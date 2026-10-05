from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, field_validator
from app.models.job import JobStatus, SkillImportance

class JobSkillBase(BaseModel):
    skill_name: str
    is_required: bool = True
    importance_weight: SkillImportance = SkillImportance.HIGH
    category: str = "Technical"

    @field_validator("importance_weight", mode="before")
    @classmethod
    def sanitize_importance(cls, v: Any) -> SkillImportance:
        if isinstance(v, str):
            clean = v.strip().capitalize()
            if clean in ("High", "Medium", "Low"):
                return SkillImportance(clean)
        return SkillImportance.HIGH

class JobSkillCreate(JobSkillBase):
    pass

class JobSkillOut(JobSkillBase):
    id: int
    job_id: int

    class Config:
        from_attributes = True

class JobBase(BaseModel):
    title: str
    department: str = "Engineering"
    location: str = "Remote"
    employment_type: str = "Full-time"
    experience_required: str = "3-5 years"
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    description: str
    education_required: str = "Bachelor's Degree or equivalent"
    status: JobStatus = JobStatus.OPEN

    @field_validator("min_salary", "max_salary", mode="before")
    @classmethod
    def sanitize_salary(cls, v: Any) -> Optional[float]:
        if v is None or v == "" or str(v).lower() in ("nan", "none", "null"):
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    @field_validator("status", mode="before")
    @classmethod
    def sanitize_status(cls, v: Any) -> JobStatus:
        if isinstance(v, str):
            clean = v.strip().upper()
            if clean in ("OPEN", "CLOSED", "DRAFT"):
                return JobStatus(clean)
        return JobStatus.OPEN

class JobCreate(JobBase):
    skills: List[JobSkillCreate] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience_required: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    description: Optional[str] = None
    education_required: Optional[str] = None
    status: Optional[JobStatus] = None
    skills: Optional[List[JobSkillCreate]] = None

class JobOut(JobBase):
    id: int
    recruiter_id: int
    created_at: datetime
    skills: List[JobSkillOut] = []
    application_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ExtractedRequirement(BaseModel):
    skill_name: str
    is_required: bool
    importance_weight: SkillImportance
    category: str

class JobAnalysisRequest(BaseModel):
    title: Optional[str] = ""
    description: str

class JobAnalysisResponse(BaseModel):
    suggested_title: Optional[str] = None
    experience_level: str
    education_criteria: str
    key_keywords: List[str]
    extracted_skills: List[ExtractedRequirement]
    summary: str
