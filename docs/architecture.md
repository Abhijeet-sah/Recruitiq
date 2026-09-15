# RecruitIQ System Architecture

## Overview
RecruitIQ is an explainable, fair, and transparent AI-based candidate evaluation platform designed as an intelligent decision-support system for hiring teams.

```
+-----------------------------------------------------------------------------------+
|                                 USER INTERFACE                                    |
|   React 19 + TypeScript + Vite + Tailwind CSS + Recharts + TanStack React Query  |
+-----------------------------------------------------------------------------------+
                                         |
                                (REST API / JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                              FASTAPI BACKEND GATEWAY                              |
|          Authentication (JWT) + RBAC (Recruiter, Candidate, Admin) + CORS        |
+-----------------------------------------------------------------------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
         v                               v                               v
+------------------+           +-------------------+           +--------------------+
|  AI / ML ENGINE  |           | DATABASE LAYER    |           | STORAGE SUBSYSTEM  |
| - Subword Vector |           | - SQLAlchemy 2.0  |           | - PyMuPDF (PDF)    |
| - IRT Adaptive   |           | - SQLite (Local)  |           | - python-docx      |
| - Consistency    |           | - PostgreSQL (Prd)|           | - File uploads     |
| - SHAP Attribution           | - Alembic         |           +--------------------+
| - Fairlearn Audit            +-------------------+
+------------------+
```

## Key Architectural Principles

### 1. Human-in-the-Loop Decision Support
RecruitIQ never claims to make automated hiring decisions. It is designed to expose empirical data, highlight strengths and gaps, perform sanity checks on self-reported credentials, and audit for demographic parity, keeping final decisions with qualified human recruiters.

### 2. Algorithmic Demographic Isolation
Protected proxy attributes (gender, age group) are strictly isolated to the Fairness Audit module. They are never ingested by scoring or ranking algorithms. Counterfactual tests mathematically demonstrate a score delta of 0.0 when proxy attributes are swapped.

### 3. Tiered AI Architecture & Offline Resilience
The platform employs a tiered approach:
- Primary: Configurable external LLMs or SBERT models.
- Fallback: Local TF-IDF subword vectorizers, PyMuPDF extractors, and validated question banks. The system will never crash if external API keys are unavailable.
