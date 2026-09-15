from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.evaluation import ConsistencyStatus, RecommendationType

class MatchScoreOut(BaseModel):
    application_id: int
    overall_score: float
    skill_match: float
    experience_match: float
    education_match: float
    project_relevance: float
    breakdown: Optional[Dict[str, Any]] = None

class SkillGapOut(BaseModel):
    application_id: int
    strong_skills: List[str] = []
    moderate_skills: List[str] = []
    missing_skills: List[str] = []

class ConsistencyDetail(BaseModel):
    skill: str
    claimed_level: str
    demonstrated_percentage: float
    assessment_evidence: str
    status: ConsistencyStatus
    neutral_observation: str

class ConsistencyReportOut(BaseModel):
    application_id: int
    overall_status: ConsistencyStatus
    consistency_score: float
    summary_text: str
    details: List[ConsistencyDetail] = []

class CandidateRankingOut(BaseModel):
    id: int
    rank: int
    candidate_id: int
    application_id: int
    candidate_name: str
    candidate_email: str
    overall_score: float
    match_score: float
    assessment_score: float
    experience_score: float
    skill_relevance_score: float
    project_score: float
    recommendation: RecommendationType
    fairness_flag: Optional[str] = "No obvious disparity"
    status: str = "APPLIED"

class RankingWeights(BaseModel):
    match_score: float = Field(default=0.35, ge=0.0, le=1.0)
    assessment_score: float = Field(default=0.30, ge=0.0, le=1.0)
    experience_score: float = Field(default=0.15, ge=0.0, le=1.0)
    skill_relevance_score: float = Field(default=0.10, ge=0.0, le=1.0)
    project_score: float = Field(default=0.10, ge=0.0, le=1.0)

class ExplainabilityFactor(BaseModel):
    name: str
    weight: float
    candidate_val: float
    contribution: float
    impact: str  # positive, neutral, negative
    explanation: str

class CandidateExplanationOut(BaseModel):
    candidate_id: int
    application_id: int
    overall_score: float
    positive_factors: List[str]
    negative_factors: List[str]
    factor_breakdown: List[ExplainabilityFactor]
    summary_narrative: str
    is_llm_generated: bool = False

class LearningModule(BaseModel):
    module_title: str
    recommended_topics: List[str]
    practice_project_idea: str
    estimated_weeks: int

class SkillDevelopmentPriority(BaseModel):
    priority_level: int
    skill_name: str
    current_level: str
    target_level: str
    importance_reason: str
    learning_modules: List[LearningModule]

class DevelopmentPlanOut(BaseModel):
    candidate_id: int
    target_role: str
    generated_at: datetime
    priorities: List[SkillDevelopmentPriority]

class RecruiterNoteCreate(BaseModel):
    note_text: str

class RecruiterNoteOut(BaseModel):
    id: int
    application_id: int
    recruiter_id: int
    recruiter_name: str
    note_text: str
    created_at: datetime
