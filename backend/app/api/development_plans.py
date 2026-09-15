import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.user import UserRole
from app.models.candidate import Application, CandidateProfile
from app.models.evaluation import DevelopmentPlan
from app.schemas.evaluation import DevelopmentPlanOut, SkillDevelopmentPriority, LearningModule
from app.services.dev_plan_generator import dev_plan_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/development-plans", tags=["Skill Development Plans"])

@router.get("/application/{application_id}", response_model=DevelopmentPlanOut)
def get_application_development_plan(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Generates or fetches personalized skill development roadmap tailored to candidate's identified skill gaps.
    """
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise NotFoundException("Application not found")

    if current_user.role == UserRole.CANDIDATE:
        if not current_user.candidate_profile or app.candidate_id != current_user.candidate_profile.id:
            raise ForbiddenException("Access denied: You can only view development plans for your own applications.")
    elif current_user.role == UserRole.RECRUITER:
        if app.job.recruiter_id != current_user.id:
            raise ForbiddenException("Access denied: You can only view development plans for your own job postings.")

    candidate = app.candidate
    existing_plan = db.query(DevelopmentPlan).filter(
        DevelopmentPlan.application_id == app.id
    ).first()

    if existing_plan:
        plan_dict = json.loads(existing_plan.plan_json)
        priorities = [
            SkillDevelopmentPriority(
                priority_level=p["priority_level"],
                skill_name=p["skill_name"],
                current_level=p["current_level"],
                target_level=p["target_level"],
                importance_reason=p["importance_reason"],
                learning_modules=[LearningModule(**m) for m in p["learning_modules"]]
            )
            for p in plan_dict.get("priorities", [])
        ]
        return DevelopmentPlanOut(
            candidate_id=candidate.id,
            target_role=existing_plan.target_role,
            generated_at=existing_plan.created_at,
            priorities=priorities
        )

    # Gather missing & moderate skills from skill gap
    missing = []
    moderate = []
    if app.skill_gap:
        missing = json.loads(app.skill_gap.missing_skills_json) if app.skill_gap.missing_skills_json else []
        moderate = json.loads(app.skill_gap.moderate_skills_json) if app.skill_gap.moderate_skills_json else []

    plan_data = dev_plan_service.generate_plan(
        candidate_id=candidate.id,
        target_role=app.job.title,
        missing_skills=missing,
        moderate_skills=moderate
    )

    plan_entity = DevelopmentPlan(
        candidate_id=candidate.id,
        application_id=app.id,
        target_role=app.job.title,
        plan_json=json.dumps(plan_data)
    )
    db.add(plan_entity)
    db.commit()

    priorities = [
        SkillDevelopmentPriority(
            priority_level=p["priority_level"],
            skill_name=p["skill_name"],
            current_level=p["current_level"],
            target_level=p["target_level"],
            importance_reason=p["importance_reason"],
            learning_modules=[LearningModule(**m) for m in p["learning_modules"]]
        )
        for p in plan_data["priorities"]
    ]

    return DevelopmentPlanOut(
        candidate_id=candidate.id,
        target_role=app.job.title,
        generated_at=datetime.now(timezone.utc),
        priorities=priorities
    )

@router.get("/candidate/{candidate_id}", response_model=DevelopmentPlanOut)
def get_candidate_latest_plan(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Fetch latest development plan for candidate."""
    cand = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not cand:
        raise NotFoundException("Candidate not found")

    if cand.development_plans:
        latest = cand.development_plans[-1]
        plan_dict = json.loads(latest.plan_json)
        priorities = [
            SkillDevelopmentPriority(
                priority_level=p["priority_level"],
                skill_name=p["skill_name"],
                current_level=p["current_level"],
                target_level=p["target_level"],
                importance_reason=p["importance_reason"],
                learning_modules=[LearningModule(**m) for m in p["learning_modules"]]
            )
            for p in plan_dict.get("priorities", [])
        ]
        return DevelopmentPlanOut(
            candidate_id=cand.id,
            target_role=latest.target_role,
            generated_at=latest.created_at,
            priorities=priorities
        )

    # Generate default comprehensive plan
    plan_data = dev_plan_service.generate_plan(
        candidate_id=cand.id,
        target_role="Full Stack AI Engineer",
        missing_skills=["Docker", "SQL Performance", "Kubernetes"],
        moderate_skills=["Machine Learning"]
    )
    priorities = [
        SkillDevelopmentPriority(
            priority_level=p["priority_level"],
            skill_name=p["skill_name"],
            current_level=p["current_level"],
            target_level=p["target_level"],
            importance_reason=p["importance_reason"],
            learning_modules=[LearningModule(**m) for m in p["learning_modules"]]
        )
        for p in plan_data["priorities"]
    ]
    return DevelopmentPlanOut(
        candidate_id=cand.id,
        target_role="Full Stack AI Engineer",
        generated_at=datetime.now(timezone.utc),
        priorities=priorities
    )
