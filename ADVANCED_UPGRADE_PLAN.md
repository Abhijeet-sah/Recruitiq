# RecruitIQ Advanced Platform Upgrade Plan

## 1. Executive Summary & Vision
RecruitIQ is transitioning from a conventional AI recruitment tool into an **Evidence-Grounded, Adaptive, Explainable, Uncertainty-Aware, and Responsible AI Recruitment Intelligence Platform**.

This document provides a systematic audit of the existing codebase, architectural blueprints, reusable modules, extension plans, database schemas, frontend components, backwards-compatibility protections, and phased execution roadmap.

---

## 2. Current Codebase Audit

### 2.1 Reusable Core Assets (Keep & Build Upon)
| Component | Existing File | Role & Upgrade Strategy |
| :--- | :--- | :--- |
| **Authentication & RBAC** | `app/api/auth.py`, `app/core/security.py`, `app/api/deps.py` | Fully preserved. Extended for Blind Screening token context and Recruiter Override audits. |
| **Document Parsers** | `app/services/resume_parser.py` | Base PDF/DOCX text extraction preserved. Enhanced with Evidence Grounding (page/offset/section tracking) and Security Analysis. |
| **Deterministic Vectorizer** | `app/services/embeddings.py` (`LocalSemanticVectorizer`) | Preserved as permanent 100% offline fallback when Sentence Transformers are loading or unavailable. |
| **Code Sandbox & Eval** | `app/services/code_evaluator.py` | Preserved and utilized for coding challenges across Python, JavaScript, SQL. |
| **Question Bank & MBPP** | `app/services/question_bank.py`, `app/services/dataset_loader.py` | Preserved. Question bank augmented with IRT parameters (difficulty $b$, discrimination $a$). |
| **Frontend Foundation** | React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts | Retained. Enhanced with dedicated enterprise visualization components. |

### 2.2 Modules Requiring Major Extension / New Layer
| Domain | Existing Implementation | Enhanced Architecture |
| :--- | :--- | :--- |
| **Semantic Matching** | Bag-of-words / TF-IDF character n-gram cosine | **`EmbeddingService`** using `SentenceTransformer('all-MiniLM-L6-v2')` + dense embedding cache + Multi-Dimensional Matching (Required, Preferred, Experience, Projects, Education, Domain). |
| **Evidence Grounding** | High-level match percentages | **`EvidenceGroundingEngine`** + `EvidenceRecord` tracking source document, section, text span, page, confidence. |
| **Document Security** | None | **`ResumeIntegrityAnalyzer`** + **`PromptInjectionDetector`** (Keyword stuffing, hidden text, instruction injection flags). |
| **Skill Ontology** | Flat dictionary of strings | **`SkillKnowledgeGraph`** with typed relations (`IS_A`, `REQUIRES`, `RELATED_TO`, `PREREQUISITE_OF`, `ALIAS_OF`). |
| **Skill Transferability** | Exact string or basic similarity | **`TransferableSkillEngine`** (Direct, Related, Transferable, Missing with 0–100% Transferability Score). |
| **Adaptive Testing** | Linear 3-level heuristic | **`ItemResponseTheoryEngine`** (2PL logistic model, $\theta$ ability updates, Maximum Fisher Information selection, Multi-skill $\theta$). |
| **Uncertainty & Consensus**| Single static confidence score | **`UncertaintyEngine`** + **`EvidenceConsensusEngine`** (Cross-module matrix: Resume vs Assessment vs Interview vs Projects). |
| **Fairness & Bias** | Simple 4/5ths selection rate | **`RecruitIQ Fairness Lab`** (Demographic Parity, Disparate Impact, Equal Opportunity, Selection Threshold Simulator, Real Counterfactual Rerun). |
| **Explainability** | Single composite formula | **Explainability 2.0**: Level 1 (Breakdown), Level 2 (Evidence), Level 3 (SHAP / Weighted Contribution). |
| **Governance & MLOps** | None | **Decision Trace** (immutable audit log), **Model Registry**, **Model Health & Drift Monitoring**, **Human Override**. |

---

## 3. Database Schema Extensions

The existing tables (`users`, `jobs`, `applications`, `candidate_profiles`, `resumes`, `assessments`, `match_scores`, `fairness_audits`, etc.) will remain 100% intact. We add new tables and nullable columns to preserve database compatibility:

### New Tables
1. **`evidence_records`**:
   - `id`, `application_id`, `candidate_id`, `job_id`, `source_type` (RESUME, JOB_DESCRIPTION, ASSESSMENT, INTERVIEW), `source_document`, `section`, `page_number`, `evidence_text`, `char_start`, `char_end`, `confidence`, `created_at`.
2. **`resume_integrity_reports`**:
   - `id`, `resume_id`, `candidate_id`, `integrity_status` (VERIFIED, REVIEW_RECOMMENDED, HIGH_RISK), `integrity_score`, `keyword_stuffing_detected` (bool), `stuffing_details_json`, `hidden_text_detected` (bool), `hidden_text_details_json`, `prompt_injection_flag` (SAFE, SUSPICIOUS, HIGH_RISK), `injection_snippets_json`, `summary_text`, `created_at`.
3. **`skill_ontologies` & `skill_relationships`**:
   - `id`, `source_skill`, `target_skill`, `relation_type` (IS_A, REQUIRES, RELATED_TO, PREREQUISITE_OF, ALIAS_OF), `weight`.
