import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class JDQualityAnalyzer:
    """
    Job Description Quality, Inclusivity & Realism Analyzer:
    Analyzes job descriptions for exclusionary language, unrealistic requirements,
    credential bias, and requirement overload.
    """

    MASCULINE_CODED_WORDS = [
        "rockstar", "ninja", "guru", "hacker", "dominate", "aggressive", "cut-throat",
        "superhero", "killer instinct", "work hard play hard", "relentless", "fearless"
    ]

    FEMININE_CODED_WORDS = [
        "nurturing", "supportive", "sympathetic", "compassionate", "sensitive", "pleasant"
    ]

    UNREALISTIC_TECH_AGE = {
        "fastapi": (2018, 6),
        "kubernetes": (2014, 10),
        "next.js": (2016, 8),
        "vue": (2014, 10),
        "flutter": (2017, 7),
        "rust": (2015, 9),
        "pytorch": (2016, 8)
    }

    def analyze_job_description(
        self,
        title: str,
        description: str,
        requirements: str = "",
        required_skills: List[str] = None,
        min_experience_years: int = 0
    ) -> Dict[str, Any]:
        full_text = f"{title}\n{description}\n{requirements}".lower()
        required_skills = required_skills or []
        findings = []
        deductions = 0

        # 1. Gender-coded / exclusionary terms
        found_masculine = [w for w in self.MASCULINE_CODED_WORDS if re.search(rf"\b{re.escape(w)}\b", full_text)]
        found_feminine = [w for w in self.FEMININE_CODED_WORDS if re.search(rf"\b{re.escape(w)}\b", full_text)]

        inclusivity_score = 100
        if found_masculine:
            deduction = len(found_masculine) * 10
            inclusivity_score = max(0, inclusivity_score - deduction)
            findings.append({
                "type": "GENDER_CODED_LANGUAGE",
                "severity": "MEDIUM",
                "title": "Masculine-Coded Terms Detected",
                "message": f"Found terms ({', '.join(found_masculine)}) that may discourage qualified candidates from underrepresented backgrounds.",
                "suggestion": "Replace with neutral, competence-focused terms (e.g. 'Skilled Engineer' instead of 'Ninja' or 'Rockstar')."
            })
        if found_feminine:
            findings.append({
                "type": "GENDER_CODED_LANGUAGE",
                "severity": "LOW",
                "title": "Feminine-Coded Terms Detected",
                "message": f"Found interpersonal terms ({', '.join(found_feminine)}). Ensure balance with technical competency requirements.",
                "suggestion": "Balance interpersonal expectations with objective role competencies."
            })

        # 2. Credential bias
        credential_bias = []
        if re.search(r"\b(tier[- ]?1|ivy league|top[- ]?tier|premier college)\b", full_text):
            credential_bias.append("Elite University Exclusivity")
        if re.search(r"\b(only from (iit|nit|bits|stanford|mit))\b", full_text):
            credential_bias.append("Institutional Restriction")

        if credential_bias:
            inclusivity_score = max(0, inclusivity_score - 25)
            findings.append({
                "type": "CREDENTIAL_BIAS",
                "severity": "HIGH",
                "title": "Institutional Credential Bias",
                "message": f"Job description specifies restrictive institutional filters ({', '.join(credential_bias)}).",
                "suggestion": "Focus on demonstrable skills, project portfolio, and assessment performance rather than pedigree."
            })

        # 3. Requirement Overload
        realism_score = 100
        if len(required_skills) > 12:
            realism_score -= 20
            findings.append({
                "type": "REQUIREMENT_OVERLOAD",
                "severity": "MEDIUM",
                "title": "Excessive Required Skills Count",
                "message": f"Position specifies {len(required_skills)} required skills. Research shows excessive mandatory requirements deter qualified diverse candidates.",
                "suggestion": "Separate into 4-6 truly 'Essential Skills' and move secondary capabilities to 'Preferred Skills'."
            })

        # 4. Junior title vs excessive years
        title_lower = title.lower()
        if any(j in title_lower for j in ["junior", "entry", "associate", "intern", "graduate"]) and min_experience_years > 3:
            realism_score -= 25
            findings.append({
                "type": "UNREALISTIC_EXPERIENCE",
                "severity": "HIGH",
                "title": "Title vs Experience Disconnect",
                "message": f"Title is entry/junior level ('{title}') but specifies {min_experience_years}+ years of required experience.",
                "suggestion": "Reduce experience requirement to 0-2 years or adjust title to Mid/Senior level."
            })

        # 5. Technology age vs experience requirement
        for skill in required_skills:
            s_clean = skill.strip().lower()
            if s_clean in self.UNREALISTIC_TECH_AGE:
                rel_year, max_possible = self.UNREALISTIC_TECH_AGE[s_clean]
                if min_experience_years > max_possible:
                    realism_score -= 20
                    findings.append({
                        "type": "IMPOSSIBLE_REQUIREMENT",
                        "severity": "HIGH",
                        "title": f"Unrealistic Experience for {skill}",
                        "message": f"Requested {min_experience_years}+ years in {skill}, which was introduced around {rel_year} (max ~{max_possible} years existing).",
                        "suggestion": f"Adjust required experience in {skill} to realistic market standards (1-4 years)."
                    })

        # 6. Readability & Structure Clarity
        clarity_score = 100
        word_count = len(full_text.split())
        if word_count < 80:
            clarity_score -= 30
            findings.append({
                "type": "VAGUE_DESCRIPTION",
                "severity": "MEDIUM",
                "title": "Underspecified Job Description",
                "message": f"Description is very brief ({word_count} words). Candidates cannot evaluate fit accurately.",
                "suggestion": "Add concrete daily responsibilities, stack details, and team context."
            })
        elif word_count > 1200:
            clarity_score -= 15
            findings.append({
                "type": "LENGTH_WARNING",
                "severity": "LOW",
                "title": "Lengthy Description",
                "message": f"Description is very verbose ({word_count} words). Important responsibilities may be overlooked.",
                "suggestion": "Use bullet points and concise summaries."
            })

        overall_quality = round((inclusivity_score * 0.40) + (realism_score * 0.35) + (clarity_score * 0.25), 1)

        status = "EXCELLENT" if overall_quality >= 85 else "GOOD" if overall_quality >= 70 else "NEEDS_IMPROVEMENT"

        return {
            "overall_quality_score": overall_quality,
            "status": status,
            "inclusivity_score": inclusivity_score,
            "realism_score": realism_score,
            "clarity_score": clarity_score,
            "word_count": word_count,
            "findings_count": len(findings),
            "findings": findings
        }

jd_quality_analyzer = JDQualityAnalyzer()
