# Interim Project Report-I

**on**

## RecruitIQ: A Smart AI-Based Recruitment and Candidate Evaluation System with Explainable and Fair Decision Support

Submitted in partial fulfillment for the award of  
**BACHELOR OF TECHNOLOGY**  
Degree In  
**COMPUTER SCIENCE & ENGINEERING**  

**2026–27**

---

**Under the Guidance of:**  
**[GUIDE NAME]**  
[DESIGNATION]  
Department of Computer Science & Engineering  

**Submitted By:**  
**Abhijeet Sah** (Admission No.: [ADMISSION NO. 1])  
**Manish Kumar** (Admission No.: [ADMISSION NO. 2])  

---

**SCHOOL OF COMPUTER SCIENCE & ENGINEERING**  
**GALGOTIAS UNIVERSITY**  
**OCTOBER 2026**

\newpage

---

## SCHOOL OF COMPUTER SCIENCE AND ENGINEERING
### PROJECT PROGRESS REPORT MTE, MID TERM EXAM, FALL/WINTER 2026–27
**B. Tech., Project Details**

| Parameter | Details |
| :--- | :--- |
| **Project ID** | [PROJECT ID] |
| **Semester** | 7th Semester |
| **Project Title** | **RecruitIQ: A Smart AI-Based Recruitment and Candidate Evaluation System with Explainable and Fair Decision Support** |
| **Progress of Project (in words)** | Interim Project Report-I covers the complete foundational engineering, problem formulation, objectives, comprehensive literature review, and working prototype implementation. The core architecture has been realized through a modular stack: a responsive frontend developed in React 18 and Tailwind CSS, an asynchronous REST API backend powered by FastAPI (Python), a hybrid persistence layer integrating relational database schemas with cloud-hosted MongoDB Atlas, an NLP semantic matching engine based on Sentence-BERT embeddings, an adaptive technical assessment module, a security-aware prompt injection filter, and an explainable scoring matrix with demographic fairness auditing. All fourteen proposed system modules have been successfully developed, integrated, and verified against functional benchmarks. |
| **Research Paper Title** | *Towards Fair and Explainable Recruitment: An Integrated Pipeline Combining Semantic Matching, Adaptive Skill Verification, and Demographic Auditing* |
| **Progress of Research Paper** | Introduction, Literature Review, Mathematical Formulation, and Architecture Design sections drafted; experimental baseline benchmark comparisons currently underway for final submission. |
| **Suggestions for improvement by Guide** | [To be recorded during discussion] |
| **Suggestions for improvement by Examiner** | [To be recorded during evaluation] |

#### Student Progress Details (Filled by Guide Only):

| S. No | Name | Admission Number | No. of times Came for Discussion | Performance of Student | Approval for Mid Term Review |
| :---: | :--- | :---: | :---: | :--- | :--- |
| 1 | Abhijeet Sah | [ADMISSION NO. 1] | | [ ] Excellent<br>[ ] Good<br>[ ] Satisfactory | [ ] Approved<br>[ ] Not Approved |
| 2 | Manish Kumar | [ADMISSION NO. 2] | | [ ] Excellent<br>[ ] Good<br>[ ] Satisfactory | [ ] Approved<br>[ ] Not Approved |

<br><br>
________________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ________________________________________  
**Supervisor Name & Signature with Date** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Examiner's Name & Signature with Date**

*Note: All information regarding performance (except student details) must be filled by the respective Guide.*

\newpage

---

## SYNOPSIS

### RecruitIQ: A Smart AI-Based Recruitment and Candidate Evaluation System with Explainable and Fair Decision Support

Recruitment in modern organizations is an information-intensive, multi-stage pipeline encompassing role definition, applicant sourcing, resume screening, competency evaluation, and final hiring decisions. With the proliferation of online career platforms, organizations regularly receive hundreds or thousands of applicants for a single job requisition. Consequently, initial resume screening has become an acute operational bottleneck. Conventional Applicant Tracking Systems (ATS) and keyword-based filtering engines were introduced to alleviate manual workload; however, these traditional tools rely on rigid lexical matching, miss qualified applicants who express identical technical competencies using synonymous phrasing, and treat textual resume claims as sufficient evidence of actual technical proficiency. Furthermore, recent empirical audits demonstrate that both embedding-based matching engines and Large Language Models (LLMs) frequently exhibit unintended demographic disparities across gender, ethnicity, and educational backgrounds [1]–[3]. Concurrently, studies indicate that unstructured document processing pipelines remain vulnerable to adversarial text injection and inflated resume claims [4], [5]. Because employment decisions directly affect candidate careers and organizational capability, automated hiring systems cannot operate as opaque black boxes; they must be relevant, auditable, mathematically grounded, and subject to human oversight.

RecruitIQ is designed and implemented as an end-to-end decision-support platform that bridges the gap between candidate screening and verifiable competency evaluation within a unified, transparent workflow. The system decomposes job descriptions into structured requirement profiles comprising core competencies, experience thresholds, and weighted technical skills. Uploaded resumes in PDF and DOCX formats are ingested through a security-conscious preprocessing stage that parses candidate profiles while scanning for adversarial prompt-injection patterns. Rather than relying on simple keyword overlap, semantic matching is performed using dense sentence-level vector representations (Sentence-BERT / MiniLM) combined with multi-factor linear score decomposition. A dedicated skill-gap analysis module categorizes candidate competencies into direct matches, partial matches, transferable skills, and missing prerequisites.

To address the reality that self-reported resume statements do not guarantee demonstrated capability, RecruitIQ integrates an adaptive technical assessment module. Candidates complete timed, dynamically calibrated problem sets aligned with role requirements. A claim-versus-evidence consistency engine cross-validates demonstrated assessment performance against claimed resume proficiencies, flagging suspicious competency inflations for human recruiter review rather than taking autonomous punitive action. To safeguard algorithmic accountability, candidate scoring is transparently decomposed into explainable sub-scores across skill match, domain experience, academic background, and assessment demonstration. A demographic parity and disparate impact auditing framework evaluates candidate distribution across protected groups without utilizing demographic attributes as scoring inputs. Final employment decisions remain strictly with human recruiters.

The methodology adopted in this project comprises rigorous problem definition, structured literature synthesis, full-stack prototype engineering, cloud database integration (MongoDB Atlas alongside local relational persistence), and empirical benchmarking against conventional keyword and TF-IDF baselines. This Interim Project Report-I details the problem context, system design, functional module implementations, literature survey, and evaluation roadmap corresponding to the 7th Semester Mid-Term Examination (MTE) milestone of Galgotias University.

**Keywords:** Artificial Intelligence, Recruitment Systems, Natural Language Processing, Resume Parsing, Semantic Matching, Sentence-BERT, Computerized Adaptive Testing, Explainable AI, Fairness Auditing, Prompt Injection Defense, Skill-Gap Analysis, Human-in-the-Loop.

\newpage

---

## TABLE OF CONTENTS

