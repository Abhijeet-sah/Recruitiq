from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel
from app.models.candidate import ApplicationStatus

class ExperienceBase(BaseModel):
    company: str
    title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = "Present"
    is_current: bool = False
    description: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceOut(ExperienceBase):
    id: int
    candidate_id: int

    class Config:
        from_attributes = True

class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationOut(EducationBase):
    id: int
    candidate_id: int

    class Config:
        from_attributes = True

class CandidateSkillBase(BaseModel):
    skill_name: str
    level: str = "Intermediate"
    verified: bool = False

class CandidateSkillCreate(CandidateSkillBase):
    pass

class CandidateSkillOut(CandidateSkillBase):
    id: int
    candidate_id: int

    class Config:
        from_attributes = True

class CandidateProfileBase(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    years_of_experience: float = 0.0
    education_level: str = "Bachelor's"
    demographic_gender: Optional[str] = "Unspecified"
    demographic_age_group: Optional[str] = "Unspecified"

class CandidateProfileUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    years_of_experience: Optional[float] = None
    education_level: Optional[str] = None

class CandidateProfileOut(CandidateProfileBase):
    id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
    parsing_confidence: float = 0.0
    skills: List[CandidateSkillOut] = []
    experiences: List[ExperienceOut] = []
    educations: List[EducationOut] = []

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: ApplicationStatus
    cover_letter: Optional[str] = None
    applied_at: datetime
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    overall_match_score: Optional[float] = None
    assessment_percentage: Optional[float] = None
    rank: Optional[int] = None

    class Config:
        from_attributes = True

class ApplicationDetailOut(ApplicationOut):
    candidate_profile: Optional[CandidateProfileOut] = None
