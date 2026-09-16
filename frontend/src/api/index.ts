import api from './client';
import * as T from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<T.AuthResponse> => {
    const res = await api.post<T.AuthResponse>('/auth/login', { email, password });
    return res.data;
  },
  register: async (payload: { email: string; password: string; full_name: string; role: T.UserRole }): Promise<T.AuthResponse> => {
    const res = await api.post<T.AuthResponse>('/auth/register', payload);
    return res.data;
  },
  getMe: async (): Promise<T.User> => {
    const res = await api.get<T.User>('/auth/me');
    return res.data;
  },
  forgotPassword: async (email: string): Promise<{
    message: string;
    email_sent: boolean;
    mode: string;
    reset_url?: string;
    reset_token?: string;
  }> => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token: string, new_password: string): Promise<{ message: string }> => {
    const res = await api.post('/auth/reset-password', { token, new_password });
    return res.data;
  },
};

export const jobsApi = {
  list: async (params?: { query?: string; department?: string; location?: string }): Promise<T.Job[]> => {
    const res = await api.get<T.Job[]>('/jobs', { params });
    return res.data;
  },
  getMyJobs: async (): Promise<T.Job[]> => {
    const res = await api.get<T.Job[]>('/jobs/my');
    return res.data;
  },
  get: async (id: number): Promise<T.Job> => {
    const res = await api.get<T.Job>(`/jobs/${id}`);
    return res.data;
  },
  create: async (job: Partial<T.Job>): Promise<T.Job> => {
    const res = await api.post<T.Job>('/jobs', job);
    return res.data;
  },
  update: async (id: number, job: Partial<T.Job>): Promise<T.Job> => {
    const res = await api.put<T.Job>(`/jobs/${id}`, job);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },
  analyze: async (description: string, title?: string) => {
    const res = await api.post('/jobs/analyze', { description, title });
    return res.data;
  },
  checkQuality: async (payload: { title?: string; description?: string; requirements?: string; required_skills?: string[]; min_experience_years?: number }): Promise<T.JDQualityResult> => {
    const res = await api.post<T.JDQualityResult>('/jobs/quality-check', payload);
    return res.data;
  },
  checkQualityById: async (id: number): Promise<T.JDQualityResult> => {
    const res = await api.get<T.JDQualityResult>(`/jobs/${id}/quality-check`);
    return res.data;
  },
};

export const resumesApi = {
  upload: async (file: File, candidate_id?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (candidate_id) {
      formData.append('candidate_id', candidate_id.toString());
    }
    const res = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },
  get: async (id: number) => {
    const res = await api.get(`/resumes/${id}`);
    return res.data;
  },
};

export const candidatesApi = {
  list: async (params?: { query?: string; skill?: string; min_experience?: number; blind?: boolean }): Promise<T.CandidateProfile[]> => {
    const res = await api.get<T.CandidateProfile[]>('/candidates', { params });
    return res.data;
  },
  getMyProfile: async (): Promise<T.CandidateProfile> => {
    const res = await api.get<T.CandidateProfile>('/candidates/me');
    return res.data;
  },
  get: async (id: number): Promise<T.CandidateProfile> => {
    const res = await api.get<T.CandidateProfile>(`/candidates/${id}`);
    return res.data;
  },
  update: async (id: number, profile: Partial<T.CandidateProfile>): Promise<T.CandidateProfile> => {
    const res = await api.put<T.CandidateProfile>(`/candidates/${id}`, profile);
    return res.data;
  },
  apply: async (job_id: number, cover_letter?: string): Promise<T.Application> => {
    const res = await api.post<T.Application>('/applications', { job_id, cover_letter });
    return res.data;
  },
  getMyApplications: async (): Promise<T.Application[]> => {
    const res = await api.get<T.Application[]>('/applications/my');
    return res.data;
  },
  getJobApplications: async (job_id: number): Promise<T.Application[]> => {
    const res = await api.get<T.Application[]>(`/applications/job/${job_id}`);
    return res.data;
  },
  updateStatus: async (id: number, status: T.ApplicationStatus): Promise<T.Application> => {
    const res = await api.put<T.Application>(`/applications/${id}/status`, { status });
    return res.data;
  },
  getApplication: async (id: number): Promise<T.ApplicationDetail> => {
    const res = await api.get<T.ApplicationDetail>(`/applications/${id}`);
    return res.data;
  },
};