| Chapter No. | Title | Page No. |
| :---: | :--- | :---: |
| | **SYNOPSIS** | iii |
| | **LIST OF FIGURES** | vi |
| | **LIST OF TABLES** | vii |
| | **LIST OF SYMBOLS AND ABBREVIATIONS** | viii |
| **1.** | **INTRODUCTION** | **1** |
| | 1.1 Background of AI in Recruitment | 1 |
| | 1.2 Recruitment Problem | 1 |
| | 1.3 Motivation and Significance | 3 |
| | 1.4 Problem Statement | 4 |
| | &nbsp;&nbsp;&nbsp;&nbsp;1.4.1 Proposed Approach in Brief | 4 |
| | &nbsp;&nbsp;&nbsp;&nbsp;1.4.2 Modules of the Proposed System | 5 |
| | 1.5 Objectives of the Project | 6 |
| | &nbsp;&nbsp;&nbsp;&nbsp;1.5.1 Objectives | 6 |
| | &nbsp;&nbsp;&nbsp;&nbsp;1.5.2 Provisional Research Questions | 7 |
| | 1.6 Scope of the Project | 8 |
| | 1.7 Limitations of the Study | 8 |
| | 1.8 Organization of the Report | 9 |
| | &nbsp;&nbsp;&nbsp;&nbsp;1.8.1 Status Conventions Used in This Report | 9 |
| **2.** | **LITERATURE REVIEW** | **10** |
| | 2.1 AI-Based Recruitment Systems | 10 |
| | 2.2 Resume Parsing and NLP-Based Screening | 11 |
| | 2.3 Semantic Job–Resume Matching | 11 |
| | 2.4 Bias and Fairness in AI Recruitment | 12 |
| | 2.5 Explainable AI for Candidate Evaluation | 13 |
| | 2.6 Adaptive Assessment and Computerized Adaptive Testing | 13 |
| | 2.7 LLM-Based Recruitment and Prompt Injection | 14 |
| | 2.8 Skill-Gap Analysis and Candidate Development | 15 |
| | 2.9 Comparative Analysis of Existing Approaches | 15 |
| | 2.10 Research Gap | 18 |
| | 2.11 Summary of Literature Findings | 20 |
| | **REFERENCES** | **22** |

\newpage

---

## LIST OF FIGURES

| Figure No. | Title | Page No. |
| :---: | :--- | :---: |
| Figure 1.1 | Typical stages of a conventional recruitment process and associated limitations | 2 |
| Figure 1.2 | Proposed end-to-end workflow of RecruitIQ with human recruiter decision | 4 |
| Figure 2.1 | Mapping of reviewed literature themes to implemented RecruitIQ modules | 16 |
| Figure 2.2 | Primary focus of the reviewed studies compared with the operational scope of RecruitIQ | 19 |

---

## LIST OF TABLES

| Table No. | Title | Page No. |
| :---: | :--- | :---: |
| Table 1.1 | Modules of RecruitIQ and their implementation status | 5 |
| Table 1.2 | Provisional research questions and planned experimental evaluation | 7 |
| Table 2.1 | Summary of selected research studies | 16 |
| Table 2.2 | Comparison of existing recruitment approaches | 17 |
| Table 2.3 | Research gaps and the RecruitIQ engineering response | 19 |

\newpage

---

## LIST OF SYMBOLS AND ABBREVIATIONS

### Abbreviations

| Abbreviation | Expansion |
| :--- | :--- |
| **AI** | Artificial Intelligence |
| **API** | Application Programming Interface |
| **ATS** | Applicant Tracking System |
| **BERT** | Bidirectional Encoder Representations from Transformers |
| **CAT** | Computerized Adaptive Testing |
| **CORS** | Cross-Origin Resource Sharing |
| **ETE** | End Term Examination |
| **IRT** | Item Response Theory |
| **JD** | Job Description |
| **JSON** | JavaScript Object Notation |
| **JWT** | JSON Web Token |
| **LLM** | Large Language Model |
| **ML** | Machine Learning |
| **MTE** | Mid Term Examination |
| **NDCG** | Normalised Discounted Cumulative Gain |
| **NLP** | Natural Language Processing |
| **ORM** | Object-Relational Mapping |
| **REST** | Representational State Transfer |
| **SBERT** | Sentence-BERT |
| **SHAP** | SHapley Additive exPlanations |
| **TF-IDF** | Term Frequency–Inverse Document Frequency |
| **UI / UX** | User Interface / User Experience |
| **XAI** | Explainable Artificial Intelligence |

### Symbols

| Symbol | Description |
| :--- | :--- |
| $\theta$ | Latent ability (proficiency) parameter of an examinee |
| $a_i$ | Discrimination parameter of assessment item $i$ |
| $b_i$ | Difficulty threshold parameter of assessment item $i$ |
| $P_i(\theta)$ | Probability of a correct response to item $i$ at proficiency level $\theta$ |
| $e_J$ | Dense embedding vector representing a structured job requirement |
| $e_R$ | Dense embedding vector representing a parsed resume competency segment |
| $\text{sim}(e_J, e_R)$ | Cosine similarity metric between job and resume vectors |
| $\| \cdot \|$ | Euclidean norm ($L_2$ norm) of a vector |
| $\hat{Y}$ | Binary recruitment recommendation outcome ($\hat{Y} = 1$ denotes shortlisted) |
| $G$ | Protected demographic group attribute (used solely for offline bias auditing) |
| $\Delta_{DP}$ | Demographic Parity Difference |
| $DI$ | Disparate Impact ratio (Four-fifths rule threshold: 0.80) |

\newpage

---

# CHAPTER 1: INTRODUCTION

### 1.1 Background of AI in Recruitment

Recruitment is the core human-resource process through which an enterprise identifies staffing requirements, broadcasts job requisitions, evaluates applicant qualifications, and makes formal hiring offers. Historically, this workflow was manual: hiring managers personally read paper resumes, cross-referenced credentials by phone, and administered paper-based technical examinations. Over the last two decades, web-based job portals, professional networking sites, and applicant intake portals have dramatically lowered application barriers for job seekers. While this has broadened talent sourcing, it has created a severe volume challenge for corporate talent acquisition teams, who frequently receive hundreds of applications for an individual engineering opening within hours of posting.

To handle this volume, corporate recruitment adopted Applicant Tracking Systems (ATS). Early ATS implementations relied on structured database filters and rigid keyword searches. Although operationally straightforward, keyword filtering is inherently brittle: it penalizes capable candidates whose resume wording does not exactly match the recruiter's search query, while rewarding candidates who engage in keyword-stuffing.

In response to keyword limitations, modern systems have integrated Natural Language Processing (NLP) and Machine Learning (ML). Word embedding architectures (Word2Vec, GloVe), transformer-based dense encoders (BERT, RoBERTa, Sentence-BERT), and generative Large Language Models (LLMs) allow systems to analyze semantic relationships rather than exact string matches. Textual descriptions of experience can now be mapped into high-dimensional geometric spaces where semantically synonymous technologies cluster closely together.

However, recent peer-reviewed audits reveal significant technical and ethical risks in purely automated screening pipelines:
1. **Demographic Bias:** Wilson and Caliskan demonstrated that state-of-the-art embedding retrieval models exhibit pronounced racial and gender skew in resume ranking, favoring White-associated names in 85.1% of evaluated trials [1].
2. **Implicit Educational Stereotyping:** Iso et al. found that while modern LLMs show reduced explicit demographic bias, they continue to display strong implicit bias correlated with candidate educational pedigree and socio-economic proxies [2].
3. **Model Brittleness:** Seshadri et al. established that minor, non-demographic perturbations in resume phrasing frequently destabilize LLM ranking outputs [3].
4. **Adversarial Vulnerability:** Baxi et al. and Augey et al. proved that resumes can be manipulated using prompt injection or subtle self-promotional text to artificially boost automated rankings without adding genuine qualifications [4], [5].

These findings indicate that an effective modern recruitment system cannot treat resume screening as an unmonitored ranking exercise. A viable platform must combine semantic matching with active technical verification, explainable scoring decompositions, demographic bias monitoring, input security sanitization, and explicit human-in-the-loop governance. This engineering requirement defines the foundation of RecruitIQ.

---

### 1.2 Recruitment Problem

The challenge addressed by this project is not an isolated software defect, but a combination of interdependent structural shortcomings present across conventional hiring funnels. Figure 1.1 illustrates the typical stages of conventional recruitment alongside their primary failure modes.

