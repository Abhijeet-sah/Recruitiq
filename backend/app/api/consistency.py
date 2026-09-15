import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException
from app.models.candidate import Application
from app.models.evaluation import ConsistencyReport, ConsistencyStatus
from app.schemas.evaluation import ConsistencyReportOut, ConsistencyDetail
from app.services.consistency_audit import consistency_service
from app.services.adaptive_engine import adaptive_engine
from app.api.deps import get_current_user

router = APIRouter(prefix="/consistency", tags=["Consistency Analysis"])

@router.get("/{application_id}", response_model=ConsistencyReportOut)
def get_consistency_report(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Returns empirical Skill Consistency Analysis cross-checking self-reported resume claims 
    against demonstrated adaptive assessment metrics using neutral observation terminology.
    """
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise NotFoundException("Application not found")

    if app.consistency_report:
        details_raw = json.loads(app.consistency_report.details_json) if app.consistency_report.details_json else []
        details = [ConsistencyDetail(**d) for d in details_raw]
        return ConsistencyReportOut(
            application_id=app.id,
            overall_status=app.consistency_report.overall_status,
            consistency_score=app.consistency_report.consistency_score,
            summary_text=app.consistency_report.summary_text,
            details=details
        )

    # Compute on the fly if not cached
    claimed = [{"skill_name": s.skill_name, "claimed_level": s.level} for s in app.candidate.skills]
    
    # Check if there is a completed assessment
    topic_perf = {}
    if app.assessment_attempts:
        comp = [a for a in app.assessment_attempts if a.status.value == "COMPLETED"]
        if comp:
            q_map = {q.id: q for q in comp[0].assessment.questions}
            summary = adaptive_engine.calculate_attempt_summary(comp[0].answers, q_map)
            topic_perf = summary.get("topic_performance", {})

    report = consistency_service.evaluate_consistency(claimed, topic_perf)

    cons_entity = ConsistencyReport(
        application_id=app.id,
        overall_status=report["overall_status"],
        consistency_score=report["consistency_score"],
        summary_text=report["summary_text"],
        details_json=json.dumps(report["details"])
    )
    db.add(cons_entity)
    db.commit()

    details = [ConsistencyDetail(**d) for d in report["details"]]
    return ConsistencyReportOut(
        application_id=app.id,
        overall_status=report["overall_status"],
        consistency_score=report["consistency_score"],
        summary_text=report["summary_text"],
        details=details
    )
