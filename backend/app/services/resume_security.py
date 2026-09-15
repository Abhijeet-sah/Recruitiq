import re
import json
from collections import Counter
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.evidence import ResumeIntegrityReport

class PromptInjectionDetector:
    """
    Detects adversarial prompt injection phrases in candidate resumes or submitted text.
    Classifies content into SAFE, SUSPICIOUS, or HIGH_RISK.
    """
    HIGH_RISK_PATTERNS = [
        r"ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?",
        r"(?:system\s+prompt|admin\s+override|prompt\s+injection)",
        r"(?:give|award|assign)\s+(?:this\s+candidate|this\s+resume|me)\s+(?:a\s+)?(?:100%|top\s+score|maximum\s+score)",
        r"(?:rank|place)\s+(?:this\s+candidate|me)\s+(?:first|#1|at\s+the\s+top)",
        r"(?:do\s+not|disregard|ignore)\s+(?:evaluate|consider|compare)\s+(?:other\s+candidates|any\s+other\s+applicant)",
        r"you\s+are\s+now\s+(?:an?\s+)?(?:helpful\s+assistant|unbiased\s+evaluator|system\s+administrator)",
        r"<\s*script\b|javascript\s*:|drop\s+table|delete\s+from\s+users"
    ]

    SUSPICIOUS_PATTERNS = [
        r"(?:important\s+instruction|system\s+note|hidden\s+instruction)\s*:",
        r"(?:must\s+select|guaranteed\s+hire|bypass\s+screening)",
        r"output\s+format\s*:\s*\{\s*\"rank\"\s*:\s*1",
        r"(?:evaluation\s+score\s*=\s*100)"
    ]

    def analyze(self, text: str) -> Dict[str, Any]:
        if not text:
            return {"flag": "SAFE", "matches": [], "risk_score": 0.0}

        t_low = text.lower()
        high_matches = []
        for pat in self.HIGH_RISK_PATTERNS:
            found = re.findall(pat, t_low)
            if found:
                high_matches.extend(found)

        suspicious_matches = []
        for pat in self.SUSPICIOUS_PATTERNS:
            found = re.findall(pat, t_low)
            if found:
                suspicious_matches.extend(found)

        if high_matches:
            return {
                "flag": "HIGH_RISK",
                "matches": list(set(high_matches)),
                "risk_score": 90.0,
                "reason": "Instruction-like patterns and override commands detected in document text."
            }
        elif suspicious_matches:
            return {
                "flag": "SUSPICIOUS",
                "matches": list(set(suspicious_matches)),
                "risk_score": 45.0,
                "reason": "Unusual meta-instruction phrasing detected in candidate document."
            }

        return {
            "flag": "SAFE",
            "matches": [],
            "risk_score": 0.0,
            "reason": "Document text is free of adversarial instruction patterns."
        }