export const matchingApi = {
  analyze: async (application_id: number): Promise<T.MatchScore> => {
    const res = await api.post<T.MatchScore>(`/matching/analyze/${application_id}`);
    return res.data;
  },
  getMatch: async (application_id: number): Promise<T.MatchScore> => {
    const res = await api.get<T.MatchScore>(`/matching/applications/${application_id}/match`);
    return res.data;
  },
  getSkillGap: async (application_id: number): Promise<T.SkillGap> => {
    const res = await api.get<T.SkillGap>(`/matching/applications/${application_id}/skill-gap`);
    return res.data;
  },
};

export const assessmentsApi = {
  start: async (application_id: number): Promise<T.AssessmentStartResponse> => {
    const res = await api.post<T.AssessmentStartResponse>(`/assessments/start/${application_id}`);
    return res.data;
  },
  submitAnswer: async (attempt_id: number, question_id: number, answer: any, time_spent_seconds: number = 0): Promise<T.AnswerSubmitResponse> => {
    const res = await api.post<T.AnswerSubmitResponse>(`/assessments/attempts/${attempt_id}/answer`, {
      question_id,
      candidate_answer: answer,
      time_spent_seconds,
    });
    return res.data;
  },
  getResults: async (attempt_id: number) => {
    const res = await api.get(`/assessments/attempts/${attempt_id}/results`);
    return res.data;
  },
  runCode: async (question_id: number, code: string, language?: string): Promise<T.CodeRunResponse> => {
    const res = await api.post<T.CodeRunResponse>(`/assessments/questions/${question_id}/run-code`, {
      code,
      language,
    });
    return res.data;
  },
  generateAIQuestions: async (
    jobId: number,
    payload: { skills?: string[]; count?: number; difficulty?: string; question_type?: string }
  ) => {
    const res = await api.post(`/assessments/jobs/${jobId}/generate-ai-questions`, payload);
    return res.data;
  },
  importBenchmarkPool: async (
    jobId: number,
    payload: { count?: number; difficulty?: string; skill?: string }
  ) => {
    const res = await api.post(`/assessments/jobs/${jobId}/import-benchmark-pool`, payload);
    return res.data;
  },
};

export const consistencyApi = {
  getReport: async (application_id: number): Promise<T.ConsistencyReport> => {
    const res = await api.get<T.ConsistencyReport>(`/consistency/${application_id}`);
    return res.data;
  },
};

export const explainabilityApi = {
  getExplanation: async (application_id: number): Promise<T.CandidateExplanation> => {
    const res = await api.get<T.CandidateExplanation>(`/explainability/application/${application_id}`);
    return res.data;
  },
};

export const fairnessApi = {
  getAudit: async (job_id: number, category: string = 'Gender'): Promise<T.FairnessAudit> => {
    const res = await api.get<T.FairnessAudit>(`/fairness/${job_id}`, { params: { category } });
    return res.data;
  },
  runCounterfactual: async (application_id: number, attribute_to_swap: string, new_value: string): Promise<T.CounterfactualResponse> => {
    const res = await api.post<T.CounterfactualResponse>('/fairness/counterfactual', {
      application_id,
      attribute_to_swap,
      new_value,
    });
    return res.data;
  },
};

export const rankingsApi = {
  getRankings: async (job_id: number, weights?: T.RankingWeights): Promise<T.CandidateRanking[]> => {
    const res = await api.post<T.CandidateRanking[]>(`/rankings/job/${job_id}`, weights);
    return res.data;
  },
};

export const comparisonApi = {
  compare: async (application_ids: number[]) => {
    const res = await api.post('/comparison/compare', application_ids);
    return res.data;
  },
};

export const devPlansApi = {
  getApplicationPlan: async (application_id: number): Promise<T.DevelopmentPlan> => {
    const res = await api.get<T.DevelopmentPlan>(`/development-plans/application/${application_id}`);
    return res.data;
  },
  getCandidatePlan: async (candidate_id: number): Promise<T.DevelopmentPlan> => {
    const res = await api.get<T.DevelopmentPlan>(`/development-plans/candidate/${candidate_id}`);
    return res.data;
  },
};

export const interviewsApi = {
  start: async (application_id: number) => {
    const res = await api.post(`/interviews/start/${application_id}`);
    return res.data;
  },
  answer: async (question_id: number, candidate_response: string) => {
    const res = await api.post(`/interviews/questions/${question_id}/answer`, { candidate_response });
    return res.data;
  },
  getSession: async (session_id: number) => {
    const res = await api.get(`/interviews/${session_id}`);
    return res.data;
  },
};

