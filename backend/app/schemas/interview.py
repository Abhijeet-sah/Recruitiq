from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class InterviewQuestionOut(BaseModel):
    id: int
    question_type: str
    question_text: str
    candidate_response: Optional[str] = None
    relevance_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    feedback_text: Optional[str] = None

class InterviewStartResponse(BaseModel):
    session_id: int
    application_id: int
    status: str
    questions: List[InterviewQuestionOut]

class InterviewAnswerRequest(BaseModel):
    question_id: int
    candidate_response: str

class InterviewAnswerResponse(BaseModel):
    question_id: int
    relevance_score: float
    technical_score: float
    communication_score: float
    feedback_text: str

class InterviewSessionResultOut(BaseModel):
    session_id: int
    application_id: int
    status: str
    overall_score: float
    feedback_summary: str
    questions: List[InterviewQuestionOut]
