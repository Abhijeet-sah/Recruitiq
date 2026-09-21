export type UserRole = 'RECRUITER' | 'CANDIDATE' | 'ADMIN';

export type ApplicationStatus = 
  | 'APPLIED' 
  | 'REVIEWED' 
  | 'ASSESSMENT_PENDING' 
  | 'ASSESSMENT_COMPLETED' 
  | 'EVALUATED' 
  | 'SHORTLISTED' 
  | 'REJECTED';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type SkillImportance = 'High' | 'Medium' | 'Low';

export type ConsistencyStatus = 
  | 'Consistent' 
  | 'Under-demonstrated' 
  | 'Stronger than claimed' 
  | 'Insufficient evidence';

export type RecommendationType = 
  | 'Highly Recommended' 
  | 'Recommended' 
  | 'Consider with Upskilling' 
  | 'Not Recommended';

export type DisparityFlag = 
  | 'No obvious disparity' 
  | 'Potential disparity' 
  | 'Needs investigation';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  candidate_profile_id?: number | null;
  recruiter_profile_id?: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface JobSkill {
  id?: number;
  skill_name: string;
  is_required: boolean;
  importance_weight: SkillImportance;
  category: string;
}

export interface Job {
  id: number;
  recruiter_id: number;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_required: string;
  min_salary?: number;
  max_salary?: number;
  description: string;
  education_required: string;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  created_at: string;
  skills: JobSkill[];
  application_count?: number;
}

export interface CandidateSkill {
  id?: number;
  skill_name: string;
  level: string;
  verified: boolean;
}

export interface Experience {
  id?: number;
  company: string;
  title: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  graduation_year?: string;
  gpa?: string;
}

export interface ResumeSummary {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  parsing_confidence: number;
  created_at?: string;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  years_of_experience: number;
  education_level: string;
  demographic_gender?: string;
  demographic_age_group?: string;
  parsing_confidence: number;
  skills: CandidateSkill[];
  experiences: Experience[];
  educations: Education[];
  resumes?: ResumeSummary[];
  recent_resume?: ResumeSummary;
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  status: ApplicationStatus;
  cover_letter?: string;
  applied_at: string;
  job_title?: string;
  company_name?: string;
  candidate_name?: string;
  candidate_email?: string;
  overall_match_score?: number;
  assessment_percentage?: number;
}

export interface ApplicationDetail extends Application {
  candidate_profile?: CandidateProfile;
}

export interface MatchScore {
  application_id: number;
  overall_score: number;
  skill_match: number;
  experience_match: number;
  education_match: number;
  project_relevance: number;
  recommendation?: string;
  breakdown?: {
    skill_breakdown?: Record<string, { importance: string; similarity: number }>;
    weights?: { skill: number; experience: number; education: number; project: number };
  };
}

export interface SkillGap {
  application_id: number;
  strong_skills: string[];
  moderate_skills: string[];
  missing_skills: string[];
}

export interface TestCaseClient {
  input: string;
  expected: string;
}

export interface CodeRunResult {
  case_number: number;
  input_repr: string;
  expected_repr: string;
  actual_repr?: string | null;
  passed: boolean;
  error?: string | null;
  execution_time_ms: number;
}

export interface CodeRunResponse {
  passed: boolean;
  passed_count: number;
  total_count: number;
  all_passed: boolean;
  test_results: CodeRunResult[];
  error?: string | null;
}

export interface TestCaseExample {
  id?: number;
  input: string;
  output: string;
  explanation?: string;
}

export interface AssessmentQuestionClient {
  id: number;
  question_text: string;
  question_type: string;
  options: string[];
  skill_tested: string;
  difficulty: DifficultyLevel;
  starter_code?: string | null;
  language?: string | null;
  test_cases?: TestCaseClient[] | null;
  title?: string | null;
  description?: string | null;
  examples?: TestCaseExample[] | null;
  constraints?: string[] | null;
  starter_templates?: Record<string, string> | null;
  hints?: string[] | null;
}

export interface AssessmentStartResponse {
  attempt_id: number;
  assessment_id: number;
  title: string;
  max_time_minutes: number;
  current_question_index: number;
  total_questions_planned: number;
  current_difficulty: DifficultyLevel;
  question: AssessmentQuestionClient;
}

