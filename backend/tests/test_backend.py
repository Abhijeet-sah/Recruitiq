import os
import json
import pytest
from app.services.embeddings import vectorizer
from app.services.resume_parser import resume_parser
from app.services.job_analyzer import job_analyzer
from app.services.adaptive_engine import adaptive_engine
from app.services.consistency_audit import consistency_service
from app.services.fairness_audit import fairness_service
from app.services.explainability import explainability_service
from app.models.assessment import DifficultyLevel, AssessmentQuestion, QuestionType
from app.models.evaluation import ConsistencyStatus
from app.schemas.evaluation import RankingWeights

def test_auth_endpoints(client):
    """Verify recruiter and candidate login."""
    # Test Recruiter login
    resp = client.post("/api/auth/login", json={
        "email": "recruiter@recruitiq.com",
        "password": "password123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "RECRUITER"

    # Test Candidate login
    resp_cand = client.post("/api/auth/login", json={
        "email": "candidate1@recruitiq.com",
        "password": "password123"
    })
    assert resp_cand.status_code == 200
    cand_data = resp_cand.json()
    assert cand_data["user"]["role"] == "CANDIDATE"

def test_job_ai_analysis(client):
    """Test AI job requirement extraction."""
    login_resp = client.post("/api/auth/login", json={
        "email": "recruiter@recruitiq.com",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    job_desc = (
        "We need a Senior Machine Learning Engineer with 5+ years of experience. "
        "Must be proficient in Python, PyTorch, and SQL. Experience with Docker and FastAPI is preferred."
    )

    resp = client.post("/api/jobs/analyze", json={"description": job_desc, "title": "ML Engineer"}, headers=headers)
    assert resp.status_code == 200
    res_data = resp.json()
    assert "extracted_skills" in res_data
    skills = [s["skill_name"].lower() for s in res_data["extracted_skills"]]
    assert "python" in skills or "machine learning" in skills

def test_resume_parser_service():
    """Verify resume parser extracts contact, skills, and confidence score."""
    sample_pdf = os.path.abspath("sample_resumes/Alex_Rivera_FullStack_Resume.pdf")
    if os.path.exists(sample_pdf):
        parsed = resume_parser.parse_file(sample_pdf)
        assert parsed["name"] == "Alex Rivera"
        assert parsed["email"] == "alex.rivera@email.com"
        assert parsed["parsing_confidence"] > 70.0
        skills = [s["skill_name"].lower() for s in parsed["skills"]]
        assert "python" in skills or "react" in skills

def test_semantic_vectorizer():
    """Test semantic similarity computation."""
    sim_exact = vectorizer.cosine_similarity("python developer backend", "python developer backend")
    assert sim_exact >= 0.99

    sim_related = vectorizer.calculate_skill_similarity("React.js", "React")
    assert sim_related >= 0.95

    sim_diff = vectorizer.cosine_similarity("culinary chef baking pastry", "deep learning neural network")
    assert sim_diff < 0.20

def test_adaptive_difficulty_progression():
    """Verify adaptive engine moves difficulty: Beginner -> Intermediate -> Advanced."""
    # Correct on Beginner -> Intermediate
    next_diff = adaptive_engine.compute_next_difficulty(DifficultyLevel.BEGINNER, is_correct=True)
    assert next_diff == DifficultyLevel.INTERMEDIATE

    # Correct on Intermediate -> Advanced
    next_diff2 = adaptive_engine.compute_next_difficulty(DifficultyLevel.INTERMEDIATE, is_correct=True)
    assert next_diff2 == DifficultyLevel.ADVANCED

    # Incorrect on Advanced -> Intermediate
    next_diff3 = adaptive_engine.compute_next_difficulty(DifficultyLevel.ADVANCED, is_correct=False)
    assert next_diff3 == DifficultyLevel.INTERMEDIATE

def test_consistency_audit_neutral_language():
    """Verify skill consistency report classifies correctly and strictly uses neutral language."""
    claimed = [{"skill_name": "SQL", "claimed_level": "Advanced"}]
    # Case 1: Under-demonstrated
    perf_low = {"SQL": 40.0}
    res_low = consistency_service.evaluate_consistency(claimed, perf_low)
    assert res_low["details"][0]["status"] == ConsistencyStatus.UNDER_DEMONSTRATED
    # Ensure neutral phrasing (no 'lying', 'cheating', 'fraud')
    for word in ["lie", "liar", "lying", "cheat", "dishonest", "fraud"]:
        assert word not in res_low["details"][0]["neutral_observation"].lower()

    # Case 2: Consistent
    perf_high = {"SQL": 90.0}
    res_high = consistency_service.evaluate_consistency(claimed, perf_high)
    assert res_high["details"][0]["status"] == ConsistencyStatus.CONSISTENT

def test_fairness_audit_calculations():
    """Verify fairness metrics calculate selection rate difference accurately."""
    candidates = [
        {"id": 1, "demographic_gender": "Female", "overall_score": 85.0, "assessment_score": 80.0},
        {"id": 2, "demographic_gender": "Female", "overall_score": 60.0, "assessment_score": 50.0},
        {"id": 3, "demographic_gender": "Male", "overall_score": 90.0, "assessment_score": 85.0},
        {"id": 4, "demographic_gender": "Male", "overall_score": 75.0, "assessment_score": 70.0}
    ]
    # Threshold 70.0: Female = 1/2 (50%), Male = 2/2 (100%) -> difference 50%
    audit = fairness_service.audit_job_applications(1, "Test Job", candidates, "Gender", 70.0)
    assert audit["selection_rate_difference"] == 50.0

def test_explainable_ranking_weights():
    """Verify candidate composite score reflects recruiter-configured weights."""
    weights = RankingWeights(
        match_score=0.50,
        assessment_score=0.50,
        experience_score=0.0,
        skill_relevance_score=0.0,
        project_score=0.0
    )
    score = explainability_service.compute_composite_score(
        match_score=80.0,
        assessment_score=90.0,
        experience_score=50.0,
        skill_relevance_score=50.0,
        project_score=50.0,
        weights=weights
    )
    assert score == 85.0

def test_get_application_dossier(client):
    """Verify application dossier endpoint returns candidate profile."""
    # Login as admin to get token
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@recruitiq.com", "password": "password123"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/applications/1", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1
    assert data["candidate_profile"] is not None
    assert "full_name" in data["candidate_profile"]

def test_code_evaluator_python_success():
    """Verify python code evaluator tests solutions against test cases."""
    from app.services.code_evaluator import evaluate_python_solution
    code = (
        "def find_duplicates(numbers):\n"
        "    seen, dups = set(), set()\n"
        "    for n in numbers:\n"
        "        if n in seen:\n"
        "            dups.add(n)\n"
        "        seen.add(n)\n"
        "    return sorted(list(dups))\n"
    )
    spec = [
        {"args": [[1, 2, 3, 2, 4, 1]], "expected": [1, 2]},
        {"args": [[10, 20]], "expected": []}
    ]
    res = evaluate_python_solution(code, "find_duplicates", spec)
    assert res["passed"] is True
    assert res["all_passed"] is True
    assert res["passed_count"] == 2

def test_code_evaluator_security_sandbox():
    """Verify disallowed modules like os or subprocess are blocked by AST inspection."""
    from app.services.code_evaluator import evaluate_python_solution
    bad_code = "import os\ndef solution(): pass"
    res = evaluate_python_solution(bad_code, "solution", [])
    assert res["passed"] is False
    assert "restricted" in res["error"].lower()

def test_code_evaluator_timeout_guard():
    """Verify infinite loops are terminated by the timeout guard without hanging."""
    from app.services.code_evaluator import evaluate_python_solution
    infinite_code = "def loop():\n    while True: pass"
    res = evaluate_python_solution(infinite_code, "loop", [{"args": [], "expected": None}])
    assert res["passed"] is False
    assert "timed out" in res["test_results"][0]["error"].lower()

def test_code_evaluator_sql_query():
    """Verify SQL query evaluation in in-memory SQLite sandbox."""
    from app.services.code_evaluator import evaluate_sql_solution
    setup = "CREATE TABLE emp (dept TEXT, sal INT); INSERT INTO emp VALUES ('Eng', 100), ('Sales', 80);"
    query = "SELECT dept, MAX(sal) FROM emp GROUP BY dept;"
    expected = [["Eng", 100], ["Sales", 80]]
    res = evaluate_sql_solution(query, setup, expected)
    assert res["passed"] is True
    assert res["all_passed"] is True

def test_run_code_api_endpoint(client):
    """Verify POST /api/assessments/questions/{id}/run-code endpoint."""
    login_res = client.post(
        "/api/auth/login",
        json={"email": "candidate1@recruitiq.com", "password": "password123"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    code_sol = (
        "def find_duplicates(numbers):\n"
        "    seen, dups = set(), set()\n"
        "    for n in numbers:\n"
        "        if n in seen:\n"
        "            dups.add(n)\n"
        "        seen.add(n)\n"
        "    return sorted(list(dups))\n"
    )
    # Question 1 is seeded as find_duplicates
    res = client.post(
        "/api/assessments/questions/1/run-code",
        json={"code": code_sol},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["passed"] is True
    assert data["all_passed"] is True
    assert len(data["test_results"]) > 0




