from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base
from app.models.base import TimestampMixin

class DisparityFlag(str, enum.Enum):
    NO_OBVIOUS_DISPARITY = "No obvious disparity"
    POTENTIAL_DISPARITY = "Potential disparity"
    NEEDS_INVESTIGATION = "Needs investigation"

class FairnessAudit(Base, TimestampMixin):
    __tablename__ = "fairness_audits"

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    audit_category = Column(String(100), default="Gender", nullable=False)  # Gender, Age Group
    selection_rate_group_a = Column(Float, default=0.0, nullable=False)
    selection_rate_group_b = Column(Float, default=0.0, nullable=False)
    selection_rate_difference = Column(Float, default=0.0, nullable=False)
    demographic_parity_diff = Column(Float, default=0.0, nullable=False)
    equal_opportunity_diff = Column(Float, default=0.0, nullable=False)
    disparity_flag = Column(SQLEnum(DisparityFlag), default=DisparityFlag.NO_OBVIOUS_DISPARITY, nullable=False)
    metric_results_json = Column(Text, nullable=False)
    summary_text = Column(Text, nullable=False)

    job = relationship("Job", back_populates="fairness_audits")

class CounterfactualAudit(Base, TimestampMixin):
    __tablename__ = "counterfactual_audits"

    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    attribute_perturbed = Column(String(100), nullable=False)  # e.g., "gender", "name_origin"
    original_score = Column(Float, nullable=False)
    counterfactual_score = Column(Float, nullable=False)
    score_delta = Column(Float, default=0.0, nullable=False)
    outcome_change = Column(Boolean, default=False, nullable=False)
    status_text = Column(String(255), default="No change detected.", nullable=False)
    audit_details_json = Column(Text, nullable=True)
