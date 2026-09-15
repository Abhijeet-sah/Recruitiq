from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.models.fairness import DisparityFlag

class DemographicMetric(BaseModel):
    group_name: str
    total_candidates: int
    selected_count: int
    selection_rate: float
    avg_score: float
    true_positive_rate: float
    false_positive_rate: float

class FairnessAuditOut(BaseModel):
    job_id: int
    job_title: str
    audit_category: str
    selection_rate_group_a: float
    selection_rate_group_b: float
    selection_rate_difference: float
    demographic_parity_diff: float
    equal_opportunity_diff: float
    disparity_flag: DisparityFlag
    summary_text: str
    metrics_table: List[DemographicMetric]
    audit_date: datetime
    methodology_note: str = (
        "Evaluation metrics are calculated for decision-support auditing purposes under controlled demographic observation. "
        "The system does not claim 100% bias-free automation; final hiring decisions must be reviewed by qualified human recruiters."
    )

class CounterfactualRequest(BaseModel):
    application_id: int
    attribute_to_swap: str = "demographic_gender"
    new_value: str = "Female"

class CounterfactualResponse(BaseModel):
    application_id: int
    candidate_id: int
    candidate_name: str
    attribute_tested: str
    original_value: str
    counterfactual_value: str
    original_score: float
    counterfactual_score: float
    score_delta: float
    outcome_changed: bool
    status: str
    explanation: str
