from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException
from app.models.user import User, UserRole
from app.models.candidate import Application
from app.models.evaluation import RecruiterNote
from app.schemas.evaluation import RecruiterNoteCreate, RecruiterNoteOut
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/notes", tags=["Recruiter Notes"])

@router.post("/{application_id}", response_model=RecruiterNoteOut, status_code=status.HTTP_201_CREATED)
def add_note(
    application_id: int,
    payload: RecruiterNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """Add a structured recruiter observation note to an application."""
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise NotFoundException("Application not found")

    note = RecruiterNote(
        application_id=app.id,
        recruiter_id=current_user.id,
        note_text=payload.note_text.strip()
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return RecruiterNoteOut(
        id=note.id,
        application_id=note.application_id,
        recruiter_id=note.recruiter_id,
        recruiter_name=current_user.full_name,
        note_text=note.note_text,
        created_at=note.created_at
    )

@router.get("/{application_id}", response_model=List[RecruiterNoteOut])
def get_notes(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """Retrieve all recruiter notes for an application."""
    notes = db.query(RecruiterNote).filter(RecruiterNote.application_id == application_id).order_by(RecruiterNote.created_at.desc()).all()
    return [
        RecruiterNoteOut(
            id=n.id,
            application_id=n.application_id,
            recruiter_id=n.recruiter_id,
            recruiter_name=n.recruiter.full_name if n.recruiter else "Recruiter",
            note_text=n.note_text,
            created_at=n.created_at
        )
        for n in notes
    ]
