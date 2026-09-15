import logging
from typing import Dict, Any, List, Optional
from app.services.embeddings import embedding_service

logger = logging.getLogger(__name__)

class FairnessLabService:
    """
    RecruitIQ Fairness Lab Service:
    Provides deep demographic audit simulations, Disparate Impact curves,
    Selection Threshold sensitivity modeling, and isolated counterfactual verification.
    """

    MIN_SAMPLE_SIZE_THRESHOLD = 5

    def simulate_selection_thresholds(
        self,
        candidates: List[Dict[str, Any]],
        category: str = "gender",
        min_thresh: int = 40,
        max_thresh: int = 95,
        step: int = 5
    ) -> Dict[str, Any]:
        """
        Simulate applicant selection metrics across a continuum of cut-off scores.
        Computes Disparate Impact Ratio (4/5ths rule) and Demographic Parity at each threshold.
        """
        attr_key = "demographic_gender" if category.lower() == "gender" else "demographic_age_group"
        
        # Group candidates
        groups: Dict[str, List[Dict[str, Any]]] = {}
        for c in candidates:
            grp = c.get(attr_key) or c.get("gender") or "Unspecified"
            if grp not in groups:
                groups[grp] = []
            groups[grp].append(c)

        group_names = [g for g in groups.keys() if g != "Unspecified"]
        if len(group_names) < 2:
            # Add synthetic contrast group if only 1 group present to allow educational simulation
            primary_name = group_names[0] if group_names else "Majority Group"
            group_names = [primary_name, "Comparison Group"]
            if primary_name not in groups:
                groups[primary_name] = candidates
            groups["Comparison Group"] = []

        grp_a = group_names[0]
        grp_b = group_names[1]

        candidates_a = groups.get(grp_a, [])
        candidates_b = groups.get(grp_b, [])
        total_n = len(candidates)
        is_small_sample = total_n < self.MIN_SAMPLE_SIZE_THRESHOLD

        simulation_curve = []
        best_threshold = 70
        best_balance_score = -1.0

        for thresh in range(min_thresh, max_thresh + 1, step):
            selected_a = [c for c in candidates_a if c.get("overall_score", c.get("match_score", 0.0)) >= thresh]
            selected_b = [c for c in candidates_b if c.get("overall_score", c.get("match_score", 0.0)) >= thresh]
            total_selected = selected_a + selected_b

            rate_a = (len(selected_a) / len(candidates_a) * 100.0) if candidates_a else 0.0
            rate_b = (len(selected_b) / len(candidates_b) * 100.0) if candidates_b else 0.0

            # Disparate Impact Ratio: min(rate) / max(rate)
            if max(rate_a, rate_b) > 0:
                dir_ratio = min(rate_a, rate_b) / max(rate_a, rate_b)
            else:
                dir_ratio = 1.0  # 0 selected in both => parity

            # 4/5ths rule (DIR >= 0.80)
            four_fifths_compliant = dir_ratio >= 0.80
            parity_diff = abs(rate_a - rate_b)

            # Combined score for threshold recommendation: quality (threshold) + fairness (DIR)
            balance = (thresh / 100.0) * 0.4 + (dir_ratio * 0.6)
            if four_fifths_compliant and balance > best_balance_score:
                best_balance_score = balance
                best_threshold = thresh

            simulation_curve.append({
                "threshold": thresh,
                "total_selected": len(total_selected),
                "overall_selection_rate": round(len(total_selected) / total_n * 100.0, 1) if total_n > 0 else 0.0,
                f"rate_{grp_a}": round(rate_a, 1),
                f"rate_{grp_b}": round(rate_b, 1),
                f"count_{grp_a}": len(selected_a),
                f"count_{grp_b}": len(selected_b),
                "disparate_impact_ratio": round(dir_ratio, 3),
                "four_fifths_compliant": four_fifths_compliant,
                "demographic_parity_diff": round(parity_diff, 1)
            })

        sample_warning = None
        if is_small_sample:
            sample_warning = (
                f"Sample size ({total_n}) is below recommended statistical threshold (N >= {self.MIN_SAMPLE_SIZE_THRESHOLD}). "
                "Calculated ratios are indicative for decision-support and should not be treated as formal legal proof."
            )

        return {
            "category": category,
            "group_a": grp_a,
            "group_b": grp_b,
            "total_candidates": total_n,
            "is_small_sample": is_small_sample,
            "sample_size_warning": sample_warning,
            "recommended_threshold": best_threshold,
            "simulation_curve": simulation_curve
        }

    def run_isolated_counterfactual(
        self,
        candidate_data: Dict[str, Any],
        job_data: Dict[str, Any],
        attribute_to_perturb: str = "gender",
        simulated_values: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Isolated Counterfactual Audit Sandbox:
        Evaluates candidate scoring while strictly perturbing protected demographic attributes.
        Demonstrates that RecruitIQ decision models are demographically invariant (Score Delta = 0.0).
        """
        if not simulated_values:
            if attribute_to_perturb.lower() == "gender":
                simulated_values = ["Female", "Male", "Non-Binary"]
            elif attribute_to_perturb.lower() == "age_group":
                simulated_values = ["<25", "25-34", "35-49", "50+"]
            else:
                simulated_values = ["Group A", "Group B"]

        original_val = candidate_data.get(f"demographic_{attribute_to_perturb}") or candidate_data.get(attribute_to_perturb) or "Original"
        
        # Base evaluation (using dense embedding + resume credentials)
        base_match = embedding_service.multi_dimensional_match(job_data, candidate_data)
        base_score = base_match.get("overall_score", 0.0)

        perturbation_results = []
        max_delta = 0.0

        for sim_val in simulated_values:
            # Create perturbed copy in pure memory sandbox
            cloned_candidate = dict(candidate_data)
            cloned_candidate[f"demographic_{attribute_to_perturb}"] = sim_val
            cloned_candidate[attribute_to_perturb] = sim_val

            # Evaluate cloned candidate
            perturbed_match = embedding_service.multi_dimensional_match(job_data, cloned_candidate)
            perturbed_score = perturbed_match.get("overall_score", 0.0)
            delta = round(perturbed_score - base_score, 2)
            if abs(delta) > max_delta:
                max_delta = abs(delta)

            perturbation_results.append({
                "perturbed_attribute": attribute_to_perturb,
                "perturbed_value": sim_val,
                "resulting_score": perturbed_score,
                "score_delta": delta,
                "invariant": delta == 0.0
            })

        is_invariant = max_delta == 0.0
        conclusion = (
            f"Counterfactual Invariance Confirmed: Altering {attribute_to_perturb} across {len(simulated_values)} "
            f"demographic states produced exactly 0.0 score deviation (Max Delta: {max_delta}). "
            "Scoring models operate strictly on competencies, experience, projects, and verified rubrics."
        ) if is_invariant else (
            f"Discrepancy detected: Max Delta is {max_delta}. Review feature inputs for proxy correlations."
        )

        return {
            "candidate_id": candidate_data.get("id"),
            "candidate_name": candidate_data.get("full_name", "Anonymous Candidate"),
            "audited_attribute": attribute_to_perturb,
            "original_attribute_value": original_val,
            "baseline_score": base_score,
            "is_counterfactually_fair": is_invariant,
            "max_score_delta": max_delta,
            "audit_conclusion": conclusion,
            "simulations": perturbation_results
        }

fairness_lab_service = FairnessLabService()
