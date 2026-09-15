import os
import json
import ast
import re
from typing import List, Dict, Any, Optional
from app.models.assessment import QuestionType, DifficultyLevel, AssessmentQuestion
from sqlalchemy.orm import Session

MBPP_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mbpp.jsonl")

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

class DatasetLoaderService:
    """
    Open-source benchmark problem loader.
    Parses verified programming challenges from Google MBPP (974 problems)
    into rich LeetCode-style questions with automated sandbox test suites.
    """

    def __init__(self, data_path: str = MBPP_DATA_PATH):
        self.data_path = data_path
        self._cache: Optional[List[Dict[str, Any]]] = None

    def _infer_difficulty(self, text: str, test_count: int, code: str) -> DifficultyLevel:
        t_low = text.lower()
        code_low = code.lower()
        # Advanced indicators: dynamic programming, bitwise, graph, tree, permutation
        if any(w in t_low or w in code_low for w in ["dynamic programming", "min_cost", "graph", "permutation", "regex", "bit", "matrix", "combinat"]):
            return DifficultyLevel.ADVANCED
        # Intermediate indicators: heap, sort, dict, binary search, recursion, nested loops
        if any(w in t_low or w in code_low for w in ["heap", "sort", "binary", "nested", "dictionary", "frequency", "recur", "tuple list", "two pointers"]):
            return DifficultyLevel.INTERMEDIATE
        return DifficultyLevel.BEGINNER

    def _infer_skill(self, text: str) -> str:
        t_low = text.lower()
        if "sql" in t_low or "query" in t_low or "database" in t_low:
            return "SQL"
        return "Python"

    def _clean_title(self, text: str, func_name: str) -> str:
        cleaned = text.strip()
        cleaned = re.sub(r"^(write a (python )?function to\s*)", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"^(write a program to\s*)", "", cleaned, flags=re.IGNORECASE)
        cleaned = cleaned[:1].upper() + cleaned[1:]
        if len(cleaned) > 60:
            cleaned = " ".join(word.capitalize() for word in func_name.split("_"))
        return cleaned.rstrip(". ")

    def _generate_starter_templates(self, func_name: str, sample_args: List[Any]) -> Dict[str, str]:
        arg_names = []
        for idx, arg in enumerate(sample_args):
            if isinstance(arg, list):
                arg_names.append(f"nums" if idx == 0 else f"arr{idx+1}")
            elif isinstance(arg, str):
                arg_names.append(f"s" if idx == 0 else f"text{idx+1}")
            elif isinstance(arg, int):
                arg_names.append(f"n" if idx == 0 else f"k")
            else:
                arg_names.append(f"param{idx+1}")

        args_str = ", ".join(arg_names)
        
        js_parts = func_name.split("_")
        js_name = js_parts[0] + "".join(p.capitalize() for p in js_parts[1:])

        return {
            "python": f"def {func_name}({args_str}):\n    # Write your solution here\n    pass",
            "javascript": f"function {js_name}({args_str}) {{\n    // Write your solution here\n}}",
            "java": f"class Solution {{\n    public Object {js_name}({args_str}) {{\n        // Write your solution here\n        return null;\n    }}\n}}",
            "cpp": f"class Solution {{\npublic:\n    auto {func_name}({args_str}) {{\n        // Write your solution here\n    }}\n}};"
        }

    def load_all_problems(self) -> List[Dict[str, Any]]:
        if self._cache is not None:
            return self._cache

        if not os.path.exists(self.data_path):
            return []

        problems = []
        with open(self.data_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    row = json.loads(line)
                    tests = row.get("test_list", [])
                    if not tests:
                        continue

                    parsed_tests = []
                    func_name = None

                    for t in tests:
                        t_tree = ast.parse(t.strip())
                        assert_node = t_tree.body[0]
                        if not isinstance(assert_node, ast.Assert):
                            continue
                        comp = assert_node.test
                        if not isinstance(comp, ast.Compare):
                            continue
                        call_node = comp.left
                        if not isinstance(call_node, ast.Call):
                            continue
                        if isinstance(call_node.func, ast.Name):
                            fn = call_node.func.id
                        elif isinstance(call_node.func, ast.Attribute):
                            fn = call_node.func.attr
                        else:
                            continue

                        if not func_name:
                            func_name = fn

                        args = [ast.literal_eval(a) for a in call_node.args]
                        expected = ast.literal_eval(comp.comparators[0])
                        parsed_tests.append({"args": args, "expected": expected})

                    if not parsed_tests or not func_name:
                        continue

                    prompt_text = row.get("text", "")
                    title = self._clean_title(prompt_text, func_name)
                    diff = self._infer_difficulty(prompt_text, len(parsed_tests), row.get("code", ""))
                    skill = self._infer_skill(prompt_text)

                    examples = []
                    for idx, pt in enumerate(parsed_tests[:2]):
                        in_repr = ", ".join(repr(a) for a in pt["args"])
                        examples.append({
                            "input": f"{func_name}({in_repr})",
                            "output": repr(pt["expected"]),
                            "explanation": f"When invoked with the specified inputs, the function returns {repr(pt['expected'])}."
                        })

                    starter_templates = self._generate_starter_templates(
                        func_name,
                        parsed_tests[0]["args"] if parsed_tests else []
                    )

                    options_payload = {
                        "title": title,
                        "description": prompt_text,
                        "examples": examples,
                        "constraints": [
                            "Execution must complete within 2.0 seconds.",
                            "Solution must not use prohibited system modules (os, sys, subprocess).",
                            "Handle edge cases cleanly including empty collections or zero values where applicable."
                        ],
                        "starter_templates": starter_templates,
                        "hints": [
                            f"Think about the base cases and write helper functions if needed.",
                            f"Focus on optimal time and space complexity."
                        ],
                        "task_id": row.get("task_id")
                    }

                    correct_payload = {
                        "language": "python",
                        "function_name": func_name,
                        "test_cases": parsed_tests,
                        "reference_solution": row.get("code", "").strip()
                    }

                    problems.append({
                        "question_text": prompt_text,
                        "question_type": QuestionType.CODE,
                        "options": options_payload,
                        "correct_answer": correct_payload,
                        "skill_tested": skill,
                        "difficulty": diff,
                        "explanation": f"Verified algorithmic solution for {title}."
                    })

                except Exception:
                    continue

        self._cache = problems
        return problems

    def import_into_assessment(
        self,
        db: Session,
        assessment_id: int,
        count: int = 50,
        difficulty: Optional[DifficultyLevel] = None,
        skill: Optional[str] = None
    ) -> int:
        all_problems = self.load_all_problems()
        if not all_problems:
            return 0

        existing_texts = set(
            q.question_text for q in db.query(AssessmentQuestion).filter(
                AssessmentQuestion.assessment_id == assessment_id
            ).all()
        )

        candidates = [
            p for p in all_problems
            if p["question_text"] not in existing_texts
        ]

        if difficulty:
            candidates = [p for p in candidates if p["difficulty"] == difficulty]
        if skill and skill.lower() != "all":
            candidates = [p for p in candidates if p["skill_tested"].lower() == skill.lower()]

        to_add = candidates[:count]
        added_count = 0

        for p_data in to_add:
            q = AssessmentQuestion(
                assessment_id=assessment_id,
                question_text=p_data["question_text"],
                question_type=p_data["question_type"],
                options_json=json.dumps(p_data["options"], default=make_json_safe),
                correct_answer_json=json.dumps(p_data["correct_answer"], default=make_json_safe),
                explanation=p_data["explanation"],
                skill_tested=p_data["skill_tested"],
                difficulty=p_data["difficulty"]
            )
            db.add(q)
            added_count += 1

        db.commit()
        return added_count

dataset_loader = DatasetLoaderService()
