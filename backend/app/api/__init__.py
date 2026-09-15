from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.jobs import router as jobs_router
from app.api.resumes import router as resumes_router
from app.api.candidates import router as candidates_router
from app.api.matching import router as matching_router
from app.api.assessments import router as assessments_router
from app.api.consistency import router as consistency_router
from app.api.explainability import router as explainability_router
from app.api.fairness import router as fairness_router
from app.api.rankings import router as rankings_router
from app.api.interviews import router as interviews_router
from app.api.development_plans import router as dev_plans_router
from app.api.analytics import router as analytics_router
from app.api.comparison import router as comparison_router
from app.api.recruiter_notes import router as notes_router
from app.api.admin import router as admin_router
from app.api.evidence import router as evidence_router
from app.api.skill_graph import router as skill_graph_router
from app.api.governance import router as governance_router
from app.api.fairness_lab import router as fairness_lab_router
from app.api.research import router as research_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(jobs_router)
api_router.include_router(resumes_router)
api_router.include_router(candidates_router)
api_router.include_router(matching_router)
api_router.include_router(assessments_router)
api_router.include_router(consistency_router)
api_router.include_router(explainability_router)
api_router.include_router(fairness_router)
api_router.include_router(rankings_router)
api_router.include_router(interviews_router)
api_router.include_router(dev_plans_router)
api_router.include_router(analytics_router)
api_router.include_router(comparison_router)
api_router.include_router(notes_router)
api_router.include_router(admin_router)
api_router.include_router(evidence_router)
api_router.include_router(skill_graph_router)
api_router.include_router(governance_router)
api_router.include_router(fairness_lab_router)
api_router.include_router(research_router)