class ResumeIntegrityAnalyzer:
    """
    Comprehensive document integrity scanner.
    Analyzes resumes for keyword stuffing, hidden zero-width text, and prompt injection attempts.
    Maintains professional, objective reporting without defamatory accusations.
    """
    def __init__(self):
        self.injection_detector = PromptInjectionDetector()

    def check_keyword_stuffing(self, text: str) -> Dict[str, Any]:
        """Detects abnormal repetition of technical terms or unnatural keyword stuffing."""
        if not text:
            return {"detected": False, "stuffed_keywords": [], "max_repetition": 0}

        words = [w.strip().lower() for w in re.findall(r"\b[a-zA-Z\+\#]{2,}\b", text)]
        if len(words) < 20:
            return {"detected": False, "stuffed_keywords": [], "max_repetition": 0}

        counts = Counter(words)
        total_words = len(words)

        # Look for consecutive identical words (e.g. "Python Python Python")
        consecutive_matches = re.findall(r"\b([a-zA-Z\+\#]{2,})(?:\s+\1){2,}\b", text, flags=re.IGNORECASE)
        
        # Unusually high single-word density (> 7% of entire resume or > 15 repetitions in short text)
        stuffed = []
        for word, count in counts.items():
            if count >= 12 and (count / total_words) > 0.06:
                stuffed.append({"keyword": word, "count": count, "density_pct": round((count / total_words) * 100, 1)})

        detected = bool(consecutive_matches) or bool(stuffed)
        return {
            "detected": detected,
            "consecutive_repetitions": list(set(consecutive_matches)),
            "stuffed_keywords": stuffed,
            "max_repetition": max(counts.values(), default=0)
        }

    def check_hidden_text(self, text: str) -> Dict[str, Any]:
        """Detects zero-width characters, abnormal whitespace bursts, or hidden styling artifacts."""
        if not text:
            return {"detected": False, "zero_width_chars": 0, "details": []}

        # Zero-width spaces & joiners
        zero_width_pattern = re.compile(r"[\u200B\u200C\u200D\uFEFF\u2060]")
        zw_matches = zero_width_pattern.findall(text)
        
        # Massive abnormal spacing (e.g. 50 consecutive spaces used to hide text)
        abnormal_spaces = len(re.findall(r"[ \t]{40,}", text))

        detected = (len(zw_matches) > 3) or (abnormal_spaces > 2)
        details = []
        if len(zw_matches) > 3:
            details.append(f"{len(zw_matches)} zero-width hidden unicode characters detected.")
        if abnormal_spaces > 2:
            details.append("Abnormal horizontal spacing blocks detected outside standard formatting.")

        return {
            "detected": detected,
            "zero_width_chars": len(zw_matches),
            "details": details
        }

    def evaluate_resume_integrity(
        self,
        raw_text: str,
        resume_id: Optional[int] = None,
        candidate_id: Optional[int] = None,
        db: Optional[Session] = None,
        document_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Runs complete security scan and generates an objective integrity report.
        """
        stuffing_res = self.check_keyword_stuffing(raw_text)
        hidden_res = self.check_hidden_text(raw_text)
        injection_res = self.injection_detector.analyze(raw_text)

        findings = []
        integrity_score = 100.0

        if injection_res["flag"] == "HIGH_RISK":
            findings.append("Instruction-like text pattern detected that resembles prompt manipulation.")
            integrity_score -= 50.0
        elif injection_res["flag"] == "SUSPICIOUS":
            findings.append("Unusual instruction phrasing noted for manual recruiter review.")
            integrity_score -= 20.0

        if stuffing_res["detected"]:
            findings.append("Abnormal keyword repetition density detected in document body.")
            integrity_score -= 25.0

        if hidden_res["detected"]:
            findings.append("Formatting anomalies (e.g., hidden characters or abnormal spacing) detected.")
            integrity_score -= 25.0

        integrity_score = max(0.0, min(100.0, integrity_score))

        if integrity_score >= 85.0 and injection_res["flag"] == "SAFE":
            status = "VERIFIED"
            summary = "Document structure and content integrity verified. No anomalous patterns detected."
        elif integrity_score >= 50.0:
            status = "REVIEW_RECOMMENDED"
            summary = "Potential document manipulation pattern detected. Recruiter review recommended."
        else:
            status = "HIGH_RISK"
            summary = "Significant anomalies or prompt injection indicators detected. Thorough human inspection required."

        report_dict = {
            "resume_id": resume_id,
            "candidate_id": candidate_id,
            "integrity_status": status,
            "integrity_score": round(integrity_score, 1),
            "keyword_stuffing_detected": stuffing_res["detected"],
            "keyword_stuffing_details": stuffing_res,
            "hidden_text_detected": hidden_res["detected"],
            "hidden_text_details": hidden_res,
            "prompt_injection_flag": injection_res["flag"],
            "prompt_injection_details": injection_res,
            "summary_text": summary,
            "findings": findings
        }

        if db and resume_id:
            # Check existing report
            existing = db.query(ResumeIntegrityReport).filter(
                ResumeIntegrityReport.resume_id == resume_id
            ).first()

            if not existing:
                existing = ResumeIntegrityReport(
                    resume_id=resume_id,
                    candidate_id=candidate_id,
                    integrity_status=status,
                    integrity_score=report_dict["integrity_score"],
                    keyword_stuffing_detected=stuffing_res["detected"],
                    keyword_stuffing_details_json=json.dumps(stuffing_res),
                    hidden_text_detected=hidden_res["detected"],
                    hidden_text_details_json=json.dumps(hidden_res),
                    prompt_injection_flag=injection_res["flag"],
                    prompt_injection_details_json=json.dumps(injection_res),
                    summary_text=summary,
                    findings_json=json.dumps(findings)
                )
                db.add(existing)
            else:
                existing.integrity_status = status
                existing.integrity_score = report_dict["integrity_score"]
                existing.keyword_stuffing_detected = stuffing_res["detected"]
                existing.keyword_stuffing_details_json = json.dumps(stuffing_res)
                existing.hidden_text_detected = hidden_res["detected"]
                existing.hidden_text_details_json = json.dumps(hidden_res)
                existing.prompt_injection_flag = injection_res["flag"]
                existing.prompt_injection_details_json = json.dumps(injection_res)
                existing.summary_text = summary
                existing.findings_json = json.dumps(findings)

            db.commit()
            db.refresh(existing)

        return report_dict

    analyze_resume_integrity = evaluate_resume_integrity

resume_security_analyzer = ResumeIntegrityAnalyzer()
resume_integrity_analyzer = resume_security_analyzer
