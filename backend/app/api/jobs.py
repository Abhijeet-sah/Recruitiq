from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.user import User, UserRole
from app.models.job import Job, JobSkill, JobStatus, SkillImportance
from app.models.assessment import Assessment, AssessmentQuestion
from app.schemas.job import (
    JobCreate, JobUpdate, JobOut, JobSkillCreate,
    JobAnalysisRequest, JobAnalysisResponse
)
from app.services.job_analyzer import job_analyzer
from app.services.jd_quality_analyzer import jd_quality_analyzer
from app.services.question_bank import VALIDATED_QUESTION_BANK
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/analyze", response_model=JobAnalysisResponse)
def analyze_job_text(
    payload: JobAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    AI-powered job description analyzer.
    Extracts skills, experience levels, education requirements, and assigns importance weights.
    """
    if not payload.description or len(payload.description.strip()) < 10:
        raise BadRequestException("Please provide a descriptive job summary to analyze.")

    analysis = job_analyzer.analyze_job(payload.title or "", payload.description)
    return analysis

@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new job posting with structured skill weights."""
    # Ensure current user has recruiter capabilities
    if current_user.role != UserRole.ADMIN and current_user.role != UserRole.RECRUITER:
        current_user.role = UserRole.RECRUITER
        db.commit()

    from app.models.candidate import RecruiterProfile
    if not current_user.recruiter_profile:
        rec_profile = RecruiterProfile(
            user_id=current_user.id,
            company_name="RecruitIQ Enterprise",
            department=job_in.department or "Talent Acquisition",
            title="Senior Technical Recruiter"
        )
        db.add(rec_profile)
        db.commit()
        db.refresh(current_user)

    job = Job(
        recruiter_id=current_user.id,
        title=job_in.title.strip(),
        department=job_in.department.strip() if job_in.department else "Engineering",
        location=job_in.location.strip() if job_in.location else "Remote",
        employment_type=job_in.employment_type or "Full-time",
        experience_required=job_in.experience_required or "3-5 years",
        min_salary=job_in.min_salary,
        max_salary=job_in.max_salary,
        description=job_in.description.strip(),
        education_required=job_in.education_required or "Bachelor's Degree or equivalent",
        status=job_in.status or JobStatus.OPEN
    )
    db.add(job)
    db.flush()

    # Add skills
    for s in job_in.skills:
        skill_name_clean = s.skill_name.strip()
        if not skill_name_clean:
            continue
        skill = JobSkill(
            job_id=job.id,
            skill_name=skill_name_clean,
            is_required=s.is_required,
            importance_weight=s.importance_weight,
            category=s.category or "Technical"
        )
        db.add(skill)

    db.commit()

    # Automatically provision default adaptive assessment for this job using the question bank
    try:
        assessment = Assessment(
            job_id=job.id,
            title=f"{job.title} Technical Competency Assessment",
            description=f"Adaptive assessment evaluating required competencies for {job.title}",
            max_time_minutes=25,
            passing_score=65.0
        )
        db.add(assessment)
        db.flush()

        # Populate relevant questions from bank matching job skills
        target_skill_names = [s.skill_name.lower() for s in job_in.skills]
        added_count = 0
        import json
        for q_data in VALIDATED_QUESTION_BANK:
            if q_data["skill_tested"].lower() in target_skill_names or added_count < 6:
                q = AssessmentQuestion(
                    assessment_id=assessment.id,
                    question_text=q_data["question_text"],
                    question_type=q_data["question_type"],
                    options_json=json.dumps(q_data["options"]),
                    correct_answer_json=json.dumps(q_data["correct_answer"]),
                    explanation=q_data.get("explanation", ""),
                    skill_tested=q_data["skill_tested"],
                    difficulty=q_data["difficulty"]
                )
                db.add(q)
                added_count += 1

        db.commit()

        # Seed with verified benchmark problems
        from app.services.dataset_loader import dataset_loader
        dataset_loader.import_into_assessment(db, assessment.id, count=15)
        db.commit()
    except Exception as e:
        print(f"Non-fatal assessment provisioning notice: {e}")

    db.refresh(job)
    return job

@router.get("", response_model=List[JobOut])
def list_jobs(
    db: Session = Depends(get_db),
    query: Optional[str] = None,
    department: Optional[str] = None,
    location: Optional[str] = None,
    status_filter: Optional[JobStatus] = None,
    skip: int = 0,
    limit: int = 50
):
    """List open jobs with search and filter capabilities."""
    q = db.query(Job)
    if query:
        q = q.filter(Job.title.ilike(f"%{query}%") | Job.description.ilike(f"%{query}%"))
    if department:
        q = q.filter(Job.department.ilike(f"%{department}%"))
    if location:
        q = q.filter(Job.location.ilike(f"%{location}%"))
    if status_filter:
        q = q.filter(Job.status == status_filter)

    jobs = q.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    # Annotate application counts
    for j in jobs:
        j.application_count = len(j.applications)
    return jobs

@router.get("/my", response_model=List[JobOut])
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """Retrieve jobs posted by the current logged-in recruiter (or all jobs if Admin)."""
    if current_user.role == UserRole.ADMIN:
        jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    else:
        jobs = db.query(Job).filter(Job.recruiter_id == current_user.id).order_by(Job.created_at.desc()).all()

    for j in jobs:
        j.application_count = len(j.applications)
    return jobs

@router.get("/{id}", response_model=JobOut)
def get_job(id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single job."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise NotFoundException("Job not found")
    job.application_count = len(job.applications)
    return job

@router.put("/{id}", response_model=JobOut)
def update_job(
    id: int,
    job_in: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """Update job attributes and skills."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise NotFoundException("Job not found")

    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise ForbiddenException("You can only modify jobs that you created")

    for field, val in job_in.model_dump(exclude_unset=True).items():
        if field == "skills":
            continue
        setattr(job, field, val)

    if job_in.skills is not None:
        db.query(JobSkill).filter(JobSkill.job_id == job.id).delete()
        for s in job_in.skills:
            skill = JobSkill(
                job_id=job.id,
                skill_name=s.skill_name.strip(),
                is_required=s.is_required,
                importance_weight=s.importance_weight,
                category=s.category
            )
            db.add(skill)

    db.commit()
    db.refresh(job)
    job.application_count = len(job.applications)
    return job

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """Delete a job."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise NotFoundException("Job not found")

    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise ForbiddenException("You can only delete jobs that you created")

    db.delete(job)
    db.commit()
    return None

@router.post("/quality-check")
def check_job_quality_text(
    payload: dict,
    current_user: User = Depends(get_current_user)
):
    """Analyze arbitrary JD text for gender-coded terms, realism, credential bias, and clarity."""
    title = payload.get("title", "")
    description = payload.get("description", "")
    requirements = payload.get("requirements", "")
    required_skills = payload.get("required_skills", [])
    min_experience_years = payload.get("min_experience_years", 0)

    return jd_quality_analyzer.analyze_job_description(
        title=title,
        description=description,
        requirements=requirements,
        required_skills=required_skills,
        min_experience_years=min_experience_years
    )

@router.get("/{id}/quality-check")
def check_job_quality_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze existing job posting for bias, clarity, and realism."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise NotFoundException("Job not found")

    skills = [s.skill_name for s in job.skills if s.is_required] if job.skills else []
    return jd_quality_analyzer.analyze_job_description(
        title=job.title or "",
        description=job.description or "",
        requirements=job.education_required or "",
        required_skills=skills,
        min_experience_years=job.experience_required or 0
    )

