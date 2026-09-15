from typing import Dict, Any, List
from app.models.job import JobSkill
from app.services.embeddings import vectorizer

class SkillGapService:
    """
    Skill Gap Analyzer.
    Categorizes job requirements against candidate skill competencies into:
    - Strong Skills: Verified or high semantic match (>= 80%)
    - Moderate Skills: Found with moderate alignment (40% - 79%)
    - Missing Skills: Lacking or insufficient demonstration (< 40%)
    """

    def analyze_gaps(self, job_skills: List[JobSkill], candidate_skills: List[str]) -> Dict[str, List[str]]:
        strong = []
        moderate = []
        missing = []

        candidate_skills_clean = [s.strip() for s in candidate_skills if s.strip()]

        for req in job_skills:
            req_name = req.skill_name.strip()
            best_sim = 0.0

            for cand_skill in candidate_skills_clean:
                sim = vectorizer.calculate_skill_similarity(cand_skill, req_name)
                if sim > best_sim:
                    best_sim = sim

            if best_sim >= 0.80:
                strong.append(req_name)
            elif best_sim >= 0.40:
                moderate.append(req_name)
            else:
                missing.append(req_name)

        return {
            "strong_skills": strong,
            "moderate_skills": moderate,
            "missing_skills": missing
        }

skill_gap_service = SkillGapService()
