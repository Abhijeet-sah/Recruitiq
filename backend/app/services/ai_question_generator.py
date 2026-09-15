import os
import json
import re
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings
from app.models.assessment import QuestionType, DifficultyLevel, AssessmentQuestion
from app.services.dataset_loader import dataset_loader
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def make_json_safe(obj):
    if isinstance(obj, (set, frozenset)):
        return list(obj)
    if isinstance(obj, tuple):
        return list(obj)
    if hasattr(obj, "value"):
        return obj.value
    if hasattr(obj, "isoformat"):
        return obj.isoformat()
    return str(obj)

class AIQuestionGeneratorService:
    """
    On-Demand AI Question Generator.
    Uses Google Gemini REST API to dynamically generate structured LeetCode-style coding challenges
    and conceptual questions tailored to specific job descriptions or skill requirements.
    Includes smart offline synthesis fallback when no API key is provided or network is unavailable.
    """

    def generate_questions(
        self,
        skills: List[str],
        count: int = 3,
        difficulty: str = "Intermediate",
        question_type: str = "CODE"
    ) -> List[Dict[str, Any]]:
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        
        if api_key:
            try:
                ai_questions = self._call_gemini_api(api_key, skills, count, difficulty, question_type)
                if ai_questions:
                    return ai_questions
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to smart local generator: {e}")

        # Fallback: Smart local synthesis & benchmark pool
        return self._generate_offline_questions(skills, count, difficulty, question_type)

    def _call_gemini_api(
        self,
        api_key: str,
        skills: List[str],
        count: int,
        difficulty: str,
        question_type: str
    ) -> List[Dict[str, Any]]:
        skills_str = ", ".join(skills) if skills else "Python, Algorithms"
        prompt = f"""You are a Principal Software Engineer creating LeetCode-style technical assessment challenges.
Generate {count} unique coding or technical questions testing: {skills_str}.
Target Difficulty: {difficulty}.
Question Type: {question_type}.

Output MUST be a valid, raw JSON array (no markdown code blocks, just raw JSON) containing objects with this exact structure:
[
  {{
    "title": "Problem Title (e.g. Invert Binary Tree or Group Anagrams)",
    "description": "Clear problem statement explaining the task, inputs, and outputs.",
    "question_type": "{question_type}",
    "skill_tested": "{skills[0] if skills else 'Python'}",
    "difficulty": "{difficulty}",
    "explanation": "Explanation of the optimal approach and time complexity.",
    "examples": [
      {{
        "input": "functionName(arg1, arg2)",
        "output": "expected_result",
        "explanation": "Why this output is produced."
      }}
    ],
    "constraints": [
      "1 <= input.length <= 10^4",
      "Time complexity should be O(N)."
    ],
    "starter_templates": {{
      "python": "def function_name(arg1, arg2):\\n    pass",
      "javascript": "function functionName(arg1, arg2) {{\\n}}",
      "java": "class Solution {{\\n    public Object functionName(Object arg1) {{\\n        return null;\\n    }}\\n}}",
      "cpp": "class Solution {{\\npublic:\\n    auto functionName(auto arg1) {{\\n    }}\\n}};"
    }},
    "correct_answer": {{
      "language": "python",
      "function_name": "function_name",
      "test_cases": [
        {{"args": [1, 2], "expected": 3}},
        {{"args": [5, 10], "expected": 15}}
      ],
      "reference_solution": "def function_name(arg1, arg2):\\n    return arg1 + arg2"
    }}
  }}
]
Ensure each problem has at least 3 test cases in test_cases with exact args and expected outputs.
"""
        url = f"{GEMINI_API_URL}?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 3000
            }
        }

        with httpx.Client(timeout=25.0) as client:
            resp = client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                logger.error(f"Gemini API returned status {resp.status_code}: {resp.text}")
                return []

            res_json = resp.json()
            candidates = res_json.get("candidates", [])
            if not candidates:
                return []

            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
            # Strip markdown code fences if model returned ```json ... ```
            raw_text = re.sub(r"^```(?:json)?", "", raw_text, flags=re.IGNORECASE).strip()
            raw_text = re.sub(r"```$", "", raw_text).strip()

            parsed = json.loads(raw_text)
            if isinstance(parsed, list):
                return parsed
            return []

    def _generate_offline_questions(
        self,
        skills: List[str],
        count: int,
        difficulty_str: str,
        question_type: str
    ) -> List[Dict[str, Any]]:
        """
        Smart local synthesizer that pulls from the 967 verified benchmark problems
        or specialized templates for SQL, React, Docker, and Python.
        """
        diff_enum = DifficultyLevel.INTERMEDIATE
        if difficulty_str.lower() == "beginner":
            diff_enum = DifficultyLevel.BEGINNER
        elif difficulty_str.lower() == "advanced":
            diff_enum = DifficultyLevel.ADVANCED

        skill_primary = skills[0] if skills else "Python"
        skill_lower = skill_primary.lower()

        # 1. Specialized Framework Templates
        if "sql" in skill_lower:
            return self._get_curated_sql_questions(count, diff_enum)
        elif "react" in skill_lower or "frontend" in skill_lower:
            return self._get_curated_react_questions(count, diff_enum)
        elif "docker" in skill_lower or "devops" in skill_lower:
            return self._get_curated_devops_questions(count, diff_enum)

        # 2. General Python / Algorithm Benchmark pool
        all_problems = dataset_loader.load_all_problems()
        import random
        # Filter by matching difficulty
        matching = [p for p in all_problems if p["difficulty"] == diff_enum]
        if not matching:
            matching = all_problems

        sampled = random.sample(matching, min(count, len(matching)))
        results = []
        for p in sampled:
            results.append({
                "title": p["options"].get("title", "Algorithmic Challenge"),
                "description": p["question_text"],
                "question_type": p["question_type"].value if hasattr(p["question_type"], "value") else str(p["question_type"]),
                "skill_tested": skill_primary,
                "difficulty": p["difficulty"].value if hasattr(p["difficulty"], "value") else str(p["difficulty"]),
                "explanation": p.get("explanation", "Algorithmic challenge verification."),
                "examples": p["options"].get("examples", []),
                "constraints": p["options"].get("constraints", []),
                "starter_templates": p["options"].get("starter_templates", {}),
                "correct_answer": p["correct_answer"]
            })
        return results

    def _get_curated_sql_questions(self, count: int, difficulty: DifficultyLevel) -> List[Dict[str, Any]]:
        templates = [
            {
                "title": "Second Highest Salary",
                "description": "Write a SQL query to find the second highest salary from the Employee table. If there is no second highest salary, return NULL.",
                "question_type": "CODE",
                "skill_tested": "SQL",
                "difficulty": "Intermediate",
                "explanation": "Use DENSE_RANK() or OFFSET 1 with LIMIT 1 on DISTINCT salaries in descending order.",
                "examples": [
                    {"input": "Employee: id, salary", "output": "SecondHighestSalary: 200", "explanation": "200 is the second highest distinct salary."}
                ],
                "constraints": ["Table contains at least 1 record.", "Query must execute within standard SQL limits."],
                "starter_templates": {
                    "sql": "-- Write your SQL query below\nSELECT "
                },
                "correct_answer": {
                    "language": "sql",
                    "setup_sql": "CREATE TABLE Employee (id INT, salary INT); INSERT INTO Employee VALUES (1, 100), (2, 200), (3, 300);",
                    "expected": [[200]]
                }
            },
            {
                "title": "Customers Who Never Order",
                "description": "Write a SQL query to find all customers who never order anything from the Orders table.",
                "question_type": "CODE",
                "skill_tested": "SQL",
                "difficulty": "Beginner",
                "explanation": "Use a LEFT JOIN with WHERE order_id IS NULL or a NOT IN subquery.",
                "examples": [
                    {"input": "Customers: id, name. Orders: id, customerId", "output": "['Henry', 'Max']", "explanation": "Henry and Max do not have orders."}
                ],
                "constraints": ["Standard relational schema."],
                "starter_templates": {
                    "sql": "-- Write your SQL query below\nSELECT name AS Customers FROM Customers\n"
                },
                "correct_answer": {
                    "language": "sql",
                    "setup_sql": "CREATE TABLE Customers (id INT, name TEXT); CREATE TABLE Orders (id INT, customerId INT); INSERT INTO Customers VALUES (1, 'Joe'), (2, 'Henry'), (3, 'Sam'), (4, 'Max'); INSERT INTO Orders VALUES (1, 3), (2, 1);",
                    "expected": [["Henry"], ["Max"]]
                }
            }
        ]
        return templates[:count]

    def _get_curated_react_questions(self, count: int, difficulty: DifficultyLevel) -> List[Dict[str, Any]]:
        templates = [
            {
                "title": "React State Memoization & Re-render Guard",
                "description": "Which React hook should be used to memoize the result of an expensive calculation to avoid recalculating on every render unless its dependencies change?",
                "question_type": "MCQ",
                "skill_tested": "React",
                "difficulty": "Intermediate",
                "explanation": "useMemo caches the calculated value between renders and only recalculates when dependencies change.",
                "examples": [
                    {"input": "const cachedValue = useMemo(calculateValue, dependencies)", "output": "useMemo", "explanation": "Standard React memoization hook."}
                ],
                "constraints": ["React 18+"],
                "starter_templates": {},
                "correct_answer": "useMemo",
                "options": ["useCallback", "useMemo", "useRef", "useEffect"]
            },
            {
                "title": "Controlled vs Uncontrolled Input Elements",
                "description": "What is the primary characteristic of a Controlled Component in React?",
                "question_type": "MCQ",
                "skill_tested": "React",
                "difficulty": "Beginner",
                "explanation": "In a controlled component, form data is handled by a React component state via value and onChange handlers.",
                "examples": [],
                "constraints": ["React core paradigms"],
                "starter_templates": {},
                "correct_answer": "Form data is controlled by React component state via value and onChange",
                "options": [
                    "Form data is controlled by React component state via value and onChange",
                    "Form data is handled directly by the browser DOM using refs",
                    "Component cannot have any child components",
                    "Component must be a class component"
                ]
            }
        ]
        return templates[:count]

    def _get_curated_devops_questions(self, count: int, difficulty: DifficultyLevel) -> List[Dict[str, Any]]:
        templates = [
            {
                "title": "Docker Multi-Stage Build Optimization",
                "description": "What is the main benefit of using multi-stage builds in a production Dockerfile?",
                "question_type": "MCQ",
                "skill_tested": "Docker",
                "difficulty": "Intermediate",
                "explanation": "Multi-stage builds allow copying only compiled artifacts into a lightweight runtime image, minimizing image size and attack surface.",
                "examples": [],
                "constraints": ["Docker Engine 17.05+"],
                "starter_templates": {},
                "correct_answer": "Drastically reduces the final production image size by separating build tools from runtime environment",
                "options": [
                    "Drastically reduces the final production image size by separating build tools from runtime environment",
                    "Allows running multiple containers from a single Dockerfile simultaneously",
                    "Automatically configures Kubernetes horizontal pod autoscaling",
                    "Enables kernel-level root privilege bypass"
                ]
            }
        ]
        return templates[:count]

    def generate_and_save_to_assessment(
        self,
        db: Session,
        assessment_id: int,
        skills: List[str],
        count: int = 3,
        difficulty: str = "Intermediate",
        question_type: str = "CODE"
    ) -> List[AssessmentQuestion]:
        raw_questions = self.generate_questions(skills, count, difficulty, question_type)
        saved_questions = []

        for item in raw_questions:
            q_type = QuestionType.CODE if item.get("question_type") == "CODE" else QuestionType.MCQ
            
            diff_str = str(item.get("difficulty", "Intermediate")).capitalize()
            diff_enum = DifficultyLevel.INTERMEDIATE
            if diff_str == "Beginner":
                diff_enum = DifficultyLevel.BEGINNER
            elif diff_str == "Advanced":
                diff_enum = DifficultyLevel.ADVANCED

            options_payload = {
                "title": item.get("title", "Technical Assessment Question"),
                "description": item.get("description", ""),
                "examples": item.get("examples", []),
                "constraints": item.get("constraints", []),
                "starter_templates": item.get("starter_templates", {}),
                "hints": item.get("hints", ["Review problem specifications and test cases carefully."]),
                "options": item.get("options", [])
            }

            correct_payload = item.get("correct_answer")
            if isinstance(correct_payload, dict):
                correct_json = json.dumps(correct_payload, default=make_json_safe)
            else:
                correct_json = json.dumps(str(correct_payload), default=make_json_safe)

            q = AssessmentQuestion(
                assessment_id=assessment_id,
                question_text=item.get("description", item.get("title", "")),
                question_type=q_type,
                options_json=json.dumps(options_payload, default=make_json_safe),
                correct_answer_json=correct_json,
                explanation=item.get("explanation", ""),
                skill_tested=item.get("skill_tested", skills[0] if skills else "General"),
                difficulty=diff_enum
            )
            db.add(q)
            saved_questions.append(q)

        db.commit()
        for q in saved_questions:
            db.refresh(q)

        return saved_questions

ai_question_generator = AIQuestionGeneratorService()
