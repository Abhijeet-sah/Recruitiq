from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.user import User, UserRole
from app.models.candidate import (
    CandidateProfile, Application, ApplicationStatus,
    Experience, Education, CandidateSkill
)
from app.models.job import Job
from app.schemas.candidate import (
    CandidateProfileOut, CandidateProfileUpdate,
    ApplicationCreate, ApplicationOut, ApplicationStatusUpdate,
    ApplicationDetailOut
)
from app.services.matching import matching_service
from app.services.skill_gap import skill_gap_service
from app.services.email_service import email_service
from app.models.evaluation import MatchScore, SkillGap
import json
from app.api.deps import get_current_user, require_role

router = APIRouter(tags=["Candidates & Applications"])

@router.get("/candidates", response_model=List[CandidateProfileOut])
def list_candidates(
    db: Session = Depends(get_db),
    query: Optional[str] = None,
    skill: Optional[str] = None,
    min_experience: Optional[float] = None,
    blind: bool = False,
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """Recruiter endpoint: Search and filter candidates with optional Blind Screening."""
    q = db.query(CandidateProfile).join(User)

    if query and not blind:
        q = q.filter(User.full_name.ilike(f"%{query}%") | CandidateProfile.summary.ilike(f"%{query}%"))
    elif query:
        q = q.filter(CandidateProfile.summary.ilike(f"%{query}%"))

    if min_experience:
        q = q.filter(CandidateProfile.years_of_experience >= min_experience)

    candidates = q.all()

    result = []
    for c in candidates:
        if skill:
            has_skill = any(skill.lower() in s.skill_name.lower() for s in c.skills)
            if not has_skill:
                continue

        out = CandidateProfileOut(
            id=c.id,
            user_id=c.user_id,
            full_name=f"Candidate #{c.id:04d}" if blind else (c.user.full_name if c.user else "Candidate"),
            email=f"candidate_{c.id}@blindscreen.internal" if blind else (c.user.email if c.user else ""),
            phone=None if blind else c.phone,
            location="Redacted (Blind Screening)" if blind else c.location,
            summary=c.summary,
            linkedin_url=None if blind else c.linkedin_url,
            github_url=None if blind else c.github_url,
            portfolio_url=None if blind else c.portfolio_url,
            years_of_experience=c.years_of_experience,
            education_level=c.education_level,
            demographic_gender=None if blind else c.demographic_gender,
            demographic_age_group=None if blind else c.demographic_age_group,
            parsing_confidence=c.parsing_confidence,
            skills=c.skills,
            experiences=c.experiences,
            educations=c.educations
        )
        result.append(out)

    return result

@router.get("/candidates/me", response_model=CandidateProfileOut)
def get_my_candidate_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CANDIDATE, UserRole.ADMIN))
):
    """Retrieve the logged-in candidate's own profile."""
    c = current_user.candidate_profile
    if not c:
        c = CandidateProfile(
            user_id=current_user.id,
            summary="Aspiring technology candidate with interests in modern software development.",
            education_level="Bachelor's Degree",
            years_of_experience=1.0,
            demographic_gender="Unspecified",
            demographic_age_group="25-34"
        )
        db.add(c)
        db.commit()
        db.refresh(c)

    return CandidateProfileOut(
        id=c.id,
        user_id=c.user_id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=c.phone or "",
        location=c.location or "Remote / Hybrid",
        summary=c.summary or "",
        linkedin_url=c.linkedin_url or "",
        github_url=c.github_url or "",
        portfolio_url=c.portfolio_url or "",
        years_of_experience=c.years_of_experience if c.years_of_experience is not None else 1.0,
        education_level=c.education_level or "Bachelor's Degree",
        demographic_gender=c.demographic_gender or "Unspecified",
        demographic_age_group=c.demographic_age_group or "Unspecified",
        parsing_confidence=c.parsing_confidence if c.parsing_confidence is not None else 0.0,
        skills=c.skills or [],
        experiences=c.experiences or [],
        educations=c.educations or []
    )

