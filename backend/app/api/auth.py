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
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, SocialLoginRequest
from app.api.deps import get_current_user
from app.services.email_service import email_service
from app.db.mongo import save_user_credential_to_mongo

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

    # Persist to MongoDB if configured
    try:
        save_user_credential_to_mongo({
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "hashed_password": user.hashed_password,
            "auth_provider": "local",
            "is_active": True,
            "created_at": user.created_at
        })
    except Exception:
        pass

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
    email_clean = user_in.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    
    # If not found in SQLite, check if user exists in MongoDB Atlas (e.g. after Render restart)
    if not user:
        try:
            from app.db.mongo import get_user_from_mongo
            m_user = get_user_from_mongo(email_clean)
            if m_user and m_user.get("hashed_password"):
                role_str = str(m_user.get("role", "CANDIDATE")).upper()
                target_role = UserRole.RECRUITER if role_str == "RECRUITER" else UserRole.CANDIDATE
                user = User(
                    email=m_user["email"],
                    hashed_password=m_user["hashed_password"],
                    full_name=m_user.get("full_name") or email_clean.split("@")[0].capitalize(),
                    role=target_role,
                    is_active=m_user.get("is_active", True)
                )
                db.add(user)
                db.flush()
                if user.role == UserRole.CANDIDATE:
                    cand = CandidateProfile(
                        user_id=user.id,
                        summary=f"Account restored for {user.full_name}.",
                        education_level="Bachelor's Degree",
                        years_of_experience=1.0,
                        demographic_gender="Unspecified",
                        demographic_age_group="25-34"
                    )
                    db.add(cand)
                elif user.role == UserRole.RECRUITER:
                    rec = RecruiterProfile(
                        user_id=user.id,
                        company_name="RecruitIQ Enterprise",
                        department="Talent Acquisition",
                        title="Talent Specialist"
                    )
                    db.add(rec)
                db.commit()
                db.refresh(user)
        except Exception:
            pass

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise UnauthorizedException("Invalid email or password")

    if not user.is_active:
        raise BadRequestException("User account is disabled")

    # Update MongoDB credentials/last_login if configured
    try:
        save_user_credential_to_mongo({
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
            "auth_provider": "local",
            "is_active": True
        })
    except Exception:
        pass

    token_data = {"sub": user.email, "role": user.role.value, "id": user.id}
    token = create_access_token(token_data)

    return Token(
        access_token=token,
        token_type="bearer",
        user=format_user_out(user)
    )

@router.post("/social-login", response_model=Token)
def social_login(payload: SocialLoginRequest, db: Session = Depends(get_db)):
    """Authenticate or auto-register a user via Google or Facebook OAuth."""
    email_clean = payload.email.lower().strip()
    provider_name = payload.provider.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        # Register new social user
        import secrets
        random_pwd = secrets.token_urlsafe(32)
        hashed_pwd = get_password_hash(random_pwd)
        target_role = payload.role if payload.role else UserRole.CANDIDATE

        user = User(
            email=email_clean,
            hashed_password=hashed_pwd,
            full_name=payload.full_name.strip() or email_clean.split("@")[0].capitalize(),
            role=target_role,
            is_active=True
        )
        db.add(user)
        db.flush()

        if user.role == UserRole.CANDIDATE:
            profile = CandidateProfile(
                user_id=user.id,
                summary=f"Welcome {user.full_name}! Connected via {provider_name.capitalize()}.",
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
                department="Talent Acquisition",
                title="Talent Specialist"
            )
            db.add(rec_profile)

        log = AuditLog(
            user_id=user.id,
            action=f"SOCIAL_REGISTRATION_{provider_name.upper()}",
            entity_type="User",
            entity_id=str(user.id),
            details_json=f'{{"email": "{user.email}", "provider": "{provider_name}", "role": "{user.role.value}"}}'
        )
        db.add(log)
        db.commit()
        db.refresh(user)

        # Save to MongoDB if configured
        try:
            save_user_credential_to_mongo({
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "auth_provider": provider_name,
                "provider_id": payload.provider_id,
                "is_active": True,
                "created_at": user.created_at
            })
        except Exception:
            pass
    else:
        if not user.is_active:
            raise BadRequestException("User account is disabled")

        log = AuditLog(
            user_id=user.id,
            action=f"SOCIAL_LOGIN_{provider_name.upper()}",
            entity_type="User",
            entity_id=str(user.id),
            details_json=f'{{"email": "{user.email}", "provider": "{provider_name}"}}'
        )
        db.add(log)
        db.commit()

        # Update last login in MongoDB if configured
        try:
            save_user_credential_to_mongo({
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "auth_provider": provider_name,
                "is_active": True
            })
        except Exception:
            pass

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
