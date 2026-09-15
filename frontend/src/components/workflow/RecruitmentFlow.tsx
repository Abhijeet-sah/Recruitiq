import React, { useState } from 'react';
import { 
  FileText, Upload, Brain, GitCompare, HelpCircle, 
  CheckCircle2, ShieldCheck, BarChart4, UserCheck, TrendingUp,
  ArrowRight, Info
} from 'lucide-react';
import clsx from 'clsx';

interface FlowStage {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  purpose: string;
  input: string;
  processing: string;
  output: string;
}

const STAGES: FlowStage[] = [
  {
    id: 'job-desc',
    title: 'Job Requirement Extraction',
    shortDesc: 'AI parses job descriptions into structured competencies',
    icon: FileText,
    purpose: 'Transform unstructured natural language job descriptions into weighted competency targets.',
    input: 'Raw text of job description, required experience, department, and role title.',
    processing: 'Entity recognition, domain keyword extraction, and automatic importance weighting (High, Medium, Low).',
    output: 'Structured requirements table with verified skills and importance weights ready for recruiter adjustment.'
  },
  {
    id: 'resume-parsing',
    title: 'Resume Ingestion & Parsing',
    shortDesc: 'Extract skills, timeline, and education with confidence scoring',
    icon: Upload,
    purpose: 'Extract structured credentials from candidate resumes across PDF and DOCX formats.',
    input: 'Uploaded candidate resume file (.pdf, .docx).',
    processing: 'PyMuPDF and python-docx text extraction, heuristic contact detection, skill taxonomy mapping, and Parsing Confidence calculation.',
    output: 'Normalized candidate profile with contact details, experience blocks, verified degrees, and confidence score.'
  },
  {
    id: 'semantic-matching',
    title: 'Semantic Job Matching',
    shortDesc: 'Multi-dimensional vector matching beyond simple keywords',
    icon: Brain,
    purpose: 'Evaluate true competency overlap using contextual subword embeddings and cosine similarity.',
    input: 'Structured job specifications and parsed candidate background.',
    processing: 'Weighted multi-factor similarity: Skill match (40%), Experience alignment (25%), Education fit (20%), Project relevance (15%).',
    output: 'Transparent composite match score (0-100%) and dimension-by-dimension percentage breakdown.'
  },
  {
    id: 'skill-gap',
    title: 'Skill Gap Analysis',
    shortDesc: 'Categorize Strong, Moderate, and Missing competencies',
    icon: GitCompare,
    purpose: 'Identify exactly where candidate capabilities meet requirements and where training is needed.',
    input: 'Job required skills versus candidate claimed and verified competencies.',
    processing: 'Semantic threshold clustering: Strong (>=80%), Moderate (40-79%), Missing (<40%).',
    output: 'Visual badge matrix detailing Strong, Moderate, and Missing competencies.'
  },
  {
    id: 'adaptive-assessment',
    title: 'Adaptive Skill Assessment',
    shortDesc: 'Dynamic difficulty item-response testing based on live performance',
    icon: HelpCircle,
    purpose: 'Empirically verify candidate capabilities through questions that adapt in real time.',
    input: 'Job skills tested and candidate ongoing answer correctness.',
    processing: 'Item-response dynamic adjustment: correct answers advance difficulty (Beginner -> Intermediate -> Advanced); errors adjust to reinforce foundation.',
    output: 'Empirical assessment score, maximum difficulty reached, and topic-by-topic mastery breakdown.'
  },
  {
    id: 'consistency-audit',
    title: 'Skill Consistency Analysis',
    shortDesc: 'Objective cross-check of resume claims vs demonstrated evidence',
    icon: CheckCircle2,
    purpose: 'Detect alignment or evidence differences between self-reported resume claims and test results without accusatory language.',
    input: 'Self-reported proficiency claims vs empirical assessment scores.',
    processing: 'Threshold cross-verification mapping claims to evidence using neutral phrasing.',
    output: 'Consistency status (Consistent, Under-demonstrated, Stronger than claimed) with evidence observations.'
  },
  {
    id: 'fairness-audit',
    title: 'Fairness & Bias Audit',
    shortDesc: 'Controlled demographic parity and counterfactual invariant testing',
    icon: ShieldCheck,
    purpose: 'Audit hiring pipeline for demographic disparities across protected proxies without manipulating candidate scores.',
    input: 'Candidate pool outcomes grouped by controlled proxy demographics (Gender, Age group).',
    processing: 'Fairlearn metrics calculation: Selection Rate Disparities, Demographic Parity, Equal Opportunity Differences, and Counterfactual Swaps.',
    output: 'Auditing dashboard with disparity classifications (No obvious disparity, Potential disparity, Needs investigation).'
  },
  {
    id: 'explainable-ranking',
    title: 'Explainable Ranking',
    shortDesc: 'Transparent SHAP-like feature contributions and configurable weights',
    icon: BarChart4,
    purpose: 'Rank applicants clearly with configurable weights, explaining positive drivers and competency gaps.',
    input: 'Match score, assessment score, experience score, and recruiter-adjusted weights.',
    processing: 'Weighted linear combination and positive/negative factor attribution breakdown.',
    output: 'Ranked candidate roster with explainability cards showing why each score was awarded.'
  },
  {
    id: 'recruiter-decision',
    title: 'Human-in-the-Loop Decision',
    shortDesc: 'Recruiter review, candidate comparison, and shortlisting',
    icon: UserCheck,
    purpose: 'Ensure final hiring decisions remain with qualified human decision-makers supported by AI evidence.',
    input: 'Multi-factor candidate dossiers, radar comparisons, recruiter notes.',
    processing: 'Recruiter qualitative review, side-by-side comparison (2-4 candidates), and status progression.',
    output: 'Final shortlist or rejection decisions enriched with contextual notes.'
  },
  {
    id: 'dev-plan',
    title: 'Personalized Skill Plan',
    shortDesc: 'Actionable upskilling roadmap for rejected or developing candidates',
    icon: TrendingUp,
    purpose: 'Provide constructive value back to candidates by converting identified skill gaps into structured learning paths.',
    input: 'Missing and moderate competencies identified during skill-gap analysis.',
    processing: 'Curriculum mapping with realistic topic modules, estimated timelines, and practical capstone projects.',
    output: 'Personalized 3-priority learning roadmap empowering continuous candidate growth.'
  }
];

export const RecruitmentFlow: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<FlowStage>(STAGES[0]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Decision Support Pipeline
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
          The 10-Stage Explainable Recruitment Workflow
        </h2>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          RecruitIQ replaces opaque black-box screening with an end-to-end, multi-stage human-supervised evaluation process.
          Click any stage below to inspect its data contract and processing logic.
        </p>
      </div>

      {/* Horizontal Stage Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage.id === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className={clsx(
                'flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center mb-1.5',
                  isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-500 border border-slate-200'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Stage {idx + 1}</span>
              <span className="text-xs font-semibold leading-tight line-clamp-1">{stage.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Inspector */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 animate-in fade-in duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <selectedStage.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{selectedStage.title}</h3>
                <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Stage {STAGES.findIndex(s => s.id === selectedStage.id) + 1} of 10
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">{selectedStage.shortDesc}</p>
            </div>
          </div>
        </div>

        {/* 4 Quadrants: Purpose, Inputs, Processing, Outputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Info className="w-4 h-4" /> Purpose & Governance
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedStage.purpose}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2">
              <ArrowRight className="w-4 h-4" /> Expected Inputs
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedStage.input}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Brain className="w-4 h-4" /> AI & Algorithmic Processing
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedStage.processing}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" /> Deterministic Output Contract
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedStage.output}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
