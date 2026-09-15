import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException
from app.models.candidate import Application, CandidateProfile
from app.schemas.evaluation import CandidateExplanationOut, RankingWeights, ExplainabilityFactor
from app.services.explainability import explainability_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/explainability", tags=["Explainable AI"])

@router.get("/application/{application_id}", response_model=CandidateExplanationOut)
def get_application_explanation(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Returns SHAP-like transparent feature attribution:
    Shows positive driving factors, negative competency gaps, and weighted point contributions.
    """
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise NotFoundException("Application not found")

    candidate = app.candidate
    candidate_name = candidate.user.full_name if candidate.user else "Candidate"

    # Match score
    match_score = app.match_score.overall_score if app.match_score else 75.0

    # Assessment score
    assessment_score = 70.0
    if app.assessment_attempts:
        comp = [att for att in app.assessment_attempts if att.status.value == "COMPLETED"]
        if comp:
            assessment_score = comp[0].percentage

    # Experience & Project scores
    exp_score = 75.0
    proj_score = 75.0
    if app.match_score:
        exp_score = app.match_score.experience_match
        proj_score = app.match_score.project_relevance

    skill_rel_score = app.match_score.skill_match if app.match_score else 80.0

    # Skill gaps
    strong_skills = []
    missing_skills = []
    if app.skill_gap:
        strong_skills = json.loads(app.skill_gap.strong_skills_json) if app.skill_gap.strong_skills_json else []
        missing_skills = json.loads(app.skill_gap.missing_skills_json) if app.skill_gap.missing_skills_json else []

    weights = RankingWeights()

    explanation = explainability_service.generate_score_explanation(
        candidate_id=candidate.id,
        application_id=app.id,
        candidate_name=candidate_name,
        match_score=match_score,
        assessment_score=assessment_score,
        experience_score=exp_score,
        skill_relevance_score=skill_rel_score,
        project_score=proj_score,
        strong_skills=strong_skills,
        missing_skills=missing_skills,
        weights=weights
    )

    factors = [ExplainabilityFactor(**f) for f in explanation["factor_breakdown"]]

    return CandidateExplanationOut(
        candidate_id=candidate.id,
        application_id=app.id,
        overall_score=explanation["overall_score"],
        positive_factors=explanation["positive_factors"],
        negative_factors=explanation["negative_factors"],
        factor_breakdown=factors,
        summary_narrative=explanation["summary_narrative"],
        is_llm_generated=False
    )