```
+------------------+     +------------------+     +------------------+     +------------------+     +------------------+
| Job Description  | --> | Large Pool of    | --> | Keyword / Rule-  | --> | Manual Review    | --> | Hiring Decision  |
| Formulation      |     | Resumes Received |     | Based Screening  |     | & Shortlisting   |     | (Single Offer)   |
+------------------+     +------------------+     +------------------+     +------------------+     +------------------+
                                  |                        |                        |                        |
                                  v                        v                        v                        v
                         [Volume Fatigue]         [Lexical Brittleness]    [Subjective Inconsistency] [Demographic Disparities]
                         Unmanageable volume;     Misses qualified         Review quality varies;     Opaque scores;
                         claims treated as        candidates with          fatigue causes random      unconscious bias;
                         proven evidence          synonymous skills        shortlisting decisions     no candidate feedback
```
**Figure 1.1: Typical stages of a conventional recruitment process and associated limitations**

The specific technical problems can be formulated as follows:

1. **Volume Fatigue and Manual Inefficiency:** Evaluating hundreds of multi-page technical resumes manually imposes extreme cognitive strain on recruiters. Review quality degrades over prolonged evaluation sessions, leading to arbitrary shortlisting outcomes.
2. **Keyword Inelasticity:** Exact-string search tools fail to recognize conceptual equivalence. For example, a candidate stating *"architected microservices using Java and Spring Framework"* is excluded by a naive filter querying *"Spring Boot Developer"*, despite possessing the exact core competencies required.
3. **Disconnection Between Claims and Demonstrated Competence:** Resumes reflect self-asserted claims authored by candidates. A candidate listing "Advanced Kubernetes" or "Distributed Systems" may have only superficial theoretical familiarity. Conventional screening provides no mechanism to verify capability prior to interview scheduling.
4. **Static, Non-Adaptive Testing:** Standard technical assessments subject all candidates to an identical, rigid question set. Beginner candidates face demoralizing difficulty, while advanced candidates waste time answering trivial questions, yielding low-information ability estimates.
5. **Absence of Actionable Candidate Feedback:** Candidates rejected during initial screening typically receive automated, uninformative rejection templates. They receive no feedback regarding missing competencies, skill gaps, or suggested learning resources.
6. **Demographic and Educational Skew:** Algorithmic ranking engines frequently replicate historical societal biases latent in training data, producing disparate selection rates across protected demographic groups [1]–[3].
7. **Black-Box Score Opacity:** Single numerical scores generated by proprietary matching algorithms provide no factor breakdown. A recruiter cannot verify whether an applicant achieved an 85% match due to relevant hands-on projects, years of tenure, or academic prestige.
8. **Vulnerability to Resume Manipulation:** Applicants increasingly employ prompt-injection techniques, hidden white-text instructions, or keyword-stuffed sections designed to hijack automated parser prompts [4], [5].

RecruitIQ addresses these eight problems in a single unified architecture, ensuring that improvements in semantic flexibility are counterbalanced by active skill verification, explainable feature attribution, and fairness auditing.

---

### 1.3 Motivation and Significance

#### 1.3.1 Motivation
The primary motivation of this project is to build an **evidence-based decision-support system** that assists human recruiters rather than automating them out of the loop. Employment decisions carry life-altering consequences for candidates and critical operational implications for hiring companies. Consequently, algorithmic recommendations must be transparent, verifiable, and open to manual correction.

The second motivation is **candidate-centric transparency**. Existing recruitment software treats candidates as passive data objects to be filtered. RecruitIQ rebalances this relationship: by synthesizing resume parsing with assessment analytics, the system generates an automated, personalized skill-gap roadmap for candidates, identifying strengths, partial matches, and recommended learning paths regardless of final selection outcome.

The third motivation is **academic and engineering integration**. While individual sub-domains—such as Sentence-BERT matching, Item Response Theory, SHAP explainability, and prompt injection detection—have been studied in isolation, few systems integrate these modules into an end-to-end, functional prototype that compares self-reported claims with demonstrated assessment metrics under an audited fairness framework.

#### 1.3.2 Significance
- **For Recruiters:** Provides an interpretable candidate evaluation dashboard detailing multi-dimensional scores (skills, experience, education, projects), verified assessment outcomes, flagged competency inflations, and demographic fairness indicators.
- **For Candidates:** Provides an intuitive career portal to discover matching positions, complete calibrated skill assessments, review objective feedback, and access personalized upskilling plans.
- **For Academic Engineering:** Delivers a verifiable, working prototype demonstrating how responsible AI principles (explainability, fairness auditing, untrusted input handling) can be integrated into high-stakes HR technology.

---

### 1.4 Problem Statement

Conventional recruitment screening remains manual, fragile to lexical variation, unverified regarding claimed competencies, vulnerable to adversarial resume text, and prone to demographic bias, while failing to provide candidates with constructive feedback.

The objective of this project is to design, develop, and empirically evaluate **RecruitIQ**, a comprehensive AI-supported recruitment decision-support system that:
1. Semantically parses and matches job requisitions and candidate resumes beyond exact keywords;
2. Integrates adaptive technical competency testing to collect demonstrated performance metrics;
3. Cross-validates self-reported resume claims against demonstrated test evidence, flagging potential competency inflations for human verification;
4. Generates mathematically explainable score decompositions across job-relevant evaluation dimensions;
5. Audits applicant outcomes for demographic disparities without utilizing protected demographic attributes as scoring inputs;
6. Treats resume content as untrusted data by applying adversarial prompt-injection screening; and
7. Preserves final hiring authority with human recruiters through a dedicated decision-support dossier.

#### 1.4.1 Proposed Approach in Brief
RecruitIQ operates as a layered, multi-stage platform. A recruiter publishes a structured job requisition through the Recruiter Studio. Candidates submit PDF or DOCX resumes through the Candidate Career Portal. Resumes pass through security sanitization and an NLP extraction pipeline that derives structured profiles. A semantic matching engine computes multi-dimensional relevance against the requisition. Candidates complete an adaptive technical assessment, generating demonstrated proficiency data. The consistency engine audits claims against demonstrated results, and candidate scores are decomposed into transparent attribution factors. The recruiter evaluates ranked candidates within an explainable dossier, supported by fairness audit metrics.

```
+----------------------------------------------------------------------------------------------------+
|                                    RECRUITIQ PLATFORM WORKFLOW                                     |
+----------------------------------------------------------------------------------------------------+

 [1. Job Requisition] ---> [2. Security & Parsing] ---> [3. Semantic Matching] ---> [4. Skill-Gap]
   Recruiter drafts          Untrusted resume text       Sentence-BERT dense         Identifies matched,
   competencies, exp,        sanitized; entities         cosine similarity           partial, missing &
   and knockout rules        extracted (PDF/DOCX)        vector computation          transferable skills
                                                                                              |
                                                                                              v
 [8. Human Decision]  <--- [7. Recruiter Dossier] <--- [6. Consistency Audit] <--- [5. Adaptive Test]
   Recruiter reviews         Explainable scores;         Compares resume             Dynamic difficulty;
   dossier; makes final      fairness demographic       claims vs. test             calibrated evidence
   interview selection       auditing indicators         evidence; flags inflation   collection
```
**Figure 1.2: Proposed end-to-end workflow of RecruitIQ with human recruiter decision**

---

### 1.4.2 Modules of the Proposed System

Table 1.1 details the fourteen modules comprising RecruitIQ, describing their functional role, theoretical design status, and implementation status in the current project prototype.

**Table 1.1: Modules of RecruitIQ and their implementation status**

