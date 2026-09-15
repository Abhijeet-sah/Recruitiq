import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class UncertaintyEngine:
    """
    Uncertainty-Aware AI Engine:
    Calculates empirical confidence levels and uncertainty bounds for candidate scores and recommendations.
    Prevents the platform from projecting unwarranted certainty when evidence is sparse or contradictory.
    """

    @staticmethod
    def calculate_confidence(
        evidence_count: int,
        parsing_confidence: float,
        semantic_score: float,
        has_assessment: bool,
        assessment_score: Optional[float] = None,
        module_discrepancy_penalty: float = 0.0,
        missing_critical_skills_count: int = 0
    ) -> Dict[str, Any]:
        """
        Synthesizes multi-factor empirical confidence:
        1. Parsing confidence baseline (20%)
        2. Evidence grounding depth (25%)
        3. Assessment verification (25%)
        4. Consistency & cross-module consensus (20%)
        5. Data completeness (10%)
        """
        # 1. Parsing confidence component
        c_parse = max(0.0, min(100.0, parsing_confidence or 75.0)) * 0.20

        # 2. Evidence depth (diminishing returns up to 10 distinct citations)
        ev_depth = min(evidence_count / 8.0, 1.0) * 100.0
        c_evidence = ev_depth * 0.25

        # 3. Assessment verification
        if has_assessment and assessment_score is not None:
            c_assessment = 25.0
        elif has_assessment:
            c_assessment = 18.0
        else:
            c_assessment = 5.0 # Unverified claims hold higher uncertainty

        # 4. Consistency / Discrepancy
        c_consensus = max(0.0, 20.0 - module_discrepancy_penalty)

        # 5. Data completeness penalty
        c_completeness = max(0.0, 10.0 - (missing_critical_skills_count * 2.5))

        total_confidence = round(c_parse + c_evidence + c_assessment + c_consensus + c_completeness, 1)
        total_confidence = max(10.0, min(98.0, total_confidence))

        if total_confidence >= 80.0:
            status = "HIGH_CONFIDENCE"
            summary = "High evidentiary confidence based on multi-source verified capability."
            human_review_recommended = False
        elif total_confidence >= 60.0:
            status = "MODERATE_CONFIDENCE"
            summary = "Moderate confidence with adequate evidence. Routine recruiter verification suggested."
            human_review_recommended = False
        else:
            status = "LOW_CONFIDENCE"
            summary = "Insufficient or divergent evidence across evaluation stages — human review strongly recommended."
            human_review_recommended = True

        return {
            "confidence_score": total_confidence,
            "status": status,
            "summary": summary,
            "human_review_recommended": human_review_recommended,
            "breakdown": {
                "parsing_reliability": round(c_parse, 1),
                "evidence_grounding_depth": round(c_evidence, 1),
                "assessment_verification": round(c_assessment, 1),
                "cross_module_consensus": round(c_consensus, 1),
                "data_completeness": round(c_completeness, 1)
            }
        }

uncertainty_engine = UncertaintyEngine()
