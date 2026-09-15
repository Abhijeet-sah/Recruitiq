# RecruitIQ Setup & Deployment Guide

## Quickstart Options

### Option 1: Local Single-Command Run (Zero Docker Required)

RecruitIQ includes an automatic SQLite fallback so you can start developing immediately without running external services.

#### 1. Start Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
The backend initializes the database, creates tables, and seeds demo data at `http://127.0.0.1:8000`. Swagger API docs are available at `http://127.0.0.1:8000/docs`.

#### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

### Option 2: Docker Compose (PostgreSQL Production Stack)

To run the complete production container stack:

```bash
# From project root
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## Seeded Demo Accounts

All demo accounts use password: `password123`

| Role | Email | Description |
|---|---|---|
| **Lead Recruiter** | `recruiter@recruitiq.com` | Full requisition, ranking & comparison access |
| **Talent Partner** | `marcus.recruiter@recruitiq.com` | Engineering requisitions |
| **AI Recruiter** | `elena.recruiter@recruitiq.com` | Data science pipeline |
| **Candidate 1** | `candidate1@recruitiq.com` | Alex Rivera (Full-Stack Engineer) |
| **Candidate 2** | `candidate2@recruitiq.com` | David Chen (Data Scientist) |
| **System Admin** | `admin@recruitiq.com` | Full governance & audit log oversight |

---

## Running Automated Tests

```bash
cd backend
python -m pytest tests/ -v
```
All 8 test suites will execute and verify authentication, job analysis, resume parsing, semantic matching, adaptive difficulty adjustments, consistency classification, and fairness formulas.
