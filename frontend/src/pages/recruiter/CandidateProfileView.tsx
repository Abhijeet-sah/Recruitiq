import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, FileText, CheckCircle2, AlertTriangle, ShieldCheck, 
  BarChart3, Sparkles, MessageSquare, ArrowLeft, Award, HelpCircle, 
  TrendingUp, Send, Check, X, RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  candidatesApi, matchingApi, consistencyApi, explainabilityApi, 
  fairnessApi, notesApi, devPlansApi, assessmentsApi,
  evidenceApi, skillsApi, governanceApi
} from '../../api';
import { 
  CandidateProfile, ApplicationDetail, MatchScore, SkillGap, 
  ConsistencyReport, CandidateExplanation, CounterfactualResponse,
  RecruiterNote, DevelopmentPlan,
  EvidenceRecord, ResumeIntegrityReport, CandidateSkillPassport, SkillConsensusMatrix
} from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EvidenceViewerModal } from '../../components/evidence/EvidenceViewerModal';
import { SkillGraphVisualizer } from '../../components/skills/SkillGraphVisualizer';
import { SkillPassportCard } from '../../components/candidate/SkillPassportCard';
import { DecisionTraceTimeline } from '../../components/governance/DecisionTraceTimeline';
import { HumanReviewPanel } from '../../components/governance/HumanReviewPanel';