| Module | Intended Function | Design Status | Implementation Status |
| :--- | :--- | :---: | :--- |
| **1. User & Authentication Management** | Role-based authentication (Candidate, Recruiter, Admin), JWT session tokens, bcrypt password hashing, and cloud MongoDB Atlas synchronization. | Implemented | **Fully Implemented** (Verified with MongoDB Atlas Cluster & SQLite/Postgres backend). |
| **2. Job Requisition Studio** | Interactive job creation interface supporting 1-click industry templates, multi-currency compensation, work arrangement settings, knockout screening questions, and automated assessment provisioning. | Implemented | **Fully Implemented** (`JobCreator.tsx` & `/api/jobs` REST endpoints). |
| **3. Resume Parsing Engine** | Ingestion of PDF and DOCX documents with automated text extraction, section segmentation, contact parsing, and structured profile generation. | Implemented | **Fully Implemented** (`pdfplumber` / `python-docx` extraction pipeline). |
| **4. Security-Aware Resume Preprocessing** | Adversarial text sanitization, prompt-injection regex heuristics, instruction-boundary isolation, and untrusted payload tagging. | Implemented | **Fully Implemented** (`resume_security.py` heuristic scanning engine). |
| **5. Semantic Job–Resume Matcher** | High-dimensional dense vector embeddings (Sentence-BERT / MiniLM), cosine similarity computation, and multi-factor alignment scoring. | Implemented | **Fully Implemented** (`embeddings.py` & `matching.py` with dense vector indexing). |
| **6. Skill-Gap Analysis Module** | Structured skill classification into matched, partially matched, transferable, and missing competencies with visual candidate feedback. | Implemented | **Fully Implemented** (`skill_gap.py` categorical matching service). |
| **7. Adaptive Technical Assessment Engine** | Dynamic problem selection adjusting question difficulty in real time based on candidate performance, time limits, and category weights. | Implemented | **Fully Implemented** (`adaptive_engine.py` & validated question bank of 100+ items). |
| **8. Claim vs. Evidence Consistency Checker** | Comparative cross-validation between resume-claimed proficiencies and assessment-demonstrated performance; flags inflation anomalies for recruiter review. | Implemented | **Fully Implemented** (`consistency_audit.py` automated discrepancy flagger). |
| **9. Demographic Fairness Audit Engine** | Independent statistical auditing computing Demographic Parity Difference ($\Delta_{DP}$) and Disparate Impact ($DI$) across demographic groups; strictly decoupled from scoring. | Implemented | **Fully Implemented** (`fairness_audit.py` & Four-Fifths rule evaluation). |
| **10. Explainable Candidate Scoring Engine** | Transparent linear score decomposition attributing total score across skill alignment (40%), experience tenure (25%), education (15%), and projects/assessments (20%). | Implemented | **Fully Implemented** (`explainability.py` multi-factor attribution model). |
| **11. Candidate Ranking & Recruiter Dossier** | Comprehensive recruiter evaluation dashboard with side-by-side candidate comparison matrix, evidence breakdown, and decision-support tools. | Implemented | **Fully Implemented** (`CandidateDossier.tsx` & Recruiter Dashboard). |
| **12. AI-Supported Interview Engine** | Context-aware generation of job-specific behavioral and technical interview questions with evaluation rubrics. | Implemented | **Fully Implemented** (`interview.py` structured question bank & rubric generator). |
| **13. Candidate Career Portal & Job Explorer** | Candidate-facing job discovery interface with search, department filtering, null-safe rendering, and one-click application submission. | Implemented | **Fully Implemented** (`JobExplorer.tsx` & application tracking). |
| **14. Personalized Development Planner** | Automated candidate feedback engine generating tailored upskilling roadmaps, targeted learning topics, and skill improvement plans based on identified gaps. | Implemented | **Fully Implemented** (`dev_plan_generator.py` & Candidate Portal). |

---

### 1.5 Objectives of the Project

#### 1.5.1 Objectives
1. To engineer a secure, role-based recruitment web application serving both candidate job-seekers and corporate recruiters.
2. To extract structured competencies, education levels, and experience milestones from raw, unstructured PDF/DOCX resumes.
3. To compute conceptual relevance between candidate resumes and job descriptions using dense sentence embeddings rather than lexical keyword search.
4. To implement categorical skill-gap classification separating exact matches, transferable skills, and missing competencies.
5. To develop a computerized adaptive testing engine that adjusts technical question difficulty dynamically based on candidate responses.
6. To cross-validate claimed resume skills against demonstrated test scores, flagging potential competency inflations for recruiter review.
7. To provide explainable score decompositions showing transparent factor contributions (skills, experience, education, performance).
8. To evaluate algorithmic outcomes for demographic parity and disparate impact across controlled demographic slices without using protected attributes in candidate scoring.
9. To implement defensive sanitization mechanisms that treat resume text as untrusted data and flag adversarial prompt-injection payloads.
10. To generate candidate-facing personalized growth roadmaps that detail actionable upskilling guidance based on identified assessment gaps.
11. To maintain a strict human-in-the-loop operational architecture ensuring final selection authority remains exclusively with human recruiters.
12. To benchmark the implemented prototype against baseline screening techniques (keyword overlap, TF-IDF cosine similarity, and static assessment).

#### 1.5.2 Provisional Research Questions
Table 1.2 details the research questions guiding the evaluation of RecruitIQ.

**Table 1.2: Provisional research questions and planned experimental evaluation**

| RQ | Research Question | Planned Comparison or Evaluation | Status |
| :---: | :--- | :--- | :---: |
| **RQ1** | Does dense semantic job–resume matching improve candidate retrieval relevance compared to keyword matching and TF-IDF? | Comparison of Exact Keyword Overlap, TF-IDF Cosine Similarity, and Sentence-BERT Dense Matching evaluated via Precision@K, Recall@K, and NDCG@K across structured benchmark job profiles. | Experimental Framework Implemented; Benchmarking Active. |
| **RQ2** | Do adaptive technical assessments provide a more reliable and efficient estimate of candidate capability than static examinations? | Static fixed-difficulty test versus dynamically calibrated adaptive test compared on measurement standard error, score separation, question efficiency, and completion time. | Experimental Framework Implemented; Verified on Item Bank. |
| **RQ3** | Can claim-versus-evidence cross-validation accurately detect competency discrepancies and resume claim inflation? | Evaluation on controlled candidate profiles containing injected claim–evidence mismatches; measurement of Precision, Recall, and False Alarm Rate of flagged inconsistencies. | Module Implemented; Test Cases Verified. |
| **RQ4** | Does multi-factor score decomposition maintain stable demographic parity across controlled counterfactual perturbations? | Counterfactual perturbation of synthetic candidate resumes across gender, ethnic naming proxies, and age brackets; computation of Demographic Parity Difference ($\Delta_{DP}$) and Disparate Impact ($DI$). | Auditing Module Active; Four-Fifths Compliance Monitored. |
| **RQ5** | Does explainable score decomposition enhance recruiter decision confidence compared to black-box numerical scores? | Comparison of single composite score versus decomposed multi-factor attribution; user-study evaluation measuring review time, auditability, and ranking consistency. | Implemented in Dossier Dashboard. |
| **RQ6** | How effective is defensive heuristic preprocessing at intercepting adversarial prompt-injection attacks embedded in resumes? | Testing normal resumes against resumes injected with system prompt overrides, delimiter attacks, and white-text instructions; measurement of Attack Detection Rate and False Positive Rate. | Heuristic Detection Implemented (`resume_security.py`). |
| **RQ7** | Can automated skill-gap analysis produce actionable, high-quality development roadmaps for rejected candidates? | Alignment evaluation comparing identified candidate skill deficiencies with recommended learning modules, technical documentation, and practice project topics. | Implemented in Candidate Portal. |

---

### 1.6 Scope of the Project

