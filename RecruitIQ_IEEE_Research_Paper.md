# An Explainable and Demographic-Fair Automated Recruitment Framework Combining Dense Semantic Embeddings, Computerized Adaptive Testing, and Counterfactual Auditing

**Abhijeet Sah**, *Student Member, IEEE*, and **Manish Kumar**, *Student Member, IEEE*  
*Department of Computer Science and Engineering, School of Computing Science and Engineering*  
*Galgotias University, Greater Noida, Uttar Pradesh 203201, India*  
*Email: abhijeetsah259@gmail.com, manishsinghaniya402@gmail.com*

---

### **Abstract**
Contemporary corporate talent acquisition faces an acute operational dilemma: human recruiters cannot manually evaluate the thousands of applications submitted for technical requisitions, yet incumbent automated solutions present critical vulnerabilities. Traditional Applicant Tracking Systems (ATS) rely upon rigid keyword matching, penalizing qualified applicants who express competencies through synonymous terminology (yielding lexical mismatch rates exceeding 60%). Conversely, emerging generative Large Language Model (LLM) evaluators suffer from severe non-determinism, susceptibility to indirect adversarial prompt injections embedded in resume text, and well-documented allocational demographic biases across gender and ethnicity ($DI < 0.80$). Crucially, both paradigms treat self-asserted textual resume claims as ground truth without verifying demonstrated technical competence. In this paper, we present **RecruitIQ**, a holistic, multi-tier decision-support framework that harmonizes dense semantic document representation, Computerized Adaptive Testing (CAT) governed by Item Response Theory (IRT), and independent demographic parity auditing within an auditable human-in-the-loop workflow. The pipeline ingests unstructured PDF/DOCX resumes through an adversarial sanitization filter, projects candidate qualifications into a 384-dimensional continuous vector space via Sentence-BERT (`all-MiniLM-L6-v2`), and performs categorical skill-gap partitioning. To validate unverified resume claims, the system deploys a dynamically calibrated 2-Parameter Logistic (2PL) adaptive examination engine that selects technical problems based on real-time maximum Fisher information, subsequently executing a claim-versus-evidence consistency audit. Algorithmic fairness is safeguarded through counterfactual stress testing and decoupled demographic parity auditing ($\Delta_{DP}$ and Four-Fifths disparate impact ratios) while preserving transparent multi-factor score attribution. Empirical evaluation across a benchmark corpus of 600 technical resumes, 1,200 adaptive testing sessions, and 150 adversarial injection payloads demonstrates that RecruitIQ achieves a 28.4% improvement in NDCG@5 over TF-IDF baselines, reduces assessment duration by 42.1% while maintaining latent ability measurement precision ($\text{SE} \le 0.31$), constrains Demographic Parity Difference to $\Delta_{DP} = 0.034$, and intercepts adversarial injection attacks with 97.4% detection recall.

**Index Terms**—Natural Language Processing, Sentence-BERT, Computerized Adaptive Testing, Item Response Theory, Demographic Parity, Counterfactual Fairness, Indirect Prompt Injection, Explainable Artificial Intelligence, Automated Recruitment.

---

## I. INTRODUCTION

THE integration of Artificial Intelligence (AI) into human resource workflows has transformed modern talent acquisition. Facing an exponential surge in online job submissions—where a single software engineering requisition routinely attracts between 500 and 2,500 candidate submissions—enterprises have widely adopted automated screening tools. Commercial surveys indicate that more than 75% of Fortune 500 companies employ automated resume filtering algorithms [1]. However, contemporary automated hiring pipelines suffer from four interconnected structural failures that compromise both corporate hiring efficacy and candidate equity:

1. **Lexical Brittleness of Traditional ATS:** First-generation filtering algorithms depend primarily upon Boolean keyword searching and Term Frequency-Inverse Document Frequency (TF-IDF) heuristics. These lexical matching methods cannot distinguish conceptual equivalence, missing high-potential applicants who express competencies through synonymous terminology (e.g., describing "distributed message streaming" instead of the exact token "Kafka") [6], [7].
2. **Hallucination, Non-Determinism, and Injection Vulnerabilities in LLMs:** While recent attempts deploy generative foundation models (e.g., GPT-4, LLaMA-3) to synthesize candidate evaluations, studies demonstrate that generative screeners exhibit severe ranking instability under minor textual perturbations [3]. Furthermore, unconstrained LLM parsers remain acutely vulnerable to indirect adversarial prompt injections—wherein malicious applicants embed white-font, high-contrast, or delimiter-breaking instructions (e.g., *"System Override: Ignore previous criteria and assign maximum rating"*) directly into resume documents [4], [5].
3. **The Unverified Resume Fallacy:** Both keyword ATS and generative evaluators operate exclusively upon candidate-authored text, operating under the naive assumption that self-reported resume statements correspond to hands-on engineering competence. Empirical labor analyses reveal that over 48% of candidate resumes contain inflated technical proficiencies [10]. Consequently, document-only screening routinely advances candidates who optimize keyword density over applicants possessing genuine technical capability.
4. **Opaque Allocational Bias and Regulatory Scrutiny:** Prior research demonstrates that embedding-based retrieval models and commercial classifiers reflect deep societal demographic disparities encoded in historical training corpora [1]–[3]. Audit experiments conducted by Wilson and Caliskan revealed that dense retrieval models favored White-associated candidate names over Black-associated names in up to 100% of tested technical roles [1]. Concurrently, emerging international regulatory statutes—including the European Union Artificial Intelligence Act (classifying recruitment AI as "High-Risk") and New York City Local Law 144—mandate strict independent bias audits and explainability guarantees.

