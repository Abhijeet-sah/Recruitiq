from datetime import timedelta
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.config import settings
from app.core.exceptions import BadRequestException, UnauthorizedException, NotFoundException
from app.models.user import User, UserRole
from app.models.candidate import CandidateProfile, RecruiterProfile
from app.models.audit import AuditLog
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.api.deps import get_current_user
from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_out(user: User) -> UserOut:
    cand_id = user.candidate_profile.id if user.candidate_profile else None
    rec_id = user.recruiter_profile.id if user.recruiter_profile else None
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        candidate_profile_id=cand_id,
        recruiter_profile_id=rec_id
    )

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (Recruiter, Candidate, or Admin) and auto-create profile."""
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise BadRequestException("An account with this email address already exists")

    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name.strip(),
        role=user_in.role,
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create associated profile
    if user.role == UserRole.CANDIDATE:
        profile = CandidateProfile(
            user_id=user.id,
            summary=f"Aspiring technology candidate with interests in modern software development.",
            education_level="Bachelor's Degree",
            years_of_experience=1.0,
            demographic_gender="Unspecified",
            demographic_age_group="25-34"
        )
        db.add(profile)
    elif user.role == UserRole.RECRUITER:
        rec_profile = RecruiterProfile(
            user_id=user.id,
            company_name="RecruitIQ Enterprise",
            department="Engineering Talent Acquisition",
            title="Technical Recruiter"
        )
        db.add(rec_profile)

    # Log audit
    log = AuditLog(
        user_id=user.id,
        action="USER_REGISTRATION",
        entity_type="User",
        entity_id=str(user.id),
        details_json=f'{{"email": "{user.email}", "role": "{user.role.value}"}}'
    )
    db.add(log)
    db.commit()
    db.refresh(user)

    # Generate token
    token_data = {"sub": user.email, "role": user.role.value, "id": user.id}
    token = create_access_token(token_data)

    return Token(
        access_token=token,
        token_type="bearer",
        user=format_user_out(user)
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password."""
    user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise UnauthorizedException("Invalid email or password")

    if not user.is_active:
        raise BadRequestException("User account is disabled")

    token_data = {"sub": user.email, "role": user.role.value, "id": user.id}
    token = create_access_token(token_data)

    return Token(
        access_token=token,
        token_type="bearer",
        user=format_user_out(user)
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the profile of currently authenticated user."""
    return format_user_out(current_user)

@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)):
    """
    Generate a secure, time-limited password reset token and dispatch a reset email.
    If SMTP credentials are configured, sends real email; otherwise simulates dispatch cleanly.
    """
    email = payload.get("email")
    if not email:
        raise BadRequestException("Email address is required")

    email_clean = email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    
    if not user:
        # Standard security response to prevent user enumeration
        return {
            "message": f"If an account exists for {email_clean}, password reset instructions have been dispatched.",
            "email_sent": False,
            "mode": "not_found"
        }

    # Generate a signed JWT reset token valid for 30 minutes
    reset_token = create_access_token(
        {"sub": user.email, "scope": "password_reset", "id": user.id},
        expires_delta=timedelta(minutes=30)
    )
    
    reset_url = f"http://localhost:5173/reset-password?token={reset_token}"

    # Dispatch email via EmailService
    dispatch_res = email_service.send_password_reset_email(
        email=user.email,
        user_name=user.full_name,
        reset_url=reset_url
    )

    # Log security audit trail
    log = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_REQUESTED",
        entity_type="User",
        entity_id=str(user.id),
        details_json=json.dumps({"email": user.email, "dispatch_mode": dispatch_res.get("mode")})
    )
    db.add(log)
    db.commit()

    is_smtp = dispatch_res.get("mode") == "smtp" and dispatch_res.get("success", False)

    return {
        "message": f"A password reset link has been dispatched to {user.email}." if is_smtp else f"Password reset instructions generated for {user.email}.",
        "email_sent": is_smtp,
        "mode": dispatch_res.get("mode", "simulated"),
        "reset_url": reset_url,
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(payload: dict, db: Session = Depends(get_db)):
    """
    Validate the signed JWT reset token and securely update the user's password.
    """
    token = payload.get("token")
    new_password = payload.get("new_password")

    if not token or not new_password:
        raise BadRequestException("Reset token and new password are required.")

    if len(new_password) < 6:
        raise BadRequestException("Password must be at least 6 characters long.")

    decoded = decode_access_token(token)
    if not decoded or decoded.get("scope") != "password_reset":
        raise BadRequestException("The password reset link is invalid or has expired. Please request a new one.")

    email = decoded.get("sub")
    if not email:
        raise BadRequestException("Invalid reset token payload.")

    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user:
        raise NotFoundException("User account associated with this reset token no longer exists.")

    user.hashed_password = get_password_hash(new_password)

    # Log security audit trail
    log = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_COMPLETED",
        entity_type="User",
        entity_id=str(user.id),
        details_json=json.dumps({"email": user.email})
    )
    db.add(log)
    db.commit()

    return {"message": "Your password has been successfully updated. You can now sign in with your new credentials."}
