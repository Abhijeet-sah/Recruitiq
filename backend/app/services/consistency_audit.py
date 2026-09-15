from typing import List, Dict, Any
from app.models.evaluation import ConsistencyStatus
from app.models.candidate import CandidateSkill, ResumeSkill

class ConsistencyAuditService:
    """
    Analyzes resume self-claims against empirically verified assessment performance.
    Adheres strictly to neutral, non-accusatory, evidence-based phrasing:
    - 'Consistent'
    - 'Under-demonstrated'
    - 'Stronger than claimed'
    - 'Insufficient evidence'
    """

    EXPECTED_PERFORMANCE_THRESHOLDS = {
        "beginner": (40.0, 65.0),
        "intermediate": (65.0, 85.0),
        "advanced": (80.0, 100.0),
        "expert": (85.0, 100.0)
    }

    def evaluate_consistency(
        self,
        claimed_skills: List[Dict[str, Any]],
        topic_performance: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Cross-analyze claimed skills with tested topic results.
        """
        details = []
        consistent_count = 0
        tested_count = 0

        for claim in claimed_skills:
            skill_name = claim.get("skill_name", "").strip()
            level = claim.get("claimed_level", "Intermediate").strip().lower()
            
            # Find matching topic in test performance
            matched_perf = None
            for topic, score in topic_performance.items():
                if topic.lower() == skill_name.lower() or skill_name.lower() in topic.lower():
                    matched_perf = score
                    break

            if matched_perf is None:
                # Skill wasn't evaluated in this assessment
                status = ConsistencyStatus.INSUFFICIENT_EVIDENCE
                obs = f"Claimed as {level.title()}, but not tested in the assessment."
                evidence = "No assessment questions administered for this topic."
                perf_val = 0.0
            else:
                tested_count += 1
                perf_val = matched_perf
                min_exp, max_exp = self.EXPECTED_PERFORMANCE_THRESHOLDS.get(level, (60.0, 85.0))

                if perf_val >= min_exp:
                    if level == "beginner" and perf_val >= 80.0:
                        status = ConsistencyStatus.STRONGER_THAN_CLAIMED
                        obs = f"Demonstrated performance ({perf_val}%) exceeds beginner claim."
                        consistent_count += 1
                    else:
                        status = ConsistencyStatus.CONSISTENT
                        obs = f"Demonstrated evidence ({perf_val}%) aligns with claimed {level.title()} proficiency."
                        consistent_count += 1
                else:
                    status = ConsistencyStatus.UNDER_DEMONSTRATED
                    obs = f"Claimed {level.title()} proficiency differs from current test result ({perf_val}%)."

                evidence = f"Scored {perf_val}% across adaptive assessment questions."

            details.append({
                "skill": skill_name,
                "claimed_level": level.title(),
                "demonstrated_percentage": perf_val,
                "assessment_evidence": evidence,
                "status": status,
                "neutral_observation": obs
            })

        # Overall synthesis
        if tested_count == 0:
            overall_status = ConsistencyStatus.INSUFFICIENT_EVIDENCE
            consistency_score = 75.0
            summary = "Insufficient assessment data available to perform full empirical cross-verification."
        else:
            ratio = consistent_count / tested_count
            consistency_score = round(ratio * 100, 1)
            if ratio >= 0.70:
                overall_status = ConsistencyStatus.CONSISTENT
                summary = f"Strong consistency observed: {consistent_count} of {tested_count} tested skills matched or exceeded self-reported resume claims."
            else:
                overall_status = ConsistencyStatus.UNDER_DEMONSTRATED
                summary = f"Evidence differences noted: {tested_count - consistent_count} of {tested_count} tested skills showed lower scores than self-reported resume levels. Recruiter review recommended."

        return {
            "overall_status": overall_status,
            "consistency_score": consistency_score,
            "summary_text": summary,
            "details": details
        }

consistency_service = ConsistencyAuditService()
