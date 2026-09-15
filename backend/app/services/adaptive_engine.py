import json
from typing import List, Dict, Any, Optional, Tuple
from app.models.assessment import (
    AssessmentQuestion, AssessmentAttempt, AssessmentAnswer,
    DifficultyLevel, QuestionType, AttemptStatus
)
from app.services.code_evaluator import evaluate_code


class AdaptiveAssessmentEngine:
    """
    Dynamic Item Response & Adaptive Assessment Engine:
    - Sequences questions dynamically based on real-time candidate answers.
    - Transitions difficulty: Beginner <-> Intermediate <-> Advanced.
    - Integrates hands-on coding challenges and conceptual MCQ/Scenario questions.
    - Evaluates code submissions in an isolated test execution sandbox.
    - Computes topic-level mastery scores and final weighted percentage.
    """

    DIFFICULTY_PROGRESSION = {
        DifficultyLevel.BEGINNER: {"up": DifficultyLevel.INTERMEDIATE, "down": DifficultyLevel.BEGINNER, "points": 1.0},
        DifficultyLevel.INTERMEDIATE: {"up": DifficultyLevel.ADVANCED, "down": DifficultyLevel.BEGINNER, "points": 2.0},
        DifficultyLevel.ADVANCED: {"up": DifficultyLevel.ADVANCED, "down": DifficultyLevel.INTERMEDIATE, "points": 3.0}
    }

    def select_next_question(
        self,
        available_questions: List[AssessmentQuestion],
        answered_question_ids: List[int],
        current_difficulty: DifficultyLevel,
        target_skills: List[str],
        prior_answered_ids: Optional[List[int]] = None
    ) -> Optional[AssessmentQuestion]:
        """
        Select the next question prioritizing:
        1. Not yet answered in the current session.
        2. Never seen in previous sessions by this candidate (freshness).
        3. Randomization among matching questions so questions vary dynamically across attempts.
        4. Balances practical coding challenges and conceptual questions.
        5. Matches target competencies and calibrated difficulty.
        """
        import random

        unanswered = [q for q in available_questions if q.id not in answered_question_ids]
        if not unanswered:
            return None

        # Prioritize questions not seen in prior attempts
        if prior_answered_ids:
            fresh = [q for q in unanswered if q.id not in prior_answered_ids]
            pool = fresh if fresh else unanswered
        else:
            pool = unanswered

        # Check if candidate has had a coding challenge yet in this attempt
        answered_questions = [q for q in available_questions if q.id in answered_question_ids]
        has_had_code = any(q.question_type == QuestionType.CODE for q in answered_questions)
        pool_code = [q for q in pool if q.question_type == QuestionType.CODE]

        # In mid-session (questions 2-4), prioritize introducing a coding question if not yet seen
        if not has_had_code and pool_code and len(answered_question_ids) >= 1:
            for skill in target_skills:
                matching_code = [
                    q for q in pool_code
                    if q.skill_tested.lower() == skill.lower() and q.difficulty == current_difficulty
                ]
                if matching_code:
                    return random.choice(matching_code)

            diff_code = [q for q in pool_code if q.difficulty == current_difficulty]
            if diff_code:
                return random.choice(diff_code)

            return random.choice(pool_code)

        # Standard priority: Try matching both skill and difficulty
        for skill in target_skills:
            matching = [
                q for q in pool
                if q.skill_tested.lower() == skill.lower() and q.difficulty == current_difficulty
            ]
            if matching:
                return random.choice(matching)

        # Match current difficulty on any available skill
        same_difficulty = [q for q in pool if q.difficulty == current_difficulty]
        if same_difficulty:
            return random.choice(same_difficulty)

        # Fallback to any question in pool or unanswered
        if pool:
            return random.choice(pool)
        return random.choice(unanswered)

    def evaluate_answer(
        self,
        question: AssessmentQuestion,
        candidate_answer: Any
    ) -> Tuple[bool, float]:
        """
        Verify candidate answer against the stored answer.
        Handles both interactive CODE challenges and standard MCQ/Scenario questions.
        Returns (is_correct, points_awarded).
        """
        correct_raw = question.correct_answer_json
        try:
            correct_val = json.loads(correct_raw)
        except Exception:
            correct_val = correct_raw

        points_base = self.DIFFICULTY_PROGRESSION.get(question.difficulty, {}).get("points", 1.0)

        # 1. Hands-on Coding Challenge Evaluation
        if question.question_type == QuestionType.CODE and isinstance(correct_val, dict):
            lang = correct_val.get("language", "python")
            code_to_eval = str(candidate_answer)
            if isinstance(candidate_answer, dict):
                code_to_eval = candidate_answer.get("code", "")
                lang = candidate_answer.get("language", lang)
            elif isinstance(candidate_answer, str):
                try:
                    parsed = json.loads(candidate_answer)
                    if isinstance(parsed, dict) and "code" in parsed:
                        code_to_eval = parsed.get("code", "")
                        lang = parsed.get("language", lang)
                except Exception:
                    pass

            eval_res = evaluate_code(lang, code_to_eval, correct_val)
            pass_ratio = eval_res.get("score_ratio", 1.0 if eval_res.get("passed") else 0.0)
            is_correct = eval_res.get("passed", False)
            points_earned = round(points_base * pass_ratio, 2)
            return is_correct, points_earned

        # 2. Standard MCQ / Scenario Comparison
        c_str = str(candidate_answer).strip().lower()
        t_str = str(correct_val).strip().lower()
        is_correct = (c_str == t_str)
        points_earned = points_base if is_correct else 0.0

        return is_correct, points_earned

    def compute_next_difficulty(
        self,
        current_difficulty: DifficultyLevel,
        is_correct: bool
    ) -> DifficultyLevel:
        """Adaptive step: increase on success, decrease on error."""
        config = self.DIFFICULTY_PROGRESSION.get(
            current_difficulty,
            self.DIFFICULTY_PROGRESSION[DifficultyLevel.INTERMEDIATE]
        )
        return config["up"] if is_correct else config["down"]

    def calculate_attempt_summary(
        self,
        answers: List[AssessmentAnswer],
        questions_map: Dict[int, AssessmentQuestion]
    ) -> Dict[str, Any]:
        """
        Compute final score, percentage, difficulty reached, and topic-wise breakdown.
        """
        total_earned = sum(a.points_earned for a in answers)
        max_possible = 0.0
        correct_count = 0
        topic_points: Dict[str, float] = {}
        topic_max: Dict[str, float] = {}
        highest_diff = DifficultyLevel.BEGINNER

        diff_order = {DifficultyLevel.BEGINNER: 1, DifficultyLevel.INTERMEDIATE: 2, DifficultyLevel.ADVANCED: 3}

        for ans in answers:
            q = questions_map.get(ans.question_id)
            if not q:
                continue

            q_points = self.DIFFICULTY_PROGRESSION.get(q.difficulty, {}).get("points", 1.0)
            max_possible += q_points

            skill = q.skill_tested
            topic_points[skill] = topic_points.get(skill, 0.0) + ans.points_earned
            topic_max[skill] = topic_max.get(skill, 0.0) + q_points

            if ans.is_correct:
                correct_count += 1
                if diff_order.get(ans.difficulty_level, 1) > diff_order.get(highest_diff, 1):
                    highest_diff = ans.difficulty_level

        percentage = round((total_earned / max_possible) * 100, 1) if max_possible > 0 else 0.0

        topic_performance = {}
        for skill, pts in topic_points.items():
            t_max = topic_max.get(skill, 1.0)
            topic_performance[skill] = round((pts / t_max) * 100, 1) if t_max > 0 else 0.0

        return {
            "total_score": round(total_earned, 1),
            "max_score": round(max_possible, 1),
            "percentage": percentage,
            "difficulty_reached": highest_diff,
            "total_questions": len(answers),
            "correct_count": correct_count,
            "topic_performance": topic_performance
        }


adaptive_engine = AdaptiveAssessmentEngine()
