from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class EvidenceRecord(Base, TimestampMixin):
    """
    Evidence Grounding: Stores the exact document source, section, page,
    character offset, and confidence for every extracted claim or skill.
    """
    __tablename__ = "evidence_records"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=True, index=True)

    claim_type = Column(String(50), nullable=False, default="SKILL")  # SKILL, EXPERIENCE, EDUCATION, REQUIREMENT
    claim_key = Column(String(150), nullable=False, index=True)       # e.g. "Python", "FastAPI"
    source_type = Column(String(50), nullable=False, default="RESUME") # RESUME, JOB_DESCRIPTION, ASSESSMENT, INTERVIEW
    source_document = Column(String(255), nullable=True)              # Filename or document title
    section = Column(String(100), nullable=True)                      # Experience, Projects, Skills, Requirements
    page_number = Column(Integer, nullable=True)
    evidence_text = Column(Text, nullable=False)                      # Exact snippet
    char_start = Column(Integer, nullable=True)
    char_end = Column(Integer, nullable=True)
    confidence = Column(Float, default=90.0, nullable=False)          # 0-100%
    metadata_json = Column(Text, nullable=True)

    application = relationship("Application", foreign_keys=[application_id])
    candidate = relationship("CandidateProfile", foreign_keys=[candidate_id])
    job = relationship("Job", foreign_keys=[job_id])


class ResumeIntegrityReport(Base, TimestampMixin):
    """
    Resume Integrity & Document Security:
    Objective analysis of keyword stuffing, hidden text, and prompt injection attempts.
    """
    __tablename__ = "resume_integrity_reports"

    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    integrity_status = Column(String(50), default="VERIFIED", nullable=False) # VERIFIED, REVIEW_RECOMMENDED, HIGH_RISK
    integrity_score = Column(Float, default=100.0, nullable=False)            # 0 to 100
    keyword_stuffing_detected = Column(Boolean, default=False, nullable=False)
    keyword_stuffing_details_json = Column(Text, nullable=True)
    hidden_text_detected = Column(Boolean, default=False, nullable=False)
    hidden_text_details_json = Column(Text, nullable=True)
    prompt_injection_flag = Column(String(50), default="SAFE", nullable=False) # SAFE, SUSPICIOUS, HIGH_RISK
    prompt_injection_details_json = Column(Text, nullable=True)
    summary_text = Column(Text, nullable=False)
    findings_json = Column(Text, nullable=True)

    resume = relationship("Resume")
    candidate = relationship("CandidateProfile")
