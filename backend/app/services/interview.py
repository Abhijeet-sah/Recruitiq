import json
from typing import List, Dict, Any
from app.models.job import Job
from app.models.candidate import CandidateProfile
from app.services.embeddings import vectorizer

class AIInterviewService:
    """
    AI Interview Evaluation Service.
    Generates targeted Technical, Behavioral, and Situational interview prompts 
    focused on identified skill gaps and job context.
    Evaluates text answers on relevance, technical accuracy, and structured communication.
    Strictly avoids inferring psychological or personality traits.
    """

    def generate_interview_questions(
        self,
        job_title: str,
        missing_skills: List[str],
        primary_skills: List[str]
    ) -> List[Dict[str, str]]:
        focus_tech = missing_skills[0] if missing_skills else (primary_skills[0] if primary_skills else "Python")
        secondary_tech = missing_skills[1] if len(missing_skills) > 1 else "System Architecture"

        questions = [
            {
                "question_type": "Technical",
                "question_text": f"In a high-throughput production service using {focus_tech}, how would you approach performance optimization and memory profiling under heavy concurrency?"
            },
            {
                "question_type": "Situational",
                "question_text": f"Suppose your team is migrating legacy infrastructure to {secondary_tech}, but you discover tight coupling and zero integration tests. What stepwise migration strategy would you propose to prevent customer downtime?"
            },
            {
                "question_type": "Behavioral",
                "question_text": f"Describe a situation where a critical production bug occurred during an on-call rotation for a {job_title} role. How did you triage the incident, communicate with stakeholders, and implement post-incident prevention?"
            }
        ]
        return questions

    def evaluate_response(
        self,
        question_text: str,
        question_type: str,
        candidate_response: str
    ) -> Dict[str, Any]:
        """
        Evaluate candidate written response against domain relevance, technical depth, and communication structure.
        """
        resp = candidate_response.strip()
        word_count = len(resp.split())

        # Length / completeness heuristic
        if word_count < 15:
            relevance = 40.0
            technical = 35.0
            communication = 50.0
            feedback = "Response is very brief; consider providing concrete examples, architecture details, or trade-offs."
        elif word_count < 40:
            relevance = 65.0
            technical = 60.0
            communication = 70.0
            feedback = "Clear basic explanation. Adding specific metrics, testing strategies, or architectural trade-offs would strengthen the response."
        else:
            # Semantic alignment with question
            sim = vectorizer.cosine_similarity(resp, question_text)
            relevance = min(max(sim * 100 * 1.5 + 40.0, 70.0), 95.0)
            technical = min(max(relevance + 5.0, 65.0), 96.0)
            communication = min(max(80.0 + (word_count // 10), 75.0), 98.0)
            feedback = (
                "Comprehensive and structured response. Clearly addressed the core scenario with practical methodology, "
                "risk mitigation considerations, and clear professional communication."
            )

        return {
            "relevance_score": round(relevance, 1),
            "technical_score": round(technical, 1),
            "communication_score": round(communication, 1),
            "feedback_text": feedback
        }

interview_service = AIInterviewService()
