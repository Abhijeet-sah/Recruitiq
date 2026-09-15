# RecruitIQ Fairness & Bias Auditing Methodology

## Ethical Guarantees & Constraints

> [!IMPORTANT]
> **No Protected Attributes in Scoring Models**
> Demographic proxy attributes (gender, age bracket) are strictly quarantined from all scoring, matching, and ranking algorithms. They are evaluated exclusively within the dedicated post-hoc Fairness Auditing engine.

## Auditing Metrics

RecruitIQ implements metrics aligned with Fairlearn and algorithmic fairness standards:

### 1. Demographic Parity & Selection Rate Difference
Demographic Parity evaluates whether candidate selection is independent of protected attributes:

$$\text{Selection Rate Difference} = |P(\hat{Y}=1 | A = a) - P(\hat{Y}=1 | A = b)|$$

Where:
- $\hat{Y} = 1$: Candidate meets recommendation/shortlist threshold ($\ge 70\%$).
- $A$: Protected demographic cohort (e.g., Female vs Male).

### 2. Equal Opportunity Difference
Evaluates whether qualified candidates have an equal chance of receiving a positive recommendation regardless of their group:

$$\text{Equal Opportunity Difference} = |TPR_A - TPR_B|$$

Where $TPR$ is the True Positive Rate evaluated against verified empirical assessment performance.

### 3. Disparity Status Classifications
- **No obvious disparity**: Selection rate delta $\le 8.0\%$.
- **Potential disparity**: Selection rate delta between $8.0\%$ and $15.0\%$.
- **Needs investigation**: Selection rate delta $> 15.0\%$.

### 4. Counterfactual Fairness Audit
RecruitIQ includes an interactive Counterfactual Audit tool. A candidate's demographic proxy is swapped (e.g. Female $\leftrightarrow$ Male) and passed through the scoring engine. The system confirms that:

$$\Delta_{\text{score}} = |\text{Score}_{\text{original}} - \text{Score}_{\text{counterfactual}}| = 0.0$$

Validating that demographic traits have zero impact on hiring recommendations.