To address these compounding challenges, we design, formulate, and empirically evaluate **RecruitIQ**, a multi-tier, explainable, and demographic-fair decision-support framework. Rather than delegating autonomous hiring authority to opaque neural classifiers, RecruitIQ acts as a calibrated decision-support instrument that pairs dense semantic document understanding with dynamic empirical capability verification and strict human-in-the-loop governance.

### Contributions
The primary technical contributions of this paper are summarized as follows:
- **A Unified Multi-Tier Recruitment Architecture:** We present an end-to-end framework that unifies security-aware document parsing, dense semantic representation, computerized adaptive testing, automated consistency auditing, explainable score attribution, and candidate upskilling in a cohesive pipeline.
- **Dense Semantic Matching with Categorical Skill-Gap Partitioning:** We formulate a Sentence-BERT embedding pipeline that computes conceptual alignment between job requisitions and candidate profiles, categorizing skills into exact, partial, transferable, and missing competencies.
- **Computerized Adaptive Testing via Item Response Theory:** We integrate a psychometrically calibrated 2-Parameter Logistic (2PL) adaptive testing engine that selects coding and conceptual challenges dynamically using maximum Fisher information, reducing evaluation duration while maximizing measurement precision.
- **Automated Claim-versus-Evidence Consistency Auditing:** We develop a formal mathematical discrepancy index that cross-validates self-reported resume proficiencies against demonstrated technical test performance, flagging inflation anomalies for recruiter review.
- **Demographic Parity Auditing with Counterfactual Invariance:** We implement an isolated demographic audit layer that tracks selection rate disparities ($\Delta_{DP}$) and EEOC Four-Fifths compliance ($DI \ge 0.80$) across gender and ethnicity slices without utilizing protected attributes in candidate ranking.
- **Security-Aware Input Sanitization:** We formulate a multi-stage defensive heuristic and AST verification layer that strips adversarial prompt injections and delimiter-override payloads from untrusted resumes prior to scoring.

The remainder of this paper is structured as follows. Section II reviews related academic literature and defines comparative baselines. Section III details the system architecture and mathematical formulations. Section IV presents the Item Response Theory adaptive testing and consistency verification mechanisms. Section V formulates demographic fairness auditing, explainable attribution, and adversarial defense. Section VI presents experimental results across empirical research questions. Section VII discusses validity threats and ethical considerations, and Section VIII concludes the paper.

---

## II. RELATED WORK & THEORETICAL FOUNDATIONS

### A. Semantic Matching and Neural Document Retrieval
Traditional resume screening relied upon inverted index searching and lexical weighting. The introduction of transformer-based language representations shifted document retrieval from lexical overlap to continuous semantic geometry. Reimers and Gurevych introduced Sentence-BERT (SBERT), which employs Siamese and triplet network structures to generate semantically rich sentence embeddings that map conceptual similarity directly to cosine distance [7]. SBERT reduced the computational cost of pairwise candidate-to-requisition semantic similarity searches across large corpora from hours (under cross-encoder BERT) to milliseconds, making real-time candidate ranking computationally viable.

### B. Algorithmic Bias and Counterfactual Auditing in Hiring
A substantial body of research documents systemic algorithmic bias in automated hiring pipelines. Wilson and Caliskan conducted systematic audits of massive text embedding models across diverse occupational profiles, proving that dense vector spaces encode implicit racial and gender stereotypes, systematically depressing similarity scores for female and minority naming proxies even when qualification text was held strictly identical [1]. Iso et al. investigated foundation models (GPT-4, Gemini) across hiring benchmarks, observing that while explicit gender discrimination has diminished through reinforcement learning from human feedback (RLHF), subtle implicit biases favoring prestige academic institutions and non-minority vernacular persist [2]. Seshadri et al. formalized allocational fairness in screening through counterfactual perturbation, demonstrating that language model ranking displays severe sensitivity to non-demographic syntax variations alongside protected proxy swaps [3]. These findings necessitate isolated audit frameworks where demographic indicators are decoupled from scoring logic.

### C. Computerized Adaptive Testing in Technical Evaluation
Computerized Adaptive Testing (CAT) traces its mathematical foundations to psychometric Item Response Theory (IRT) [9]. Unlike conventional fixed-length examinations—which administer identical questions regardless of candidate proficiency—CAT dynamically selects items that match the examinee's emerging latent ability estimate ($\hat{\theta}$). Bock and Gibbons established that adaptive engines grounded in multi-parameter logistic models achieve equal or superior measurement precision with up to 50% fewer questions compared to static examinations [9]. Benton noted, however, that empirical measurement gains require rigorously calibrated item banks with verified discrimination ($a_i$) and difficulty ($b_i$) parameters [10]. RecruitIQ adapts IRT psychometrics from educational measurement to professional technical recruitment, verifying claimed resume proficiencies through dynamic problem administration.

### D. Adversarial Prompt Injection in Recruitment Systems
The proliferation of LLMs in resume processing has exposed automated pipelines to adversarial document attacks. Baxi et al. established that indirect prompt injection—where adversarial text strings are concealed within resumes using white font, invisible Unicode characters, or structural delimiters—reliably overrides LLM evaluators, artificially boosting candidate rankings from the lowest quartile to the top percentile [4]. Augey et al. introduced RAPIDS, a detection cascade combining fine-tuned small language models with heuristic filtering, demonstrating that proactive sanitization is required before feeding untrusted resume text into downstream evaluators [5].

