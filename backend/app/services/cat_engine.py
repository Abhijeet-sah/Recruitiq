import math
import logging
from typing import Dict, Any, List, Optional, Tuple
from app.models.assessment import DifficultyLevel, AssessmentQuestion, QuestionType

logger = logging.getLogger(__name__)

class ItemResponseTheoryEngine:
    """
    Computerized Adaptive Testing (CAT) Engine based on the 2-Parameter Logistic (2PL)
    Item Response Theory (IRT) model.
    Estimates candidate latent technical ability (theta, θ) and selects questions
    maximizing Fisher Information.
    """

    # Mapping from categorical difficulty to IRT b parameter
    DIFFICULTY_TO_B = {
        DifficultyLevel.BEGINNER: -1.0,
        DifficultyLevel.INTERMEDIATE: 0.2,
        DifficultyLevel.ADVANCED: 1.5,
    }

    # Default discrimination parameter (a) by question format
    DEFAULT_A = {
        QuestionType.CODE: 1.6,      # High discrimination for hands-on coding
        QuestionType.SCENARIO: 1.3,  # Moderate discrimination
        QuestionType.MCQ: 1.1        # Standard discrimination
    }

    STOPPING_SE_THRESHOLD: float = 0.35

    @staticmethod
    def probability_correct(theta: float, a: float, b: float) -> float:
        """2PL Logistic Response Function: P(correct | theta) = 1 / (1 + exp(-a * (theta - b)))"""
        logit = -a * (theta - b)
        # Numerical stability clamp
        logit = max(min(logit, 35.0), -35.0)
        return 1.0 / (1.0 + math.exp(logit))

    @staticmethod
    def fisher_information(theta: float, a: float, b: float) -> float:
        """Fisher Information: I(theta) = a^2 * P * (1 - P)"""
        p = ItemResponseTheoryEngine.probability_correct(theta, a, b)
        return (a ** 2) * p * (1.0 - p)

    def estimate_theta_eap(
        self,
        responses: List[Tuple[float, float, bool]]  # List of (a, b, is_correct)
    ) -> Tuple[float, float]:
        """
        Computes Expected A Posteriori (EAP) latent ability theta estimate with Gaussian prior N(0, 1).
        Returns (theta_estimate, standard_error).
        """
        if not responses:
            return 0.0, 1.0

        # Numerical integration over quadrature points in [-3.5, 3.5]
        num_points = 61
        points = [ -3.5 + i * (7.0 / (num_points - 1)) for i in range(num_points) ]
        
        weights = []
        likelihoods = []
        
        for q in points:
            # Gaussian prior N(0, 1)
            prior = math.exp(-0.5 * (q ** 2)) / math.sqrt(2.0 * math.pi)
            
            # Likelihood product over observed responses
            ll = 1.0
            for resp in responses:
                if isinstance(resp, dict):
                    a = float(resp.get("discrimination", resp.get("discrimination_a", 1.0)))
                    b = float(resp.get("difficulty", resp.get("difficulty_b", 0.0)))
                    is_correct = bool(resp.get("is_correct", False))
                else:
                    a, b, is_correct = resp
                p = self.probability_correct(q, a, b)
                ll *= p if is_correct else (1.0 - p)
                
            posterior = ll * prior
            weights.append(posterior)

        total_weight = sum(weights)
        if total_weight == 0.0 or math.isnan(total_weight):
            return 0.0, 1.0

        # Mean (EAP estimate)
        eap_theta = sum(p * w for p, w in zip(points, weights)) / total_weight

        # Standard Error: sqrt(Variance)
        var_theta = sum(((p - eap_theta) ** 2) * w for p, w in zip(points, weights)) / total_weight
        se_theta = math.sqrt(max(var_theta, 0.04))

        # Clamp theta to reasonable bounds
        clamped_theta = max(min(round(eap_theta, 2), 3.0), -3.0)
        return clamped_theta, round(se_theta, 2)

    def select_next_item_cat(
        self,
        available_questions: List[AssessmentQuestion],
        answered_ids: List[int],
        current_theta: float,
        target_skills: List[str],
        prior_answered_ids: Optional[List[int]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Selects the next optimal question by maximizing Fisher Information I(theta)
        near the candidate's current ability estimate, prioritizing uncovered target skills.
        """
        import random

        unanswered = [q for q in available_questions if q.id not in answered_ids]
        if not unanswered:
            return None

        # Prioritize never-before-seen questions across historical attempts
        if prior_answered_ids:
            fresh = [q for q in unanswered if q.id not in prior_answered_ids]
            pool = fresh if fresh else unanswered
        else:
            pool = unanswered

        scored_candidates = []
        target_lower = [s.lower() for s in target_skills]

        for q in pool:
            b = self.DIFFICULTY_TO_B.get(q.difficulty, 0.0)
            a = self.DEFAULT_A.get(q.question_type, 1.2)
            info = self.fisher_information(current_theta, a, b)

            # Skill alignment bonus
            skill_bonus = 1.3 if q.skill_tested.lower() in target_lower else 1.0
            
            # Mid-session coding challenge incentive
            code_bonus = 1.25 if q.question_type == QuestionType.CODE else 1.0
            
            total_utility = info * skill_bonus * code_bonus

            scored_candidates.append((total_utility, q, a, b))

        # Sort by maximum information / utility
        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        # Pick among top 3 to introduce controlled variety
        top_slice = scored_candidates[:min(3, len(scored_candidates))]
        chosen_utility, chosen_q, chosen_a, chosen_b = random.choice(top_slice)

        prob = self.probability_correct(current_theta, chosen_a, chosen_b)

        return {
            "question": chosen_q,
            "theta_target": current_theta,
            "difficulty_b": chosen_b,
            "discrimination_a": chosen_a,
            "fisher_information": round(chosen_utility, 3),
            "expected_prob_correct": round(prob, 2)
        }

    def map_theta_to_competency(self, theta: float) -> str:
        """Translates numerical theta ability into standardized competency levels."""
        if theta >= 1.2:
            return "Advanced"
        elif theta >= 0.0:
            return "Intermediate"
        else:
            return "Beginner"

    def estimate_ability_eap(self, responses: List[Any]) -> Dict[str, Any]:
        theta, se = self.estimate_theta_eap(responses)
        comp = self.map_theta_to_competency(theta)
        return {
            "theta": theta,
            "standard_error": se,
            "competency_level": comp,
            "converged": se <= self.STOPPING_SE_THRESHOLD
        }

cat_engine = ItemResponseTheoryEngine()
irt_cat_engine = cat_engine