@router.get("/candidates/{id}", response_model=CandidateProfileOut)
def get_candidate(
    id: int,
    blind: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full candidate profile with optional Blind Screening."""
    c = db.query(CandidateProfile).filter(CandidateProfile.id == id).first()
    if not c:
        raise NotFoundException("Candidate not found")

    if current_user.role == UserRole.CANDIDATE:
        if not current_user.candidate_profile or current_user.candidate_profile.id != c.id:
            raise ForbiddenException("Access denied: You can only view your own candidate profile.")

    return CandidateProfileOut(
        id=c.id,
        user_id=c.user_id,
        full_name=f"Candidate #{c.id:04d}" if blind else (c.user.full_name if c.user else "Candidate"),
        email=f"candidate_{c.id}@blindscreen.internal" if blind else (c.user.email if c.user else ""),
        phone=None if blind else c.phone,
        location="Redacted (Blind Screening)" if blind else c.location,
        summary=c.summary,
        linkedin_url=None if blind else c.linkedin_url,
        github_url=None if blind else c.github_url,
        portfolio_url=None if blind else c.portfolio_url,
        years_of_experience=c.years_of_experience,
        education_level=c.education_level,
        demographic_gender=None if blind else c.demographic_gender,
        demographic_age_group=None if blind else c.demographic_age_group,
        parsing_confidence=c.parsing_confidence,
        skills=c.skills,
        experiences=c.experiences,
        educations=c.educations
    )

@router.put("/candidates/{id}", response_model=CandidateProfileOut)
def update_candidate_profile(
    id: int,
    payload: CandidateProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update profile details (manual correction support)."""
    c = db.query(CandidateProfile).filter(CandidateProfile.id == id).first()
    if not c:
        raise NotFoundException("Candidate not found")

    if current_user.role == UserRole.CANDIDATE and current_user.candidate_profile.id != c.id:
        raise ForbiddenException("Access denied")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(c, field, val)

    db.commit()
    db.refresh(c)
    return CandidateProfileOut(
        id=c.id,
        user_id=c.user_id,
        full_name=c.user.full_name if c.user else "Candidate",
        email=c.user.email if c.user else "",
        phone=c.phone,
        location=c.location,
        summary=c.summary,
        linkedin_url=c.linkedin_url,
        github_url=c.github_url,
        portfolio_url=c.portfolio_url,
        years_of_experience=c.years_of_experience,
        education_level=c.education_level,
        demographic_gender=c.demographic_gender,
        demographic_age_group=c.demographic_age_group,
        parsing_confidence=c.parsing_confidence,
        skills=c.skills,
        experiences=c.experiences,
        educations=c.educations
    )

@router.post("/applications", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CANDIDATE, UserRole.ADMIN))
):
    """Candidate submits application to a job."""
    candidate = current_user.candidate_profile
    if not candidate:
        raise BadRequestException("Please complete your candidate profile before applying.")

    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise NotFoundException("Job not found")

    # Check existing application
    existing = db.query(Application).filter(
        Application.job_id == app_in.job_id,
        Application.candidate_id == candidate.id
    ).first()
    if existing:
        raise BadRequestException("You have already applied to this job.")

    application = Application(
        job_id=job.id,
        candidate_id=candidate.id,
        status=ApplicationStatus.APPLIED,
        cover_letter=app_in.cover_letter
    )
    db.add(application)
    db.flush()

    # Automatically compute initial semantic match and skill gap
    resume_text = candidate.resumes[0].raw_text if candidate.resumes else ""
    match_res = matching_service.evaluate_application(job, candidate, resume_text)

    match_entity = MatchScore(
        application_id=application.id,
        overall_score=match_res["overall_score"],
        skill_match=match_res["skill_match"],
        experience_match=match_res["experience_match"],
        education_match=match_res["education_match"],
        project_relevance=match_res["project_relevance"],
        breakdown_json=json.dumps(match_res["breakdown"])
    )
    db.add(match_entity)

    # Skill gaps
    cand_skill_names = [s.skill_name for s in candidate.skills]
    gaps = skill_gap_service.analyze_gaps(job.skills, cand_skill_names)
    gap_entity = SkillGap(
        application_id=application.id,
        strong_skills_json=json.dumps(gaps["strong_skills"]),
        moderate_skills_json=json.dumps(gaps["moderate_skills"]),
        missing_skills_json=json.dumps(gaps["missing_skills"])
    )
    db.add(gap_entity)

    db.commit()
    db.refresh(application)

    # 1. Dispatch confirmation email to candidate
    try:
        email_service.notify_application_received(
            candidate_email=current_user.email,
            candidate_name=current_user.full_name,
            job_title=job.title
        )
    except Exception as e:
        print(f"Candidate application confirmation email notice error: {e}")

    # 2. Dispatch new applicant alert to job recruiter
    try:
        recruiter_user = db.query(User).filter(User.id == job.recruiter_id).first()
        recruiter_email = recruiter_user.email if recruiter_user else "recruiter@recruitiq.com"
        recruiter_name = recruiter_user.full_name if recruiter_user else "Hiring Team"
        email_service.notify_recruiter_new_applicant(
            recruiter_email=recruiter_email,
            recruiter_name=recruiter_name,
            candidate_name=current_user.full_name,
            candidate_email=current_user.email,
            job_title=job.title,
            match_score=match_entity.overall_score
        )
    except Exception as e:
        print(f"Recruiter new applicant email notice error: {e}")

    return ApplicationOut(
        id=application.id,
        job_id=application.job_id,
        candidate_id=application.candidate_id,
        status=application.status,
        cover_letter=application.cover_letter,
        applied_at=application.created_at,
        job_title=job.title,
        company_name="Enterprise Corp",
        candidate_name=current_user.full_name,
        candidate_email=current_user.email,
        overall_match_score=match_entity.overall_score
    )

