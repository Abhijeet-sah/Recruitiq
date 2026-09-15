from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base
from app.models.base import TimestampMixin

class JobStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    DRAFT = "DRAFT"

class SkillImportance(str, enum.Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    department = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    employment_type = Column(String(100), default="Full-time", nullable=False)
    experience_required = Column(String(100), default="3-5 years", nullable=False)
    min_salary = Column(Float, nullable=True)
    max_salary = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    education_required = Column(String(255), default="Bachelor's Degree or equivalent", nullable=False)
    status = Column(SQLEnum(JobStatus), default=JobStatus.OPEN, nullable=False)

    # Relationships
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="job", cascade="all, delete-orphan")
    rankings = relationship("CandidateRanking", back_populates="job", cascade="all, delete-orphan")
    fairness_audits = relationship("FairnessAudit", back_populates="job", cascade="all, delete-orphan")

class JobSkill(Base, TimestampMixin):
    __tablename__ = "job_skills"

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    is_required = Column(Boolean, default=True, nullable=False)
    importance_weight = Column(SQLEnum(SkillImportance), default=SkillImportance.HIGH, nullable=False)
    category = Column(String(100), default="Technical", nullable=False)

    job = relationship("Job", back_populates="skills")
