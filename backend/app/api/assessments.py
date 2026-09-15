import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.candidate import CandidateProfile, Application, ApplicationStatus
from app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer,
    DifficultyLevel, AttemptStatus, QuestionType
)
from app.models.evaluation import ConsistencyReport, ConsistencyStatus
from app.schemas.assessment import (
    AssessmentStartResponse, AssessmentQuestionClient,
    AnswerSubmitRequest, AnswerSubmitResponse, AssessmentResultOut,
    CodeRunRequest, CodeRunResponse
)
from pydantic import BaseModel
from app.services.adaptive_engine import adaptive_engine
from app.services.consistency_audit import consistency_service
from app.services.code_evaluator import evaluate_code
from app.services.ai_question_generator import ai_question_generator
from app.services.dataset_loader import dataset_loader
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/assessments", tags=["Adaptive Assessments"])

def format_question_for_client(q: AssessmentQuestion) -> AssessmentQuestionClient:
    """Strip out correct answers and explanations for anti-cheating safety."""
    opts = []
    starter_code = None
    language = "python"
    test_cases = None
    title = None
    description = None
    examples = None
    constraints = None
    starter_templates = None
    hints = None

    if q.options_json:
        try:
            parsed = json.loads(q.options_json)
            if isinstance(parsed, list):
                opts = parsed
            elif isinstance(parsed, dict):
                opts = parsed.get("options", [])
                starter_code = parsed.get("starter_code")
                language = parsed.get("language", "python")
                test_cases = parsed.get("test_cases")
                title = parsed.get("title")
                description = parsed.get("description")
                examples = parsed.get("examples")
                constraints = parsed.get("constraints")
                starter_templates = parsed.get("starter_templates")
                hints = parsed.get("hints")
        except Exception:
            opts = []

    return AssessmentQuestionClient(
        id=q.id,
        question_text=q.question_text,
        question_type=q.question_type,
        options=opts,
        skill_tested=q.skill_tested,
        difficulty=q.difficulty,
        starter_code=starter_code,
        language=language,
        test_cases=test_cases,
        title=title,
        description=description,
        examples=examples,
        constraints=constraints,
        starter_templates=starter_templates,
        hints=hints
    )

@router.post("/questions/{question_id}/run-code", response_model=CodeRunResponse)
def run_question_code(
    question_id: int,
    payload: CodeRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Candidate tests their code against sample test cases in real-time.
    Does not commit or finalize an assessment answer.
    """
    question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == question_id).first()
    if not question:
        raise NotFoundException("Question not found")

    if question.question_type != QuestionType.CODE:
        raise BadRequestException("This question is not a coding challenge.")

    try:
        correct_spec = json.loads(question.correct_answer_json)
    except Exception:
        raise BadRequestException("Invalid question configuration.")

    lang = payload.language or correct_spec.get("language", "python")
    result = evaluate_code(lang, payload.code, correct_spec)

    return CodeRunResponse(
        passed=result.get("passed", False),
        passed_count=result.get("passed_count", 0),
        total_count=result.get("total_count", 0),
        all_passed=result.get("all_passed", False),
        test_results=result.get("test_results", []),
        error=result.get("error")
    )

@router.post("/start/{application_id}", response_model=AssessmentStartResponse)
def start_assessment(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Candidate starts adaptive assessment.
    Selects the first question based on claimed resume competencies and sets baseline difficulty.
    """
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise NotFoundException("Application not found")

    if current_user.role == UserRole.CANDIDATE:
        if not current_user.candidate_profile or app.candidate_id != current_user.candidate_profile.id:
            raise ForbiddenException("Access denied: You can only take assessments for your own applications.")

    job = app.job
    assessment = db.query(Assessment).filter(Assessment.job_id == job.id).first()
    if not assessment:
        raise NotFoundException("No assessment configured for this job")

    # Check for active or prior attempt
    active_attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == assessment.id,
        AssessmentAttempt.application_id == app.id,
        AssessmentAttempt.status == AttemptStatus.IN_PROGRESS
    ).first()

    if not active_attempt:
        active_attempt = AssessmentAttempt(
            assessment_id=assessment.id,
            candidate_id=app.candidate_id,
            application_id=app.id,
            status=AttemptStatus.IN_PROGRESS,
            difficulty_reached=DifficultyLevel.INTERMEDIATE
        )
        db.add(active_attempt)
        db.commit()
        db.refresh(active_attempt)

    # Find answered questions in current attempt
    answered_ids = [a.question_id for a in active_attempt.answers]

    # Find questions answered in prior attempts by this candidate to prioritize fresh questions
    prior_attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == assessment.id,
        AssessmentAttempt.candidate_id == app.candidate_id,
        AssessmentAttempt.id != active_attempt.id
    ).all()
    prior_answered_ids = [a.question_id for pa in prior_attempts for a in pa.answers]

    # Target skills from job
    target_skills = [s.skill_name for s in job.skills]

    # Pick first question
    first_q = adaptive_engine.select_next_question(
        assessment.questions,
        answered_ids,
        active_attempt.difficulty_reached,
        target_skills,
        prior_answered_ids=prior_answered_ids
    )
    if not first_q:
        raise BadRequestException("No questions available for this assessment.")

    total_planned = min(len(assessment.questions), 5)  # 5 adaptive questions per session

    return AssessmentStartResponse(
        attempt_id=active_attempt.id,
        assessment_id=assessment.id,
        title=assessment.title,
        max_time_minutes=assessment.max_time_minutes,
        current_question_index=len(answered_ids) + 1,
        total_questions_planned=total_planned,
        current_difficulty=first_q.difficulty,
        question=format_question_for_client(first_q)
    )

