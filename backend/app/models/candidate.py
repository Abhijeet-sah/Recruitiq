from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base
from app.models.base import TimestampMixin

class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    REVIEWED = "REVIEWED"
    ASSESSMENT_PENDING = "ASSESSMENT_PENDING"
    ASSESSMENT_COMPLETED = "ASSESSMENT_COMPLETED"
    EVALUATED = "EVALUATED"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"

class CandidateProfile(Base, TimestampMixin):
    __tablename__ = "candidate_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    years_of_experience = Column(Float, default=0.0, nullable=False)
    education_level = Column(String(100), default="Bachelor's", nullable=False)
    parsing_confidence = Column(Float, default=0.0, nullable=False)  # 0 to 100%
    
    # Controlled proxy/demographic attributes for fairness auditing ONLY. NEVER used in candidate scoring.
    demographic_gender = Column(String(50), default="Unspecified", nullable=True)
    demographic_age_group = Column(String(50), default="Unspecified", nullable=True)

    user = relationship("User", back_populates="candidate_profile")
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="candidate", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    rankings = relationship("CandidateRanking", back_populates="candidate", cascade="all, delete-orphan")
    development_plans = relationship("DevelopmentPlan", back_populates="candidate", cascade="all, delete-orphan")

class RecruiterProfile(Base, TimestampMixin):
    __tablename__ = "recruiter_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String(255), default="Enterprise Inc.", nullable=False)
    department = Column(String(255), default="Talent Acquisition", nullable=False)
    title = Column(String(255), default="Senior Technical Recruiter", nullable=False)

    user = relationship("User", back_populates="recruiter_profile")

class Resume(Base, TimestampMixin):
    __tablename__ = "resumes"

    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx
    file_size = Column(Integer, default=0, nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(Text, nullable=True)  # JSON string of parsed payload
    parsing_confidence = Column(Float, default=85.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    candidate = relationship("CandidateProfile", back_populates="resumes")
    skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan")

class ResumeSkill(Base, TimestampMixin):
    __tablename__ = "resume_skills"

    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    claimed_level = Column(String(50), default="Intermediate", nullable=False)  # Beginner, Intermediate, Advanced, Expert
    years_experience = Column(Float, default=1.0, nullable=False)

    resume = relationship("Resume", back_populates="skills")

class CandidateSkill(Base, TimestampMixin):
    __tablename__ = "candidate_skills"

    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    level = Column(String(50), default="Intermediate", nullable=False)
    verified = Column(Boolean, default=False, nullable=False)

    candidate = relationship("CandidateProfile", back_populates="skills")

class Experience(Base, TimestampMixin):
    __tablename__ = "experiences"

    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    company = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), default="Present", nullable=True)
    is_current = Column(Boolean, default=False, nullable=False)
    description = Column(Text, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="experiences")

class Education(Base, TimestampMixin):
    __tablename__ = "educations"

    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=False)
    field_of_study = Column(String(255), nullable=True)
    graduation_year = Column(String(50), nullable=True)
    gpa = Column(String(50), nullable=True)

    candidate = relationship("CandidateProfile", back_populates="educations")

class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False)
    cover_letter = Column(Text, nullable=True)

    job = relationship("Job", back_populates="applications")
    candidate = relationship("CandidateProfile", back_populates="applications")
    match_score = relationship("MatchScore", back_populates="application", uselist=False, cascade="all, delete-orphan")
    skill_gap = relationship("SkillGap", back_populates="application", uselist=False, cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="application", cascade="all, delete-orphan")
    consistency_report = relationship("ConsistencyReport", back_populates="application", uselist=False, cascade="all, delete-orphan")
    notes = relationship("RecruiterNote", back_populates="application", cascade="all, delete-orphan")
    interview_session = relationship("InterviewSession", back_populates="application", uselist=False, cascade="all, delete-orphan")