4. **`candidate_skill_passports`**:
   - `id`, `candidate_id`, `application_id`, `passport_data_json` (multi-source verified skills, confidence, levels), `overall_verified_score`, `created_at`.
5. **`model_registries` & `model_executions`**:
   - `id`, `model_name`, `version`, `model_type` (EMBEDDING, PARSER, IRT_CAT, SCORING, FAIRNESS), `status` (ACTIVE, FALLBACK, UNAVAILABLE), `metrics_json`, `last_invoked`.
6. **`decision_traces`**:
   - `id`, `application_id`, `actor_type` (SYSTEM, AI_SERVICE, RECRUITER, ADMIN), `actor_id`, `action_name`, `service_used`, `model_version`, `input_summary`, `output_summary_json`, `reasoning_text`, `created_at`.
7. **`recruiter_overrides`**:
   - `id`, `application_id`, `recruiter_id`, `ai_recommendation`, `human_decision`, `override_reason`, `created_at`.
8. **`drift_metrics`**:
   - `id`, `metric_name`, `baseline_value`, `current_value`, `drift_magnitude`, `status` (STABLE, WARNING, DRIFT_DETECTED), `recorded_at`.
9. **`research_experiments`**:
   - `id`, `experiment_name`, `experiment_type` (BASELINE_VS_TRANSFORMER, FIXED_VS_ADAPTIVE, THRESHOLD_SENSITIVITY), `metrics_json`, `dataset_size`, `created_at`.
10. **`in_app_notifications`**:
    - `id`, `user_id`, `title`, `message`, `type` (INFO, WARNING, ACTION_REQUIRED), `read_status`, `created_at`.

---

## 4. Frontend Architecture Extensions

### New Recruiter & Candidate Pages / Views
1. **Evidence Inspector**: Drawer / modal to view exact resume text snippets backing any skill or match claim.
2. **Skill Knowledge Graph Visualizer**: Interactive network rendering nodes (skills) and directed edges (relations).
3. **Candidate Skill Passport**: Comprehensive badge matrix showing Resume Evidence, Assessment Verification, and Interview Verification.
4. **Fairness Lab & Selection Threshold Simulator**: Slider dynamically modeling selection rates, demographic parity, and disparate impact.
5. **Decision Trace Timeline**: Chronological audit trail of all AI evaluations and human decisions.
6. **What-If Candidate Simulator**: Non-destructive simulator allowing recruiters and candidates to project score deltas from upskilling.
7. **JD Quality & Bias Analyzer**: Integrated in Job Creator to audit requirements for restrictive wording and unrealistic experience combos.
8. **Admin Model Registry & Drift Monitor**: Live status of embedding models, parsers, CAT engines, and latency metrics.
9. **Admin Research Lab**: Empirical comparison charts (Baseline vs Transformer, Fixed vs Adaptive CAT).

---

## 5. Phased Implementation Roadmap

### Phase 1: Core Advanced AI & Evidence Infrastructure (Priority 1)
- [x] Install & verify `sentence-transformers`, `torch`, `safetensors`.
- [ ] Implement `EmbeddingService` with `all-MiniLM-L6-v2` + cache + multi-dimensional matching + local vectorizer fallback.
- [ ] Implement `EvidenceGroundingEngine` & `EvidenceRecord` database schema.
- [ ] Implement `ResumeIntegrityAnalyzer` (keyword stuffing, hidden text, prompt injection detection).
- [ ] Implement `SkillKnowledgeGraph` & `TransferableSkillEngine`.
- [ ] Implement `UncertaintyEngine` (AI confidence scores & human review thresholds).
- [ ] Implement `ItemResponseTheoryEngine` (2PL CAT with $\theta$ updates, Fisher information, multi-skill estimation).
- [ ] Implement `EvidenceConsensusEngine` (Resume vs Assessment vs Interview cross-verification).
- [ ] Implement Explainability 2.0 (Level 1 Breakdown, Level 2 Evidence, Level 3 SHAP / Weighted Contribution).

### Phase 2: Fairness, Governance & Research Lab (Priority 2)
- [ ] Implement Blind Screening Mode.
- [ ] Build RecruitIQ Fairness Lab & Selection Threshold Simulator.
- [ ] Implement Real Counterfactual Audit (cloned input rerun with isolated perturbation).
- [ ] Implement Admin Research Lab & Baseline vs Advanced Evaluation Benchmarking.

### Phase 3: Enterprise Intelligence & Usability (Priority 3)
- [ ] Implement Decision Trace & Immutable Audit Logging.
- [ ] Implement AI Model Registry & Drift Monitoring.
- [ ] Implement Human-in-the-Loop Override Workflow.
- [ ] Implement Job Description Quality & Bias Analyzer.
- [ ] Implement Candidate Skill Passport & What-If Simulator.
- [ ] Implement Printable Candidate Evaluation Dossier Report.
- [ ] Implement In-App Notification Center.
- [ ] Implement Advanced Semantic Candidate Search & Duplicate Detection.

### Phase 4: Verification & End-to-End Demo Validation
- [ ] Verify PyTest test suite (unit tests for all new services).
- [ ] Verify Vite frontend build (`tsc -b && vite build` clean).
- [ ] Walk through the complete 17-step reviewer demo scenario.
- [ ] Update documentation (`README.md`, `docs/`).