@router.post("/attempts/{attempt_id}/answer", response_model=AnswerSubmitResponse)
def submit_adaptive_answer(
    attempt_id: int,
    payload: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Candidate submits an answer to a question.
    Engine evaluates response, dynamically raises/lowers difficulty level,
    and returns the next dynamically adapted question.
    """
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise NotFoundException("Assessment attempt not found")

    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise BadRequestException("This assessment attempt is already concluded.")

    question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == payload.question_id).first()
    if not question:
        raise NotFoundException("Question not found")

    # Evaluate answer
    is_correct, points_earned = adaptive_engine.evaluate_answer(question, payload.candidate_answer)

    # Record answer
    ans = AssessmentAnswer(
        attempt_id=attempt.id,
        question_id=question.id,
        candidate_answer_json=json.dumps(payload.candidate_answer),
        is_correct=is_correct,
        points_earned=points_earned,
        time_spent_seconds=payload.time_spent_seconds,
        difficulty_level=question.difficulty
    )
    db.add(ans)

    # Dynamic Difficulty Adjustment
    next_diff = adaptive_engine.compute_next_difficulty(question.difficulty, is_correct)
    attempt.difficulty_reached = next_diff

    db.flush()

    # Check if we should conclude (e.g. 5 questions completed)
    answered_ids = [a.question_id for a in attempt.answers]
    total_planned = 5

    if len(answered_ids) >= total_planned:
        # Finalize attempt
        attempt.status = AttemptStatus.COMPLETED
        attempt.end_time = datetime.now(timezone.utc)

        # Build questions lookup
        q_map = {q.id: q for q in attempt.assessment.questions}
        summary = adaptive_engine.calculate_attempt_summary(attempt.answers, q_map)

        attempt.total_score = summary["total_score"]
        attempt.max_score = summary["max_score"]
        attempt.percentage = summary["percentage"]
        attempt.difficulty_reached = summary["difficulty_reached"]

        # Update application status
        app = attempt.application
        app.status = ApplicationStatus.ASSESSMENT_COMPLETED

        # Trigger Skill Consistency Analysis
        claimed_skills = []
        for cs in app.candidate.skills:
            claimed_skills.append({"skill_name": cs.skill_name, "claimed_level": cs.level})

        cons_res = consistency_service.evaluate_consistency(claimed_skills, summary["topic_performance"])
        cons_entity = app.consistency_report
        if not cons_entity:
            cons_entity = ConsistencyReport(application_id=app.id)
            db.add(cons_entity)

        cons_entity.overall_status = cons_res["overall_status"]
        cons_entity.consistency_score = cons_res["consistency_score"]
        cons_entity.summary_text = cons_res["summary_text"]
        cons_entity.details_json = json.dumps(cons_res["details"])

        db.commit()
        db.refresh(attempt)

        return AnswerSubmitResponse(
            attempt_id=attempt.id,
            is_completed=True,
            current_question_index=len(answered_ids),
            total_questions_planned=total_planned,
            current_difficulty=attempt.difficulty_reached,
            next_question=None,
            result=summary
        )

    # Fetch next adapted question
    target_skills = [s.skill_name for s in attempt.application.job.skills]
    prior_attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == attempt.assessment_id,
        AssessmentAttempt.candidate_id == attempt.candidate_id,
        AssessmentAttempt.id != attempt.id
    ).all()
    prior_answered_ids = [a.question_id for pa in prior_attempts for a in pa.answers]

    next_q = adaptive_engine.select_next_question(
        attempt.assessment.questions,
        answered_ids,
        next_diff,
        target_skills,
        prior_answered_ids=prior_answered_ids
    )

    db.commit()

    if not next_q:
        # Conclude early if no more questions available
        attempt.status = AttemptStatus.COMPLETED
        attempt.end_time = datetime.now(timezone.utc)
        q_map = {q.id: q for q in attempt.assessment.questions}
        summary = adaptive_engine.calculate_attempt_summary(attempt.answers, q_map)
        attempt.total_score = summary["total_score"]
        attempt.max_score = summary["max_score"]
        attempt.percentage = summary["percentage"]
        db.commit()

        return AnswerSubmitResponse(
            attempt_id=attempt.id,
            is_completed=True,
            current_question_index=len(answered_ids),
            total_questions_planned=len(answered_ids),
            current_difficulty=attempt.difficulty_reached,
            next_question=None,
            result=summary
        )

    return AnswerSubmitResponse(
        attempt_id=attempt.id,
        is_completed=False,
        current_question_index=len(answered_ids) + 1,
        total_questions_planned=total_planned,
        current_difficulty=next_q.difficulty,
        next_question=format_question_for_client(next_q)
    )

@router.get("/attempts/{attempt_id}/results", response_model=AssessmentResultOut)
def get_attempt_results(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full score breakdown, difficulty reached, and topic performance."""
    attempt = db.query(AssessmentAttempt).filter(AssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise NotFoundException("Assessment attempt not found")

    q_map = {q.id: q for q in attempt.assessment.questions}
    summary = adaptive_engine.calculate_attempt_summary(attempt.answers, q_map)

    time_taken = 0
    if attempt.end_time and attempt.start_time:
        time_taken = int((attempt.end_time - attempt.start_time).total_seconds())

    return AssessmentResultOut(
        attempt_id=attempt.id,
        assessment_id=attempt.assessment_id,
        candidate_id=attempt.candidate_id,
        status=attempt.status,
        total_score=attempt.total_score,
        max_score=attempt.max_score,
        percentage=attempt.percentage,
        difficulty_reached=attempt.difficulty_reached,
        total_questions=summary["total_questions"],
        correct_count=summary["correct_count"],
        topic_performance=summary["topic_performance"],
        time_taken_seconds=time_taken,
        completed_at=attempt.end_time
    )

class AIGenerateRequest(BaseModel):
    skills: Optional[List[str]] = None
    count: int = 3
    difficulty: str = "Intermediate"
    question_type: str = "CODE"

class ImportBenchmarkRequest(BaseModel):
    count: int = 25
    difficulty: Optional[str] = None
    skill: Optional[str] = None

@router.post("/jobs/{job_id}/generate-ai-questions")
def generate_ai_questions_for_job(
    job_id: int,
    payload: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """
    On-Demand AI Question Generator.
    Generates new LeetCode challenges or conceptual questions tailored to job skills,
    saving them directly into the job's assessment pool.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise NotFoundException("Job not found")

    assessment = db.query(Assessment).filter(Assessment.job_id == job.id).first()
    if not assessment:
        assessment = Assessment(
            job_id=job.id,
            title=f"{job.title} Competency Assessment",
            max_time_minutes=45
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

    skills_to_use = payload.skills or [s.skill_name for s in job.skills] or ["Python"]
    created_questions = ai_question_generator.generate_and_save_to_assessment(
        db=db,
        assessment_id=assessment.id,
        skills=skills_to_use,
        count=payload.count,
        difficulty=payload.difficulty,
        question_type=payload.question_type
    )

    return {
        "success": True,
        "message": f"Successfully generated {len(created_questions)} AI questions for {job.title}.",
        "added_count": len(created_questions),
        "total_assessment_questions": len(assessment.questions),
        "generated_questions": [
            {
                "id": q.id,
                "title": json.loads(q.options_json).get("title") if q.options_json else q.question_text[:30],
                "skill": q.skill_tested,
                "difficulty": q.difficulty.value,
                "type": q.question_type.value
            }
            for q in created_questions
        ]
    }

@router.post("/jobs/{job_id}/import-benchmark-pool")
def import_benchmark_questions_for_job(
    job_id: int,
    payload: ImportBenchmarkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER, UserRole.ADMIN))
):
    """
    Imports verified benchmark programming problems (from MBPP dataset)
    into the assessment pool.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise NotFoundException("Job not found")

    assessment = db.query(Assessment).filter(Assessment.job_id == job.id).first()
    if not assessment:
        assessment = Assessment(
            job_id=job.id,
            title=f"{job.title} Competency Assessment",
            max_time_minutes=45
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

    diff_enum = None
    if payload.difficulty:
        if payload.difficulty.lower() == "beginner":
            diff_enum = DifficultyLevel.BEGINNER
        elif payload.difficulty.lower() == "intermediate":
            diff_enum = DifficultyLevel.INTERMEDIATE
        elif payload.difficulty.lower() == "advanced":
            diff_enum = DifficultyLevel.ADVANCED

    added = dataset_loader.import_into_assessment(
        db=db,
        assessment_id=assessment.id,
        count=payload.count,
        difficulty=diff_enum,
        skill=payload.skill
    )

    db.refresh(assessment)

    return {
        "success": True,
        "message": f"Successfully imported {added} benchmark questions into {job.title}.",
        "added_count": added,
        "total_assessment_questions": len(assessment.questions)
    }

