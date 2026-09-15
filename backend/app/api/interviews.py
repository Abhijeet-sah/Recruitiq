import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.candidate import Application
from app.models.interview import InterviewSession, InterviewQuestion, InterviewStatus
from app.schemas.interview import (
    InterviewStartResponse, InterviewQuestionOut,
    InterviewAnswerRequest, InterviewAnswerResponse, InterviewSessionResultOut
)
from app.services.interview import interview_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/interviews", tags=["AI Interviews"])

@router.post("/start/{application_id}", response_model=InterviewStartResponse)
def start_interview(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Start an AI-assisted interview session with targeted Technical, Situational, and Behavioral prompts."""
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise NotFoundException("Application not found")

    session = app.interview_session
    if not session:
        session = InterviewSession(
            application_id=app.id,
            candidate_id=app.candidate_id,
            status=InterviewStatus.IN_PROGRESS
        )
        db.add(session)
        db.flush()

        missing = []
        if app.skill_gap and app.skill_gap.missing_skills_json:
            missing = json.loads(app.skill_gap.missing_skills_json)

        primary = [s.skill_name for s in app.job.skills]
        prompts = interview_service.generate_interview_questions(app.job.title, missing, primary)

        for p in prompts:
            q = InterviewQuestion(
                session_id=session.id,
                question_type=p["question_type"],
                question_text=p["question_text"]
            )
            db.add(q)
        db.commit()
        db.refresh(session)

    q_outs = [
        InterviewQuestionOut(
            id=q.id,
            question_type=q.question_type,
            question_text=q.question_text,
            candidate_response=q.candidate_response,
            relevance_score=q.relevance_score,
            technical_score=q.technical_score,
            communication_score=q.communication_score,
            feedback_text=q.feedback_text
        )
        for q in session.questions
    ]

    return InterviewStartResponse(
        session_id=session.id,
        application_id=app.id,
        status=session.status.value,
        questions=q_outs
    )

@router.post("/questions/{question_id}/answer", response_model=InterviewAnswerResponse)
def answer_interview_question(
    question_id: int,
    payload: InterviewAnswerRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Submit text response to an interview question and receive structured objective evaluation."""
    q = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    if not q:
        raise NotFoundException("Interview question not found")

    eval_res = interview_service.evaluate_response(
        question_text=q.question_text,
        question_type=q.question_type,
        candidate_response=payload.candidate_response
    )

    q.candidate_response = payload.candidate_response
    q.relevance_score = eval_res["relevance_score"]
    q.technical_score = eval_res["technical_score"]
    q.communication_score = eval_res["communication_score"]
    q.feedback_text = eval_res["feedback_text"]

    db.flush()

    # Check if all session questions are answered
    session = q.session
    unanswered = [item for item in session.questions if not item.candidate_response]
    if not unanswered:
        session.status = InterviewStatus.COMPLETED
        avg_score = sum((item.technical_score + item.relevance_score + item.communication_score) / 3.0 for item in session.questions) / len(session.questions)
        session.overall_score = round(avg_score, 1)

    db.commit()

    return InterviewAnswerResponse(
        question_id=q.id,
        relevance_score=eval_res["relevance_score"],
        technical_score=eval_res["technical_score"],
        communication_score=eval_res["communication_score"],
        feedback_text=eval_res["feedback_text"]
    )

@router.get("/{session_id}", response_model=InterviewSessionResultOut)
def get_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieve full interview session evaluation results."""
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise NotFoundException("Interview session not found")

    q_outs = [
        InterviewQuestionOut(
            id=q.id,
            question_type=q.question_type,
            question_text=q.question_text,
            candidate_response=q.candidate_response,
            relevance_score=q.relevance_score,
            technical_score=q.technical_score,
            communication_score=q.communication_score,
            feedback_text=q.feedback_text
        )
        for q in session.questions
    ]

    summary = (
        f"Candidate completed {len(session.questions)} evaluation questions with an overall communication & technical index of {session.overall_score}%."
        if session.status == InterviewStatus.COMPLETED else "Interview is currently in progress."
    )

    return InterviewSessionResultOut(
        session_id=session.id,
        application_id=session.application_id,
        status=session.status.value,
        overall_score=session.overall_score,
        feedback_summary=summary,
        questions=q_outs
    )
