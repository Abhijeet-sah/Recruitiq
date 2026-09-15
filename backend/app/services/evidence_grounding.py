import re
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.evidence import EvidenceRecord

logger = logging.getLogger(__name__)

class EvidenceGroundingEngine:
    """
    Evidence-Grounded AI Engine:
    Locates exact textual evidence, sections, page numbers, character offsets,
    and confidence scores for every extracted skill, qualification, and requirement.
    Ensures RecruitIQ never behaves as an ungrounded black box.
    """

    SECTIONS_REGEX = {
        "Experience": r"(?:work\s+experience|professional\s+experience|employment\s+history|experience)",
        "Projects": r"(?:personal\s+projects|academic\s+projects|featured\s+projects|projects)",
        "Education": r"(?:education|academic\s+background|degrees|qualifications)",
        "Skills": r"(?:technical\s+skills|skills\s+(&|and)\s+competencies|core\s+competencies|skills)",
        "Certifications": r"(?:certifications|licenses|courses)",
        "Summary": r"(?:summary|profile|about\s+me|objective)",
        "Requirements": r"(?:requirements|qualifications|what\s+you'll\s+need|must\s+have)"
    }

    def infer_section(self, text_before: str) -> str:
        """Determines the containing document section based on preceding text."""
        last_found_sec = "Experience"
        last_pos = -1
        t_low = text_before.lower()

        for sec_name, pattern in self.SECTIONS_REGEX.items():
            matches = list(re.finditer(pattern, t_low))
            if matches:
                m_pos = matches[-1].start()
                if m_pos > last_pos:
                    last_pos = m_pos
                    last_found_sec = sec_name

        return last_found_sec

    def extract_evidence(
        self,
        raw_text: str,
        claim_key: str,
        source_document: str = "Document",
        source_type: str = "RESUME",
        page_count: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Locates exact sentences or paragraphs in raw_text mentioning claim_key.
        Computes character offsets, containing section, approximate page number, and confidence.
        """
        if not raw_text or not claim_key:
            return []

        # Split text into lines/sentences
        escaped_key = re.escape(claim_key.strip())
        pattern = re.compile(rf"(?:^|\b|\W){escaped_key}(?:\b|\W|$)", re.IGNORECASE)

        evidences = []
        total_len = len(raw_text)

        # Sentence/Paragraph boundary splitting
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n|\n(?=[A-Z0-9\-\*\•])", raw_text) if p.strip()]

        for p in paragraphs:
            match = pattern.search(p)
            if match:
                char_idx = raw_text.find(p)
                char_start = max(char_idx, 0)
                char_end = min(char_start + len(p), total_len)

                # Estimate page number proportionally
                est_page = max(1, min(page_count, int((char_start / max(total_len, 1)) * page_count) + 1))
                
                # Section detection
                preceding_text = raw_text[:char_start]
                section = self.infer_section(preceding_text)

                # Confidence heuristic based on match context length and exactness
                p_words = p.split()
                has_action_verb = bool(re.search(r"(?:built|developed|designed|implemented|architected|maintained|led|managed|created)", p, re.IGNORECASE))
                confidence = 94.0 if has_action_verb else (88.0 if len(p_words) > 5 else 75.0)

                # Keep snippet concise (max 280 chars)
                snippet = p if len(p) <= 280 else p[:277] + "..."

                evidences.append({
                    "claim_type": "SKILL",
                    "claim_key": claim_key,
                    "source_type": source_type,
                    "source_document": source_document,
                    "section": section,
                    "page_number": est_page,
                    "evidence_text": snippet,
                    "char_start": char_start,
                    "char_end": char_end,
                    "confidence": round(confidence, 1)
                })

                if len(evidences) >= 3:  # Limit to top 3 strongest occurrences per claim
                    break

        return evidences

    def extract_resume_evidence(
        self,
        resume_text: str,
        target_skills: List[str],
        document_name: str = "Resume.pdf"
    ) -> List[Dict[str, Any]]:
        """Extract evidence for a list of target skills from candidate resume."""
        all_evidences = []
        for skill in target_skills:
            evs = self.extract_evidence(
                raw_text=resume_text,
                claim_key=skill,
                source_document=document_name,
                source_type="RESUME"
            )
            all_evidences.extend(evs)
        return all_evidences

    def persist_evidence_batch(
        self,
        db: Session,
        evidence_list: List[Dict[str, Any]],
        application_id: Optional[int] = None,
        candidate_id: Optional[int] = None,
        job_id: Optional[int] = None
    ) -> List[EvidenceRecord]:
        """Save evidence records to the database."""
        created = []
        for item in evidence_list:
            rec = EvidenceRecord(
                application_id=application_id,
                candidate_id=candidate_id,
                job_id=job_id,
                claim_type=item.get("claim_type", "SKILL"),
                claim_key=item.get("claim_key", ""),
                source_type=item.get("source_type", "RESUME"),
                source_document=item.get("source_document", "Resume"),
                section=item.get("section", "Experience"),
                page_number=item.get("page_number", 1),
                evidence_text=item.get("evidence_text", ""),
                char_start=item.get("char_start"),
                char_end=item.get("char_end"),
                confidence=item.get("confidence", 85.0)
            )
            db.add(rec)
            created.append(rec)

        db.commit()
        for r in created:
            db.refresh(r)
        return created

    def get_evidence_for_claim(
        self,
        db: Session,
        application_id: int,
        claim_key: str
    ) -> List[EvidenceRecord]:
        """Retrieve all recorded evidence for a specific claim or skill."""
        return db.query(EvidenceRecord).filter(
            EvidenceRecord.application_id == application_id,
            EvidenceRecord.claim_key.ilike(claim_key.strip())
        ).order_by(EvidenceRecord.confidence.desc()).all()

evidence_engine = EvidenceGroundingEngine()
evidence_grounding_engine = evidence_engine
