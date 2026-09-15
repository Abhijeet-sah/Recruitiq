# RecruitIQ

### A Smart AI-Based Recruitment and Candidate Evaluation System with Explainable and Fair Decision Support

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC.svg)](https://tailwindcss.com/)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy_2.0-D71F00.svg)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED.svg)](https://www.docker.com/)

---

## 1. Project Overview

**RecruitIQ** is an enterprise-grade AI decision-support platform that transforms talent acquisition from opaque keyword matching into an explainable, empirically verified, and fair evaluation pipeline.

The platform guides candidates and recruiters through a transparent 10-stage evaluation pipeline:
```
Job Description
→ AI Job Requirement Extraction
→ Resume Upload & Parsing
→ Semantic Multi-Dimensional Matching
→ Skill Gap Analysis (Strong, Moderate, Missing)
→ Dynamic Adaptive Assessment (IRT)
→ Skill Consistency Analysis (Claims vs Demonstrated Evidence)
→ Fairness & Bias Auditing (Demographic Parity & Equal Opportunity)
→ Explainable Candidate Ranking (Configurable Weights & SHAP Attribution)
→ Human-in-the-Loop Recruiter Decision & Comparison
→ Personalized Skill Development Plan
```

> [!IMPORTANT]
> **Decision-Support Philosophy**: RecruitIQ does **NOT** make automated hiring decisions. It is designed to empower human recruiters with transparent, explainable evidence while mathematically protecting demographic proxy attributes from entering scoring models.

---

## 2. Key Differentiators & Core Capabilities

1. **Semantic Multi-Dimensional Matching**: Uses contextual subword embeddings to score Skill Match (40%), Experience Alignment (25%), Education Fit (20%), and Project Relevance (15%).
2. **Dynamic Adaptive Assessment Engine**: Implements Item Response Theory (IRT). Question difficulty adjusts dynamically (`Beginner` $\leftrightarrow$ `Intermediate` $\leftrightarrow$ `Advanced`) based on candidate answers in real time.
3. **Skill Consistency Analysis**: Cross-verifies self-reported resume claims against verified test outcomes using neutral, non-accusatory language (`Consistent`, `Under-demonstrated`, `Stronger than claimed`).
4. **Explainable AI (SHAP-Like Attribution)**: Explains every score with positive driving factors, competency gaps, and configurable factor contributions.
5. **Fairness & Bias Auditing**: Fairlearn-compatible metrics evaluating Selection Rate Differences, Demographic Parity, and Equal Opportunity across controlled demographic cohorts (Gender, Age Group).
6. **Counterfactual Invariance Audit**: Empirically proves that perturbing demographic proxy attributes results in a score delta of $\Delta = 0.0$.
7. **Personalized Upskilling Roadmap**: Generates a 3-priority curriculum with realistic milestones and practical capstone projects for developing candidates.
8. **Candidate Comparison**: Side-by-side radar charts and attribute matrices comparing 2 to 4 candidates simultaneously.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, TanStack Query, Axios, Recharts, Lucide React, React Hook Form, Zod.
- **Backend**: Python 3.14 / 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic.
- **Database**: Dual-engine architecture:
  - **SQLite**: Instant zero-config local development without external dependencies.
  - **PostgreSQL**: Production-ready containerized service for Docker Compose.
- **Document Processing**: PyMuPDF (`pymupdf`) for high-fidelity PDF extraction; `python-docx` for Word documents.
- **AI / ML Modules**: Resilient subword TF-IDF vectorizer, Item Response Theory adaptive sequencing, Fairlearn-compatible metrics, configurable LLM fallbacks.
- **Testing**: Pytest with automated test coverage.
- **DevOps**: Docker, Docker Compose, Nginx.

---

## 4. Project Structure

```
recruitiq/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, jobs, resumes, matching, assessments, fairness, etc.)
│   │   ├── core/            # Settings, security (bcrypt + JWT), custom exceptions
│   │   ├── db/              # SQLAlchemy session, engine, initial seed script
│   │   ├── models/          # Normalized SQLAlchemy 2.0 ORM models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── services/        # Decoupled AI/ML logic (embeddings, parser, adaptive, fairness, dev plan)
│   ├── tests/               # Pytest automated test suites
│   ├── requirements.txt
│   └── main.py              # FastAPI server entry point
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client & typed API endpoints
│   │   ├── components/      # Common UI, interactive workflow, charts, modals, badges
│   │   ├── contexts/        # AuthContext (JWT, session persistence)
│   │   ├── pages/           # Landing, Auth, Recruiter, Candidate, Admin dashboards
│   │   ├── types/           # TypeScript data contracts
│   │   └── App.tsx          # Role-based route guard
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.app.json
├── sample_resumes/          # Realistic PDF & DOCX resumes for live demo evaluation
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docs/                    # In-depth architectural & algorithmic documentation
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── ai_pipeline.md
│   ├── fairness.md
│   └── setup.md
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Quickstart & Installation

### Option A: Local Run (Zero Configuration Required)

#### 1. Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*The database and seed demo data are automatically provisioned.* API is accessible at `http://127.0.0.1:8000` (Swagger docs: `/docs`).

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

---

### Option B: Docker Compose (PostgreSQL Production Stack)

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 6. Pre-Configured Demo Accounts

All demo accounts use password: `password123`

| Role | Email | Capabilities |
|---|---|---|
| **Recruiter** | `recruiter@recruitiq.com` | Requisitions, candidate dossiers, rankings, comparison, fairness |
| **Recruiter (AI)** | `elena.recruiter@recruitiq.com` | Data Science & Machine Learning pipelines |
| **Candidate 1** | `candidate1@recruitiq.com` | Alex Rivera (Full-Stack Engineer - 5 yrs exp) |
| **Candidate 2** | `candidate2@recruitiq.com` | David Chen (Data Scientist - 6 yrs exp) |
| **System Admin** | `admin@recruitiq.com` | User management, audit logs, AI diagnostics |

---

## 7. End-to-End Reviewer Demo Journey

1. **Login as Recruiter**: Navigate to `/login` and click **Recruiter Demo** (or use `recruiter@recruitiq.com`).
2. **Review Dashboard**: Inspect KPI cards, hiring funnel, and the live candidate roster.
3. **Create Job**: Click **Post Job**, enter a title like *Lead ML Engineer*, paste a description, and click **Analyze Job with AI**. Observe auto-extracted skills with High/Medium/Low importance weights.
4. **Evaluate Candidate Dossier**: Open any candidate to review their 10-tab dossier (Parsed Resume, Skills & Gaps, Semantic Match, Assessment, Consistency, Explainability, Fairness, and Recruiter Notes).
5. **Inspect Fairness Audit**: Go to `/recruiter/fairness/1` to view selection rate differences, demographic parity, and run the **Counterfactual Invariance Test**.
6. **Compare Candidates**: Select 2 candidates and click **Compare** to view side-by-side radar charts and attribute matrices.
7. **Tune Ranking Weights**: Go to `/recruiter/rankings/1` and adjust sliders to see scores recompute in real time.
8. **Login as Candidate**: Sign in with `candidate1@recruitiq.com` to view the candidate portal, launch the **Adaptive Assessment** (watch question difficulty adjust dynamically), and view the **Personalized Skill Development Plan**.

---

## 8. Running Automated Tests

```bash
cd backend
python -m pytest tests/ -v
```
Verifies authentication, AI job analysis, resume parsing, semantic vector math, adaptive difficulty adjustments, consistency classification, and fairness formulas.

---

## 9. Limitations & Future Scope

- **Audio/Video AI Interviews**: Current implementation evaluates written responses for relevance and technical clarity. Real-time WebRTC audio analysis can be integrated in future phases.
- **Enterprise ATS Integration**: Future releases can connect webhooks to Greenhouse, Lever, and Workday.