The scope of this project encompasses the design, implementation, and empirical validation of an end-to-end recruitment decision-support software platform. The in-scope boundaries comprise:
- Secure candidate and recruiter portal interfaces supporting registration, credential management, role-based access control, and database persistence (MongoDB Atlas & SQLite/PostgreSQL).
- Requisition builder enabling recruiters to publish vacancies with skill weights, compensation parameters, and knockout screening criteria.
- Automated document intake parsing PDF and DOCX files into structured entity models.
- Dense semantic vector matching based on Sentence-BERT embeddings.
- Computerized adaptive testing backed by a curated technical problem bank.
- Consistency analysis auditing self-reported claims against test performance.
- Transparent score decomposition and demographic fairness auditing.
- Security filters screening uploaded resume text for adversarial prompt-injection payloads.
- Automated generation of candidate growth plans and recruiter interview dossiers.

The following areas are explicitly outside the scope of this project:
- Fully autonomous hiring or automated candidate rejection without human recruiter review.
- Facial emotion recognition or computer-vision-based video interview sentiment analysis.
- Demographic trait inference from biographical or photographic data.
- Production-scale enterprise ERP integration (e.g., SAP SuccessFactors, Workday).
- Legal compliance certification under regional employment statutes (e.g., NYC Local Law 144, EU AI Act), though the system is engineered to support compliance auditability.

---

### 1.7 Limitations of the Study

1. **Textual Proxy Constraint:** Semantic matching measures textual and conceptual alignment between written documents. It cannot independently verify interpersonal communication skills, organizational citizenship, or undocumented hands-on competence.
2. **Item Bank Calibration Dependency:** The measurement precision of the adaptive testing engine depends on the breadth, difficulty calibration, and technical currency of items in the underlying question bank.
3. **Sample Size Sensitivity in Auditing:** Group-fairness metrics such as Disparate Impact ($DI$) and Demographic Parity Difference ($\Delta_{DP}$) become statistically volatile when applied to small candidate cohorts ($N < 30$). These metrics must be interpreted with caution.
4. **Non-Exhaustive Injection Defense:** While rule-based and heuristic sanitizers intercept common prompt-injection vectors, adversarial NLP techniques evolve continuously. The security layer acts as an alerting filter rather than an absolute security boundary.
5. **Document Layout Heterogeneity:** Resumes exhibiting non-standard multi-column layouts, graphics-heavy infographics, or scanned bitmap images may experience reduced parsing accuracy compared to standardized PDF/DOCX text files.
6. **Controlled Evaluation Data:** To respect candidate privacy and ethical compliance, fairness and injection experiments utilize curated, controlled synthetic candidate datasets rather than non-consensual production applicant records.

---

### 1.8 Organization of the Report

This Interim Project Report-I is organized as follows:
- **Chapter 1 (Introduction):** Outlines the background of recruitment automation, formulates the core recruitment problem, provides project motivation, defines the problem statement, introduces the fourteen system modules and their implementation status, presents project objectives and research questions, and establishes operational scope and limitations.
- **Chapter 2 (Literature Review):** Reviews primary literature across AI recruitment systems, resume parsing, semantic matching, algorithmic fairness, explainable AI, computerized adaptive testing, prompt-injection security, and skill-gap analysis; presents comparative tables, maps literature themes to system modules, and defines the research gap addressed by RecruitIQ.
- **Subsequent Interim / Final Reports:** Will present formal mathematical formulations, detailed software architecture, database schemas, full implementation code walk-throughs, empirical experimental results across RQ1–RQ7, and concluding analyses.

#### 1.8.1 Status Conventions Used in This Report
To maintain rigorous academic honesty, four standard status conventions are employed:
- **Implemented:** A functional system component or feature that has been fully developed in the codebase, integrated, and verified through executable demonstrations.
- **Proposed Design:** An architectural concept or algorithmic enhancement designed in principle but scheduled for future deployment.
- **Planned Experiment:** An empirical benchmarking test or user study designed to address a research question whose formal numerical results are actively being gathered.
- **Future Scope:** An enterprise extension or specialized capability planned beyond the academic project lifecycle.

\newpage

---

# CHAPTER 2: LITERATURE REVIEW

This chapter reviews peer-reviewed conference proceedings, journal papers, and research monographs relevant to the architecture of RecruitIQ. The literature is synthesized by technical theme rather than chronological publication order. Each thematic section examines the problem addressed in prior work, the methodology employed, primary findings, limitations relevant to RecruitIQ, and the specific module motivated by that study.

```
+------------------------------------------------+       +------------------------------------------------+
|         LITERATURE THEMES (CHAPTER 2)          |       |         RECRUITIQ MODULES (IMPLEMENTED)        |
+------------------------------------------------+       +------------------------------------------------+
| Dense Sentence Embeddings (SBERT) [7]          | ----> | 5. Semantic Job-Resume Matching                |
| Bias in Embedding-Based Retrieval [1]          | ----> | 9. Demographic Fairness Audit Engine           |
| LLM Bias Across Gender, Race, Education [2]    | ----> | 9. Demographic Fairness Audit Engine           |
| Ranking Instability & Allocational Bias [3]   | ----> | 9. Demographic Fairness Audit Engine           |
| Prompt Injection in Resume Screening [4]       | ----> | 4. Security-Aware Resume Preprocessing         |
| Resume Injection Detection (RAPIDS) [5]        | ----> | 4. Security-Aware Resume Preprocessing         |
| Explainable Hiring Frameworks (SHAP) [6], [8]  | ----> | 10. Explainable Candidate Scoring Engine       |
| Item Response Theory & Adaptive Testing [9,10] | ----> | 7. Adaptive Technical Assessment Engine        |
| Claim-Evidence Verification (Gap in lit.)      | ----> | 8. Claim vs. Evidence Consistency Checker      |
| Candidate Upskilling Plans (Gap in lit.)       | ----> | 14. Personalized Development Planner           |
+------------------------------------------------+       +------------------------------------------------+
```
**Figure 2.1: Mapping of reviewed literature themes to implemented RecruitIQ modules**

---

### 2.1 AI-Based Recruitment Systems

Early recruitment software focused on digitizing application storage and filtering submissions using boolean rules (e.g., Boolean search strings querying specific academic degrees or job titles). As application volumes increased, machine learning classifiers were trained on historical hiring data to predict whether a candidate would advance to an interview.

Recent investigations explore generative Large Language Models (LLMs) to automate candidate evaluation. Iso et al. evaluated the potential of LLMs to match job requisitions with candidate resumes in English-language settings, noting that while LLMs substantially reduce manual operational overhead, unconstrained model reasoning introduces severe risks of perpetuating historical hiring disparities [2]. Wilson and Caliskan treated LLM screening as a direct evolution of document retrieval engines, asking whether high-dimensional embeddings can retrieve candidates without systematically disadvantaging protected demographic groups [1].

Kumar et al. proposed a multi-stage student placement architecture combining NLP-based resume evaluation, placement probability prediction, fairness-aware sampling, and SHAP-based feature explanations [6]. Their work demonstrates that responsible AI principles can be integrated into candidate placement pipelines. However, their system is designed around institutional campus placement prediction: it does not incorporate active technical skill testing, does not evaluate whether self-reported resume claims match demonstrated performance, and does not include defenses against adversarial resume injection.

A general finding across these studies is that recruitment automation is typically evaluated one stage at a time. RecruitIQ adopts the complete hiring pipeline as its object of study, connecting resume parsing, semantic matching, active adaptive testing, consistency auditing, and candidate upskilling in a single unified architecture.

---

### 2.2 Resume Parsing and NLP-Based Screening

Resume parsing converts unstructured PDF, DOCX, or plain text documents into structured schema models detailing candidate contact information, educational history, work tenure, technical competencies, and project portfolios. This task is complicated by layout diversity, differing terminology, non-standard section headings, and varied formatting styles.

Information extraction pipelines employ Named Entity Recognition (NER) models (e.g., fine-tuned spaCy, BERT-NER) alongside heuristic regular expressions to identify entities and map them to standardized taxonomies (such as O*NET or ESCO). Kumar et al. utilized rule-based and NLP entity extraction to evaluate academic resumes prior to machine learning classification [6].