export interface AnswerSubmitResponse {
  attempt_id: number;
  is_completed: boolean;
  current_question_index: number;
  total_questions_planned: number;
  current_difficulty: DifficultyLevel;
  next_question?: AssessmentQuestionClient | null;
  result?: {
    total_score: number;
    max_score: number;
    percentage: number;
    difficulty_reached: DifficultyLevel;
    total_questions: number;
    correct_count: number;
    topic_performance: Record<string, number>;
  } | null;
}

export interface ConsistencyDetail {
  skill: string;
  claimed_level: string;
  demonstrated_percentage: number;
  assessment_evidence: string;
  status: ConsistencyStatus;
  neutral_observation: string;
}

export interface ConsistencyReport {
  application_id: number;
  overall_status: ConsistencyStatus;
  consistency_score: number;
  summary_text: string;
  details: ConsistencyDetail[];
}

export interface ExplainabilityFactor {
  name: string;
  weight: number;
  candidate_val: number;
  contribution: number;
  impact: 'positive' | 'neutral' | 'negative';
  explanation: string;
}

export interface CandidateExplanation {
  candidate_id: number;
  application_id: number;
  overall_score: number;
  positive_factors: string[];
  negative_factors: string[];
  factor_breakdown: ExplainabilityFactor[];
  summary_narrative: string;
  is_llm_generated: boolean;
}

export interface DemographicMetric {
  group_name: string;
  total_candidates: number;
  selected_count: number;
  selection_rate: number;
  avg_score: number;
  true_positive_rate: number;
  false_positive_rate: number;
}

export interface FairnessAudit {
  job_id: number;
  job_title: string;
  audit_category: string;
  selection_rate_group_a: number;
  selection_rate_group_b: number;
  selection_rate_difference: number;
  demographic_parity_diff: number;
  equal_opportunity_diff: number;
  disparity_flag: DisparityFlag;
  summary_text: string;
  metrics_table: DemographicMetric[];
  audit_date: string;
  methodology_note: string;
}

export interface CounterfactualResponse {
  application_id: number;
  candidate_id: number;
  candidate_name: string;
  attribute_tested: string;
  original_value: string;
  counterfactual_value: string;
  original_score: number;
  counterfactual_score: number;
  score_delta: number;
  outcome_changed: boolean;
  status: string;
  explanation: string;
}

export interface CandidateRanking {
  id: number;
  rank: number;
  candidate_id: number;
  application_id: number;
  candidate_name: string;
  candidate_email: string;
  overall_score: number;
  match_score: number;
  assessment_score: number;
  experience_score: number;
  skill_relevance_score: number;
  project_score: number;
  recommendation: RecommendationType;
  fairness_flag: string;
  status: string;
}

export interface RankingWeights {
  match_score: number;
  assessment_score: number;
  experience_score: number;
  skill_relevance_score: number;
  project_score: number;
}

export interface LearningModule {
  module_title: string;
  recommended_topics: string[];
  practice_project_idea: string;
  estimated_weeks: number;
}

export interface SkillDevelopmentPriority {
  priority_level: number;
  skill_name: string;
  current_level: string;
  target_level: string;
  importance_reason: string;
  learning_modules: LearningModule[];
}

export interface DevelopmentPlan {
  candidate_id: number;
  target_role: string;
  generated_at: string;
  priorities: SkillDevelopmentPriority[];
}

export interface RecruiterNote {
  id: number;
  application_id: number;
  recruiter_id: number;
  recruiter_name: string;
  note_text: string;
  created_at: string;
}

export interface RecruiterDashboardAnalytics {
  kpis: {
    active_jobs: number;
    total_candidates: number;
    shortlisted: number;
    assessments_completed: number;
    average_match_score: number;
  };
  funnel: Array<{ stage: string; count: number; percentage: number }>;
  score_distribution: Array<{ range: string; count: number }>;
  top_skills_in_demand: Array<{ skill: string; count: number }>;
  common_skill_gaps: Array<{ skill: string; count: number }>;
  status_distribution: Record<string, number>;
  fairness_overview: {
    status: string;
    demographic_parity_gap: string;
    equal_opportunity_gap: string;
    flag: string;
  };
}

