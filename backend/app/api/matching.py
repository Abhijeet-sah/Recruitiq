import json
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.user import User, UserRole
from app.models.candidate import Application
from app.models.evaluation import MatchScore, SkillGap
from app.schemas.evaluation import MatchScoreOut, SkillGapOut
from app.services.matching import matching_service
from app.services.skill_gap import skill_gap_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/matching", tags=["Semantic Matching & Skill Gaps"])

@router.post("/analyze/{application_id}", response_model=MatchScoreOut)
def analyze_matching(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers fresh semantic matching and skill gap computation for an application.
    Calculates Overall Match, Skill Match, Experience Match, Education Match, and Project Relevance.
    """
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise NotFoundException("Application not found")

    job = app.job
    candidate = app.candidate

    resume_text = candidate.resumes[0].raw_text if candidate.resumes else ""
    eval_res = matching_service.evaluate_application(job, candidate, resume_text)

    # Update or create MatchScore
    match_entity = app.match_score
    if not match_entity:
        match_entity = MatchScore(application_id=app.id)
        db.add(match_entity)

    match_entity.overall_score = eval_res["overall_score"]
    match_entity.skill_match = eval_res["skill_match"]
    match_entity.experience_match = eval_res["experience_match"]
    match_entity.education_match = eval_res["education_match"]
    match_entity.project_relevance = eval_res["project_relevance"]
    match_entity.breakdown_json = json.dumps(eval_res["breakdown"])

    # Update or create SkillGap
    cand_skill_names = [s.skill_name for s in candidate.skills]
    if not cand_skill_names and candidate.resumes:
        for r in candidate.resumes:
            cand_skill_names.extend([s.skill_name for s in r.skills])

    gaps = skill_gap_service.analyze_gaps(job.skills, cand_skill_names)
    gap_entity = app.skill_gap
    if not gap_entity:
        gap_entity = SkillGap(application_id=app.id)
        db.add(gap_entity)

    gap_entity.strong_skills_json = json.dumps(gaps["strong_skills"])
    gap_entity.moderate_skills_json = json.dumps(gaps["moderate_skills"])
    gap_entity.missing_skills_json = json.dumps(gaps["missing_skills"])

    db.commit()
    db.refresh(match_entity)

    return MatchScoreOut(
        application_id=app.id,
        overall_score=match_entity.overall_score,
        skill_match=match_entity.skill_match,
        experience_match=match_entity.experience_match,
        education_match=match_entity.education_match,
        project_relevance=match_entity.project_relevance,
        breakdown=eval_res["breakdown"]
    )

@router.get("/applications/{id}/match", response_model=MatchScoreOut)
def get_match_score(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve existing semantic match score for an application."""
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise NotFoundException("Application not found")

    if not app.match_score:
        # Compute on the fly if not yet recorded
        return analyze_matching(id, db, current_user)

    breakdown = json.loads(app.match_score.breakdown_json) if app.match_score.breakdown_json else None
    return MatchScoreOut(
        application_id=app.id,
        overall_score=app.match_score.overall_score,
        skill_match=app.match_score.skill_match,
        experience_match=app.match_score.experience_match,
        education_match=app.match_score.education_match,
        project_relevance=app.match_score.project_relevance,
        breakdown=breakdown
    )

@router.get("/applications/{id}/skill-gap", response_model=SkillGapOut)
def get_skill_gaps(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve visual Strong, Moderate, and Missing skills breakdown."""
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise NotFoundException("Application not found")

    if not app.skill_gap:
        cand_skill_names = [s.skill_name for s in app.candidate.skills]
        gaps = skill_gap_service.analyze_gaps(app.job.skills, cand_skill_names)
        return SkillGapOut(
            application_id=app.id,
            strong_skills=gaps["strong_skills"],
            moderate_skills=gaps["moderate_skills"],
            missing_skills=gaps["missing_skills"]
        )

    strong = json.loads(app.skill_gap.strong_skills_json) if app.skill_gap.strong_skills_json else []
    moderate = json.loads(app.skill_gap.moderate_skills_json) if app.skill_gap.moderate_skills_json else []
    missing = json.loads(app.skill_gap.missing_skills_json) if app.skill_gap.missing_skills_json else []

    return SkillGapOut(
        application_id=app.id,
        strong_skills=strong,
        moderate_skills=moderate,
        missing_skills=missing
    )
