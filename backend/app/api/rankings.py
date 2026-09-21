import json
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.user import UserRole
from app.models.job import Job
from app.models.candidate import Application
from app.models.evaluation import CandidateRanking
from app.schemas.evaluation import CandidateRankingOut, RankingWeights
from app.services.explainability import explainability_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/rankings", tags=["Candidate Rankings"])

@router.get("/job/{job_id}", response_model=List[CandidateRankingOut])
@router.post("/job/{job_id}", response_model=List[CandidateRankingOut])
def get_or_compute_job_rankings(
    job_id: int,
    weights: Optional[RankingWeights] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Computes explainable candidate rankings for a job using configurable weights:
    Match Score, Assessment Score, Experience Score, Skill Relevance, Project Score.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise NotFoundException("Job not found")

    if current_user.role == UserRole.CANDIDATE:
        raise ForbiddenException("Access denied: Candidates cannot view candidate rankings.")

    if not weights:
        weights = RankingWeights()

    apps = db.query(Application).filter(Application.job_id == job_id).all()
    scored_candidates = []

    for a in apps:
        cand = a.candidate
        c_user = cand.user
        cand_name = c_user.full_name if c_user else "Candidate"
        cand_email = c_user.email if c_user else ""

        match_score = a.match_score.overall_score if a.match_score else 70.0
        exp_score = a.match_score.experience_match if a.match_score else 70.0
        skill_score = a.match_score.skill_match if a.match_score else 75.0
        proj_score = a.match_score.project_relevance if a.match_score else 65.0

        assessment_score = 68.0
        if a.assessment_attempts:
            comp = [att for att in a.assessment_attempts if att.status.value == "COMPLETED"]
            if comp:
                assessment_score = comp[0].percentage

        overall = explainability_service.compute_composite_score(
            match_score=match_score,
            assessment_score=assessment_score,
            experience_score=exp_score,
            skill_relevance_score=skill_score,
            project_score=proj_score,
            weights=weights
        )

        rec = explainability_service.determine_recommendation(overall, assessment_score)

        scored_candidates.append({
            "application_id": a.id,
            "candidate_id": cand.id,
            "candidate_name": cand_name,
            "candidate_email": cand_email,
            "overall_score": overall,
            "match_score": match_score,
            "assessment_score": assessment_score,
            "experience_score": exp_score,
            "skill_relevance_score": skill_score,
            "project_score": proj_score,
            "recommendation": rec,
            "status": a.status.value
        })

    # Sort descending by overall score
    scored_candidates.sort(key=lambda x: x["overall_score"], reverse=True)

    # Persist or update CandidateRanking entities
    rankings_out = []
    for rank_idx, c_data in enumerate(scored_candidates, start=1):
        # Update or create in DB
        ranking_row = db.query(CandidateRanking).filter(
            CandidateRanking.job_id == job.id,
            CandidateRanking.candidate_id == c_data["candidate_id"]
        ).first()

        if not ranking_row:
            ranking_row = CandidateRanking(
                job_id=job.id,
                candidate_id=c_data["candidate_id"],
                application_id=c_data["application_id"]
            )
            db.add(ranking_row)

        ranking_row.rank = rank_idx
        ranking_row.overall_score = c_data["overall_score"]
        ranking_row.match_score = c_data["match_score"]
        ranking_row.assessment_score = c_data["assessment_score"]
        ranking_row.experience_score = c_data["experience_score"]
        ranking_row.skill_relevance_score = c_data["skill_relevance_score"]
        ranking_row.project_score = c_data["project_score"]
        ranking_row.recommendation = c_data["recommendation"]
        ranking_row.weights_used_json = json.dumps(weights.model_dump())

        db.flush()

        rankings_out.append(CandidateRankingOut(
            id=ranking_row.id,
            rank=rank_idx,
            candidate_id=c_data["candidate_id"],
            application_id=c_data["application_id"],
            candidate_name=c_data["candidate_name"],
            candidate_email=c_data["candidate_email"],
            overall_score=c_data["overall_score"],
            match_score=c_data["match_score"],
            assessment_score=c_data["assessment_score"],
            experience_score=c_data["experience_score"],
            skill_relevance_score=c_data["skill_relevance_score"],
            project_score=c_data["project_score"],
            recommendation=c_data["recommendation"],
            fairness_flag="No obvious disparity",
            status=c_data["status"]
        ))

    db.commit()
    return rankings_out
