# RecruitIQ AI & NLP Pipeline Architecture

## 1. Resume Parsing & Entity Extraction
- **PDF Engine**: PyMuPDF (`pymupdf`) performs fast direct text stream extraction without graphical overhead.
- **DOCX Engine**: `python-docx` parses paragraphs, headers, and metadata tables.
- **Information Extracted**:
  - Contact Information (email regex, phone patterns, candidate name heuristics).
  - Experience Timeline (job titles, tenure dates, duration calculations).
  - Education (degrees mapped to hierarchical educational levels: Ph.D., Master's, Bachelor's).
  - Skills & Claimed Proficiency (keyword taxonomy search, surrounding window context for Beginner, Intermediate, Advanced, Expert classification).
- **Resume Parsing Confidence**: Composite metric based on contact completeness (25%), skills richness (30%), experience continuity (25%), and education presence (20%).

## 2. Semantic Job Matching Engine
Instead of brittle keyword matches, RecruitIQ computes a multi-dimensional semantic match score:

$$\text{Overall Match} = 0.40 \cdot \text{Skill} + 0.25 \cdot \text{Experience} + 0.20 \cdot \text{Education} + 0.15 \cdot \text{Project}$$

1. **Skill Match**: Semantic subword similarity with importance multipliers (High: 1.0, Medium: 0.7, Low: 0.4).
2. **Experience Match**: Tenure duration ratio combined with domain semantic relevance.
3. **Education Match**: Degree level distance matrix against specified minimum criteria.
4. **Project Relevance**: Cosine similarity between candidate portfolio descriptions and role specifications.

## 3. Dynamic Adaptive Assessment Engine
- **Item Response Theory (IRT) Foundation**: Question difficulty levels (`Beginner`, `Intermediate`, `Advanced`).
- **Dynamic Difficulty Calibration**:
  - Starts candidate at difficulty matched to claimed resume level (default `Intermediate`).
  - Correct answer $\rightarrow$ Difficulty increases (`Beginner` $\rightarrow$ `Intermediate` $\rightarrow$ `Advanced`).
  - Incorrect answer $\rightarrow$ Difficulty decreases or reinforces foundation.
  - Topic representation guarantees coverage of high-importance job skills.

## 4. Skill Consistency Analysis
- Evaluates self-reported resume claims against verified adaptive test results.
- Strict adherence to neutral, non-accusatory language:
  - `Consistent`: Demonstrated score aligns with claimed level.
  - `Under-demonstrated`: Current test score is lower than claimed proficiency.
  - `Stronger than claimed`: Demonstrated score significantly exceeds claimed baseline.
  - `Insufficient evidence`: Skill claimed but not tested in the assessment.

## 5. Explainable Scoring (SHAP-Like Attribution)
- Linear additive feature attribution explicitly detailing:
  - Positive score drivers (e.g. "Strong Python match (95%)").
  - Competency gaps (e.g. "Missing Docker containerization").
  - Factor point contributions based on recruiter-configured weights.
