# RecruitIQ REST API Reference

All endpoints are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header.

## Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user & profile | Public |
| POST | `/api/auth/login` | Authenticate & obtain JWT | Public |
| GET | `/api/auth/me` | Fetch authenticated profile | Authenticated |
| POST | `/api/auth/forgot-password` | Trigger password recovery | Public |
| POST | `/api/auth/reset-password` | Fulfill password recovery | Public |

## Jobs & Analysis
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/jobs/analyze` | AI extraction of skills & weights | Recruiter/Admin |
| POST | `/api/jobs` | Create job posting | Recruiter/Admin |
| GET | `/api/jobs` | List open jobs | Public |
| GET | `/api/jobs/{id}` | Get job details | Public |
| PUT | `/api/jobs/{id}` | Update job posting | Recruiter/Admin |
| DELETE | `/api/jobs/{id}` | Delete job posting | Recruiter/Admin |

## Resumes & Candidate Profiles
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/resumes/upload` | Upload & parse PDF/DOCX resume | Authenticated |
| GET | `/api/candidates` | List candidates with filters | Recruiter/Admin |
| GET | `/api/candidates/{id}` | Retrieve candidate profile | Authenticated |
| PUT | `/api/candidates/{id}` | Update candidate profile | Authenticated |
| POST | `/api/applications` | Apply for job | Candidate |
| GET | `/api/applications/my` | View my applications & timeline | Candidate |
| GET | `/api/applications/job/{id}` | List applications for job | Recruiter/Admin |
| PUT | `/api/applications/{id}/status` | Update status (Shortlist/Reject) | Recruiter/Admin |

## Matching, Assessments & Intelligence
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/matching/analyze/{app_id}` | Trigger semantic matching | Authenticated |
| GET | `/api/matching/applications/{id}/match` | Get match breakdown | Authenticated |
| GET | `/api/matching/applications/{id}/skill-gap` | Get Strong/Moderate/Missing gaps | Authenticated |
| POST | `/api/assessments/start/{app_id}` | Start adaptive assessment attempt | Candidate |
| POST | `/api/assessments/attempts/{id}/answer` | Submit answer & adapt difficulty | Candidate |
| GET | `/api/assessments/attempts/{id}/results` | View attempt results | Authenticated |
| GET | `/api/consistency/{app_id}` | Resume claims vs test consistency | Authenticated |
| GET | `/api/explainability/application/{id}` | SHAP feature attribution breakdown | Authenticated |
| GET | `/api/fairness/{job_id}` | Demographic parity & disparity audit | Recruiter/Admin |
| POST | `/api/fairness/counterfactual` | Invariance audit on swapped proxy | Authenticated |
| POST | `/api/rankings/job/{id}` | Calculate rankings with custom weights | Recruiter/Admin |
| POST | `/api/comparison/compare` | Compare 2-4 candidates side-by-side | Recruiter/Admin |
| GET | `/api/development-plans/application/{id}` | Get candidate upskilling plan | Authenticated |
| POST | `/api/notes/{app_id}` | Add recruiter observation note | Recruiter/Admin |
| GET | `/api/analytics/recruiter` | Recruiter dashboard KPIs & charts | Recruiter/Admin |
| GET | `/api/analytics/admin` | System analytics & AI diagnostics | Admin |