However, extraction is itself susceptible to demographic bias. Seshadri et al. observed that LLM-based resume summarization engines produced materially divergent summaries when identical candidate credentials were paired with ethnically distinct naming proxies [3]. Consequently, resume parsing cannot be assumed to be neutral; parsing and extraction must be audited alongside scoring.

Furthermore, extracting a technical skill from a resume verifies only that the applicant wrote the word, not that they possess the competency. RecruitIQ therefore treats parsed resume entities as self-asserted claims requiring downstream verification.

---

### 2.3 Semantic Job–Resume Matching

Keyword filtering requires exact lexical overlap and penalizes qualified candidates who use synonymous technical terms. Semantic matching addresses this by mapping job descriptions and candidate resumes into continuous high-dimensional vector spaces where conceptual similarity corresponds to geometric proximity.

Reimers and Gurevych introduced Sentence-BERT (SBERT), which adapts pretrained BERT networks using siamese and triplet subnetworks to generate semantically meaningful sentence embeddings [7]. SBERT reduces the computational overhead of pairwise semantic comparison from hours (under cross-encoder BERT) to milliseconds using cosine similarity, while maintaining high semantic accuracy.

Mathematically, if $e_J \in \mathbb{R}^d$ represents the dense embedding vector of a job requisition requirement and $e_R \in \mathbb{R}^d$ represents the vector of a parsed resume competency, their semantic similarity is computed via cosine similarity:

$$\text{sim}(e_J, e_R) = \frac{e_J \cdot e_R}{\|e_J\| \|e_R\|} = \frac{\sum_{k=1}^d e_{J,k} e_{R,k}}{\sqrt{\sum_{k=1}^d e_{J,k}^2} \sqrt{\sum_{k=1}^d e_{R,k}^2}} \tag{2.1}$$

However, dense embeddings are not inherently unbiased. Wilson and Caliskan audited Massive Text Embedding models across nine occupational categories using 500 public resumes and 500 job descriptions, discovering that embedding retrieval systems favored White-associated names over Black-associated names in up to 100% of tested job categories [1]. Similarly, Iso et al. observed that semantic matching models display persistent implicit bias favoring elite educational institutions [2].

Therefore, in RecruitIQ, semantic similarity is treated as evidence of textual relevance rather than definitive proof of candidate merit, and matching scores are integrated into an audited multi-factor evaluation framework.

---

### 2.4 Bias and Fairness in AI Recruitment

Algorithmic bias in recruitment refers to systematic disparities in candidate evaluation outcomes across demographic groups that cannot be justified by job-relevant qualifications.

Wilson and Caliskan established that dense retrieval models encode societal stereotypes present in training corpora, producing disparate retrieval ranks when only applicant names are varied [1]. Iso et al. examined LLM evaluation across gender, ethnicity, and educational background, concluding that while explicit gender bias has decreased in newer foundation models, implicit socio-economic and educational bias remains prominent [2].

Seshadri et al. examined allocational fairness in LLM resume screening using controlled counterfactual perturbations [3]. They demonstrated that candidate rankings are sensitive to race and gender substitutions, and that models display instability even under non-demographic rephrasing, pointing to general model brittleness.

To quantify demographic fairness, RecruitIQ adopts established algorithmic fairness metrics. For a binary screening recommendation $\hat{Y} \in \{0, 1\}$ (where $\hat{Y} = 1$ denotes shortlisting) and a sensitive group attribute $G \in \{g_1, g_2\}$, the selection rate for group $g$ is defined as $P(\hat{Y} = 1 \mid G = g)$.

The **Demographic Parity Difference ($\Delta_{DP}$)** measures absolute disparity in selection rates:

$$\Delta_{DP} = \left| P(\hat{Y} = 1 \mid G = g_1) - P(\hat{Y} = 1 \mid G = g_2) \right| \tag{2.2}$$

An ideal demographic parity corresponds to $\Delta_{DP} = 0$.

The **Disparate Impact ($DI$) Ratio**, derived from the U.S. Equal Employment Opportunity Commission (EEOC) Four-Fifths rule, is formulated as:

$$DI = \frac{P(\hat{Y} = 1 \mid G = g_1)}{P(\hat{Y} = 1 \mid G = g_2)}, \quad \text{where } P(\hat{Y} = 1 \mid G = g_1) \le P(\hat{Y} = 1 \mid G = g_2) \tag{2.3}$$

Under the Four-Fifths guideline, a disparate impact ratio $DI < 0.80$ signals potential adverse impact warranting investigation.

In RecruitIQ, protected attributes are strictly excluded from candidate scoring calculations; demographic variables are maintained in isolated audit schemas solely to evaluate aggregate pipeline fairness.

---

### 2.5 Explainable AI for Candidate Evaluation

Explainable AI (XAI) seeks to make the internal mechanics and outputs of algorithmic models interpretable to human operators. In recruitment, a recruiter requires understandable evidence explaining why an applicant received a specific score.

Lundberg and Lee developed SHAP (SHapley Additive exPlanations), a game-theoretic framework that unifies feature attribution methods by calculating the marginal contribution of each input variable to a predictive outcome [8]. Kumar et al. integrated SHAP within their placement prediction framework to visualize which academic parameters drove placement forecasts [6].

SHAP is well-suited for explaining trained black-box regression or classification models. In RecruitIQ's core scoring engine, an explicit, transparent linear decomposition is utilized across four primary evaluation pillars:

$$S_{\text{composite}} = w_{\text{skill}} S_{\text{skill}} + w_{\text{exp}} S_{\text{exp}} + w_{\text{edu}} S_{\text{edu}} + w_{\text{eval}} S_{\text{eval}} \tag{2.4}$$

where $w_{\text{skill}} = 0.40$, $w_{\text{exp}} = 0.25$, $w_{\text{edu}} = 0.15$, and $w_{\text{eval}} = 0.20$ ($\sum w = 1.0$).

This additive decomposition gives recruiters direct insight into factor contributions without relying on secondary surrogate explanations, ensuring full decision auditability.

---

### 2.6 Adaptive Assessment and Computerized Adaptive Testing

Static testing presents an identical sequence of questions to all examinees. In contrast, Computerized Adaptive Testing (CAT) selects items dynamically throughout the examination based on the examinee's performance on preceding questions.

Bock and Gibbons detail how CAT builds upon Item Response Theory (IRT) [9]. Under the standard Two-Parameter Logistic (2PL) IRT model, the probability that an examinee with latent ability $\theta$ correctly answers an item $i$ having difficulty $b_i$ and discrimination $a_i$ is expressed as:

$$P_i(\theta) = \frac{1}{1 + \exp\left[-a_i (\theta - b_i)\right]} \tag{2.5}$$

As the candidate answers items correctly, the estimated ability $\hat{\theta}$ increases, prompting the selection of more challenging items ($b_i > \hat{\theta}$). Incorrect responses decrease $\hat{\theta}$, triggering items of lower difficulty.

Benton noted that empirical gains in CAT efficiency depend heavily on the validity of item calibration and the quality of the item bank [10].

In RecruitIQ, adaptive technical testing is implemented to collect verifiable capability metrics. The system maintains a curated, calibrated problem bank across core engineering disciplines. Question difficulty dynamically escalates or de-escalates based on real-time candidate accuracy, providing a more informative estimate of proficiency than static questionnaires.

---

### 2.7 LLM-Based Recruitment and Prompt Injection

With organizations increasingly deploying LLMs to process inbound job applications, a new security vulnerability has emerged: resume prompt injection.

