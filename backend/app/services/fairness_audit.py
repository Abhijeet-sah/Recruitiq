from typing import List, Dict, Any
from app.models.fairness import DisparityFlag
from app.models.candidate import CandidateProfile, Application, ApplicationStatus

class FairnessAuditService:
    """
    Dedicated algorithmic fairness auditing engine.
    Applies Fairlearn-compatible metrics to evaluate parity across protected/proxy groups.
    Demographic attributes are strictly isolated to this audit and NEVER input to scoring models.
    """

    def audit_job_applications(
        self,
        job_id: int,
        job_title: str,
        candidates_with_scores: List[Dict[str, Any]],
        audit_category: str = "Gender",
        selection_threshold: float = 70.0
    ) -> Dict[str, Any]:
        """
        Compute demographic parity, selection rates, and equal opportunity metrics.
        """
        # Group candidates by demographic category
        group_key = "demographic_gender" if audit_category.lower() == "gender" else "demographic_age_group"
        
        groups: Dict[str, List[Dict[str, Any]]] = {}
        for c in candidates_with_scores:
            grp = c.get(group_key) or "Unspecified"
            if grp not in groups:
                groups[grp] = []
            groups[grp].append(c)

        # Standardize on the two primary groups (e.g. Male vs Female, or <35 vs >=35)
        keys = list(groups.keys())
        grp_a_name = keys[0] if len(keys) > 0 else "Group A"
        grp_b_name = keys[1] if len(keys) > 1 else "Group B"

        group_a = groups.get(grp_a_name, [])
        group_b = groups.get(grp_b_name, [])

        def calc_group_stats(cand_list: List[Dict[str, Any]], name: str) -> Dict[str, Any]:
            total = len(cand_list)
            if total == 0:
                return {
                    "group_name": name,
                    "total_candidates": 0,
                    "selected_count": 0,
                    "selection_rate": 0.0,
                    "avg_score": 0.0,
                    "true_positive_rate": 0.0,
                    "false_positive_rate": 0.0
                }

            # Selected candidates meet threshold
            selected = [c for c in cand_list if c.get("overall_score", 0.0) >= selection_threshold]
            sel_count = len(selected)
            sel_rate = round((sel_count / total) * 100, 1)
            avg_score = round(sum(c.get("overall_score", 0.0) for c in cand_list) / total, 1)

            # Ground truth proxy: verified assessment score >= 70
            qualified = [c for c in cand_list if c.get("assessment_score", 0.0) >= 65.0]
            unqualified = [c for c in cand_list if c.get("assessment_score", 0.0) < 65.0]

            tp = sum(1 for c in selected if c in qualified)
            fp = sum(1 for c in selected if c in unqualified)

            tpr = round((tp / len(qualified)) * 100, 1) if qualified else 100.0
            fpr = round((fp / len(unqualified)) * 100, 1) if unqualified else 0.0

            return {
                "group_name": name,
                "total_candidates": total,
                "selected_count": sel_count,
                "selection_rate": sel_rate,
                "avg_score": avg_score,
                "true_positive_rate": tpr,
                "false_positive_rate": fpr
            }

        stats_a = calc_group_stats(group_a, grp_a_name)
        stats_b = calc_group_stats(group_b, grp_b_name)

        sel_diff = round(abs(stats_a["selection_rate"] - stats_b["selection_rate"]), 1)
        demographic_parity = sel_diff
        equal_opp_diff = round(abs(stats_a["true_positive_rate"] - stats_b["true_positive_rate"]), 1)

        # Classify disparity
        if sel_diff <= 8.0:
            flag = DisparityFlag.NO_OBVIOUS_DISPARITY
            summary = (
                f"No obvious disparity detected between {grp_a_name} ({stats_a['selection_rate']}%) "
                f"and {grp_b_name} ({stats_b['selection_rate']}%). "
                f"Selection rate delta is {sel_diff}%, within standard variance thresholds."
            )
        elif sel_diff <= 15.0:
            flag = DisparityFlag.POTENTIAL_DISPARITY
            summary = (
                f"Potential disparity observed: {grp_a_name} selection rate is {stats_a['selection_rate']}%, "
                f"whereas {grp_b_name} is {stats_b['selection_rate']}% (Delta: {sel_diff}%). "
                f"Recruiter review and broader pool sourcing recommended."
            )
        else:
            flag = DisparityFlag.NEEDS_INVESTIGATION
            summary = (
                f"Disparity threshold exceeded: Selection difference is {sel_diff}% between {grp_a_name} and {grp_b_name}. "
                f"Auditing pipeline qualifications and job requirements is strongly advised."
            )

        metrics_table = [stats_a, stats_b]
        # Include remaining groups if any
        for k in keys[2:]:
            metrics_table.append(calc_group_stats(groups[k], k))

        return {
            "job_id": job_id,
            "job_title": job_title,
            "audit_category": audit_category,
            "selection_rate_group_a": stats_a["selection_rate"],
            "selection_rate_group_b": stats_b["selection_rate"],
            "selection_rate_difference": sel_diff,
            "demographic_parity_diff": demographic_parity,
            "equal_opportunity_diff": equal_opp_diff,
            "disparity_flag": flag,
            "summary_text": summary,
            "metrics_table": metrics_table
        }

fairness_service = FairnessAuditService()