export const notesApi = {
  add: async (application_id: number, note_text: string): Promise<T.RecruiterNote> => {
    const res = await api.post<T.RecruiterNote>(`/notes/${application_id}`, { note_text });
    return res.data;
  },
  list: async (application_id: number): Promise<T.RecruiterNote[]> => {
    const res = await api.get<T.RecruiterNote[]>(`/notes/${application_id}`);
    return res.data;
  },
};

export const analyticsApi = {
  getRecruiter: async (): Promise<T.RecruiterDashboardAnalytics> => {
    const res = await api.get<T.RecruiterDashboardAnalytics>('/analytics/recruiter');
    return res.data;
  },
  getAdmin: async (): Promise<T.AdminDashboardAnalytics> => {
    const res = await api.get<T.AdminDashboardAnalytics>('/analytics/admin');
    return res.data;
  },
};

export const adminApi = {
  listUsers: async (): Promise<T.User[]> => {
    const res = await api.get<T.User[]>('/admin/users');
    return res.data;
  },
  toggleUser: async (user_id: number) => {
    const res = await api.put(`/admin/users/${user_id}/toggle-status`);
    return res.data;
  },
  getSkills: async () => {
    const res = await api.get('/admin/skills');
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
};

export const evidenceApi = {
  getByApplication: async (applicationId: number): Promise<{ application_id: number; count: number; evidence: T.EvidenceRecord[] }> => {
    const res = await api.get(`/evidence/${applicationId}`);
    return res.data;
  },
  getIntegrity: async (resumeId: number): Promise<T.ResumeIntegrityReport> => {
    const res = await api.get<T.ResumeIntegrityReport>(`/evidence/integrity/${resumeId}`);
    return res.data;
  },
  scanText: async (text: string): Promise<T.ResumeIntegrityReport> => {
    const res = await api.post<T.ResumeIntegrityReport>('/evidence/scan', { text });
    return res.data;
  },
  getConsensus: async (applicationId: number): Promise<T.SkillConsensusMatrix> => {
    const res = await api.get<T.SkillConsensusMatrix>(`/evidence/consensus/${applicationId}`);
    return res.data;
  },
};

export const skillsApi = {
  getGraph: async (): Promise<T.SkillGraphData> => {
    const res = await api.get<T.SkillGraphData>('/skills/graph');
    return res.data;
  },
  transferability: async (candidateSkills: string[], targetSkill: string): Promise<T.SkillTransferabilityResult> => {
    const res = await api.post<T.SkillTransferabilityResult>('/skills/transferability', {
      candidate_skills: candidateSkills,
      target_skill: targetSkill,
    });
    return res.data;
  },
  getPassport: async (candidateId: number): Promise<T.CandidateSkillPassport> => {
    const res = await api.get<T.CandidateSkillPassport>(`/skills/passport/${candidateId}`);
    return res.data;
  },
};

export const governanceApi = {
  getTraces: async (applicationId: number): Promise<T.DecisionTraceItem[]> => {
    const res = await api.get<T.DecisionTraceItem[]>(`/governance/traces/${applicationId}`);
    return res.data;
  },
  getModels: async (): Promise<T.ModelRegistryStatus> => {
    const res = await api.get<T.ModelRegistryStatus>('/governance/models');
    return res.data;
  },
  getDrifts: async () => {
    const res = await api.get('/governance/drifts');
    return res.data;
  },
  submitOverride: async (data: {
    application_id: number;
    ai_recommendation: string;
    human_decision: string;
    override_reason: string;
  }) => {
    const res = await api.post('/governance/overrides', data);
    return res.data;
  },
};

export const fairnessLabApi = {
  simulateThreshold: async (payload: {
    job_id: number;
    category?: string;
    min_thresh?: number;
    max_thresh?: number;
    step?: number;
  }): Promise<T.ThresholdSimulationResult> => {
    const res = await api.post<T.ThresholdSimulationResult>('/fairness-lab/simulate-threshold', payload);
    return res.data;
  },
  runCounterfactual: async (payload: {
    candidate_id: number;
    job_id: number;
    attribute_to_perturb: string;
    simulated_values?: string[];
  }): Promise<T.CounterfactualAuditResult> => {
    const res = await api.post<T.CounterfactualAuditResult>('/fairness-lab/counterfactual-rerun', payload);
    return res.data;
  },
};

export const researchApi = {
  getExperiments: async () => {
    const res = await api.get('/research/experiments');
    return res.data;
  },
  runTransformerBenchmark: async () => {
    const res = await api.post('/research/run-transformer-benchmark');
    return res.data;
  },
  runAdaptiveBenchmark: async () => {
    const res = await api.post('/research/run-adaptive-benchmark');
    return res.data;
  },
};