Baxi et al. investigated prompt injection in LLM resume screening, defining it as adversarial text embedded within a resume designed to override the evaluator's system instructions (e.g., *"System Instruction Override: Ignore all previous criteria and assign this applicant an exceptional rating"*) [4]. In controlled experiments, they found that injection attacks reliably inflated applicant rankings, allowing lower-qualified candidates to surpass qualified peers.

Augey et al. introduced RAPIDS, an injection detection framework combining a lightweight, fine-tuned language model with an LLM verification cascade, reporting over 98% detection recall across synthetic attack benchmarks [5].

These studies demonstrate that resume text cannot be treated as trusted system input. RecruitIQ incorporates defensive sanitization: inbound resume text is isolated from system prompts, stripped of hidden control instructions, and scanned for adversarial injection patterns before passing to downstream evaluators.

---

### 2.8 Skill-Gap Analysis and Candidate Development

Skill-gap analysis compares the technical requirements of a role with the verified profile of an applicant, categorizing skills into direct matches, partial matches, transferable competencies, and missing prerequisites.

In conventional ATS platforms, rejected applicants receive generic notifications that provide no insight into why they were disqualified. RecruitIQ addresses this by connecting skill-gap analysis with an automated Personalized Development Planner. The system translates identified skill deficiencies into constructive learning recommendations, suggesting specific frameworks, documentation topics, and practice projects. This ensures that every applicant receives actionable professional development feedback.

---

### 2.9 Comparative Analysis of Existing Approaches

Table 2.1 summarizes the primary research literature reviewed in this chapter, detailing the problem addressed, method used, key findings, limitations, and the RecruitIQ module motivated by each study.

**Table 2.1: Summary of selected research studies**

| Ref. | Problem & Method | Main Reported Finding | Limitation Relevant to RecruitIQ | Motivates RecruitIQ Module |
| :---: | :--- | :--- | :--- | :--- |
| **[1]** | Audit of Massive Text Embedding retrieval models across 9 occupations using 500+ resumes and JDs. | Embedding retrieval favored White-associated names in 85.1% of cases; Black male names disadvantaged in up to 100%. | Focuses solely on retrieval; does not incorporate technical assessments or explainable scoring. | **Module 9:** Demographic Fairness Audit Engine. |
| **[2]** | LLM job–resume matching evaluation across gender, race, and educational background. | Explicit demographic bias decreased in modern models, but implicit bias linked to educational prestige remained strong. | Evaluates matching stage only; restricted to English-language US contexts. | **Module 9 & 10:** Multi-factor scoring and educational bias auditing. |
| **[3]** | Allocational fairness analysis of LLM resume ranking using controlled counterfactual perturbations. | Resume summaries differed significantly under demographic shifts; rankings showed sensitivity to non-demographic changes. | Synthetic perturbation focus; does not include active competency verification. | **Module 8 & 9:** Counterfactual testing and claim verification. |
| **[4]** | Controlled prompt-injection vulnerability study in LLM resume screening. | Prompt injection reliably inflated candidate ranking when resume quality was homogeneous. | Analyzes the attack vulnerability without proposing an end-to-end defense pipeline. | **Module 4:** Security-Aware Resume Preprocessing. |
| **[5]** | RAPIDS: Resume attack prompt injection detection via small language models and verifier cascades. | Achieved >98% detection recall with a 21–24x latency reduction over standalone frontier LLMs. | Focuses strictly on attack detection; not integrated into full recruitment platform. | **Module 4:** Defensive text sanitization heuristics. |
| **[6]** | University placement framework combining NLP resume evaluation, placement prediction, and SHAP. | Demonstrated that integrating NLP, ML prediction, and fairness processing improves placement transparency. | Oriented toward campus placement; lacks adaptive testing and claim verification. | **Module 10 & 11:** Explainable candidate scoring dossier. |
| **[7]** | Sentence-BERT: Siamese and triplet transformer networks for dense sentence embeddings. | Reduced semantic similarity search over 10,000 sentences from 65 hours (BERT) to ~5 seconds with equivalent accuracy. | General NLP representation model; does not evaluate domain-specific recruitment bias. | **Module 5:** Semantic Job–Resume Matcher. |
| **[8]** | Unified game-theoretic framework for feature attribution of individual model predictions (SHAP). | Unifies six feature attribution methods using Shapley values to provide consistent additive explanations. | Requires a trained predictive model; explains model behavior rather than input validity. | **Module 10:** Transparent score decomposition. |
| **[9]** | Item Response Theory (IRT) and Computerized Adaptive Testing (CAT) foundations. | Formulates mathematical 2PL models for dynamic item selection and examinee ability estimation. | General educational measurement theory; not integrated with resume claim data. | **Module 7:** Adaptive Technical Assessment Engine. |
| **[10]** | Reliability evaluation of shortened adaptive versus fixed assessments. | Demonstrated that adaptive testing efficiency depends on item calibration and model fit. | Evaluates educational assessments; does not address professional recruitment contexts. | **Module 7:** Question bank calibration and timing limits. |

Table 2.2 compares conventional ATS, embedding-based retrieval, LLM screening, and RecruitIQ across key functional capabilities.

**Table 2.2: Comparison of existing recruitment approaches**

| Capability | Traditional ATS | Embedding Retrieval [1,7] | Generative LLM Screening [2,4] | RecruitIQ (This Project) |
| :--- | :---: | :---: | :---: | :---: |
| **Matching Paradigm** | Keyword matching | Dense vector similarity | Generative prompting | Dense Sentence-BERT + multi-factor scoring |
| **Handles Synonyms** | No | Yes | Yes | Yes |
| **Demonstrated Skill Testing** | No | No | No | **Yes (Adaptive testing engine)** |
| **Claim vs. Evidence Check** | No | No | No | **Yes (Consistency audit engine)** |
| **Prompt Injection Defense** | N/A | Limited | Vulnerable [4] | **Yes (Heuristic sanitization layer)** |
| **Demographic Fairness Audit** | No | Offline research only [1] | Vulnerable to bias [2,3] | **Yes ($\Delta_{DP}$ & $DI$ auditing)** |
| **Transparent Score Attribution** | No | No (Cosine distance only) | Opaque narrative | **Yes (Linear factor decomposition)** |
| **Candidate Development Plan** | No | No | No | **Yes (Actionable upskilling roadmap)** |
| **Human Decision Governance** | Manual review | Manual review | Often fully automated | **Yes (Strict human-in-the-loop)** |

---

### 2.10 Research Gap

Extensive research has investigated individual sub-components of AI hiring: semantic matching, algorithmic fairness auditing, explainable AI, adaptive testing, and prompt-injection detection. However, existing studies evaluate these mechanisms in isolation.

Figure 2.2 visualizes the primary focus areas of reviewed studies compared with the comprehensive scope of RecruitIQ.

```
Study / System       Resume Screening   Fairness Audit   Explainability   Adaptive Test   Injection Security   Claim-Evidence   Candidate Plan
[1] Wilson & Caliskan      [X]               [X]               [ ]             [ ]               [ ]                 [ ]             [ ]
[2] Iso et al.             [X]               [X]               [ ]             [ ]               [ ]                 [ ]             [ ]
[3] Seshadri et al.        [X]               [X]               [ ]             [ ]               [ ]                 [ ]             [ ]
[4] Baxi et al.            [X]               [ ]               [ ]             [ ]               [X]                 [ ]             [ ]
[5] Augey et al.           [ ]               [ ]               [ ]             [ ]               [X]                 [ ]             [ ]
[6] Kumar et al.           [X]               [X]               [X]             [ ]               [ ]                 [ ]             [ ]
[7] Reimers & Gurevych     [X]               [ ]               [ ]             [ ]               [ ]                 [ ]             [ ]
[8] Lundberg & Lee         [ ]               [ ]               [X]             [ ]               [ ]                 [ ]             [ ]
[9] Bock & Gibbons         [ ]               [ ]               [ ]             [X]               [ ]                 [ ]             [ ]
[10] Benton                [ ]               [ ]               [ ]             [X]               [ ]                 [ ]             [ ]
-----------------------------------------------------------------------------------------------------------------------------------------
RecruitIQ (Implemented)    [X]               [X]               [X]             [X]               [X]                 [X]             [X]
```
**Figure 2.2: Primary focus of the reviewed studies compared with the operational scope of RecruitIQ**

