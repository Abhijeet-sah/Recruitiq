import os
import shutil
import uuid
import json
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException, ForbiddenException
from app.models.user import User, UserRole
from app.models.candidate import CandidateProfile, Resume, ResumeSkill, CandidateSkill, Experience, Education
from app.schemas.resume import ResumeUploadResponse, ParsedResumeOut
from app.services.resume_parser import resume_parser
from app.api.deps import get_current_user

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeUploadResponse)
def upload_resume(
    file: UploadFile = File(...),
    candidate_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and parse candidate resume (PDF or DOCX).
    Extracts profile details, computes Resume Parsing Confidence score,
    and synchronizes skills, experiences, and educations.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise BadRequestException(f"Invalid file extension '{ext}'. Only .pdf and .docx files are accepted.")

    # Target candidate determination
    if current_user.role == UserRole.CANDIDATE:
        candidate = current_user.candidate_profile
        if not candidate:
            candidate = CandidateProfile(user_id=current_user.id)
            db.add(candidate)
            db.flush()
    else:
        # Recruiter or Admin uploading on behalf of a candidate
        if not candidate_id:
            raise BadRequestException("Recruiters must supply candidate_id when uploading on behalf of a candidate.")
        candidate = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
        if not candidate:
            raise NotFoundException("Specified candidate profile not found.")

    # Save physical file
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{file.filename.replace(' ', '_')}"
    target_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(target_path)

    # Parse resume
    try:
        parsed = resume_parser.parse_file(target_path)
    except Exception as e:
        if os.path.exists(target_path):
            os.remove(target_path)
        raise BadRequestException(f"Unable to parse this resume: {str(e)}. Please upload a valid PDF or DOCX file.")

    confidence = parsed.get("parsing_confidence", 85.0)

    # Create Resume entity
    resume = Resume(
        candidate_id=candidate.id,
        filename=file.filename,
        file_path=target_path,
        file_type=ext.replace(".", ""),
        file_size=file_size,
        raw_text=parsed.get("raw_text", ""),
        parsed_data=json.dumps(parsed),
        parsing_confidence=confidence,
        is_active=True
    )
    db.add(resume)
    db.flush()

    # Sync candidate profile
    candidate.parsing_confidence = confidence
    if parsed.get("phone"):
        candidate.phone = parsed["phone"]
    if parsed.get("summary"):
        candidate.summary = parsed["summary"]
    if parsed.get("years_of_experience"):
        candidate.years_of_experience = float(parsed["years_of_experience"])
    if parsed.get("education_level"):
        candidate.education_level = parsed["education_level"]

    # Sync skills
    # Clear existing candidate skills to avoid duplicates
    db.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate.id).delete()
    for s_info in parsed.get("skills", []):
        rs = ResumeSkill(
            resume_id=resume.id,
            skill_name=s_info["skill_name"],
            claimed_level=s_info["claimed_level"],
            years_experience=s_info["years_experience"]
        )
        db.add(rs)

        cs = CandidateSkill(
            candidate_id=candidate.id,
            skill_name=s_info["skill_name"],
            level=s_info["claimed_level"],
            verified=False
        )
        db.add(cs)

    # Sync experiences
    db.query(Experience).filter(Experience.candidate_id == candidate.id).delete()
    for exp in parsed.get("experiences", []):
        e = Experience(
            candidate_id=candidate.id,
            company=exp["company"],
            title=exp["title"],
            start_date=exp.get("start_date"),
            end_date=exp.get("end_date", "Present"),
            is_current=exp.get("is_current", False),
            description=exp.get("description", "")
        )
        db.add(e)

    # Sync educations
    db.query(Education).filter(Education.candidate_id == candidate.id).delete()
    for edu in parsed.get("educations", []):
        ed = Education(
            candidate_id=candidate.id,
            institution=edu["institution"],
            degree=edu["degree"],
            field_of_study=edu.get("field_of_study"),
            graduation_year=edu.get("graduation_year"),
            gpa=edu.get("gpa")
        )
        db.add(ed)

    db.commit()
    db.refresh(resume)

    return ResumeUploadResponse(
        resume_id=resume.id,
        candidate_id=candidate.id,
        filename=resume.filename,
        file_type=resume.file_type,
        file_size=resume.file_size,
        parsing_confidence=resume.parsing_confidence,
        parsed_data=ParsedResumeOut(**parsed),
        message=f"Resume parsed successfully with {confidence}% confidence."
    )

@router.get("/{id}")
def get_resume(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve parsed resume data."""
    resume = db.query(Resume).filter(Resume.id == id).first()
    if not resume:
        raise NotFoundException("Resume not found")

    # Authorize: candidate can view their own; recruiter and admin can view all
    if current_user.role == UserRole.CANDIDATE:
        if not current_user.candidate_profile or current_user.candidate_profile.id != resume.candidate_id:
            raise ForbiddenException("Access denied")

    parsed_dict = json.loads(resume.parsed_data) if resume.parsed_data else {}
    return {
        "id": resume.id,
        "candidate_id": resume.candidate_id,
        "filename": resume.filename,
        "file_type": resume.file_type,
        "file_size": resume.file_size,
        "parsing_confidence": resume.parsing_confidence,
        "parsed_data": parsed_dict,
        "uploaded_at": resume.created_at
    }
