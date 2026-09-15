from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Boolean, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
import enum
from datetime import datetime, timezone
from app.db.session import Base
from app.models.base import TimestampMixin

class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    MULTI_SELECT = "MULTI_SELECT"
    SCENARIO = "SCENARIO"
    CODE = "CODE"
    SHORT_ANSWER = "SHORT_ANSWER"

class DifficultyLevel(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    TIMED_OUT = "TIMED_OUT"

class Assessment(Base, TimestampMixin):
    __tablename__ = "assessments"

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    max_time_minutes = Column(Integer, default=30, nullable=False)
    passing_score = Column(Float, default=65.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    job = relationship("Job", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base, TimestampMixin):
    __tablename__ = "assessment_questions"

    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), default=QuestionType.MCQ, nullable=False)
    options_json = Column(Text, nullable=True)  # JSON list of options
    correct_answer_json = Column(Text, nullable=False)  # JSON string of answer - NEVER exposed to candidates
    explanation = Column(Text, nullable=True)
    skill_tested = Column(String(100), nullable=False, index=True)
    difficulty = Column(SQLEnum(DifficultyLevel), default=DifficultyLevel.INTERMEDIATE, nullable=False)

    assessment = relationship("Assessment", back_populates="questions")
    answers = relationship("AssessmentAnswer", back_populates="question", cascade="all, delete-orphan")

class AssessmentAttempt(Base, TimestampMixin):
    __tablename__ = "assessment_attempts"

    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    end_time = Column(DateTime, nullable=True)
    status = Column(SQLEnum(AttemptStatus), default=AttemptStatus.IN_PROGRESS, nullable=False)
    total_score = Column(Float, default=0.0, nullable=False)
    max_score = Column(Float, default=0.0, nullable=False)
    percentage = Column(Float, default=0.0, nullable=False)
    difficulty_reached = Column(SQLEnum(DifficultyLevel), default=DifficultyLevel.BEGINNER, nullable=False)

    assessment = relationship("Assessment", back_populates="attempts")
    application = relationship("Application", back_populates="assessment_attempts")
    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")

class AssessmentAnswer(Base, TimestampMixin):
    __tablename__ = "assessment_answers"

    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False)
    candidate_answer_json = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    points_earned = Column(Float, default=0.0, nullable=False)
    time_spent_seconds = Column(Integer, default=0, nullable=False)
    difficulty_level = Column(SQLEnum(DifficultyLevel), default=DifficultyLevel.INTERMEDIATE, nullable=False)

    attempt = relationship("AssessmentAttempt", back_populates="answers")
    question = relationship("AssessmentQuestion", back_populates="answers")