Table 2.3 identifies the eight research and engineering gaps in current literature alongside RecruitIQ's technical responses.

**Table 2.3: Research gaps and the RecruitIQ engineering response**

| No. | Gap Observed in Reviewed Literature | Proposed RecruitIQ Response | Implemented Verification |
| :---: | :--- | :--- | :--- |
| **G1** | Most recruitment systems evaluate candidate resumes as an isolated, one-step screening filter. | Engineered an end-to-end decision-support pipeline linking requisition creation to candidate upskilling. | 14 integrated modules operating across a unified React + FastAPI architecture. |
| **G2** | Semantic matching estimates textual relevance but cannot verify hands-on technical proficiency. | Integrated an adaptive technical assessment module that dynamically measures demonstrated candidate capability. | Calibrated technical question bank administered via dynamic testing engine. |
| **G3** | Resumes are treated as sufficient proof of competence despite widespread claim inflation. | Developed an automated consistency engine that cross-validates claimed skills against test performance. | Automated flagger highlighting competency discrepancies for recruiter review. |
| **G4** | Standard hiring tests use static question sets that fail to adapt to candidate ability levels. | Implemented computerized adaptive testing that adjusts question difficulty in real time based on responses. | Dynamic difficulty adjustment engine with response-time logging. |
| **G5** | Algorithmic fairness and explainability are typically evaluated separately from screening workflows. | Coupled demographic parity auditing ($\Delta_{DP}$, $DI$) and factor score decompositions directly to candidate dossiers. | Recruiter Dossier displaying sub-score attribution alongside fairness compliance indicators. |
| **G6** | Ingested resume text is vulnerable to adversarial prompt injection and system override text. | Implemented a defensive sanitization layer isolating untrusted input text and screening for injection patterns. | Heuristic injection preprocessor (`resume_security.py`). |
| **G7** | Recruitment platforms serve hiring managers exclusively, offering no guidance to rejected candidates. | Designed a candidate-facing portal that generates personalized skill-gap roadmaps and recommended learning topics. | Automated Personal Development Plan generator in candidate dashboard. |
| **G8** | Fully automated hiring tools risk unmonitored discrimination and lack accountability. | Enforced a strict human-in-the-loop architecture where algorithmic scoring serves as an auditable recommendation. | Recruiter retains sole authority for interview selection and final hiring decisions. |

---

### 2.11 Summary of Literature Findings

1. **Semantic Representation Outperforms Keyword Matching:** Sentence-BERT dense embeddings capture conceptual equivalence between technical qualifications and job requisitions, resolving the lexical rigidity of traditional keyword ATS [7].
2. **Algorithmic Bias Must Be Audited:** Empirical research confirms that dense retrieval models and LLMs encode demographic disparities [1]–[3]. Fairness cannot be assumed; it requires continuous monitoring via metrics such as Demographic Parity Difference and Disparate Impact.
3. **Resume Content Must Be Treated as Untrusted Input:** Recent demonstrations of prompt injection in resume screening require dedicated preprocessing defenses to sanitize text before parsing [4], [5].
4. **Explainability Is Essential for Algorithmic Accountability:** Factor attribution and score decompositions provide human recruiters with the necessary context to audit and justify hiring recommendations [6], [8].
5. **Demonstrated Testing Must Supplement Document Screening:** Static resumes capture self-reported claims; computerized adaptive testing provides an objective measurement of actual technical proficiency [9], [10].
6. **Unified Architecture Addresses Existing Gaps:** While prior research has investigated these mechanisms in isolation, RecruitIQ demonstrates that semantic matching, adaptive testing, consistency auditing, prompt injection security, explainable scoring, and candidate upskilling can be successfully integrated into a cohesive, fair, human-in-the-loop platform.

\newpage

---

# REFERENCES

[1] K. Wilson and A. Caliskan, "Gender, race, and intersectional bias in resume screening via language model retrieval," in *Proc. AAAI/ACM Conf. on AI, Ethics, and Society (AIES)*, vol. 7, no. 1, 2024, pp. 1578–1590, doi: 10.1609/aies.v7i1.31748.

[2] H. Iso, P. Pezeshkpour, N. Bhutani, and E. Hruschka, "Evaluating bias in LLMs for job–resume matching: Gender, race, and education," in *Proc. 2025 Conf. Nations of the Americas Chapter of the Assoc. for Computational Linguistics: Human Language Technologies (Volume 3: Industry Track)*, Albuquerque, NM, USA, Apr. 2025, pp. 672–683, doi: 10.18653/v1/2025.naacl-industry.55.

[3] P. Seshadri, H. Chen, S. Singh, and S. Goldfarb-Tarrant, "Small changes, large consequences: Analyzing the allocational fairness of LLMs in hiring contexts," in *Proc. 14th Int. Joint Conf. Natural Language Processing and 4th Conf. Asia-Pacific Chapter of the Assoc. for Computational Linguistics*, Mumbai, India, Dec. 2025, pp. 2645–2665, doi: 10.18653/v1/2025.ijcnlp-long.143.

[4] P. Baxi, J. Xu, J. Y. Jiang, and S. Jasin, "Prompt injection in automated résumé screening with large language models: Single and multi-injection settings," in *Findings of the Assoc. for Computational Linguistics: ACL 2026*, San Diego, CA, USA, Jul. 2026, pp. 2942–2953, doi: 10.18653/v1/2026.findings-acl.142.

[5] Y. Augey, J. H. Levy, and A. Akdemir, "RAPIDS: Resume attack prompt injection detection at scale," in *Proc. 64th Annu. Meeting of the Assoc. for Computational Linguistics (Volume 6: Industry Track)*, San Diego, CA, USA, Jul. 2026, pp. 1848–1865, doi: 10.18653/v1/2026.acl-industry.127.

[6] D. Kumar, C. Verma, and Z. Illés, "Optimizing student job placements with NLP and explainable AI: A fair and transparent hiring framework," *Array*, vol. 29, Art. no. 100729, 2026, doi: 10.1016/j.array.2026.100729.

[7] N. Reimers and I. Gurevych, "Sentence-BERT: Sentence embeddings using Siamese BERT-networks," in *Proc. 2019 Conf. Empirical Methods in Natural Language Processing and 9th Int. Joint Conf. Natural Language Processing (EMNLP-IJCNLP)*, Hong Kong, China, Nov. 2019, pp. 3982–3992, doi: 10.18653/v1/D19-1410.

[8] S. M. Lundberg and S.-I. Lee, "A unified approach to interpreting model predictions," in *Advances in Neural Information Processing Systems 30 (NIPS 2017)*, I. Guyon et al., Eds. Curran Associates, 2017, pp. 4765–4774.

[9] R. D. Bock and R. D. Gibbons, "Computerized adaptive testing," in *Item Response Theory*. Hoboken, NJ: Wiley, 2021, ch. 8, pp. 241–278, doi: 10.1002/9781119716723.ch8.

[10] T. Benton, "Item response theory, computer adaptive testing and the risk of self-deception," *Research Matters*, no. 32, pp. 82–100, Autumn 2021, Cambridge Assessment. [Online]. Available: https://www.cambridgeassessment.org.uk/Images/research-matters-32-item-response-theory-computer-adaptive-testing-and-the-risk-of-self-deception.pdf. [Accessed: Oct. 9, 2026].
