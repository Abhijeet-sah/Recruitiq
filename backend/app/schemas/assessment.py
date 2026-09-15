from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from app.models.assessment import QuestionType, DifficultyLevel, AttemptStatus


class AssessmentQuestionClient(BaseModel):
    id: int
    question_text: str
    question_type: QuestionType
    options: List[str] = []
    skill_tested: str
    difficulty: DifficultyLevel
    starter_code: Optional[str] = None
    language: Optional[str] = "python"
    test_cases: Optional[List[Dict[str, Any]]] = None
    title: Optional[str] = None
    description: Optional[str] = None
    examples: Optional[List[Dict[str, Any]]] = None
    constraints: Optional[List[str]] = None
    starter_templates: Optional[Dict[str, str]] = None
    hints: Optional[List[str]] = None


class CodeRunRequest(BaseModel):
    code: str
    language: Optional[str] = "python"


class CodeRunResult(BaseModel):
    case_number: int
    input_repr: str
    expected_repr: str
    actual_repr: Optional[str] = None
    passed: bool
    error: Optional[str] = None
    execution_time_ms: float = 0.0


class CodeRunResponse(BaseModel):
    passed: bool
    passed_count: int
    total_count: int
    all_passed: bool
    test_results: List[CodeRunResult]
    error: Optional[str] = None


class AssessmentStartResponse(BaseModel):
    attempt_id: int
    assessment_id: int
    title: str
    max_time_minutes: int
    current_question_index: int
    total_questions_planned: int
    current_difficulty: DifficultyLevel
    question: AssessmentQuestionClient


class AnswerSubmitRequest(BaseModel):
    question_id: int
    candidate_answer: Any
    time_spent_seconds: int = 0


class AnswerSubmitResponse(BaseModel):
    attempt_id: int
    is_completed: bool
    current_question_index: int
    total_questions_planned: int
    current_difficulty: DifficultyLevel
    next_question: Optional[AssessmentQuestionClient] = None
    result: Optional[Dict[str, Any]] = None


class AssessmentResultOut(BaseModel):
    attempt_id: int
    assessment_id: int
    candidate_id: int
    status: AttemptStatus
    total_score: float
    max_score: float
    percentage: float
    difficulty_reached: DifficultyLevel
    total_questions: int
    correct_count: int
    topic_performance: Dict[str, float] = {}
    time_taken_seconds: int = 0
    completed_at: Optional[datetime] = None