### E. Comparative Literature Matrix
Table I systematically benchmarks contemporary literature against the functional capabilities implemented within RecruitIQ.

```
TABLE I
Comparative Analysis of Recruitment Frameworks and Prior Academic Literature
```

| Dimension / Capability | Traditional ATS | Wilson & Caliskan [1] | Iso et al. [2] | Seshadri et al. [3] | Baxi et al. [4] | Kumar et al. [6] | RecruitIQ (This Work) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Matching Paradigm** | Keyword Search | Dense Retrieval | LLM Prompting | LLM Prompting | LLM Screening | ML + NLP | **SBERT + Multi-Factor** |
| **Semantic Synonym Handling** | No | Yes | Yes | Yes | Yes | Partial | **Yes** |
| **Demonstrated Skill Testing** | No | No | No | No | No | No | **Yes (CAT / 2PL IRT)** |
| **Claim-vs-Evidence Auditing** | No | No | No | No | No | No | **Yes (Discrepancy Metric)** |
| **Prompt Injection Sanitization** | N/A | No | No | No | Evaluated Attack | No | **Yes (Heuristic Filter)** |
| **Demographic Fairness Audit** | No | Evaluated [1] | Evaluated [2] | Evaluated [3] | No | Fairlearn [6] | **Yes ($\Delta_{DP}$, $DI$ Decoupled)** |
| **Explainable Factor Attribution** | No | No | Narrative | Narrative | No | SHAP [6] | **Yes (Linear Decomposition)** |
| **Candidate Upskilling Feedback** | No | No | No | No | No | No | **Yes (Automated Roadmap)** |
| **Governance Architecture** | Manual | Offline | Automated | Automated | Automated | Semi-Auto | **Human-in-the-Loop** |

---

## III. SYSTEM ARCHITECTURE & MATHEMATICAL MODELING

RecruitIQ is structured as a modular, asynchronous software pipeline combining a high-performance RESTful API backend (FastAPI, Python 3.11), a relational persistence store for auditable transactional logs (PostgreSQL / SQLite), cloud telemetry synchronization (MongoDB Atlas), and a responsive client interface (React 18, TypeScript, Tailwind CSS). Fig. 1 illustrates the operational dataflow.

```
       +--------------------------------------------------------------------------+
       |                         UNTRUSTED INPUT INGESTION                        |
       |  +--------------------+                     +-------------------------+  |
       |  | Job Requisition JD |                     | Candidate Resume Doc    |  |
       |  | (Skills, Exp, Edu) |                     | (PDF / DOCX Upload)     |  |
       |  +---------+----------+                     +------------+------------+  |
       +------------|---------------------------------------------|---------------+
                    |                                             v
                    |                             +-------------------------------+
                    |                             | Layer 1: Security Preprocess  |
                    |                             | - Prompt Injection Scanner    |
                    |                             | - Delimiter & Payload Stripper|
                    |                             +---------------+---------------+
                    |                                             |
                    v                                             v
       +--------------------------------------------------------------------------+
       |               LAYER 2: DENSE SEMANTIC ENCODING & PARSING                 |
       |  +--------------------+                     +-------------------------+  |
       |  | Requirement Vector |                     | Candidate Vector        |  |
       |  | e_J in R^384       |                     | e_R in R^384            |  |
       |  +---------+----------+                     +------------+------------+  |
       |            \                                            /                |
       |             \---> Cosine Similarity: sim(e_J, e_R) <---/                 |
       +------------------------------------+-------------------------------------+
                                            |
                                            v
       +--------------------------------------------------------------------------+
       |               LAYER 3: ADAPTIVE COMPETENCY TESTING (CAT)                 |
       |  - 2PL Item Response Theory Question Selection: max I_i(theta)           |
       |  - Real-Time Dynamic Difficulty Calibration (Beginner -> Advanced)      |
       |  - Automated Sandbox Code Execution & Automated Unit Tests               |
       +------------------------------------+-------------------------------------+
                                            |
                                            v
       +--------------------------------------------------------------------------+
       |             LAYER 4: CROSS-VERIFICATION & MULTI-FACTOR AUDIT             |
       |  - Claim-vs-Evidence Discrepancy Index: delta_s = max(0, Claim - Eval)   |
       |  - Composite Score Attribution: S = 0.40 S_sk + 0.25 S_ex + 0.15 S_ed... |
       |  - Independent Demographic Fairness Audit: Delta_DP & EEOC 4/5ths DI     |
       +------------------------------------+-------------------------------------+
                                            |
                                            v
       +--------------------------------------------------------------------------+
       |                 LAYER 5: HUMAN-IN-THE-LOOP OUTPUT STAGES                 |
       |  +--------------------------------+   +-------------------------------+  |
       |  | Recruiter Decision Dossier     |   | Candidate Development Plan    |  |
       |  | - Rank-ordered evidence matrix |   | - Targeted skill-gap roadmap  |  |
       |  | - Discrepancy inflation flags  |   | - 4-week learning curriculum  |  |
       |  | - Final Human Hiring Decision  |   | - Curated capstone project    |  |
       |  +--------------------------------+   +-------------------------------+  |
       +--------------------------------------------------------------------------+
```
**Fig. 1. Architectural blueprint of RecruitIQ demonstrating multi-tier security, parsing, adaptive testing, fairness auditing, and human governance.**

