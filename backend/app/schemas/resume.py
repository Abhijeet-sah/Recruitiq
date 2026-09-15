from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class ParsedSkill(BaseModel):
    skill_name: str
    claimed_level: str = "Intermediate"
    years_experience: float = 1.0

class ParsedExperience(BaseModel):
    company: str
    title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = "Present"
    is_current: bool = False
    description: Optional[str] = None

class ParsedEducation(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None

class ParsedResumeOut(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    education_level: Optional[str] = "Bachelor's"
    years_of_experience: float = 0.0
    skills: List[ParsedSkill] = []
    experiences: List[ParsedExperience] = []
    educations: List[ParsedEducation] = []
    certifications: List[str] = []
    projects: List[Dict[str, Any]] = []
    languages: List[str] = []
    parsing_confidence: float = 85.0
    raw_text: Optional[str] = None

class ResumeUploadResponse(BaseModel):
    resume_id: int
    candidate_id: int
    filename: str
    file_type: str
    file_size: int
    parsing_confidence: float
    parsed_data: ParsedResumeOut
    message: str
