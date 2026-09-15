from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class KPICard(BaseModel):
    title: str
    value: Any
    change: Optional[str] = None
    trend: Optional[str] = "up"

class FunnelStage(BaseModel):
    stage: str
    count: int
    percentage: float

class ScoreDistributionBucket(BaseModel):
    range: str
    count: int

class SkillFrequency(BaseModel):
    skill: str
    count: int

class RecruiterDashboardAnalytics(BaseModel):
    kpis: Dict[str, Any]
    funnel: List[FunnelStage]
    score_distribution: List[ScoreDistributionBucket]
    top_skills_in_demand: List[SkillFrequency]
    common_skill_gaps: List[SkillFrequency]
    status_distribution: Dict[str, int]
    fairness_overview: Dict[str, Any]

class AdminDashboardAnalytics(BaseModel):
    total_users: int
    total_candidates: int
    total_recruiters: int
    total_jobs: int
    total_applications: int
    total_assessments_taken: int
    ai_service_status: Dict[str, Any]
    recent_activity: List[Dict[str, Any]]