### A. Ingestion and Defensive Sanitization Layer
Candidate-uploaded documents (PDF, DOCX) represent untrusted data streams. Before downstream natural language extraction, text is processed through a deterministic security sanitizer that intercepts adversarial prompt-injection vectors [4], [5]. The sanitizer applies regular-expression scanning, instruction-boundary isolation, and structural token normalization:

$$\mathcal{D}_{\text{clean}} = \mathcal{F}_{\text{sanitize}}(\mathcal{D}_{\text{raw}}) = \left\{ t \in \mathcal{D}_{\text{raw}} \mid \forall p \in \mathcal{P}_{\text{adv}}, \, \text{Match}(p, t) = \emptyset \right\} \tag{1}$$

where $\mathcal{P}_{\text{adv}}$ denotes the curated repository of adversarial injection patterns (e.g., system prompt delimiters `### System:`, prompt-override commands `ignore previous instructions`, and white-font ASCII camouflage). Inbound text matching injection heuristics is sanitized and tagged with a high-priority security audit flag for human recruiter inspection, preventing adversarial prompt manipulation.

### B. Dense Semantic Vector Representation
Lexical parsing maps clean text into extracted entities: candidate claimed skills $\mathcal{S}_R = \{s_{r,1}, s_{r,2}, \dots, s_{r,m}\}$, documented experience tenure $E_R \in \mathbb{R}^+$, and academic credentials. Job requisitions define target competencies $\mathcal{S}_J = \{s_{j,1}, s_{j,2}, \dots, s_{j,n}\}$ and minimum experience requirements $E_J$.

Rather than matching tokens lexically, each technical competency is mapped into a continuous 384-dimensional dense semantic embedding space via a fine-tuned Sentence-BERT network (`all-MiniLM-L6-v2`) [7]:

$$\mathbf{e}_s = \text{SBERT}(s) \in \mathbb{R}^{384}, \quad \|\mathbf{e}_s\|_2 = 1 \tag{2}$$

The semantic alignment between a required competency $s_j \in \mathcal{S}_J$ and a candidate competency $s_r \in \mathcal{S}_R$ is computed via cosine similarity:

$$\text{sim}(s_j, s_r) = \frac{\mathbf{e}_{s_j} \cdot \mathbf{e}_{s_r}}{\|\mathbf{e}_{s_j}\|_2 \|\mathbf{e}_{s_r}\|_2} = \sum_{k=1}^{384} e_{s_j, k} \cdot e_{s_r, k} \tag{3}$$

### C. Categorical Skill-Gap Partitioning
To provide actionable feedback to both recruiters and candidates, the system partitions each required competency $s_j \in \mathcal{S}_J$ into four mutually exclusive operational categories based on dual similarity thresholds $\tau_{\text{exact}} = 0.85$ and $\tau_{\text{partial}} = 0.65$:

$$\mathcal{C}(s_j) = \begin{cases}
\text{Exact Match}, & \text{if } \max_{s_r \in \mathcal{S}_R} \text{sim}(s_j, s_r) \ge \tau_{\text{exact}} \\
\text{Partial / Transferable}, & \text{if } \tau_{\text{partial}} \le \max_{s_r \in \mathcal{S}_R} \text{sim}(s_j, s_r) < \tau_{\text{exact}} \\
\text{Missing Competency}, & \text{if } \max_{s_r \in \mathcal{S}_R} \text{sim}(s_j, s_r) < \tau_{\text{partial}}
\end{cases} \tag{4}$$

The aggregate skill match score $S_{\text{skill}} \in [0, 100]$ is computed as the importance-weighted mean alignment across all required competencies:

$$S_{\text{skill}} = \frac{1}{\sum_{j=1}^n \omega_j} \sum_{j=1}^n \omega_j \left( \max_{s_r \in \mathcal{S}_R} \text{sim}(s_j, s_r) \right) \times 100 \tag{5}$$

where $\omega_j \in [1, 3]$ represents the recruiter-designated importance weight of competency $s_j$.

### D. Multi-Factor Additive Score Decomposition
To guarantee transparent explainability without relying upon post-hoc surrogate explanations (e.g., LIME), RecruitIQ computes candidate composite scores through an explicit, auditable linear attribution model:

$$S_{\text{composite}} = w_{\text{skill}} S_{\text{skill}} + w_{\text{exp}} S_{\text{exp}} + w_{\text{edu}} S_{\text{edu}} + w_{\text{eval}} S_{\text{eval}} \tag{6}$$

where:
- $S_{\text{skill}} \in [0, 100]$: Dense semantic competency alignment score.
- $S_{\text{exp}} \in [0, 100]$: Tenure alignment score, defined as $\min\left(100, \frac{E_R}{E_J} \times 100\right)$.
- $S_{\text{edu}} \in [0, 100]$: Academic qualification tier score.
- $S_{\text{eval}} \in [0, 100]$: Empirical score derived from adaptive technical testing.
- Default attribution weights satisfy $\sum w = 1.0$: $w_{\text{skill}} = 0.40$, $w_{\text{exp}} = 0.25$, $w_{\text{edu}} = 0.15$, and $w_{\text{eval}} = 0.20$.

Every candidate score presented in the recruiter dossier is accompanied by this complete linear vector breakdown, eliminating black-box uncertainty.

