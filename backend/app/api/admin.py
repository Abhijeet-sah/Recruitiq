from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.user import User, UserRole
from app.models.job import Job, JobSkill
from app.models.candidate import CandidateSkill
from app.models.audit import AuditLog
from app.schemas.user import UserOut
from app.services.resume_parser import ResumeParserService
from app.api.deps import require_role

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/users", response_model=List[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Admin endpoint: List all users in the system."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    out = []
    for u in users:
        cand_id = u.candidate_profile.id if u.candidate_profile else None
        rec_id = u.recruiter_profile.id if u.recruiter_profile else None
        out.append(UserOut(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at,
            candidate_profile_id=cand_id,
            recruiter_profile_id=rec_id
        ))
    return out

@router.put("/users/{user_id}/toggle-status")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Admin endpoint: Enable or disable a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found")
    if user.id == current_user.id:
        raise BadRequestException("You cannot disable your own admin account")

    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User '{user.email}' status set to {'active' if user.is_active else 'inactive'}"}

@router.get("/skills")
def get_skills_catalog(current_user: User = Depends(require_role(UserRole.ADMIN))):
    """Admin endpoint: View system-recognized competencies catalog."""
    return {
        "total_skills": len(ResumeParserService.KNOWN_SKILLS),
        "skills": sorted([s.title() for s in ResumeParserService.KNOWN_SKILLS])
    }

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Admin endpoint: View recent immutable audit events."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user.email if l.user else "System",
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details_json,
            "created_at": l.created_at
        }
        for l in logs
    ]
