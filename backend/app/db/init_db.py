import json
import random
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.job import Job, JobSkill, JobStatus, SkillImportance
from app.models.candidate import (
    CandidateProfile, RecruiterProfile, Resume, ResumeSkill,
    CandidateSkill, Experience, Education, Application, ApplicationStatus
)
from app.models.assessment import (
    Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer,
    QuestionType, DifficultyLevel, AttemptStatus
)
from app.models.evaluation import (
    MatchScore, SkillGap, ConsistencyReport, ConsistencyStatus,
    CandidateRanking, RecommendationType, RecruiterNote
)
from app.models.fairness import FairnessAudit, DisparityFlag
from app.services.question_bank import VALIDATED_QUESTION_BANK
from app.services.matching import matching_service
from app.services.skill_gap import skill_gap_service
from app.services.explainability import explainability_service
from app.schemas.evaluation import RankingWeights

def init_db(db: Session = None):
    """Seed comprehensive demo data for RecruitIQ."""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    # Check if data already exists or any user is registered
    if db.query(User).first() is not None:
        print("Database already initialized or users exist. Skipping demo data seeding.")
        if should_close:
            db.close()
        return

    print("Seeding database with realistic synthetic recruitment data...")

    # 1. Create Admin
    admin_user = User(
        email="admin@recruitiq.com",
        hashed_password=get_password_hash("password123"),
        full_name="Admin Director",
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin_user)

    # 2. Create 3 Recruiters
    recruiters_data = [
        ("recruiter@recruitiq.com", "Sarah Jenkins", "Lead Technical Recruiter", "Core Engineering Talent"),
        ("marcus.recruiter@recruitiq.com", "Marcus Vance", "Engineering Talent Partner", "Cloud & Infrastructure"),
        ("elena.recruiter@recruitiq.com", "Elena Rostova", "Principal AI Recruiter", "Data Science & Machine Learning")
    ]
    recruiters = []
    for email, name, title, dept in recruiters_data:
        u = User(
            email=email,
            hashed_password=get_password_hash("password123"),
            full_name=name,
            role=UserRole.RECRUITER,
            is_active=True
        )
        db.add(u)
        db.flush()
        rp = RecruiterProfile(
            user_id=u.id,
            company_name="RecruitIQ Enterprise Labs",
            department=dept,
            title=title
        )
        db.add(rp)
        recruiters.append(u)

    # 3. Create 5 Jobs
    jobs_data = [
        {
            "title": "Senior Full-Stack Engineer",
            "department": "Platform Engineering",
            "location": "San Francisco, CA / Remote",
            "employment_type": "Full-time",
            "experience_required": "4-6 years",
            "min_salary": 145000.0,
            "max_salary": 185000.0,
            "description": (
                "We are seeking an experienced Senior Full-Stack Engineer to architect and deliver scalable web platforms. "
                "The candidate will lead Python and FastAPI service development, integrate reactive frontend interfaces in React and TypeScript, "
                "and deploy resilient PostgreSQL and Docker microservices. Must have proven experience with high-throughput REST APIs and Git workflows."
            ),
            "education_required": "Bachelor's Degree in Computer Science or related engineering discipline",
            "skills": [
                ("Python", True, SkillImportance.HIGH, "Backend"),
                ("React", True, SkillImportance.HIGH, "Frontend"),
                ("FastAPI", True, SkillImportance.HIGH, "Backend"),
                ("PostgreSQL", True, SkillImportance.HIGH, "Database"),
                ("Docker", True, SkillImportance.MEDIUM, "DevOps"),
                ("TypeScript", False, SkillImportance.MEDIUM, "Frontend"),
                ("Git", True, SkillImportance.LOW, "Practices")
            ]
        },
        {
            "title": "Lead Data Scientist",
            "department": "Applied AI Research",
            "location": "New York, NY / Hybrid",
            "employment_type": "Full-time",
            "experience_required": "5+ years",
            "min_salary": 160000.0,
            "max_salary": 210000.0,
            "description": (
                "Join our AI innovation team as Lead Data Scientist. You will architect end-to-end predictive modeling pipelines, "
                "develop advanced machine learning algorithms using Python, Scikit-Learn, and PyTorch, and run complex statistical SQL queries. "
                "Strong foundation in feature engineering, model interpretability, and production data workflows required."
            ),
            "education_required": "Master's or Ph.D. in Data Science, Statistics, Mathematics, or Computer Science",
            "skills": [
                ("Python", True, SkillImportance.HIGH, "Core Language"),
                ("Machine Learning", True, SkillImportance.HIGH, "Modeling"),
                ("SQL", True, SkillImportance.HIGH, "Database"),
                ("Deep Learning", False, SkillImportance.MEDIUM, "AI"),
                ("Pandas", True, SkillImportance.HIGH, "Data"),
                ("Scikit-Learn", True, SkillImportance.HIGH, "Modeling"),
                ("Docker", False, SkillImportance.LOW, "Deployment")
            ]
        },
        {
            "title": "Cloud & DevOps Architect",
            "department": "Infrastructure & Reliability",
            "location": "Seattle, WA / Remote",
            "employment_type": "Full-time",
            "experience_required": "5+ years",
            "min_salary": 155000.0,
            "max_salary": 195000.0,
            "description": (
                "Lead our cloud modernization initiatives. You will design automated CI/CD deployment pipelines, manage Kubernetes clusters, "
                "and deploy infrastructure-as-code on AWS using Terraform. Experience with container security, Linux systems administration, and monitoring is essential."
            ),
            "education_required": "Bachelor's Degree in Software Engineering or equivalent experience",
            "skills": [
                ("Docker", True, SkillImportance.HIGH, "Containers"),
                ("Kubernetes", True, SkillImportance.HIGH, "Orchestration"),
                ("AWS", True, SkillImportance.HIGH, "Cloud"),
                ("CI/CD", True, SkillImportance.HIGH, "Automation"),
                ("Linux", True, SkillImportance.MEDIUM, "Systems"),
                ("Python", False, SkillImportance.LOW, "Scripting")
            ]
        },
        {
            "title": "Frontend Systems Specialist",
            "department": "Design & User Experience",
            "location": "Austin, TX / Remote",
            "employment_type": "Full-time",
            "experience_required": "3-5 years",
            "min_salary": 130000.0,
            "max_salary": 165000.0,
            "description": (
                "We are looking for a passionate Frontend Systems Specialist to build accessible, fluid web applications. "
                "Core focus includes React component architectures, TypeScript static typing, responsive styling with Tailwind CSS, "
                "and TanStack state caching. Emphasis on performance benchmarks, client accessibility, and modern design systems."
            ),
            "education_required": "Bachelor's Degree or equivalent frontend engineering portfolio",
            "skills": [
                ("React", True, SkillImportance.HIGH, "Frontend"),
                ("TypeScript", True, SkillImportance.HIGH, "Language"),
                ("JavaScript", True, SkillImportance.HIGH, "Core"),
                ("Tailwind CSS", True, SkillImportance.MEDIUM, "Styling"),
                ("HTML", True, SkillImportance.MEDIUM, "Markup"),
                ("Git", True, SkillImportance.LOW, "Practices")
            ]
        },
        {
            "title": "Machine Learning Engineer",
            "department": "Autonomous Systems",
            "location": "Boston, MA / Hybrid",
            "employment_type": "Full-time",
            "experience_required": "3-5 years",
            "min_salary": 150000.0,
            "max_salary": 190000.0,
            "description": (
                "Bridge research and production as our Machine Learning Engineer. You will deploy PyTorch deep learning models into "
                "high-performance FastAPI inference microservices, optimize model latency, and design automated feature stores with PostgreSQL."
            ),
            "education_required": "Master's or Bachelor's Degree in Computer Science with ML specialization",
            "skills": [
                ("Python", True, SkillImportance.HIGH, "Core"),
                ("Machine Learning", True, SkillImportance.HIGH, "Modeling"),
                ("FastAPI", True, SkillImportance.HIGH, "Backend"),
                ("PyTorch", True, SkillImportance.HIGH, "Deep Learning"),
                ("SQL", True, SkillImportance.MEDIUM, "Database"),
                ("Docker", True, SkillImportance.MEDIUM, "Containers")
            ]
        }
    ]

    jobs = []
    for j_idx, j_data in enumerate(jobs_data):
        recruiter = recruiters[j_idx % len(recruiters)]
        job = Job(
            recruiter_id=recruiter.id,
            title=j_data["title"],
            department=j_data["department"],
            location=j_data["location"],
            employment_type=j_data["employment_type"],
            experience_required=j_data["experience_required"],
            min_salary=j_data["min_salary"],
            max_salary=j_data["max_salary"],
            description=j_data["description"],
            education_required=j_data["education_required"],
            status=JobStatus.OPEN
        )
        db.add(job)
        db.flush()

        for s_name, is_req, imp, cat in j_data["skills"]:
            js = JobSkill(
                job_id=job.id,
                skill_name=s_name,
                is_required=is_req,
                importance_weight=imp,
                category=cat
            )
            db.add(js)

        # Create Adaptive Assessment for Job
        assessment = Assessment(
            job_id=job.id,
            title=f"{job.title} Adaptive Competency Assessment",
            description=f"Automated adaptive technical assessment covering core skills for {job.title}.",
            max_time_minutes=25,
            passing_score=65.0
        )
        db.add(assessment)
        db.flush()

        target_skill_names = [s[0].lower() for s in j_data["skills"]]
        added_count = 0
        for q_item in VALIDATED_QUESTION_BANK:
            if q_item["skill_tested"].lower() in target_skill_names or added_count < 6:
                q = AssessmentQuestion(
                    assessment_id=assessment.id,
                    question_text=q_item["question_text"],
                    question_type=q_item["question_type"],
                    options_json=json.dumps(q_item["options"]),
                    correct_answer_json=json.dumps(q_item["correct_answer"]),
                    explanation=q_item.get("explanation", ""),
                    skill_tested=q_item["skill_tested"],
                    difficulty=q_item["difficulty"]
                )
                db.add(q)
                added_count += 1

        jobs.append(job)

    # 4. Create 20 Synthetic Candidates with realistic profiles
    candidates_seed_info = [
        ("Alex Rivera", "alex.rivera@email.com", "Female", "25-34", 5.0, "Master's Degree", ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Git"]),
        ("David Chen", "david.chen@email.com", "Male", "25-34", 6.0, "Bachelor's Degree", ["Python", "Machine Learning", "SQL", "Scikit-Learn", "Pandas", "PyTorch"]),
        ("Priya Sharma", "priya.sharma@email.com", "Female", "25-34", 4.5, "Master's Degree", ["Python", "SQL", "Machine Learning", "Pandas", "Deep Learning"]),
        ("Jordan Taylor", "jordan.taylor@email.com", "Non-Binary", "25-34", 5.5, "Bachelor's Degree", ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Python"]),
        ("Michael Scott", "michael.scott@email.com", "Male", "35-44", 7.0, "Bachelor's Degree", ["React", "TypeScript", "JavaScript", "HTML", "Tailwind CSS", "Git"]),
        ("Sophia Patel", "sophia.patel@email.com", "Female", "25-34", 4.0, "Bachelor's Degree", ["Python", "React", "FastAPI", "PostgreSQL", "Docker"]),
        ("Liam O'Connor", "liam.oconnor@email.com", "Male", "25-34", 3.5, "Bachelor's Degree", ["Python", "SQL", "FastAPI", "Git"]),
        ("Emma Watson", "emma.watson@email.com", "Female", "25-34", 6.5, "Ph.D.", ["Python", "Machine Learning", "PyTorch", "SQL", "Deep Learning", "FastAPI"]),
        ("Lucas Silva", "lucas.silva@email.com", "Male", "25-34", 5.0, "Bachelor's Degree", ["Docker", "Kubernetes", "AWS", "Linux", "Git"]),
        ("Aisha Al-Mansoor", "aisha.mansoor@email.com", "Female", "25-34", 4.0, "Master's Degree", ["React", "TypeScript", "JavaScript", "Tailwind CSS", "Git"]),
        ("Ethan Hunt", "ethan.hunt@email.com", "Male", "35-44", 8.0, "Master's Degree", ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "AWS"]),
        ("Chloe Bennett", "chloe.bennett@email.com", "Female", "18-24", 2.0, "Bachelor's Degree", ["Python", "React", "JavaScript", "Git"]),
        ("Noah Miller", "noah.miller@email.com", "Male", "25-34", 3.0, "Bachelor's Degree", ["Python", "SQL", "Pandas", "Scikit-Learn"]),
        ("Fatima Zahra", "fatima.zahra@email.com", "Female", "25-34", 5.0, "Master's Degree", ["Docker", "Kubernetes", "AWS", "CI/CD", "Python"]),
        ("Ryan Reynolds", "ryan.reynolds@email.com", "Male", "35-44", 6.0, "Bachelor's Degree", ["React", "TypeScript", "JavaScript", "HTML", "Git"]),
        ("Maya Lin", "maya.lin@email.com", "Female", "25-34", 4.5, "Master's Degree", ["Python", "Machine Learning", "SQL", "PyTorch", "FastAPI"]),
        ("Carlos Gomez", "carlos.gomez@email.com", "Male", "25-34", 3.5, "Bachelor's Degree", ["Python", "FastAPI", "PostgreSQL", "Git"]),
        ("Hannah Abbott", "hannah.abbott@email.com", "Female", "25-34", 5.0, "Bachelor's Degree", ["Docker", "AWS", "CI/CD", "Linux"]),
        ("Omar Farooq", "omar.farooq@email.com", "Male", "25-34", 4.0, "Bachelor's Degree", ["React", "TypeScript", "Tailwind CSS", "JavaScript"]),
        ("Grace Hopper", "grace.hopper@email.com", "Female", "35-44", 10.0, "Ph.D.", ["Python", "SQL", "FastAPI", "Machine Learning", "Docker", "Kubernetes"])
    ]

    candidates = []
    for idx, (name, email, gender, age_grp, exp_yrs, edu_lvl, skills_list) in enumerate(candidates_seed_info, start=1):
        cand_user = User(
            email=f"candidate{idx}@recruitiq.com",
            hashed_password=get_password_hash("password123"),
            full_name=name,
            role=UserRole.CANDIDATE,
            is_active=True
        )
        db.add(cand_user)
        db.flush()

        profile = CandidateProfile(
            user_id=cand_user.id,
            phone=f"+1 (555) 01{idx:02d}-8492",
            location="San Francisco, CA" if idx % 2 == 0 else "Remote / Hybrid",
            summary=f"Experienced software engineer with {exp_yrs} years delivering production cloud services and full-stack solutions.",
            linkedin_url=f"https://linkedin.com/in/{name.lower().replace(' ', '')}",
            github_url=f"https://github.com/{name.lower().replace(' ', '')}",
            portfolio_url=f"https://{name.lower().replace(' ', '')}.dev",
            years_of_experience=exp_yrs,
            education_level=edu_lvl,
            demographic_gender=gender,
            demographic_age_group=age_grp,
            parsing_confidence=88.0 + (idx % 10)
        )
        db.add(profile)
        db.flush()

        # Add candidate skills
        for s in skills_list:
            cs = CandidateSkill(
                candidate_id=profile.id,
                skill_name=s,
                level="Advanced" if exp_yrs >= 5.0 else "Intermediate",
                verified=(idx % 3 == 0)
            )
            db.add(cs)

        # Add Experience
        exp1 = Experience(
            candidate_id=profile.id,
            company="Tech Innovations Inc.",
            title="Senior Software Engineer" if exp_yrs >= 4.0 else "Software Engineer",
            start_date="2021",
            end_date="Present",
            is_current=True,
            description=f"Developed scalable distributed services with {', '.join(skills_list[:3])}. Improved API latency by 35%."
        )
        db.add(exp1)

        # Add Education
        edu1 = Education(
            candidate_id=profile.id,
            institution="University of Technology",
            degree=edu_lvl,
            field_of_study="Computer Science & Engineering",
            graduation_year="2020",
            gpa="3.8/4.0"
        )
        db.add(edu1)

        # Add Resume
        parsed_mock = {
            "name": name,
            "email": cand_user.email,
            "phone": profile.phone,
            "summary": profile.summary,
            "skills": [{"skill_name": s, "claimed_level": "Advanced" if exp_yrs >= 5.0 else "Intermediate", "years_experience": exp_yrs} for s in skills_list],
            "experiences": [{"company": "Tech Innovations Inc.", "title": "Software Engineer", "start_date": "2021", "end_date": "Present", "is_current": True, "description": "Production engineering"}],
            "educations": [{"institution": "University of Technology", "degree": edu_lvl, "field_of_study": "Computer Science", "graduation_year": "2020", "gpa": "3.8/4.0"}],
            "parsing_confidence": profile.parsing_confidence,
            "raw_text": f"{name}\n{cand_user.email}\n{profile.summary}\nSkills: {', '.join(skills_list)}"
        }

        resume = Resume(
            candidate_id=profile.id,
            filename=f"{name.replace(' ', '_')}_Resume.pdf",
            file_path=f"./uploads/resumes/{name.replace(' ', '_')}_Resume.pdf",
            file_type="pdf",
            file_size=102400,
            raw_text=parsed_mock["raw_text"],
            parsed_data=json.dumps(parsed_mock),
            parsing_confidence=profile.parsing_confidence,
            is_active=True
        )
        db.add(resume)
        db.flush()

        for s in skills_list:
            rs = ResumeSkill(
                resume_id=resume.id,
                skill_name=s,
                claimed_level="Advanced" if exp_yrs >= 5.0 else "Intermediate",
                years_experience=exp_yrs
            )
            db.add(rs)

        candidates.append((profile, cand_user, skills_list))

    # 5. Apply candidates to Jobs & compute real MatchScores, Assessments, Consistency & Rankings
    job1 = jobs[0]  # Senior Full-Stack Engineer
    job2 = jobs[1]  # Lead Data Scientist

    for c_idx, (profile, cand_user, skills_list) in enumerate(candidates):
        # Even indices apply to Job 1, Odd to Job 2 (and some to both)
        target_jobs = [job1] if c_idx % 2 == 0 else [job2]
        if c_idx < 6:
            target_jobs = [job1, job2]

        for target_job in target_jobs:
            app_status = ApplicationStatus.APPLIED
            if c_idx % 4 == 0:
                app_status = ApplicationStatus.SHORTLISTED
            elif c_idx % 3 == 0:
                app_status = ApplicationStatus.EVALUATED
            elif c_idx % 2 == 0:
                app_status = ApplicationStatus.ASSESSMENT_COMPLETED

            app = Application(
                job_id=target_job.id,
                candidate_id=profile.id,
                status=app_status,
                cover_letter=f"I am deeply interested in contributing my expertise in {skills_list[0]} and {skills_list[1]} to {target_job.title}."
            )
            db.add(app)
            db.flush()

            # Compute Match Score
            eval_res = matching_service.evaluate_application(target_job, profile, profile.summary)
            ms = MatchScore(
                application_id=app.id,
                overall_score=eval_res["overall_score"],
                skill_match=eval_res["skill_match"],
                experience_match=eval_res["experience_match"],
                education_match=eval_res["education_match"],
                project_relevance=eval_res["project_relevance"],
                breakdown_json=json.dumps(eval_res["breakdown"])
            )
            db.add(ms)

            # Compute Skill Gap
            gaps = skill_gap_service.analyze_gaps(target_job.skills, skills_list)
            sg = SkillGap(
                application_id=app.id,
                strong_skills_json=json.dumps(gaps["strong_skills"]),
                moderate_skills_json=json.dumps(gaps["moderate_skills"]),
                missing_skills_json=json.dumps(gaps["missing_skills"])
            )
            db.add(sg)

            # Create assessment attempt for candidate
            job_assessment = target_job.assessments[0]
            attempt_status = AttemptStatus.COMPLETED if app_status in [ApplicationStatus.ASSESSMENT_COMPLETED, ApplicationStatus.EVALUATED, ApplicationStatus.SHORTLISTED] else AttemptStatus.IN_PROGRESS
            
            # Deterministic test score variation
            pct = min(max(eval_res["skill_match"] - (c_idx % 12) + 5.0, 45.0), 96.0)
            attempt = AssessmentAttempt(
                assessment_id=job_assessment.id,
                candidate_id=profile.id,
                application_id=app.id,
                status=attempt_status,
                total_score=pct * 0.1,
                max_score=10.0,
                percentage=pct,
                difficulty_reached=DifficultyLevel.ADVANCED if pct >= 80 else (DifficultyLevel.INTERMEDIATE if pct >= 60 else DifficultyLevel.BEGINNER),
                start_time=datetime.now(timezone.utc) - timedelta(hours=2),
                end_time=datetime.now(timezone.utc) - timedelta(hours=1, minutes=30)
            )
            db.add(attempt)
            db.flush()

            # Populate answers for attempt
            for q_idx, q in enumerate(job_assessment.questions[:5]):
                is_corr = (q_idx < 4) if pct >= 75.0 else (q_idx < 2)
                ans = AssessmentAnswer(
                    attempt_id=attempt.id,
                    question_id=q.id,
                    candidate_answer_json=q.correct_answer_json if is_corr else json.dumps("Incorrect option chosen"),
                    is_correct=is_corr,
                    points_earned=2.0 if is_corr else 0.0,
                    time_spent_seconds=45,
                    difficulty_level=q.difficulty
                )
                db.add(ans)

            # Consistency report
            claimed = [{"skill_name": s, "claimed_level": "Advanced" if profile.years_of_experience >= 5 else "Intermediate"} for s in skills_list]
            topic_perf = {s: pct for s in skills_list}
            from app.services.consistency_audit import consistency_service
            cons_res = consistency_service.evaluate_consistency(claimed, topic_perf)
            cons_rep = ConsistencyReport(
                application_id=app.id,
                overall_status=cons_res["overall_status"],
                consistency_score=cons_res["consistency_score"],
                summary_text=cons_res["summary_text"],
                details_json=json.dumps(cons_res["details"])
            )
            db.add(cons_rep)

            # Recruiter note
            rec_note = RecruiterNote(
                application_id=app.id,
                recruiter_id=recruiters[0].id,
                note_text=f"Candidate demonstrated high technical aptitude in {skills_list[0]}. Recommended for final panel."
            )
            db.add(rec_note)

    # 6. Compute initial candidate rankings for Job 1 & Job 2
    weights = RankingWeights()
    for target_job in [job1, job2]:
        apps_for_job = db.query(Application).filter(Application.job_id == target_job.id).all()
        ranked_list = []
        for a in apps_for_job:
            m_score = a.match_score.overall_score if a.match_score else 70.0
            a_score = 65.0
            if a.assessment_attempts:
                comp = [att for att in a.assessment_attempts if att.status == AttemptStatus.COMPLETED]
                if comp:
                    a_score = comp[0].percentage
            exp_score = a.match_score.experience_match if a.match_score else 70.0
            skill_score = a.match_score.skill_match if a.match_score else 75.0
            proj_score = a.match_score.project_relevance if a.match_score else 65.0

            overall = explainability_service.compute_composite_score(
                m_score, a_score, exp_score, skill_score, proj_score, weights
            )
            rec = explainability_service.determine_recommendation(overall, a_score)
            ranked_list.append((a, overall, m_score, a_score, exp_score, skill_score, proj_score, rec))

        ranked_list.sort(key=lambda x: x[1], reverse=True)
        for r_idx, (a, overall, m_sc, a_sc, e_sc, s_sc, p_sc, rec) in enumerate(ranked_list, start=1):
            cr = CandidateRanking(
                job_id=target_job.id,
                candidate_id=a.candidate_id,
                application_id=a.id,
                rank=r_idx,
                overall_score=overall,
                match_score=m_sc,
                assessment_score=a_sc,
                experience_score=e_sc,
                skill_relevance_score=s_sc,
                project_score=p_sc,
                recommendation=rec,
                weights_used_json=json.dumps(weights.model_dump())
            )
            db.add(cr)

        # 7. Add Fairness Audit record for Job
        audit_record = FairnessAudit(
            job_id=target_job.id,
            audit_category="Gender",
            selection_rate_group_a=68.2,
            selection_rate_group_b=63.6,
            selection_rate_difference=4.6,
            demographic_parity_diff=4.6,
            equal_opportunity_diff=3.4,
            disparity_flag=DisparityFlag.NO_OBVIOUS_DISPARITY,
            metric_results_json=json.dumps([
                {"group_name": "Female", "total_candidates": 10, "selected_count": 7, "selection_rate": 70.0, "avg_score": 82.4, "true_positive_rate": 88.0, "false_positive_rate": 8.0},
                {"group_name": "Male", "total_candidates": 10, "selected_count": 6, "selection_rate": 60.0, "avg_score": 79.1, "true_positive_rate": 83.0, "false_positive_rate": 10.0}
            ]),
            summary_text=f"No obvious disparity detected between Female (70.0%) and Male (60.0%) candidates for {target_job.title}."
        )
        db.add(audit_record)

    db.commit()
    print("Database seeding completed successfully!")

    if should_close:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    init_db()
