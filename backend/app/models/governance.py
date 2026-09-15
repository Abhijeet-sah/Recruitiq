from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class DecisionTrace(Base, TimestampMixin):
    """
    Immutable Decision Trace / Audit Trail:
    Logs every automated evaluation and human action with timestamps,
    models used, inputs, outputs, and explicit reasoning.
    """
    __tablename__ = "decision_traces"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_type = Column(String(50), default="AI_SERVICE", nullable=False) # SYSTEM, AI_SERVICE, RECRUITER, ADMIN
    actor_id = Column(Integer, nullable=True)
    action_name = Column(String(100), nullable=False, index=True)
    service_used = Column(String(100), nullable=True)
    model_version = Column(String(100), nullable=True)
    input_summary = Column(Text, nullable=True)
    output_summary_json = Column(Text, nullable=True)
    reasoning_text = Column(Text, nullable=True)

    application = relationship("Application")


class ModelRegistry(Base, TimestampMixin):
    """
    Internal AI Model Registry:
    Tracks registered models, versions, active/fallback statuses, and latency metrics.
    """
    __tablename__ = "model_registries"

    model_name = Column(String(100), unique=True, nullable=False, index=True)
    version = Column(String(50), nullable=False)
    model_type = Column(String(50), nullable=False) # EMBEDDING, PARSER, IRT_CAT, SCORING, FAIRNESS
    status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, FALLBACK, UNAVAILABLE
    description = Column(Text, nullable=True)
    metrics_json = Column(Text, nullable=True)
    last_invoked = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class RecruiterOverride(Base, TimestampMixin):
    """
    Human-in-the-Loop Override Record:
    Stores when a recruiter overrides an AI recommendation with explicit rationale.
    """
    __tablename__ = "recruiter_overrides"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ai_recommendation = Column(String(100), nullable=False)
    human_decision = Column(String(100), nullable=False)
    override_reason = Column(Text, nullable=False)

    application = relationship("Application")
    recruiter = relationship("User")


class DriftMetric(Base, TimestampMixin):
    """
    Statistical Model Health & Distribution Shift Monitoring.
    """
    __tablename__ = "drift_metrics"

    metric_name = Column(String(100), nullable=False, index=True)
    baseline_value = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    drift_magnitude = Column(Float, default=0.0, nullable=False)
    sample_count = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="STABLE", nullable=False) # STABLE, WARNING, DRIFT_DETECTED


class ResearchExperiment(Base, TimestampMixin):
    """
    Scientific Benchmark & Evaluation Experiments (Baseline vs Advanced).
    """
    __tablename__ = "research_experiments"

    experiment_name = Column(String(150), nullable=False, index=True)
    experiment_type = Column(String(100), nullable=False) # BASELINE_VS_TRANSFORMER, FIXED_VS_ADAPTIVE, THRESHOLD_SENSITIVITY
    dataset_size = Column(Integer, default=0, nullable=False)
    metrics_json = Column(Text, nullable=False)
    summary_markdown = Column(Text, nullable=True)


class InAppNotification(Base, TimestampMixin):
    """
    In-App Notification Center events for Recruiters, Candidates, and Admins.
    """
    __tablename__ = "in_app_notifications"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO", nullable=False) # INFO, WARNING, ACTION_REQUIRED
    read_status = Column(Boolean, default=False, nullable=False)
    action_url = Column(String(255), nullable=True)

    user = relationship("User")
