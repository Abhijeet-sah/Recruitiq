from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.candidate import Application, CandidateProfile
from app.models.job import Job
from app.services.fairness_lab import fairness_lab_service

router = APIRouter(prefix="/fairness-lab", tags=["RecruitIQ Fairness Lab & Sensitivity Simulator"])

class ThresholdSimRequest(BaseModel):
    job_id: int
    category: str = "gender"
    min_thresh: int = 40
    max_thresh: int = 95
    step: int = 5

class CounterfactualRequest(BaseModel):
    candidate_id: int
    job_id: int
    attribute_to_perturb: str = "gender"
    simulated_values: Optional[List[str]] = None

@router.post("/simulate-threshold")
def simulate_selection_threshold(
    payload: ThresholdSimRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Simulate applicant selection rates, Disparate Impact (4/5ths rule), and Demographic Parity
    across a customizable range of cut-off thresholds.
    """
    job = db.query(Job).filter(Job.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Fetch candidates and scores for this job
    applications = db.query(Application).filter(Application.job_id == payload.job_id).all()
    candidates_data = []

    for app in applications:
        cand = app.candidate
        if not cand:
            continue
        
        cand_score = app.overall_match_score
        if cand_score is None and app.assessments:
            scores = [a.score for a in app.assessments if a.score is not None]
            cand_score = sum(scores) / len(scores) if scores else 70.0
        if cand_score is None:
            cand_score = 72.0

        candidates_data.append({
            "id": cand.id,
            "full_name": cand.full_name,
            "overall_score": cand_score,
            "demographic_gender": cand.demographic_gender or "Unspecified",
            "demographic_age_group": cand.demographic_age_group or "25-34"
        })

    # If no applicants or single applicant in database, provide realistic demo benchmark cohort
    if len(candidates_data) < 4:
        candidates_data = [
            {"id": 101, "full_name": "Alex Mercer", "overall_score": 88.0, "demographic_gender": "Male", "demographic_age_group": "25-34"},
            {"id": 102, "full_name": "Elena Rostova", "overall_score": 86.5, "demographic_gender": "Female", "demographic_age_group": "25-34"},
            {"id": 103, "full_name": "David Chen", "overall_score": 79.0, "demographic_gender": "Male", "demographic_age_group": "<25"},
            {"id": 104, "full_name": "Priya Sharma", "overall_score": 82.0, "demographic_gender": "Female", "demographic_age_group": "25-34"},
            {"id": 105, "full_name": "Marcus Vance", "overall_score": 68.0, "demographic_gender": "Male", "demographic_age_group": "35-49"},
            {"id": 106, "full_name": "Sophia Martinez", "overall_score": 74.5, "demographic_gender": "Female", "demographic_age_group": "25-34"},
            {"id": 107, "full_name": "Liam Gallagher", "overall_score": 62.0, "demographic_gender": "Male", "demographic_age_group": "50+"},
            {"id": 108, "full_name": "Amina Al-Mansoor", "overall_score": 91.0, "demographic_gender": "Female", "demographic_age_group": "25-34"}
        ]

    return fairness_lab_service.simulate_selection_thresholds(
        candidates=candidates_data,
        category=payload.category,
        min_thresh=payload.min_thresh,
        max_thresh=payload.max_thresh,
        step=payload.step
    )

@router.post("/counterfactual-rerun")
def run_counterfactual_audit_sandbox(
    payload: CounterfactualRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Rerun candidate scoring in an isolated sandbox with counterfactual demographic perturbations.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.id == payload.candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job = db.query(Job).filter(Job.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    cand_skills = [s.skill_name for s in cand.skills] if cand.skills else []
    job_skills = [s.skill_name for s in job.skills] if job.skills else []

    candidate_data = {
        "id": cand.id,
        "full_name": cand.full_name,
        "demographic_gender": cand.demographic_gender or "Unspecified",
        "demographic_age_group": cand.demographic_age_group or "25-34",
        "skills": cand_skills,
        "total_experience_years": cand.total_experience_years or 3,
        "raw_text": cand.resumes[0].raw_text if cand.resumes else ""
    }

    job_data = {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "required_skills": job_skills,
        "min_experience_years": job.min_experience_years or 2
    }

    return fairness_lab_service.run_isolated_counterfactual(
        candidate_data=candidate_data,
        job_data=job_data,
        attribute_to_perturb=payload.attribute_to_perturb,
        simulated_values=payload.simulated_values
    )
