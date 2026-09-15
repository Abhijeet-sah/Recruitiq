import re
from typing import Dict, Any, List
from app.models.job import SkillImportance
from app.services.resume_parser import ResumeParserService

class JobAnalyzerService:
    """
    AI-powered Job Description Analyzer.
    Extracts required skills, preferred skills, experience thresholds, 
    education criteria, and assigns importance weights (High, Medium, Low).
    """

    TECH_DOMAINS = {
        "data_science": ["python", "machine learning", "deep learning", "sql", "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow", "statistics", "data analysis"],
        "frontend": ["react", "javascript", "typescript", "html", "css", "tailwind css", "next.js", "vue", "redux", "ui/ux", "responsive design"],
        "backend": ["fastapi", "django", "flask", "node.js", "express", "postgresql", "mysql", "mongodb", "redis", "rest api", "graphql", "microservices"],
        "devops": ["docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "terraform", "linux", "jenkins", "git", "cloud computing", "ansible"],
        "general": ["git", "agile", "scrum", "problem solving", "communication", "unit testing", "system design"]
    }

    def analyze_job(self, title: str, description: str) -> Dict[str, Any]:
        """
        Extract structured competencies, weighting, and metadata from job description.
        """
        desc_lower = description.lower()
        title_lower = (title or "").lower()
        
        # 1. Experience extraction
        exp_match = re.search(r"(\d+)\s*(?:to|-|\+)?\s*(\d+)?\s*(?:years?|yrs?)(?:\s+of\s+experience)?", desc_lower)
        if exp_match:
            min_exp = exp_match.group(1)
            max_exp = exp_match.group(2)
            if max_exp:
                experience_level = f"{min_exp}-{max_exp} years"
            else:
                experience_level = f"{min_exp}+ years"
        else:
            if "senior" in title_lower or "lead" in title_lower:
                experience_level = "5+ years"
            elif "junior" in title_lower or "intern" in title_lower:
                experience_level = "0-2 years"
            else:
                experience_level = "3-5 years"

        # 2. Education extraction
        if any(w in desc_lower for w in ["master", "ph.d", "doctorate", "m.s."]):
            education_criteria = "Master's or Ph.D. in Computer Science, Data Science, or related field"
        else:
            education_criteria = "Bachelor's Degree in Computer Science, Software Engineering, or equivalent experience"

        # 3. Skills and Importance Weights
        all_skills = ResumeParserService.KNOWN_SKILLS
        extracted_skills = []
        found_skills = set()

        for skill in all_skills:
            pattern = r"(?:\b|_)" + re.escape(skill) + r"(?:\b|_)"
            if re.search(pattern, desc_lower) or re.search(pattern, title_lower):
                found_skills.add(skill)
                
                # Determine importance
                # Title skills or repeated/highlighted skills get HIGH
                is_in_title = skill in title_lower
                count_in_desc = len(re.findall(pattern, desc_lower))
                
                # Check for section markers
                idx = desc_lower.find(skill)
                window = desc_lower[max(0, idx - 80):min(len(desc_lower), idx + 80)]
                
                is_preferred = any(p in window for p in ["preferred", "nice to have", "plus", "bonus", "optional"])
                
                if is_in_title or count_in_desc >= 3 or any(r in window for r in ["must have", "required", "essential", "core", "proficient"]):
                    importance = SkillImportance.HIGH
                    is_req = True
                elif is_preferred:
                    importance = SkillImportance.LOW
                    is_req = False
                else:
                    importance = SkillImportance.MEDIUM
                    is_req = True

                # Determine category
                category = "Technical"
                if skill in ["git", "agile", "scrum", "unit testing"]:
                    category = "Engineering Practices"
                elif skill in ["aws", "gcp", "azure", "docker", "kubernetes"]:
                    category = "Cloud & Infrastructure"

                extracted_skills.append({
                    "skill_name": skill.title() if len(skill) > 3 else skill.upper(),
                    "is_required": is_req,
                    "importance_weight": importance,
                    "category": category
                })

        # Ensure at least 4-6 skills if description is sparse
        if len(extracted_skills) < 4:
            fallbacks = [
                ("Python", True, SkillImportance.HIGH, "Core Language"),
                ("SQL", True, SkillImportance.HIGH, "Database"),
                ("Git", True, SkillImportance.MEDIUM, "Version Control"),
                ("Docker", False, SkillImportance.LOW, "DevOps"),
            ]
            for s_name, req, imp, cat in fallbacks:
                if not any(s["skill_name"].lower() == s_name.lower() for s in extracted_skills):
                    extracted_skills.append({
                        "skill_name": s_name,
                        "is_required": req,
                        "importance_weight": imp,
                        "category": cat
                    })

        # Sort: High importance first
        importance_rank = {SkillImportance.HIGH: 0, SkillImportance.MEDIUM: 1, SkillImportance.LOW: 2}
        extracted_skills.sort(key=lambda x: importance_rank.get(x["importance_weight"], 1))

        # Keywords extraction
        key_keywords = [s["skill_name"] for s in extracted_skills[:6]]
        if "data" in title_lower or "data" in desc_lower:
            key_keywords.extend(["Analytics", "Pipeline", "Optimization"])
        if "api" in desc_lower or "backend" in title_lower:
            key_keywords.extend(["REST APIs", "Microservices"])

        summary = (
            f"This role seeks a professional with approximately {experience_level} of experience. "
            f"Key technical drivers include {', '.join([s['skill_name'] for s in extracted_skills[:3]])}. "
            f"Target qualification: {education_criteria}."
        )

        return {
            "suggested_title": title or "Software Engineering Role",
            "experience_level": experience_level,
            "education_criteria": education_criteria,
            "key_keywords": list(dict.fromkeys(key_keywords)),
            "extracted_skills": extracted_skills,
            "summary": summary
        }

job_analyzer = JobAnalyzerService()