export interface AdminDashboardAnalytics {
  total_users: number;
  total_candidates: number;
  total_recruiters: number;
  total_jobs: number;
  total_applications: number;
  total_assessments_taken: number;
  ai_service_status: Record<string, string>;
  recent_activity: Array<{ action: string; detail: string; timestamp: string }>;
}

// ==========================================
// Advanced AI & Evidence Grounding Types
// ==========================================

export interface EvidenceRecord {
  id?: number;
  claim_type: string;
  claim_key: string;
  source_type: string;
  source_document: string;
  section: string;
  page_number: number;
  evidence_text: string;
  char_start?: number;
  char_end?: number;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface ResumeIntegrityReport {
  resume_id: number;
  integrity_status: 'VERIFIED' | 'REVIEW_RECOMMENDED' | 'HIGH_RISK';
  integrity_score: number;
  keyword_stuffing_detected: boolean;
  hidden_text_detected: boolean;
  prompt_injection_flag: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';
  summary_text: string;
  findings: string[];
}

export interface SkillNode {
  id: string;
  label: string;
  category: string;
}

export interface SkillEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface SkillGraphData {
  nodes: SkillNode[];
  edges: SkillEdge[];
}

export interface SkillTransferabilityResult {
  required_skill: string;
  status: string;
  direct_match: boolean;
  transferability_score: number;
  matched_via?: string;
  explanation: string;
}

export interface VerifiedSkillItem {
  skill: string;
  raw_name: string;
  category: string;
  resume_verified: boolean;
  assessment_verified: boolean;
  interview_verified: boolean;
  proficiency_level: string;
  verification_status: string;
}

export interface CandidateSkillPassport {
  candidate_id: number;
  candidate_name: string;
  passport_id: string;
  issue_date: string;
  verified_skills_count: number;
  verified_skills: VerifiedSkillItem[];
  blockchain_audit_hash: string;
}

export interface SkillConsensusRow {
  skill: string;
  resume_evidence: string;
  assessment_evidence: string;
  interview_evidence: string;
  consensus_level: string;
  confidence: number;
}

export interface SkillConsensusMatrix {
  overall_consensus: string;
  matrix: SkillConsensusRow[];
  discrepancies: Array<{ skill: string; claim: string; assessment_demonstrated: string; observation: string }>;
  discrepancy_count: number;
}

export interface DecisionTraceItem {
  id: number;
  application_id: number;
  timestamp: string;
  actor_type: string;
  actor_id?: number;
  action_name: string;
  service_used: string;
  model_version: string;
  input_summary: string;
  output_summary: Record<string, any>;
  reasoning_text: string;
}

export interface ModelItem {
  model_name: string;
  version: string;
  type: string;
  status: string;
  dimension?: number;
  lru_cache_entries?: number;
  fallback_available?: boolean;
  fallback_name?: string;
  purpose: string;
  estimation_method?: string;
  features?: string[];
  metrics?: string[];
}

export interface ModelRegistryStatus {
  timestamp: string;
  models: ModelItem[];
}

export interface ThresholdCurvePoint {
  threshold: number;
  total_selected: number;
  overall_selection_rate: number;
  disparate_impact_ratio: number;
  four_fifths_compliant: boolean;
  demographic_parity_diff: number;
  [key: string]: any;
}

export interface ThresholdSimulationResult {
  category: string;
  group_a: string;
  group_b: string;
  total_candidates: number;
  is_small_sample: boolean;
  sample_size_warning?: string;
  recommended_threshold: number;
  simulation_curve: ThresholdCurvePoint[];
}

export interface CounterfactualSimulationPoint {
  perturbed_attribute: string;
  perturbed_value: string;
  resulting_score: number;
  score_delta: number;
  invariant: boolean;
}

export interface CounterfactualAuditResult {
  candidate_id: number;
  candidate_name: string;
  audited_attribute: string;
  original_attribute_value: string;
  baseline_score: number;
  is_counterfactually_fair: boolean;
  max_score_delta: number;
  audit_conclusion: string;
  simulations: CounterfactualSimulationPoint[];
}

export interface JDFinding {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  message: string;
  suggestion: string;
}

export interface JDQualityResult {
  overall_quality_score: number;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT';
  inclusivity_score: number;
  realism_score: number;
  clarity_score: number;
  word_count: number;
  findings_count: number;
  findings: JDFinding[];
}