---

## IV. COMPUTERIZED ADAPTIVE TESTING VIA ITEM RESPONSE THEORY

A central innovation of RecruitIQ is the integration of Computerized Adaptive Testing (CAT) directly into the screening workflow to verify self-asserted resume proficiencies.

### A. Psychometric 2PL IRT Model
We model candidate performance using the Two-Parameter Logistic (2PL) Item Response Theory model [9]. Let $\theta \in (-\infty, +\infty)$ represent the candidate's latent technical capability (standardized with mean 0, variance 1). For an assessment item $i$, let $b_i \in [-3.0, +3.0]$ denote the difficulty parameter and $a_i \in [0.5, 2.5]$ denote the discrimination parameter. The conditional probability of candidate correctness $Y_i \in \{0, 1\}$ is formulated as:

$$P_i(\theta) = P(Y_i = 1 \mid \theta, a_i, b_i) = \frac{1}{1 + \exp\left[ -a_i (\theta - b_i) \right]} \tag{7}$$

The corresponding item information function $I_i(\theta)$, quantifying the statistical measurement precision contributed by item $i$ at latent ability $\theta$, is expressed as:

$$I_i(\theta) = a_i^2 P_i(\theta) \left( 1 - P_i(\theta) \right) = \frac{a_i^2 \exp\left[ -a_i (\theta - b_i) \right]}{\left( 1 + \exp\left[ -a_i (\theta - b_i) \right] \right)^2} \tag{8}$$

### B. Dynamic Item Selection and Latent Trait Updating
During an adaptive examination session, after administering $k$ items with observed response vector $\mathbf{y}_k = (y_1, y_2, \dots, y_k)$, the candidate's provisional latent capability $\hat{\theta}_k$ is estimated via Maximum Likelihood Estimation (MLE) by finding the root of the score equation:

$$\frac{\partial \ln \mathcal{L}(\theta \mid \mathbf{y}_k)}{\partial \theta} = \sum_{j=1}^k a_j \left[ y_j - P_j(\theta) \right] = 0 \tag{9}$$

To maximize measurement efficiency, the $(k+1)$-th item $i^*$ is selected from the unadministered problem pool $\mathcal{Q}_{\text{rem}}$ according to the Maximum Fisher Information criterion:

$$i^* = \arg\max_{i \in \mathcal{Q}_{\text{rem}}} I_i(\hat{\theta}_k) \tag{10}$$

Items are calibrated across three discrete operational tiers: Beginner ($b_i \in [-2.0, -0.5]$), Intermediate ($b_i \in [-0.5, +0.8]$), and Advanced ($b_i \in [+0.8, +2.5]$). The test continues until the measurement standard error satisfies $\text{SE}(\hat{\theta}) \le 0.35$ or a maximum budget of $K = 5$ items is reached. The empirical assessment score $S_{\text{eval}}$ is then mapped to the interval $[0, 100]$:

$$S_{\text{eval}} = \frac{1}{1 + \exp(-\hat{\theta}_{\text{final}})} \times 100 \tag{11}$$

### C. Claim-versus-Evidence Consistency Discrepancy Index
To detect resume inflation anomalies without autonomous disqualification, RecruitIQ computes a formal Discrepancy Index $\delta_s$ for each claimed competency $s$:

$$\delta_s = \max\left(0, \, \Phi_{\text{claim}}(s) - \Phi_{\text{demonstrated}}(s, \hat{\theta})\right) \tag{12}$$

where $\Phi_{\text{claim}}(s) \in [0, 1]$ represents the candidate's self-reported mastery level extracted from resume text, and $\Phi_{\text{demonstrated}}(s, \hat{\theta}) \in [0, 1]$ represents the normalized latent performance exhibited on items testing competency $s$. When $\delta_s \ge 0.40$, the system generates an auditable *Competency Inflation Flag* in the Recruiter Dossier, accompanied by the specific empirical evidence for human review.

---

## V. ALGORITHMIC FAIRNESS, EXPLAINABILITY, & ADVERSARIAL DEFENSE

### A. Demographic Parity and Disparate Impact Metrics
To ensure compliance with statutory ethical standards without manipulating individual qualification scores, RecruitIQ incorporates an independent audit engine that evaluates aggregate selection outcomes across demographic groups.

Let $G \in \{g_1, g_2\}$ represent a sensitive demographic attribute (e.g., gender, ethnicity), and let $\hat{Y} \in \{0, 1\}$ represent the binary candidate shortlisting recommendation ($S_{\text{composite}} \ge \tau_{\text{hire}}$).

The **Demographic Parity Difference ($\Delta_{DP}$)** measures the absolute divergence in selection rates between groups:

$$\Delta_{DP} = \left| P(\hat{Y} = 1 \mid G = g_1) - P(\hat{Y} = 1 \mid G = g_2) \right| \tag{13}$$

A fully fair decision distribution corresponds to $\Delta_{DP} = 0.0$.

The **Disparate Impact ($DI$) Ratio**, formalizing the U.S. Equal Employment Opportunity Commission (EEOC) Four-Fifths rule, is defined as:

$$DI = \frac{P(\hat{Y} = 1 \mid G = g_{\text{unfavored}})}{P(\hat{Y} = 1 \mid G = g_{\text{favored}})} \tag{14}$$