@router.get("/applications/my", response_model=List[ApplicationOut])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CANDIDATE))
):
    """Candidate views their applied jobs and status timeline."""
    candidate = current_user.candidate_profile
    if not candidate:
        return []

    apps = db.query(Application).filter(Application.candidate_id == candidate.id).order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        pct = None
        if a.assessment_attempts:
            completed = [att for att in a.assessment_attempts if att.status.value == "COMPLETED"]
            if completed:
                pct = completed[0].percentage

        results.append(ApplicationOut(
            id=a.id,
            job_id=a.job_id,
            candidate_id=a.candidate_id,
            status=a.status,
            cover_letter=a.cover_letter,
            applied_at=a.created_at,
            job_title=a.job.title if a.job else "Role",
            company_name="Enterprise Corp",
            candidate_name=current_user.full_name,
            candidate_email=current_user.email,
            overall_match_score=a.match_score.overall_score if a.match_score else None,
            assessment_percentage=pct
        ))
    return results

@router.get("/applications/job/{job_id}", response_model=List[ApplicationOut])
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """Recruiter views all applications for a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise NotFoundException("Job not found")

    if current_user.role == UserRole.RECRUITER and job.recruiter_id != current_user.id:
        raise ForbiddenException("You can only view applications for your own job postings.")

    apps = db.query(Application).filter(Application.job_id == job_id).all()
    results = []
    for a in apps:
        pct = None
        if a.assessment_attempts:
            completed = [att for att in a.assessment_attempts if att.status.value == "COMPLETED"]
            if completed:
                pct = completed[0].percentage

        c_user = a.candidate.user if a.candidate else None
        results.append(ApplicationOut(
            id=a.id,
            job_id=a.job_id,
            candidate_id=a.candidate_id,
            status=a.status,
            cover_letter=a.cover_letter,
            applied_at=a.created_at,
            job_title=a.job.title if a.job else "Role",
            candidate_name=c_user.full_name if c_user else "Candidate",
            candidate_email=c_user.email if c_user else "",
            overall_match_score=a.match_score.overall_score if a.match_score else None,
            assessment_percentage=pct
        ))
    return results

@router.put("/applications/{id}/status", response_model=ApplicationOut)
def update_application_status(
    id: int,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """Recruiter updates candidate application status (Shortlist, Reject, Review)."""
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise NotFoundException("Application not found")

    if current_user.role == UserRole.RECRUITER and app.job.recruiter_id != current_user.id:
        raise ForbiddenException("You can only modify applications for your own job postings.")

    app.status = payload.status
    db.commit()
    db.refresh(app)

    c_user = app.candidate.user if app.candidate else None
    job_title = app.job.title if app.job else "Target Role"

    # Dispatch automated email notification to candidate on decision
    if c_user and payload.status == ApplicationStatus.SHORTLISTED:
        try:
            email_service.notify_candidate_shortlisted(
                candidate_email=c_user.email,
                candidate_name=c_user.full_name,
                job_title=job_title
            )
        except Exception as e:
            print(f"Candidate shortlisted notification error: {e}")
    elif c_user and payload.status == ApplicationStatus.REJECTED:
        try:
            email_service.notify_candidate_rejected(
                candidate_email=c_user.email,
                candidate_name=c_user.full_name,
                job_title=job_title
            )
        except Exception as e:
            print(f"Candidate rejection notification error: {e}")

    return ApplicationOut(
        id=app.id,
        job_id=app.job_id,
        candidate_id=app.candidate_id,
        status=app.status,
        cover_letter=app.cover_letter,
        applied_at=app.created_at,
        job_title=app.job.title if app.job else "Role",
        candidate_name=c_user.full_name if c_user else "Candidate",
        candidate_email=c_user.email if c_user else "",
        overall_match_score=app.match_score.overall_score if app.match_score else None
    )

@router.get("/applications/{id}", response_model=ApplicationDetailOut)
def get_application(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full application dossier details including candidate profile."""
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise NotFoundException("Application not found")

    if current_user.role == UserRole.CANDIDATE:
        if not current_user.candidate_profile or current_user.candidate_profile.id != app.candidate_id:
            raise ForbiddenException("Access denied to this application")
    elif current_user.role == UserRole.RECRUITER:
        if app.job.recruiter_id != current_user.id:
            raise ForbiddenException("Access denied to this application")

    c = app.candidate
    cand_out = None
    if c:
        cand_out = CandidateProfileOut(
            id=c.id,
            user_id=c.user_id,
            full_name=c.user.full_name if c.user else "Candidate",
            email=c.user.email if c.user else "",
            phone=c.phone,
            location=c.location,
            summary=c.summary,
            linkedin_url=c.linkedin_url,
            github_url=c.github_url,
            portfolio_url=c.portfolio_url,
            years_of_experience=c.years_of_experience,
            education_level=c.education_level,
            demographic_gender=c.demographic_gender,
            demographic_age_group=c.demographic_age_group,
            parsing_confidence=c.parsing_confidence,
            skills=c.skills,
            experiences=c.experiences,
            educations=c.educations
        )

    pct = None
    if app.assessment_attempts:
        completed = [att for att in app.assessment_attempts if att.status.value == "COMPLETED"]
        if completed:
            pct = completed[0].percentage

    c_user = c.user if c else None
    return ApplicationDetailOut(
        id=app.id,
        job_id=app.job_id,
        candidate_id=app.candidate_id,
        status=app.status,
        cover_letter=app.cover_letter,
        applied_at=app.created_at,
        job_title=app.job.title if app.job else "Role",
        company_name="Enterprise Corp",
        candidate_name=c_user.full_name if c_user else "Candidate",
        candidate_email=c_user.email if c_user else "",
        overall_match_score=app.match_score.overall_score if app.match_score else None,
        assessment_percentage=pct,
        candidate_profile=cand_out
    )

