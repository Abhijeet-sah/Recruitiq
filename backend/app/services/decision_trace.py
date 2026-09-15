import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.governance import DecisionTrace, RecruiterOverride

logger = logging.getLogger(__name__)

def make_json_safe(obj: Any) -> Any:
    if isinstance(obj, (set, tuple)):
        return list(obj)
    if hasattr(obj, "isoformat"):
        return obj.isoformat()
    return str(obj)

class DecisionTraceService:
    """
    Immutable Decision Trace and Audit Trail Service:
    Logs all automated AI decisions and human recruiter actions with exact timestamps,
    models invoked, input summaries, output explanations, and recruiter justifications.
    """

    def record_trace(
        self,
        db: Session,
        application_id: int,
        action_name: str,
        actor_type: str = "AI_SERVICE",
        actor_id: Optional[int] = None,
        service_used: Optional[str] = None,
        model_version: Optional[str] = None,
        input_summary: Optional[str] = None,
        output_summary: Optional[Dict[str, Any]] = None,
        reasoning_text: Optional[str] = None
    ) -> DecisionTrace:
        try:
            output_json = json.dumps(output_summary, default=make_json_safe) if output_summary else None
            trace = DecisionTrace(
                application_id=application_id,
                actor_type=actor_type,
                actor_id=actor_id,
                action_name=action_name,
                service_used=service_used,
                model_version=model_version or "1.0",
                input_summary=input_summary,
                output_summary_json=output_json,
                reasoning_text=reasoning_text
            )
            db.add(trace)
            db.commit()
            db.refresh(trace)
            return trace
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to record decision trace: {e}")
            return None

    def get_traces_for_application(
        self,
        db: Session,
        application_id: int
    ) -> List[Dict[str, Any]]:
        traces = db.query(DecisionTrace).filter(
            DecisionTrace.application_id == application_id
        ).order_by(DecisionTrace.created_at.asc()).all()

        results = []
        for t in traces:
            output_data = {}
            if t.output_summary_json:
                try:
                    output_data = json.loads(t.output_summary_json)
                except Exception:
                    output_data = {"raw": t.output_summary_json}

            results.append({
                "id": t.id,
                "application_id": t.application_id,
                "timestamp": t.created_at.isoformat() if t.created_at else None,
                "actor_type": t.actor_type,
                "actor_id": t.actor_id,
                "action_name": t.action_name,
                "service_used": t.service_used,
                "model_version": t.model_version,
                "input_summary": t.input_summary,
                "output_summary": output_data,
                "reasoning_text": t.reasoning_text
            })
        return results

    def record_override(
        self,
        db: Session,
        application_id: int,
        recruiter_id: int,
        ai_recommendation: str,
        human_decision: str,
        override_reason: str
    ) -> Dict[str, Any]:
        try:
            override = RecruiterOverride(
                application_id=application_id,
                recruiter_id=recruiter_id,
                ai_recommendation=ai_recommendation,
                human_decision=human_decision,
                override_reason=override_reason
            )
            db.add(override)
            
            # Also log as a decision trace for unified audit trail
            self.record_trace(
                db=db,
                application_id=application_id,
                actor_type="RECRUITER",
                actor_id=recruiter_id,
                action_name="RECRUITER_HUMAN_OVERRIDE",
                service_used="HumanReviewPanel",
                model_version="N/A",
                input_summary=f"AI Recommendation: {ai_recommendation}",
                output_summary={"override_decision": human_decision},
                reasoning_text=override_reason
            )

            db.commit()
            db.refresh(override)
            return {
                "id": override.id,
                "application_id": override.application_id,
                "recruiter_id": override.recruiter_id,
                "ai_recommendation": override.ai_recommendation,
                "human_decision": override.human_decision,
                "override_reason": override.override_reason,
                "created_at": override.created_at.isoformat() if override.created_at else None
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to record recruiter override: {e}")
            raise e

decision_trace_service = DecisionTraceService()