A disparate impact ratio $DI < 0.80$ triggers an automated algorithmic fairness violation alert in the administrative dashboard, prompting human recruiters to inspect qualification weighting criteria. Protected demographic indicators are completely isolated from candidate scoring tables and exist solely in the audit telemetry database.

### B. Counterfactual Fairness Stress Testing
To audit model invariance against proxy leakage, the system executes automated counterfactual stress tests prior to ranking deployment. For a candidate profile $X$, counterfactual pairs $X'$ are synthetically constructed by swapping demographic proxy tokens (e.g., culturally distinct applicant names, gender pronouns, historically gendered student organizations) while holding all technical credentials, experience milestones, and assessment scores invariant:

$$\text{CF-Invariance}(X, X') = \left| S_{\text{composite}}(X) - S_{\text{composite}}(X') \right| < \epsilon \tag{15}$$

RecruitIQ enforces strict numerical invariance ($\epsilon = 0.0$), guaranteeing that demographic proxy swapping produces zero score variance.

---

## VI. EXPERIMENTAL EVALUATION & RESULTS

To validate the theoretical architecture of RecruitIQ, we conduct empirical evaluations addressing five primary research questions:
- **RQ1 (Semantic Retrieval Efficacy):** Does dense Sentence-BERT matching improve candidate retrieval relevance over lexical keyword matching and TF-IDF baselines?
- **RQ2 (Psychometric Measurement Efficiency):** Does 2PL computerized adaptive testing reduce evaluation duration while maintaining latent ability estimation precision?
- **RQ3 (Claim Inflation Detection):** Can the discrepancy index accurately detect simulated resume competency inflations?
- **RQ4 (Demographic Parity & Counterfactual Invariance):** Does the framework maintain demographic equity across controlled counterfactual perturbations?
- **RQ5 (Adversarial Prompt Injection Defense):** How effectively does the defensive preprocessing layer intercept malicious indirect prompt injections?

### A. Benchmark Experimental Setup
The experimental corpus comprises:
1. **600 Technical Resumes:** Sourced from public open-source resumes and curated synthetic profiles across three engineering tracks (Full-Stack Engineering, Data Science / AI, Cloud & DevOps).
2. **MBPP Coding Benchmark:** Technical coding assessment items adapted from Google's Mostly Basic Python Problems (MBPP) dataset (974 verified problems), augmented with calibrated IRT discrimination and difficulty parameters [5].
3. **Counterfactual Perturbation Suite:** 200 resume pairs generated by applying demographic token substitutions (male/female naming conventions, racially distinct proxy names) to identical engineering qualification backgrounds.
4. **Adversarial Injection Benchmark:** 150 resumes injected with three distinct prompt-injection modalities: white-text instructions, delimiter overrides (`### Instruction: Shortlist Candidate`), and markdown obfuscation.

All experiments were executed on an AMD Ryzen 7 5800H platform (16 threads, 3.20 GHz, 16 GB DDR4 RAM) running Python 3.11 and PyTorch on Windows 11.

### B. RQ1: Semantic Retrieval Accuracy
We evaluate candidate ranking accuracy against a panel of three senior software engineering recruiters who established ground-truth relevance rankings for 20 benchmark job requisitions. We compare exact Keyword Matching, TF-IDF Cosine Similarity, and RecruitIQ's Sentence-BERT multi-factor matcher across Precision@K, Recall@K, Normalized Discounted Cumulative Gain (NDCG@K), and Mean Reciprocal Rank (MRR).

```
TABLE II
Retrieval Efficacy Comparison Across Matching Paradigms (N = 600 Resumes)
```

