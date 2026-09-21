import re
from typing import Dict, Any, List, Tuple
from app.services.embeddings import vectorizer
from app.models.job import Job, JobSkill, SkillImportance
from app.models.candidate import CandidateProfile, Resume

class SemanticMatchingService:
    """
    Multi-dimensional semantic matching engine:
    1. Skill Match: Evaluates candidate skills against job requirements with importance weights (High: 1.0, Medium: 0.7, Low: 0.4).
    2. Experience Match: Evaluates years of experience against required experience and domain relevance.
    3. Education Match: Evaluates degree level alignment.
    4. Project Relevance: Computes semantic similarity between candidate projects/experience descriptions and job domain.
    5. Overall Composite Match: Transparent linear combination of the 4 dimensions.
    """

    def parse_required_years(self, exp_str: str) -> float:
        """Parse numeric years required from text like '3-5 years', '5+ years'."""
        if not exp_str:
            return 3.0
        match = re.search(r"(\d+)", exp_str)
        return float(match.group(1)) if match else 3.0

    def calculate_skill_match(self, job_skills: List[JobSkill], candidate_skills: List[str]) -> Tuple[float, Dict[str, Any]]:
        """
        Calculate weighted semantic skill match.
        """
        if not job_skills:
            return 80.0, {}

        weight_map = {
            SkillImportance.HIGH: 1.0,
            SkillImportance.MEDIUM: 0.7,
            SkillImportance.LOW: 0.4
        }

        total_weight = 0.0
        earned_weight = 0.0
        skill_breakdown = {}

        candidate_skills_lower = [s.strip().lower() for s in candidate_skills]

        for req_skill in job_skills:
            w = weight_map.get(req_skill.importance_weight, 0.7)
            total_weight += w

            target = req_skill.skill_name.strip()
            # Find best match among candidate skills
            best_sim = 0.0
            for cs in candidate_skills_lower:
                sim = vectorizer.calculate_skill_similarity(cs, target)
                if sim > best_sim:
                    best_sim = sim

            # Score this skill
            earned_weight += (best_sim * w)
            skill_breakdown[target] = {
                "importance": req_skill.importance_weight.value if hasattr(req_skill.importance_weight, "value") else str(req_skill.importance_weight),
                "similarity": round(best_sim * 100, 1)
            }

        score = (earned_weight / total_weight) * 100 if total_weight > 0 else 0.0
        return round(min(max(score, 0.0), 100.0), 1), skill_breakdown

    def calculate_experience_match(self, required_exp_str: str, candidate_years: float, candidate_text: str, job_text: str) -> float:
        """
        Calculate experience alignment based on duration and domain text relevance.
        """
        target_years = self.parse_required_years(required_exp_str)
        cand_years = float(candidate_years) if candidate_years is not None else 0.0
        
        # Duration ratio
        if target_years <= 0:
            duration_score = 100.0
        elif cand_years >= target_years:
            # Full score if meets or slightly exceeds, capped at 100
            duration_score = 100.0
        else:
            duration_score = (cand_years / target_years) * 90.0

        # Domain semantic relevance
        domain_sim = vectorizer.cosine_similarity(candidate_text, job_text)
        relevance_score = min(max(domain_sim * 100 * 1.5, 40.0), 100.0)

        # 60% duration adherence, 40% domain context
        exp_score = (0.60 * duration_score) + (0.40 * relevance_score)
        return round(min(max(exp_score, 10.0), 100.0), 1)

    def calculate_education_match(self, required_edu: str, candidate_edu: str) -> float:
        """
        Calculate degree and educational qualification match.
        """
        req_lower = (required_edu or "").lower()
        cand_lower = (candidate_edu or "").lower()

        degree_levels = {
            "ph.d": 4, "doctor": 4,
            "master": 3, "m.s": 3, "mba": 3, "m.tech": 3,
            "bachelor": 2, "b.s": 2, "b.tech": 2, "b.e": 2, "degree": 2,
            "associate": 1, "diploma": 1, "high school": 0
        }

        req_lvl = 2  # Default Bachelor's
        for deg, lvl in degree_levels.items():
            if deg in req_lower:
                req_lvl = max(req_lvl, lvl)

        cand_lvl = 2  # Default Bachelor's
        for deg, lvl in degree_levels.items():
            if deg in cand_lower:
                cand_lvl = max(cand_lvl, lvl)

        if cand_lvl >= req_lvl:
            return 95.0 if cand_lvl == req_lvl else 100.0
        elif cand_lvl == req_lvl - 1:
            return 80.0
        else:
            return 65.0

    def calculate_project_relevance(self, candidate_text: str, job_text: str) -> float:
        """
        Calculate semantic similarity of projects/portfolio to job requirements.
        """
        sim = vectorizer.cosine_similarity(candidate_text, job_text)
        # Scaled non-linearly to reflect standard industry portfolio matching
        scaled = min(max((sim * 100 * 1.6) + 20.0, 30.0), 98.0)
        return round(scaled, 1)

    def evaluate_application(
        self,
        job: Job,
        candidate: CandidateProfile,
        resume_text: str = ""
    ) -> Dict[str, Any]:
        """
        Full semantic matching pipeline producing all four dimensions and composite overall score.
        """
        # Gather candidate skills
        candidate_skill_names = [s.skill_name for s in candidate.skills]
        if not candidate_skill_names and candidate.resumes:
            for r in candidate.resumes:
                candidate_skill_names.extend([s.skill_name for s in r.skills])

        # 1. Skill match
        skill_score, skill_breakdown = self.calculate_skill_match(job.skills, candidate_skill_names)

        # 2. Experience match
        cand_full_text = resume_text or (candidate.summary or "")
        exp_score = self.calculate_experience_match(
            job.experience_required,
            candidate.years_of_experience,
            cand_full_text,
            job.description
        )

        # 3. Education match
        edu_score = self.calculate_education_match(
            job.education_required,
            candidate.education_level
        )

        # 4. Project relevance
        proj_score = self.calculate_project_relevance(cand_full_text, job.description)

        # Composite score
        overall = (
            (skill_score * 0.40) +
            (exp_score * 0.25) +
            (edu_score * 0.20) +
            (proj_score * 0.15)
        )
        overall = round(min(max(overall, 0.0), 100.0), 1)

        breakdown = {
            "skill_match": skill_score,
            "experience_match": exp_score,
            "education_match": edu_score,
            "project_relevance": proj_score,
            "skill_breakdown": skill_breakdown,
            "weights": {
                "skill": 0.40,
                "experience": 0.25,
                "education": 0.20,
                "project": 0.15
            }
        }

        return {
            "overall_score": overall,
            "skill_match": skill_score,
            "experience_match": exp_score,
            "education_match": edu_score,
            "project_relevance": proj_score,
            "breakdown": breakdown
        }

matching_service = SemanticMatchingService()
