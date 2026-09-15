from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base
from app.models.base import TimestampMixin

class ConsistencyStatus(str, enum.Enum):
    CONSISTENT = "Consistent"
    UNDER_DEMONSTRATED = "Under-demonstrated"
    STRONGER_THAN_CLAIMED = "Stronger than claimed"
    INSUFFICIENT_EVIDENCE = "Insufficient evidence"

class RecommendationType(str, enum.Enum):
    HIGHLY_RECOMMENDED = "Highly Recommended"
    RECOMMENDED = "Recommended"
    CONSIDER_WITH_UPSKILLING = "Consider with Upskilling"
    NOT_RECOMMENDED = "Not Recommended"

class MatchScore(Base, TimestampMixin):
    __tablename__ = "match_scores"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_score = Column(Float, nullable=False)  # 0 to 100
    skill_match = Column(Float, nullable=False)
    experience_match = Column(Float, nullable=False)
    education_match = Column(Float, nullable=False)
    project_relevance = Column(Float, nullable=False)
    breakdown_json = Column(Text, nullable=True)

    application = relationship("Application", back_populates="match_score")

class SkillGap(Base, TimestampMixin):
    __tablename__ = "skill_gaps"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    strong_skills_json = Column(Text, nullable=False)    # JSON array
    moderate_skills_json = Column(Text, nullable=False)  # JSON array
    missing_skills_json = Column(Text, nullable=False)   # JSON array

    application = relationship("Application", back_populates="skill_gap")

class ConsistencyReport(Base, TimestampMixin):
    __tablename__ = "consistency_reports"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_status = Column(SQLEnum(ConsistencyStatus), default=ConsistencyStatus.CONSISTENT, nullable=False)
    consistency_score = Column(Float, default=100.0, nullable=False)
    summary_text = Column(Text, nullable=False)
    details_json = Column(Text, nullable=False)  # Detailed per-skill breakdown

    application = relationship("Application", back_populates="consistency_report")

class CandidateRanking(Base, TimestampMixin):
    __tablename__ = "candidate_rankings"

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    rank = Column(Integer, default=1, nullable=False)
    overall_score = Column(Float, nullable=False)
    match_score = Column(Float, default=0.0, nullable=False)
    assessment_score = Column(Float, default=0.0, nullable=False)
    experience_score = Column(Float, default=0.0, nullable=False)
    skill_relevance_score = Column(Float, default=0.0, nullable=False)
    project_score = Column(Float, default=0.0, nullable=False)
    recommendation = Column(SQLEnum(RecommendationType), default=RecommendationType.RECOMMENDED, nullable=False)
    weights_used_json = Column(Text, nullable=True)

    job = relationship("Job", back_populates="rankings")
    candidate = relationship("CandidateProfile", back_populates="rankings")

class DevelopmentPlan(Base, TimestampMixin):
    __tablename__ = "development_plans"

    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True)
    target_role = Column(String(255), default="Target Role", nullable=False)
    plan_json = Column(Text, nullable=False)  # Priority 1, 2, 3 learning paths with actionable modules

    candidate = relationship("CandidateProfile", back_populates="development_plans")

class RecruiterNote(Base, TimestampMixin):
    __tablename__ = "recruiter_notes"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    note_text = Column(Text, nullable=False)

    application = relationship("Application", back_populates="notes")
    recruiter = relationship("User")
