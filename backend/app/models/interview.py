from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base
from app.models.base import TimestampMixin

class InterviewStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class InterviewSession(Base, TimestampMixin):
    __tablename__ = "interview_sessions"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(InterviewStatus), default=InterviewStatus.PENDING, nullable=False)
    overall_score = Column(Float, default=0.0, nullable=False)
    feedback_json = Column(Text, nullable=True)

    application = relationship("Application", back_populates="interview_session")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")

class InterviewQuestion(Base, TimestampMixin):
    __tablename__ = "interview_questions"

    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question_type = Column(String(50), default="Technical", nullable=False)  # Technical, Behavioral, Situational
    question_text = Column(Text, nullable=False)
    candidate_response = Column(Text, nullable=True)
    relevance_score = Column(Float, default=0.0, nullable=False)
    technical_score = Column(Float, default=0.0, nullable=False)
    communication_score = Column(Float, default=0.0, nullable=False)
    feedback_text = Column(Text, nullable=True)

    session = relationship("InterviewSession", back_populates="questions")