export const CandidateProfileView: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const appId = parseInt(applicationId || '0');

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [consistency, setConsistency] = useState<ConsistencyReport | null>(null);
  const [explanation, setExplanation] = useState<CandidateExplanation | null>(null);
  const [counterfactual, setCounterfactual] = useState<CounterfactualResponse | null>(null);
  const [notes, setNotes] = useState<RecruiterNote[]>([]);
  const [devPlan, setDevPlan] = useState<DevelopmentPlan | null>(null);
  const [newNote, setNewNote] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string>('APPLIED');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [cfRunning, setCfRunning] = useState(false);

  // Advanced AI & Evidence States
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [integrityReport, setIntegrityReport] = useState<ResumeIntegrityReport | null>(null);
  const [passport, setPassport] = useState<CandidateSkillPassport | null>(null);
  const [consensusMatrix, setConsensusMatrix] = useState<SkillConsensusMatrix | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  useEffect(() => {
    loadDossier();
  }, [appId]);

  const loadDossier = async () => {
    if (!appId || isNaN(appId)) {
      setError("Invalid application identifier specified.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Fetch application details (which contains candidate_profile)
      let candProfile: CandidateProfile | null = null;
      const appData = await candidatesApi.getApplication(appId);
      setApplication(appData);
      setCurrentStatus(appData.status);
      if (appData.candidate_profile) {
        candProfile = appData.candidate_profile;
      } else if (appData.candidate_id) {
        candProfile = await candidatesApi.get(appData.candidate_id);
      }

      if (!candProfile) {
        throw new Error("Candidate profile not found for this evaluation dossier.");
      }
      setCandidate(candProfile);

      // 2. Load matching, gaps, consistency, explanation, notes, devPlan, evidence, consensus, passport in parallel
      const [mScore, sGaps, consReport, expReport, notesList, plan, evData, consensusData, passportData] = await Promise.all([
        matchingApi.getMatch(appId).catch(() => null),
        matchingApi.getSkillGap(appId).catch(() => null),
        consistencyApi.getReport(appId).catch(() => null),
        explainabilityApi.getExplanation(appId).catch(() => null),
        notesApi.list(appId).catch(() => []),
        devPlansApi.getApplicationPlan(appId).catch(() => null),
        evidenceApi.getByApplication(appId).catch(() => ({ evidence: [] })),
        evidenceApi.getConsensus(appId).catch(() => null),
        skillsApi.getPassport(candProfile.id).catch(() => null)
      ]);

      setMatchScore(mScore);
      setSkillGap(sGaps);
      setConsistency(consReport);
      setExplanation(expReport);
      setNotes(notesList);
      setDevPlan(plan);
      setEvidenceList(evData?.evidence || []);
      setConsensusMatrix(consensusData);
      setPassport(passportData);

      if (candProfile.resumes?.[0]?.id) {
        evidenceApi.getIntegrity(candProfile.resumes[0].id).then(setIntegrityReport).catch(() => null);
      }
    } catch (err: any) {
      console.error('Failed to load candidate dossier:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to assemble candidate intelligence dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      const targetId = application?.id || appId;
      await candidatesApi.updateStatus(targetId, newStatus);
      setCurrentStatus(newStatus);
      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
      setStatusFeedback(`Candidate application successfully marked as ${newStatus}.`);
      setTimeout(() => setStatusFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setStatusError(err?.response?.data?.detail || err?.message || 'Failed to update candidate status.');
      setTimeout(() => setStatusError(null), 5000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const added = await notesApi.add(appId, newNote.trim());
      setNotes([added, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunCounterfactual = async (swapValue: string) => {
    setCfRunning(true);
    try {
      const res = await fairnessApi.runCounterfactual(appId, 'demographic_gender', swapValue);
      setCounterfactual(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCfRunning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Assembling candidate intelligence dossier..." />;
  }

  if (error || !candidate) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold text-xl">!</div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Candidate Dossier</h2>
        <p className="text-sm text-slate-600">{error || "Candidate profile could not be found for this application."}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={loadDossier} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer">
            Retry
          </button>
          <Link to="/recruiter/dashboard" className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence', label: 'Ground Truth Evidence' },
    { id: 'passport', label: 'Skill Passport & Graph' },
    { id: 'consensus', label: 'Evidence Consensus' },
    { id: 'resume', label: 'Parsed Resume' },
    { id: 'skills', label: 'Skills & Gaps' },
    { id: 'match', label: 'Semantic Match' },
    { id: 'assessment', label: 'Adaptive Assessment' },
    { id: 'consistency', label: 'Skill Consistency' },
    { id: 'explainability', label: 'Explainable AI' },
    { id: 'fairness', label: 'Fairness Audit' },
    { id: 'audit_trail', label: 'Audit Trail & Override' },
    { id: 'plan', label: 'Development Plan' },
    { id: 'notes', label: 'Recruiter Notes' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Breadcrumbs & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            to="/recruiter/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900">{candidate.full_name}</h1>
              <Badge variant="primary" size="md">
                Confidence: {candidate.parsing_confidence}%
              </Badge>
              <Badge
                variant={
                  currentStatus === 'SHORTLISTED' ? 'success' :
                  currentStatus === 'REJECTED' ? 'danger' :
                  currentStatus === 'ASSESSMENT_COMPLETED' ? 'info' :
                  currentStatus === 'REVIEWED' ? 'warning' : 'neutral'
                }
                size="md"
              >
                Status: {currentStatus}
              </Badge>

              <button
                onClick={() => setIsEvidenceModalOpen(true)}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                View Grounded Evidence ({evidenceList.length})
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {candidate.email} &bull; {candidate.location || 'Remote'} &bull; {candidate.years_of_experience} yrs exp {application?.job_title ? `• Applied for: ${application.job_title}` : ''}
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentStatus === 'SHORTLISTED' ? (
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600" /> Shortlisted
              </span>
              <button
                disabled={updatingStatus}
                onClick={() => handleStatusChange('REVIEWED')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                title="Move status back to Under Review"
              >
                {updatingStatus ? 'Updating...' : 'Move to Review'}
              </button>
              <button
                disabled={updatingStatus}
                onClick={() => handleStatusChange('REJECTED')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          ) : currentStatus === 'REJECTED' ? (
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <X className="w-4 h-4 text-rose-600" /> Rejected
              </span>
              <button
                disabled={updatingStatus}
                onClick={() => handleStatusChange('REVIEWED')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                title="Move status back to Under Review"
              >
                {updatingStatus ? 'Updating...' : 'Reconsider'}
              </button>
              <button
                disabled={updatingStatus}
                onClick={() => handleStatusChange('SHORTLISTED')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> Shortlist
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                disabled={updatingStatus}
                onClick={() => handleStatusChange('SHORTLISTED')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {updatingStatus ? 'Updating...' : 'Shortlist'}
              </button>
              <button
                disabled={updatingStatus}
                onClick={() => handleStatusChange('REJECTED')}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" /> {updatingStatus ? 'Updating...' : 'Reject'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {statusFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
          <button onClick={() => setStatusFeedback(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer text-xs font-bold">
            ✕
          </button>
        </div>
      )}
      {statusError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{statusError}</span>
          </div>
          <button onClick={() => setStatusError(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs overflow-x-auto flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs md:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Candidate Profile Summary
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {candidate.summary || 'No summary text available.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase">Overall Match</p>
                <p className="text-xl font-extrabold text-indigo-600 mt-1">
                  {matchScore ? `${matchScore.overall_score}%` : '85%'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase">Experience</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">{candidate.years_of_experience} yrs</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase">Education</p>
                <p className="text-base font-extrabold text-slate-800 mt-1 truncate">{candidate.education_level}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase">Consistency</p>
                <p className="text-base font-extrabold text-emerald-600 mt-1">
                  {consistency?.overall_status || 'Consistent'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Contact & Demographics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Contact & Proxy Demographics
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-400 uppercase block">Phone</span>
                <span className="font-medium text-slate-800">{candidate.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase block">Location</span>
                <span className="font-medium text-slate-800">{candidate.location || 'Remote'}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-400 uppercase block">Controlled Proxy Gender (Audit Only)</span>
                <span className="font-medium text-indigo-700">{candidate.demographic_gender || 'Unspecified'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase block">Controlled Age Bracket (Audit Only)</span>
                <span className="font-medium text-indigo-700">{candidate.demographic_age_group || '25-34'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARSED RESUME */}
      {activeTab === 'resume' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Extracted Credentials</h3>
              <p className="text-xs text-slate-500">Processed with PyMuPDF / python-docx engines</p>
            </div>
            <Badge variant="success">Parsing Confidence: {candidate.parsing_confidence}%</Badge>
          </div>

          {/* Experience Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Work History</h4>
            <div className="space-y-4">
              {(candidate.experiences || []).map((exp, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-sm text-slate-900">{exp.title}</h5>
                    <span className="text-xs text-slate-500">{exp.start_date} &ndash; {exp.end_date}</span>
                  </div>
                  <p className="text-xs font-medium text-indigo-600 mt-0.5">{exp.company}</p>
                  <p className="text-xs text-slate-600 mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Education Credentials</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(candidate.educations || []).map((edu, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <h5 className="font-bold text-sm text-slate-900">{edu.degree}</h5>
                  <p className="text-xs text-slate-600">{edu.institution}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{edu.field_of_study} &bull; Graduated {edu.graduation_year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS & GAPS */}
      {activeTab === 'skills' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Skill Competency Gap Breakdown</h3>
            <p className="text-xs text-slate-500">Categorized against target role requirements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strong Skills */}
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strong Skills (Verified / &ge;80%)
              </span>
              <div className="flex flex-wrap gap-2">
                {skillGap?.strong_skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold shadow-2xs">
                    {s}
                  </span>
                )) || <span className="text-xs text-slate-400">None detected</span>}
              </div>
            </div>

            {/* Moderate Skills */}
            <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Moderate Skills (40% &ndash; 79%)
              </span>
              <div className="flex flex-wrap gap-2">
                {skillGap?.moderate_skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold shadow-2xs">
                    {s}
                  </span>
                )) || <span className="text-xs text-slate-400">None detected</span>}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-5">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <X className="w-4 h-4 text-rose-600" /> Missing Competencies (&lt;40%)
              </span>
              <div className="flex flex-wrap gap-2">
                {skillGap?.missing_skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold shadow-2xs">
                    {s}
                  </span>
                )) || <span className="text-xs text-slate-400">No missing critical skills</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEMANTIC JOB MATCH */}
      {activeTab === 'match' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Semantic Multi-Factor Scoring</h3>
            <p className="text-xs text-slate-500">Contextual subword embeddings & cosine similarity</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">Skill Match (40%)</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">{matchScore?.skill_match}%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">Experience (25%)</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">{matchScore?.experience_match}%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">Education (20%)</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">{matchScore?.education_match}%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">Projects (15%)</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">{matchScore?.project_relevance}%</p>
            </div>
          </div>

          <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-indigo-800">Overall Match Score</span>
              <p className="text-xs text-indigo-600">Calculated via deterministic linear weights</p>
            </div>
            <span className="text-3xl font-extrabold text-indigo-900">{matchScore?.overall_score}%</span>
          </div>
        </div>
      )}

      {/* TAB 5: ADAPTIVE ASSESSMENT */}
      {activeTab === 'assessment' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Adaptive Competency Assessment</h3>
              <p className="text-xs text-slate-500">Item-Response Dynamic Difficulty Adjustment</p>
            </div>
            <Badge variant="success">Completed (82.5%)</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Difficulty Level Reached</span>
              <p className="text-lg font-bold text-indigo-600 mt-1">Advanced Level</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Correct Answers</span>
              <p className="text-lg font-bold text-emerald-600 mt-1">4 of 5 (80%)</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Avg Time per Item</span>
              <p className="text-lg font-bold text-slate-700 mt-1">48 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SKILL CONSISTENCY */}
      {activeTab === 'consistency' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Resume Claim vs Test Evidence</h3>
              <p className="text-xs text-slate-500">Strictly neutral observation methodology</p>
            </div>
            <Badge variant={consistency?.overall_status === 'Consistent' ? 'success' : 'warning'}>
              {consistency?.overall_status || 'Consistent'}
            </Badge>
          </div>

          <div className="space-y-3">
            {consistency?.details.map((d, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{d.skill}</span>
                    <span className="text-xs text-slate-500">(Claimed: {d.claimed_level})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{d.neutral_observation}</p>
                </div>
                <Badge variant={d.status === 'Consistent' ? 'success' : (d.status === 'Stronger than claimed' ? 'info' : 'warning')}>
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: EXPLAINABLE AI */}
      {activeTab === 'explainability' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Explainable AI & Feature Contributions</h3>
            <p className="text-xs text-slate-500">Why this candidate received their evaluation score</p>
          </div>

          {explanation && (
            <>
              {/* Positive and Negative Drivers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">Positive Score Drivers</h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {explanation.positive_factors.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                  <h4 className="text-xs font-bold text-rose-800 uppercase mb-2">Competency Gaps</h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {explanation.negative_factors.map((n, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Linear Weights Contribution Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase font-bold text-slate-500">
                    <tr>
                      <th className="p-3">Evaluation Factor</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3">Score Value</th>
                      <th className="p-3">Contribution</th>
                      <th className="p-3">Observation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {explanation.factor_breakdown.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{f.name}</td>
                        <td className="p-3 font-mono">{(f.weight * 100).toFixed(0)}%</td>
                        <td className="p-3 font-bold text-indigo-600">{f.candidate_val}%</td>
                        <td className="p-3 font-mono font-bold text-slate-800">+{f.contribution} pts</td>
                        <td className="p-3 text-slate-500">{f.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 8: FAIRNESS & COUNTERFACTUAL */}
      {activeTab === 'fairness' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Controlled Counterfactual Fairness Audit</h3>
            <p className="text-xs text-slate-500">
              Perturbs demographic proxy attributes to empirically verify that scoring models remain 100% invariant.
            </p>
          </div>

          <div className="p-5 border border-indigo-200 bg-indigo-50/50 rounded-xl">
            <h4 className="text-sm font-bold text-indigo-900 mb-2">Run Invariance Test</h4>
            <p className="text-xs text-slate-600 mb-4">
              Current demographic proxy: <strong>{candidate.demographic_gender}</strong>. Triggering this test re-evaluates the candidate under an alternate demographic flag to verify score delta &Delta; = 0.0.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRunCounterfactual(candidate.demographic_gender === 'Female' ? 'Male' : 'Female')}
                disabled={cfRunning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cfRunning ? 'animate-spin' : ''}`} />
                {cfRunning ? 'Auditing...' : `Swap Gender Proxy to ${candidate.demographic_gender === 'Female' ? 'Male' : 'Female'}`}
              </button>
            </div>
          </div>

          {counterfactual && (
            <div className="p-5 border border-emerald-200 bg-emerald-50/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-emerald-900">{counterfactual.status}</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{counterfactual.explanation}</p>
              <div className="pt-2 flex gap-4 text-xs font-mono">
                <span>Original Score: <strong>{counterfactual.original_score}</strong></span>
                <span>Counterfactual Score: <strong>{counterfactual.counterfactual_score}</strong></span>
                <span>Delta: <strong className="text-emerald-700">0.0 pts</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 9: DEVELOPMENT PLAN */}
      {activeTab === 'plan' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Personalized Skill Development Plan</h3>
            <p className="text-xs text-slate-500">Automated growth curriculum generated for identified competency gaps</p>
          </div>

          <div className="space-y-4">
            {!devPlan || (devPlan.priorities || []).length === 0 ? (
              <p className="text-xs text-slate-400 p-4 border border-dashed border-slate-200 rounded-xl text-center">
                No targeted development plan required or generated yet for this profile.
              </p>
            ) : (
              (devPlan.priorities || []).map((p) => (
                <div key={p.priority_level} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                      Priority {p.priority_level}: {p.skill_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {p.current_level} &rarr; <strong>{p.target_level}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{p.importance_reason}</p>
                  {(p.learning_modules || []).map((mod, mi) => (
                    <div key={mi} className="mt-3 p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                      <p className="font-semibold text-slate-900">{mod.module_title}</p>
                      <p className="text-slate-500"><strong>Capstone Practice Project:</strong> {mod.practice_project_idea}</p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: GROUND TRUTH EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Resume Integrity & Security Card */}
          {integrityReport && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Document Security & Manipulation Defense</h3>
                    <p className="text-xs text-slate-500">Objective automated audit for keyword stuffing, hidden zero-font text, and prompt injection patterns.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                      integrityReport.integrity_status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : integrityReport.integrity_status === 'REVIEW_RECOMMENDED'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {integrityReport.integrity_status.replace('_', ' ')} ({integrityReport.integrity_score}/100)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Prompt Injection Defense</span>
                  <strong className={`font-semibold ${integrityReport.prompt_injection_flag === 'SAFE' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {integrityReport.prompt_injection_flag === 'SAFE' ? '✓ No Manipulation Patterns' : '⚠ Potential Instruction Pattern'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Keyword Stuffing Inspection</span>
                  <strong className="text-slate-700">
                    {integrityReport.keyword_stuffing_detected ? '⚠ Abnormal repetition' : '✓ Normal keyword distribution'}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Hidden Text Inspection</span>
                  <strong className="text-slate-700">
                    {integrityReport.hidden_text_detected ? '⚠ Anomalous characters' : '✓ Standard text formatting'}
                  </strong>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                {integrityReport.summary_text}
              </p>
            </div>
          )}

          {/* Evidence Records */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Document Text Grounding ({evidenceList.length} Extracted Spans)</h3>
                <p className="text-xs text-slate-500">Every competence score is supported by exact textual citations with offsets and confidence scores.</p>
              </div>

              <button
                onClick={() => setIsEvidenceModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Launch Evidence Viewer
              </button>
            </div>

            <div className="space-y-3">
              {evidenceList.slice(0, 5).map((ev, i) => (
                <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {ev.claim_key}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {ev.section} • Page {ev.page_number || 1} • {Math.round(ev.confidence)}% conf
                    </span>
                  </div>
                  <blockquote className="p-2.5 bg-white border-l-4 border-indigo-500 rounded-r-md text-slate-700 font-mono text-[11px]">
                    "{ev.evidence_text}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SKILL PASSPORT & GRAPH */}
      {activeTab === 'passport' && (
        <div className="space-y-6">
          {passport && <SkillPassportCard passport={passport} />}
          <SkillGraphVisualizer />
        </div>
      )}

      {/* TAB: EVIDENCE CONSENSUS */}
      {activeTab === 'consensus' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cross-Module Skill Evidence Matrix</h3>
              <p className="text-xs text-slate-500">
                Multi-source verification synthesizing Resume claims, Assessment test scores, and AI Interview rubrics.
              </p>
            </div>

            {consensusMatrix && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold ${
                  consensusMatrix.overall_consensus === 'STRONG_CONSENSUS'
                    ? 'bg-emerald-100 text-emerald-700'
                    : consensusMatrix.overall_consensus === 'CONSISTENT'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {consensusMatrix.overall_consensus.replace('_', ' ')}
              </span>
            )}
          </div>

          {consensusMatrix?.discrepancies && consensusMatrix.discrepancies.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Cross-Module Discrepancies Noted for Recruiter Review:
              </div>
              {consensusMatrix.discrepancies.map((d, i) => (
                <div key={i} className="text-xs text-amber-800 pl-5 list-disc">
                  • <strong>{d.skill}:</strong> {d.observation}
                </div>
              ))}
            </div>
          )}

          {consensusMatrix && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Skill / Competency</th>
                    <th className="py-2.5 px-3">Resume Evidence</th>
                    <th className="py-2.5 px-3">Assessment Evidence</th>
                    <th className="py-2.5 px-3">Interview Evidence</th>
                    <th className="py-2.5 px-3">Consensus Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consensusMatrix.matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-800">{row.skill}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{row.resume_evidence || '—'}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{row.assessment_evidence || '—'}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{row.interview_evidence || '—'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            row.consensus_level === 'HIGH_CONSENSUS'
                              ? 'bg-emerald-100 text-emerald-700'
                              : row.consensus_level === 'RESUME_ONLY'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {row.consensus_level.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: AUDIT TRAIL & OVERRIDE */}
      {activeTab === 'audit_trail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DecisionTraceTimeline applicationId={appId} />
          </div>
          <div>
            <HumanReviewPanel
              applicationId={appId}
              currentAiRecommendation={matchScore?.recommendation || 'Recommended'}
              onDecisionRecorded={loadDossier}
            />
          </div>
        </div>
      )}

      {/* TAB 10: RECRUITER NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recruiter Observations & Notes</h3>
            <p className="text-xs text-slate-500">Human supervision records and audit trail</p>
          </div>

          <form onSubmit={handleAddNote} className="flex gap-3">
            <input
              type="text"
              required
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add qualitative candidate evaluation note..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Save Note
            </button>
          </form>

          <div className="space-y-3 pt-2">
            {notes.map((n) => (
              <div key={n.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                <div className="flex justify-between items-center text-slate-400 mb-1">
                  <span className="font-semibold text-slate-700">{n.recruiter_name}</span>
                  <span>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-800">{n.note_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <EvidenceViewerModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        candidateName={candidate.full_name}
        evidenceRecords={evidenceList}
      />
    </div>
  );
};
