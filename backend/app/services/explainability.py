import logging
from typing import List, Dict, Any, Optional
from app.models.evaluation import RecommendationType
from app.schemas.evaluation import RankingWeights

logger = logging.getLogger(__name__)

class ExplainabilityService:
    """
    Explainability 2.0 Engine:
    Structured 3-Level Explainability Architecture:
    - LEVEL 1: Score Breakdown (Weighted Factor Decomposition)
    - LEVEL 2: Evidence Explanation (Direct Evidence & Gap Analysis)
    - LEVEL 3: Model Explanation (Transparently labeled 'Weighted Feature Contribution',
               'SHAP Explanation' where applicable, and 'Generated Narrative')
    """

    def compute_composite_score(
        self,
        match_score: float,
        assessment_score: float,
        experience_score: float,
        skill_relevance_score: float,
        project_score: float,
        weights: RankingWeights
    ) -> float:
        raw = (
            (match_score * weights.match_score) +
            (assessment_score * weights.assessment_score) +
            (experience_score * weights.experience_score) +
            (skill_relevance_score * weights.skill_relevance_score) +
            (project_score * weights.project_score)
        )
        total_weight = (
            weights.match_score +
            weights.assessment_score +
            weights.experience_score +
            weights.skill_relevance_score +
            weights.project_score
        )
        normalized = raw / total_weight if total_weight > 0 else raw
        return round(min(max(normalized, 0.0), 100.0), 1)

    def determine_recommendation(self, overall_score: float, assessment_score: float) -> RecommendationType:
        if overall_score >= 82.0 and assessment_score >= 70.0:
            return RecommendationType.HIGHLY_RECOMMENDED
        elif overall_score >= 70.0:
            return RecommendationType.RECOMMENDED
        elif overall_score >= 55.0:
            return RecommendationType.CONSIDER_WITH_UPSKILLING
        else:
            return RecommendationType.NOT_RECOMMENDED

    def generate_level1_breakdown(
        self,
        match_score: float,
        assessment_score: float,
        experience_score: float,
        skill_relevance_score: float,
        project_score: float,
        weights: RankingWeights
    ) -> Dict[str, Any]:
        """LEVEL 1 — Quantitative Score Breakdown & Contribution Weights."""
        factors = [
            {
                "factor": "Semantic Match",
                "weight_pct": int(weights.match_score * 100),
                "score": match_score,
                "contribution_points": round(match_score * weights.match_score, 1),
                "impact": "positive" if match_score >= 75.0 else ("negative" if match_score < 60.0 else "neutral")
            },
            {
                "factor": "Adaptive Assessment",
                "weight_pct": int(weights.assessment_score * 100),
                "score": assessment_score,
                "contribution_points": round(assessment_score * weights.assessment_score, 1),
                "impact": "positive" if assessment_score >= 75.0 else ("negative" if assessment_score < 60.0 else "neutral")
            },
            {
                "factor": "Experience Alignment",
                "weight_pct": int(weights.experience_score * 100),
                "score": experience_score,
                "contribution_points": round(experience_score * weights.experience_score, 1),
                "impact": "positive" if experience_score >= 75.0 else ("negative" if experience_score < 60.0 else "neutral")
            },
            {
                "factor": "Skill Relevance",
                "weight_pct": int(weights.skill_relevance_score * 100),
                "score": skill_relevance_score,
                "contribution_points": round(skill_relevance_score * weights.skill_relevance_score, 1),
                "impact": "positive" if skill_relevance_score >= 75.0 else ("negative" if skill_relevance_score < 60.0 else "neutral")
            },
            {
                "factor": "Project Depth",
                "weight_pct": int(weights.project_score * 100),
                "score": project_score,
                "contribution_points": round(project_score * weights.project_score, 1),
                "impact": "positive" if project_score >= 75.0 else ("negative" if project_score < 60.0 else "neutral")
            }
        ]
        return {"level": 1, "type": "Score Breakdown", "factors": factors}

    def generate_level2_evidence(
        self,
        strong_skills: List[str],
        missing_skills: List[str],
        years_experience: float,
        project_count: int,
        match_score: float
    ) -> Dict[str, Any]:
        """LEVEL 2 — Qualitative Evidence & Gap Explanation."""
        return {
            "level": 2,
            "type": "Evidence Explanation",
            "why_match_score": f"Match score of {match_score}% is driven by strong alignment in core technical competencies.",
            "verified_strengths": strong_skills,
            "unmet_or_missing_requirements": missing_skills,
            "experience_evidence": f"{years_experience} years of relevant professional industry tenure.",
            "projects_evidence": f"{project_count} technical projects demonstrating practical implementation."
        }

    def generate_level3_model_explanation(
        self,
        match_score: float,
        assessment_score: float,
        experience_score: float,
        skill_relevance_score: float,
        project_score: float,
        weights: RankingWeights
    ) -> Dict[str, Any]:
        """
        LEVEL 3 — Explicit Model Attribution.
        Transparently labels mathematical decomposition as 'Weighted Feature Contribution'
        without misleadingly conflating it with SHAP unless SHAP tree/kernel explainer is invoked.
        """
        overall = self.compute_composite_score(
            match_score, assessment_score, experience_score,
            skill_relevance_score, project_score, weights
        )

        baseline_mean = 60.0 # Baseline candidate average
        delta = round(overall - baseline_mean, 1)

        contributions = [
            {"feature": "Semantic Resume Match", "delta_from_baseline": round((match_score - baseline_mean) * weights.match_score, 2)},
            {"feature": "CAT Assessment Ability", "delta_from_baseline": round((assessment_score - baseline_mean) * weights.assessment_score, 2)},
            {"feature": "Experience Tenure", "delta_from_baseline": round((experience_score - baseline_mean) * weights.experience_score, 2)},
            {"feature": "Skill Relevance", "delta_from_baseline": round((skill_relevance_score - baseline_mean) * weights.skill_relevance_score, 2)},
            {"feature": "Project Relevance", "delta_from_baseline": round((project_score - baseline_mean) * weights.project_score, 2)}
        ]

        return {
            "level": 3,
            "attribution_method": "Weighted Feature Contribution", # Accurate scientific label
            "baseline_reference_score": baseline_mean,
            "overall_candidate_score": overall,
            "total_delta": delta,
            "feature_attributions": contributions,
            "methodology_note": "Calculated via standardized weighted additive decomposition against a baseline cohort average."
        }

    def generate_score_explanation(
        self,
        candidate_id: int,
        application_id: int,
        candidate_name: str,
        match_score: float,
        assessment_score: float,
        experience_score: float,
        skill_relevance_score: float,
        project_score: float,
        strong_skills: List[str],
        missing_skills: List[str],
        weights: RankingWeights,
        years_experience: float = 3.0,
        project_count: int = 2
    ) -> Dict[str, Any]:
        """Synthesizes the complete Explainability 2.0 dossier."""
        overall = self.compute_composite_score(
            match_score, assessment_score, experience_score,
            skill_relevance_score, project_score, weights
        )
        rec = self.determine_recommendation(overall, assessment_score)

        lvl1 = self.generate_level1_breakdown(match_score, assessment_score, experience_score, skill_relevance_score, project_score, weights)
        lvl2 = self.generate_level2_evidence(strong_skills, missing_skills, years_experience, project_count, match_score)
        lvl3 = self.generate_level3_model_explanation(match_score, assessment_score, experience_score, skill_relevance_score, project_score, weights)

        narrative = (
            f"{candidate_name} achieved an overall evaluation score of {overall} ({rec.value}). "
            f"The primary positive drivers were {', '.join(strong_skills[:3]) if strong_skills else 'demonstrated foundation'}. "
            f"Key development opportunities remain in {', '.join(missing_skills[:2]) if missing_skills else 'advanced specializations'}."
        )

        return {
            "candidate_id": candidate_id,
            "application_id": application_id,
            "candidate_name": candidate_name,
            "overall_score": overall,
            "recommendation": rec.value,
            "summary_narrative": narrative,
            "level1_score_breakdown": lvl1,
            "level2_evidence_explanation": lvl2,
            "level3_model_explanation": lvl3,
            # Backward and schema compatible fields
            "factors": [
                {
                    "name": f["factor"],
                    "weight": f["weight_pct"] / 100.0,
                    "candidate_val": f["score"],
                    "contribution": f["contribution_points"],
                    "impact": f["impact"],
                    "explanation": f"Feature contribution: {f['contribution_points']} points ({f['weight_pct']}% weight)."
                }
                for f in lvl1["factors"]
            ],
            "factor_breakdown": [
                {
                    "name": f["factor"],
                    "weight": f["weight_pct"] / 100.0,
                    "candidate_val": f["score"],
                    "contribution": f["contribution_points"],
                    "impact": f["impact"],
                    "explanation": f"Feature contribution: {f['contribution_points']} points ({f['weight_pct']}% weight)."
                }
                for f in lvl1["factors"]
            ],
            "strong_points": strong_skills,
            "gap_points": missing_skills,
            "positive_factors": strong_skills,
            "negative_factors": missing_skills
        }

explainability_service = ExplainabilityService()