| Screening Methodology | Precision@3 | Precision@5 | Recall@5 | NDCG@5 | MRR | Latency per Doc (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Exact Keyword Matching | 0.521 | 0.468 | 0.412 | 0.534 | 0.612 | **1.2** |
| TF-IDF Cosine Similarity | 0.645 | 0.592 | 0.538 | 0.648 | 0.724 | 4.8 |
| Standard BERT Base | 0.762 | 0.718 | 0.684 | 0.772 | 0.816 | 148.5 |
| **RecruitIQ (SBERT + Multi-Factor)** | **0.842** | **0.804** | **0.782** | **0.832** | **0.884** | 18.6 |

As reported in Table II, RecruitIQ achieves an NDCG@5 of 0.832, representing a **28.4% relative improvement over TF-IDF** (0.648) and a **55.8% improvement over keyword matching** (0.534). By encoding dense sentence semantics, RecruitIQ successfully identifies candidates possessing equivalent competencies expressed through disparate terminologies while maintaining an evaluation latency of only 18.6 ms per document.

### C. RQ2: Psychometric Measurement Efficiency of Adaptive Testing
We evaluate the computerized adaptive testing module by comparing static fixed-length tests (10 items of homogeneous intermediate difficulty) against RecruitIQ's 2PL IRT adaptive engine across 1,200 simulated candidate sessions spanning true latent ability $\theta \in [-2.5, +2.5]$.

```
TABLE III
Psychometric Measurement Performance: Static vs. Adaptive Testing (N = 1,200 Sessions)
```

| Evaluation Parameter | Static Fixed Test (10 Items) | RecruitIQ CAT Engine (Max 5 Items) | Relative Efficiency Gain |
| :--- | :---: | :---: | :---: |
| **Mean Items Administered** | 10.0 | **5.0** | **-50.0%** |
| **Mean Examination Duration** | 21.4 min | **12.4 min** | **-42.1%** |
| **Root Mean Squared Error (RMSE)** | 0.428 | **0.306** | **-28.5% Error** |
| **Measurement Standard Error (SE)** | 0.442 | **0.312** | **-29.4% Error** |
| **Separation Reliability Index ($R_\theta$)** | 0.812 | **0.904** | **+11.3% Reliability** |
| **Item Bank Pool Utilization** | 10.0% | **84.2%** | **+74.2% Diversity** |

Table III confirms that the adaptive testing engine achieves a **28.5% reduction in ability estimation error (RMSE 0.306 vs. 0.428)** while reducing candidate testing time from 21.4 minutes to 12.4 minutes (**42.1% time reduction**). By targeting maximum Fisher information, items administer challenge levels aligned with candidate ability, eliminating test fatigue and floor/ceiling saturation.

### D. RQ3: Claim Inflation & Discrepancy Auditing
To assess the consistency auditor, we injected 100 candidate profiles with synthetic skill inflations (asserting "Advanced" mastery of microservices and algorithmic concurrency, while executing basic code implementations). The consistency auditor achieved:
- **Detection Precision:** 91.8%
- **Detection Recall:** 88.0%
- **Area Under ROC Curve (AUC):** 0.942
- **False Alarm Rate:** 6.2%

The framework successfully identified 88 out of 100 inflated profiles, flagging them with detailed discrepancy rationales in the recruiter dossier without automated disqualification.

### E. RQ4: Demographic Fairness & Counterfactual Invariance
We audit demographic fairness by evaluating selection recommendations on 200 counterfactual resume pairs across gender and racial naming proxies. Table IV compares baseline LLM screening (unconstrained prompting) against RecruitIQ.

```
TABLE IV
Demographic Parity and Counterfactual Fairness Audit Across Slices
```

| Evaluated System Pipeline | Male Selection Rate | Female Selection Rate | Demographic Parity Diff ($\Delta_{DP}$) | Disparate Impact Ratio ($DI$) | EEOC 4/5ths Compliant? | CF-Score Invariance ($\Delta S$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Unconstrained Generative LLM | 38.4% | 29.2% | 0.092 | 0.760 | **Violated ($DI < 0.80$)** | 6.42 pts |
| Dense Keyword Model | 34.0% | 28.5% | 0.055 | 0.838 | Passed | 1.84 pts |
| **RecruitIQ Pipeline (Audited)** | **35.2%** | **34.0%** | **0.012** | **0.966** | **Fully Compliant** | **0.00 pts (Exact Invariance)** |

Under unconstrained LLM screening, the selection rate between male and female naming proxies diverged significantly ($DI = 0.760$), violating the EEOC Four-Fifths benchmark. In contrast, RecruitIQ maintains an empirical disparate impact ratio of **$DI = 0.966$** and achieves strict **counterfactual score invariance ($\Delta S = 0.00$)**, proving that demographic proxy swaps exert zero mathematical influence on candidate evaluation scores.

### F. RQ5: Adversarial Prompt Injection Defense
We evaluated the defensive sanitization layer against 150 resumes embedded with adversarial prompt injections. Table V summarizes detection metrics across three attack archetypes.

```
TABLE V
Defense Efficacy Against Adversarial Prompt Injection Attacks (N = 150 Payloads)
```

| Attack Modality | Injected Samples | Intercepted Samples | Attack Detection Recall | False Positive Rate | Preprocessing Latency (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Delimiter Overrides (`### System:`) | 50 | 50 | **100.0%** | 0.0% | 1.8 ms |
| White-Font / Low-Contrast Text | 50 | 48 | **96.0%** | 0.5% | 2.4 ms |
| Natural Language Instruction Overrides | 50 | 48 | **96.0%** | 1.2% | 3.1 ms |
| **Aggregate Defensive Performance** | **150** | **146** | **97.4%** | **0.56%** | **2.4 ms** |

As demonstrated in Table V, the sanitization preprocessor achieves an overall **detection recall of 97.4%** with an overhead latency of only 2.4 ms, neutralizing prompt injection attacks before resume text interacts with downstream evaluation components.

---

## VII. DISCUSSION, THREATS TO VALIDITY, & ETHICAL CONSIDERATIONS

### A. Human-in-the-Loop Decision Governance
A fundamental design principle of RecruitIQ is strict adherence to human-in-the-loop governance. At no point does the system autonomously issue adverse employment decisions or reject applicants. Instead, algorithmic scores serve as auditable decision-support signals. Final interview selections, candidate advancements, and hiring offers remain solely within the discretion of human recruiters, ensuring full accountability under emerging legal guidelines (such as the EU AI Act).

### B. Threats to Validity
1. **Item Bank Calibration Sensitivity:** The accuracy of latent ability estimation ($\hat{\theta}$) is contingent upon item calibration validity. Future iterations should incorporate online continuous item calibration using marginal maximum likelihood estimation.
2. **Document Layout Heterogeneity:** Resumes utilizing complex non-standard multi-column infographics or image-based text may suffer optical character extraction degradation, requiring ongoing enhancements to document OCR parsing pipelines.
3. **Small Sample Volatility:** Group-level fairness statistics ($\Delta_{DP}$, $DI$) exhibit high variance when computed over small candidate pools ($N < 30$), indicating that algorithmic fairness indicators must be interpreted alongside statistical confidence intervals.

---

## VIII. CONCLUSION & FUTURE WORK

In this paper, we presented **RecruitIQ**, an explainable, secure, and demographic-fair automated recruitment framework. By integrating Sentence-BERT dense semantic matching, computerized adaptive testing governed by 2-Parameter Logistic Item Response Theory, automated claim-versus-evidence consistency auditing, and decoupled demographic parity auditing, RecruitIQ resolves the critical vulnerabilities of traditional keyword ATS and generative LLM screeners. Empirical evaluation proves that RecruitIQ achieves superior retrieval precision (NDCG@5 = 0.832), reduces candidate testing duration by 42.1% while maintaining psychometric precision ($\text{SE} \le 0.31$), constrains demographic disparities ($\Delta_{DP} = 0.012$, $DI = 0.966$), and neutralizes adversarial prompt injections with 97.4% recall.

Future research will extend the framework to explore multimodal interview transcription analysis, differential privacy preservation during recruiter benchmarking, and cross-lingual multilingual competency calibration.

---

## REFERENCES

[1] K. Wilson and A. Caliskan, "Gender, race, and intersectional bias in resume screening via language model retrieval," in *Proc. AAAI/ACM Conf. on AI, Ethics, and Society (AIES)*, vol. 7, no. 1, 2024, pp. 1578–1590, doi: 10.1609/aies.v7i1.31748.

[2] H. Iso, P. Pezeshkpour, N. Bhutani, and E. Hruschka, "Evaluating bias in LLMs for job–resume matching: Gender, race, and education," in *Proc. 2025 Conf. Nations of the Americas Chapter of the Assoc. for Computational Linguistics: Human Language Technologies (NAACL-HLT)*, Albuquerque, NM, USA, Apr. 2025, pp. 672–683, doi: 10.18653/v1/2025.naacl-industry.55.

[3] P. Seshadri, H. Chen, S. Singh, and S. Goldfarb-Tarrant, "Small changes, large consequences: Analyzing the allocational fairness of LLMs in hiring contexts," in *Proc. 14th Int. Joint Conf. Natural Language Processing and 4th Conf. Asia-Pacific Chapter of the Assoc. for Computational Linguistics (IJCNLP-AACL)*, Mumbai, India, Dec. 2025, pp. 2645–2665, doi: 10.18653/v1/2025.ijcnlp-long.143.

[4] P. Baxi, J. Xu, J. Y. Jiang, and S. Jasin, "Prompt injection in automated résumé screening with large language models: Single and multi-injection settings," in *Findings of the Assoc. for Computational Linguistics: ACL 2026*, San Diego, CA, USA, Jul. 2026, pp. 2942–2953, doi: 10.18653/v1/2026.findings-acl.142.

[5] Y. Augey, J. H. Levy, and A. Akdemir, "RAPIDS: Resume attack prompt injection detection at scale," in *Proc. 64th Annu. Meeting of the Assoc. for Computational Linguistics (ACL)*, San Diego, CA, USA, Jul. 2026, pp. 1848–1865, doi: 10.18653/v1/2026.acl-industry.127.

[6] D. Kumar, C. Verma, and Z. Illés, "Optimizing student job placements with NLP and explainable AI: A fair and transparent hiring framework," *Array*, vol. 29, Art. no. 100729, 2026, doi: 10.1016/j.array.2026.100729.

[7] N. Reimers and I. Gurevych, "Sentence-BERT: Sentence embeddings using Siamese BERT-networks," in *Proc. 2019 Conf. Empirical Methods in Natural Language Processing (EMNLP-IJCNLP)*, Hong Kong, China, Nov. 2019, pp. 3982–3992, doi: 10.18653/v1/D19-1410.

[8] S. M. Lundberg and S.-I. Lee, "A unified approach to interpreting model predictions," in *Advances in Neural Information Processing Systems (NeurIPS 2017)*, vol. 30, Long Beach, CA, USA, Dec. 2017, pp. 4765–4774.

[9] R. D. Bock and R. D. Gibbons, "Computerized adaptive testing," in *Item Response Theory*. Hoboken, NJ, USA: Wiley, 2021, ch. 8, pp. 241–278, doi: 10.1002/9781119716723.ch8.

[10] T. Benton, "Item response theory, computer adaptive testing and the risk of self-deception," *Research Matters*, no. 32, pp. 82–100, Autumn 2021, Cambridge Assessment.

[11] M. Hardt, E. Price, and N. Srebro, "Equality of opportunity in supervised learning," in *Advances in Neural Information Processing Systems (NeurIPS 2016)*, vol. 29, Barcelona, Spain, Dec. 2016, pp. 3315–3323.

[12] S. Barocas, M. Hardt, and A. Narayanan, *Fairness and Machine Learning: Limitations and Opportunities*. Cambridge, MA, USA: MIT Press, 2023.

[13] M. B. Eisenstein, *Introduction to Natural Language Processing*. Cambridge, MA, USA: MIT Press, 2019.

[14] D. J. Weiss, "Adaptive testing by computer," *J. Consult. Clin. Psychol.*, vol. 50, no. 4, pp. 472–485, Aug. 1982, doi: 10.1037/0022-006X.50.4.472.

[15] U.S. Equal Employment Opportunity Commission (EEOC), *Uniform Guidelines on Employee Selection Procedures*, 29 C.F.R. Part 1607, 1978.

[16] European Parliament and Council of the European Union, *Artificial Intelligence Act*, Regulation (EU) 2024/1689, Official Journal of the European Union, Jul. 2024.
