import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Plus, Trash2, ArrowRight, Briefcase, CheckCircle2, 
  AlertCircle, Loader2, ShieldCheck, Eye, Edit3, Globe, 
  Building2, DollarSign, Calendar, GraduationCap, Check, 
  Clock, HeartHandshake, HelpCircle, Send, FileCheck2, Bookmark
} from 'lucide-react';
import { jobsApi } from '../../api';
import { JobSkill, SkillImportance, JDQualityResult } from '../../types';
import { JDQualityScoreCard } from '../../components/jobs/JDQualityScoreCard';

interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'text' | 'number';
  required: boolean;
}

const JOB_TEMPLATES = [
  {
    id: 'fullstack',
    name: 'Full Stack Engineer',
    icon: '🚀',
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'Full-time',
    experienceRequired: '3-5 years',
    minSalary: 120000,
    maxSalary: 160000,
    educationRequired: "Bachelor's Degree in Computer Science or equivalent practical experience",
    skills: [
      { skill_name: 'React', is_required: true, importance_weight: 'High' as SkillImportance, category: 'Frontend' },
      { skill_name: 'Node.js', is_required: true, importance_weight: 'High' as SkillImportance, category: 'Backend' },
      { skill_name: 'TypeScript', is_required: true, importance_weight: 'High' as SkillImportance, category: 'Language' },
      { skill_name: 'PostgreSQL', is_required: true, importance_weight: 'Medium' as SkillImportance, category: 'Database' },
      { skill_name: 'Docker', is_required: false, importance_weight: 'Medium' as SkillImportance, category: 'DevOps' },
    ],
    description: `### Role Overview\nWe are looking for a Senior Full Stack Engineer to build high-performance, customer-facing web applications. You will collaborate directly with product and design to craft intuitive user experiences powered by scalable APIs.\n\n### Key Responsibilities\n- Design, develop, and maintain modern web applications with React, TypeScript, and Node.js.\n- Architect scalable REST and GraphQL APIs with clean database models.\n- Ensure high availability, code quality, and fast client-side performance.\n- Participate in code reviews, technical architecture sessions, and agile sprint planning.\n\n### Requirements\n- 3+ years of professional full-stack web development experience.\n- Deep mastery of modern JavaScript/TypeScript, React state management, and modern CSS frameworks.\n- Solid backend API design skills with Node.js, Express/Fastify, or Python frameworks.\n- Experience with relational databases (PostgreSQL/MySQL) and query optimization.\n\n### Benefits & Culture\n- 100% remote flexibility with home office stipend.\n- Comprehensive health, dental, and vision insurance.\n- Generous equity grants and 401(k) / retirement matching.\n- Annual learning & continuous education stipend.`
  },
  {
    id: 'aiml',
    name: 'AI / ML Engineer',
    icon: '🧠',
    title: 'Lead AI / Machine Learning Engineer',
    department: 'AI & Data Science',
    location: 'Hybrid / Remote',
    employmentType: 'Full-time',
    experienceRequired: '4-7 years',
    minSalary: 150000,
    maxSalary: 210000,
    educationRequired: "Master's or Bachelor's in AI, Computer Science, or Data Science",
    skills: [
      { skill_name: 'Python', is_required: true, importance_weight: 'High' as SkillImportance, category: 'Language' },
      { skill_name: 'PyTorch', is_required: true, importance_weight: 'High' as SkillImportance, category: 'AI/ML' },
      { skill_name: 'NLP / LLMs', is_required: true, importance_weight: 'High' as SkillImportance, category: 'AI/ML' },
      { skill_name: 'LangChain / RAG', is_required: true, importance_weight: 'Medium' as SkillImportance, category: 'AI' },
      { skill_name: 'FastAPI', is_required: false, importance_weight: 'Medium' as SkillImportance, category: 'Backend' },
    ],
    description: `### Role Overview\nLead our machine learning initiatives to build next-generation adaptive evaluation models, semantic embedding pipelines, and LLM-powered candidate matching engines.\n\n### Key Responsibilities\n- Fine-tune and deploy open-weight and proprietary Large Language Models (LLMs).\n- Build Retrieval-Augmented Generation (RAG) pipelines and vector search indexing.\n- Monitor model fairness, calibration, and latency in production.\n- Collaborate with backend engineers to expose low-latency inference APIs.\n\n### Requirements\n- 4+ years building production ML systems with Python and PyTorch/TensorFlow.\n- Proven track record with Transformers, embedding generation, and vector databases (Pinecone, Chroma, pgvector).\n- Strong understanding of model explainability (SHAP, LIME) and fairness metrics.\n- Experience deploying models on cloud platforms (AWS/GCP).`
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud SRE',
    icon: '☁️',
    title: 'Senior DevOps / SRE Engineer',
    department: 'Infrastructure',
    location: 'Remote',
    employmentType: 'Full-time',
    experienceRequired: '3-6 years',
    minSalary: 130000,
    maxSalary: 175000,
    educationRequired: "Bachelor's Degree in Computer Science, IT, or equivalent experience",
    skills: [
      { skill_name: 'Kubernetes', is_required: true, importance_weight: 'High' as SkillImportance, category: 'DevOps' },
      { skill_name: 'Docker', is_required: true, importance_weight: 'High' as SkillImportance, category: 'DevOps' },
      { skill_name: 'Terraform', is_required: true, importance_weight: 'High' as SkillImportance, category: 'IaC' },
      { skill_name: 'AWS / Cloud', is_required: true, importance_weight: 'High' as SkillImportance, category: 'Cloud' },
      { skill_name: 'CI/CD Pipelines', is_required: true, importance_weight: 'Medium' as SkillImportance, category: 'DevOps' },
    ],
    description: `### Role Overview\nOwn the reliability, scalability, and security of our multi-region cloud infrastructure and automated deployment pipelines.\n\n### Key Responsibilities\n- Manage container orchestration using Kubernetes (EKS/GKE) and Helm.\n- Provision infrastructure as code (IaC) using Terraform.\n- Build zero-downtime CI/CD pipelines with GitHub Actions.\n- Implement observability, telemetry, and automated alerting with Prometheus and Grafana.\n\n### Requirements\n- 3+ years managing production cloud infrastructure (AWS or GCP).\n- Deep hands-on experience with Kubernetes, Docker, and service meshes.\n- Proficiency in scripting with Python, Bash, or Go.`
  },
  {
    id: 'pm',
    name: 'Product Manager',
    icon: '💼',
    title: 'Senior Technical Product Manager',
    department: 'Product',
    location: 'Hybrid',
    employmentType: 'Full-time',
    experienceRequired: '3-5 years',
    minSalary: 125000,
    maxSalary: 165000,
    educationRequired: "Bachelor's Degree in Business, Engineering, or relevant field",
    skills: [
      { skill_name: 'Product Strategy', is_required: true, importance_weight: 'High' as SkillImportance, category: 'Product' },
      { skill_name: 'Agile / Scrum', is_required: true, importance_weight: 'High' as SkillImportance, category: 'Management' },
      { skill_name: 'User Research', is_required: true, importance_weight: 'Medium' as SkillImportance, category: 'Product' },
      { skill_name: 'SQL Analytics', is_required: false, importance_weight: 'Medium' as SkillImportance, category: 'Analytics' },
    ],
    description: `### Role Overview\nDrive the vision, discovery, and execution of our AI-assisted recruitment platform products.\n\n### Key Responsibilities\n- Define product roadmaps, requirements specifications (PRDs), and acceptance criteria.\n- Work closely with engineering and AI research teams to deliver impactful recruitment features.\n- Analyze product metrics and user engagement to prioritize high-value initiatives.\n\n### Requirements\n- 3+ years of technical product management experience in SaaS or B2B enterprise.\n- Strong analytical mindset with data-driven decision making.\n- Exceptional stakeholder communication and team leadership skills.`
  }
];

const COMMON_PERKS = [
  'Comprehensive Health & Dental Insurance',
  'Remote Office Setup Allowance',
  'Annual Learning & Conference Budget',
  '401(k) / Provident Fund Matching',
  'Stock Options / Equity Grants',
  'Flexible Unlimited PTO',
  'Gym & Wellness Reimbursement'
];

export const JobCreator: React.FC = () => {
  const navigate = useNavigate();

  // Active View Tab (Edit vs Candidate Preview)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Form Fields
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [workplaceType, setWorkplaceType] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [location, setLocation] = useState('Remote (Worldwide)');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceRequired, setExperienceRequired] = useState('3-5 years');
  const [currency, setCurrency] = useState<'USD' | 'INR' | 'EUR' | 'GBP'>('USD');
  const [minSalary, setMinSalary] = useState<number>(120000);
  const [maxSalary, setMaxSalary] = useState<number>(160000);
  const [description, setDescription] = useState('');
  const [educationRequired, setEducationRequired] = useState("Bachelor's Degree in Computer Science or equivalent");
  const [selectedPerks, setSelectedPerks] = useState<string[]>([
    'Comprehensive Health & Dental Insurance',
    'Remote Office Setup Allowance',
    'Flexible Unlimited PTO'
  ]);

  // Skills Matrix
  const [skills, setSkills] = useState<JobSkill[]>([
    { skill_name: 'Python', is_required: true, importance_weight: 'High', category: 'Core' },
    { skill_name: 'React', is_required: true, importance_weight: 'High', category: 'Frontend' },
    { skill_name: 'SQL', is_required: true, importance_weight: 'Medium', category: 'Database' }
  ]);
  const [newSkillName, setNewSkillName] = useState('');

  // Screening Questions
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([
    { id: '1', question: 'Are you authorized to work in this location without sponsorship?', type: 'yes_no', required: true },
    { id: '2', question: 'How many years of relevant production experience do you have?', type: 'number', required: true }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // AI & Processing States
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [jdQuality, setJdQuality] = useState<JDQualityResult | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Template loader
  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = JOB_TEMPLATES.find((t) => t.id === tmplId);
    if (!tmpl) return;
    setTitle(tmpl.title);
    setDepartment(tmpl.department);
    setLocation(tmpl.location);
    setEmploymentType(tmpl.employmentType);
    setExperienceRequired(tmpl.experienceRequired);
    setMinSalary(tmpl.minSalary);
    setMaxSalary(tmpl.maxSalary);
    setEducationRequired(tmpl.educationRequired);
    setSkills(tmpl.skills);
    setDescription(tmpl.description);
    setError(null);
  };

  // AI Generate Job Description
  const handleGenerateJDWithAI = () => {
    if (!title.trim()) {
      setError('Please enter a Job Title first so AI can draft the description.');
      return;
    }
    setError(null);
    setGeneratingWithAI(true);
    setTimeout(() => {
      const generated = `### Role Overview\nWe are seeking an exceptional **${title}** to join our fast-growing **${department}** team. In this role, you will lead end-to-end technical delivery, collaborate across high-impact product features, and help scale our architecture to millions of users.\n\n### Key Responsibilities\n- Design, architect, and deliver robust software components with high test coverage and clean documentation.\n- Partner with cross-functional product, design, and engineering teams to define roadmap priorities.\n- Continuously optimize application reliability, latency, and operational telemetry.\n- Mentor fellow engineers and champion modern engineering best practices.\n\n### Must-Have Qualifications\n- **${experienceRequired}** of hands-on experience in production environments.\n- Proficient in core stack: **${skills.map(s => s.skill_name).join(', ')}**.\n- Strong understanding of distributed systems, cloud computing, and automated CI/CD.\n- Degree in ${educationRequired} or proven industry track record.\n\n### What We Offer\n- Competitive compensation package with attractive equity/bonus.\n- Transparent, collaborative, and inclusive engineering culture.\n- Growth opportunities and autonomy to shape architecture decisions.`;
      setDescription(generated);
      setGeneratingWithAI(false);
    }, 600);
  };

  const handleCheckQuality = async () => {
    if (!description || description.trim().length < 20) {
      setError('Please provide job description text to audit.');
      return;
    }
    setError(null);
    setCheckingQuality(true);
    try {
      const res = await jobsApi.checkQuality({
        title,
        description,
        requirements: educationRequired,
        required_skills: skills.map((s) => s.skill_name),
        min_experience_years: parseInt(experienceRequired) || 2,
      });
      setJdQuality(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze job quality.');
    } finally {
      setCheckingQuality(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!description || description.trim().length < 20) {
      setError('Please provide a descriptive job summary (at least 20 characters) for AI extraction.');
      return;
    }
    setError(null);
    setAnalyzing(true);
    try {
      const res = await jobsApi.analyze(description, title);
      if (res.extracted_skills && res.extracted_skills.length > 0) {
        setSkills(res.extracted_skills);
      }
      if (res.experience_level) {
        setExperienceRequired(res.experience_level);
      }
      if (res.education_criteria) {
        setEducationRequired(res.education_criteria);
      }
      if (res.summary) {
        setAiSummary(res.summary);
      }
    } catch (err: any) {
      setError(err.message || 'AI job analysis degraded. Using rule-based fallback.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddSkill = (customName?: string) => {
    const nameToAdd = (customName || newSkillName).trim();
    if (!nameToAdd) return;
    if (skills.some((s) => s.skill_name.toLowerCase() === nameToAdd.toLowerCase())) return;

    setSkills([
      ...skills,
      { skill_name: nameToAdd, is_required: true, importance_weight: 'High', category: 'Technical' }
    ]);
    if (!customName) setNewSkillName('');
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleWeightChange = (idx: number, weight: SkillImportance) => {
    const updated = [...skills];
    updated[idx].importance_weight = weight;
    setSkills(updated);
  };

  const handleTogglePerk = (perk: string) => {
    if (selectedPerks.includes(perk)) {
      setSelectedPerks(selectedPerks.filter((p) => p !== perk));
    } else {
      setSelectedPerks([...selectedPerks, perk]);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setScreeningQuestions([
      ...screeningQuestions,
      { id: Date.now().toString(), question: newQuestionText.trim(), type: 'yes_no', required: true }
    ]);
    setNewQuestionText('');
  };

  const handleRemoveQuestion = (id: string) => {
    setScreeningQuestions(screeningQuestions.filter((q) => q.id !== id));
  };

  const handlePublish = async (status: 'OPEN' | 'DRAFT') => {
    if (!title.trim()) {
      setError('Job Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Job Description is required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await jobsApi.create({
        title: title.trim(),
        department: department.trim() || 'Engineering',
        location: `${location} (${workplaceType})`,
        employment_type: employmentType,
        experience_required: experienceRequired,
        min_salary: minSalary || 0,
        max_salary: maxSalary || 0,
        description: description.trim(),
        education_required: educationRequired,
        status: status,
        skills: skills.map(s => ({
          skill_name: s.skill_name,
          is_required: s.is_required,
          importance_weight: s.importance_weight || 'High',
          category: s.category || 'Technical'
        }))
      });

      setPublishSuccess(true);
      setTimeout(() => {
        navigate('/recruiter/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create job requisition.');
    } finally {
      setSubmitting(false);
    }
  };

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              Recruiter Studio
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> AI Assisted Requisitions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Post New Job Requisition
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Build high-converting job posts with intelligent skill weighting, automated assessments, and candidate previews.
          </p>
        </div>

        {/* Tab Toggle: Edit vs Candidate Preview */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" /> Requisition Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" /> Candidate View Preview
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {publishSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">Job Requisition successfully published to live candidate portal! Redirecting to dashboard...</span>
        </div>
      )}

      {/* Quick 1-Click Templates Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              1-Click Industry Templates
            </span>
          </div>
          <span className="text-xs text-slate-300">
            Load complete pre-filled job requisitions ready for publishing
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {JOB_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tmpl.id)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left text-xs font-semibold transition-all cursor-pointer text-white"
            >
              <span className="text-base">{tmpl.icon}</span>
              <span className="truncate">{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="space-y-8">
          {/* Card 1: Role Overview & Work Arrangement */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Role & Work Arrangement
              </h3>
              <span className="text-xs text-slate-400 font-medium">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Job Title *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Machine Learning Engineer, Full Stack Lead"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering, Product, Design, Sales"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Workplace Model</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Remote', 'Hybrid', 'On-site'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWorkplaceType(type)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        workplaceType === type
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location / Timezone</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote (US/EU), San Francisco, CA, Bengaluru"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Full-time">Full-time (Permanent)</option>
                  <option value="Contract">Contract / Consultant</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Experience Level Required</label>
                <input
                  type="text"
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(e.target.value)}
                  placeholder="e.g. 3-5 years, Mid-Senior level"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Education Requirement</label>
                <input
                  type="text"
                  value={educationRequired}
                  onChange={(e) => setEducationRequired(e.target.value)}
                  placeholder="e.g. Bachelor's in CS or equivalent experience"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Compensation & Benefits */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Compensation & Benefits Package
              </h3>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                {(['USD', 'INR', 'EUR', 'GBP'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      currency === curr ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Minimum Annual Salary</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    value={minSalary || ''}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Maximum Annual Salary</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    value={maxSalary || ''}
                    onChange={(e) => setMaxSalary(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Company Perks & Benefits</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {COMMON_PERKS.map((perk) => {
                  const isChecked = selectedPerks.includes(perk);
                  return (
                    <button
                      key={perk}
                      type="button"
                      onClick={() => handleTogglePerk(perk)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{perk}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 3: Job Description & AI Enhancer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Job Description</h3>
                <p className="text-xs text-slate-500">Draft your complete specification or let AI craft it from your role title</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateJDWithAI}
                  disabled={generatingWithAI}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {generatingWithAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Drafting JD...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Auto-Draft with AI
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCheckQuality}
                  disabled={checkingQuality}
                  className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {checkingQuality ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Auditing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Audit Inclusivity & Bias
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeWithAI}
                  disabled={analyzing}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting Skills...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Extract Skills with AI
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste or write detailed job specifications here. Include Responsibilities, Requirements, and Culture..."
              className="w-full p-4 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
            />

            {aiSummary && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <span className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Executive Summary:
                </span>
                {aiSummary}
              </div>
            )}

            {jdQuality && (
              <div className="mt-4">
                <JDQualityScoreCard result={jdQuality} />
              </div>
            )}
          </div>

          {/* Card 4: Skill Competencies & Weighted Match Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Skill Competencies & Semantic Weights</h3>
                <p className="text-xs text-slate-500">
                  Assign priority weights (High = Dealbreaker, Medium = Desirable, Low = Bonus) used by AI semantic matching
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {skills.length} Evaluated Skills
              </span>
            </div>

            {/* Quick add popular skills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-400 mr-1">Quick add:</span>
              {['Python', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'GraphQL', 'Machine Learning'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  + {s}
                </button>
              ))}
            </div>

            {/* Custom skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                placeholder="Type custom skill name (e.g. Next.js, Redis, PyTorch) and press Add..."
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            {/* Skill list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70"
                >
                  <div>
                    <span className="font-bold text-sm text-slate-900">{skill.skill_name}</span>
                    <span className="text-[11px] text-slate-500 block">{skill.category || 'Technical'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                      {(['High', 'Medium', 'Low'] as SkillImportance[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleWeightChange(idx, lvl)}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                            skill.importance_weight === lvl
                              ? lvl === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : lvl === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                              : 'text-slate-400 hover:text-slate-800'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Applicant Screening Questions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Applicant Screening Questions</h3>
                <p className="text-xs text-slate-500">Ask knockout questions to quickly filter qualified applicants</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuestion(); } }}
                placeholder="Add screening question (e.g. Do you have 3+ years experience with React?)..."
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            <div className="space-y-2">
              {screeningQuestions.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-sm font-medium text-slate-800">{q.question}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/recruiter/dashboard')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handlePublish('DRAFT')}
                disabled={submitting}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Bookmark className="w-4 h-4" /> Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handlePublish('OPEN')}
                disabled={submitting}
                className="flex-1 sm:flex-none px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publishing Requisition...
                  </>
                ) : (
                  <>
                    Publish Job Requisition <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: Live Candidate View Preview */
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  {department || 'Engineering'}
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                  {title || 'Untitled Job Position'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-3">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-400" /> {location} ({workplaceType})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> {employmentType}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                    {currencySymbol}{minSalary.toLocaleString()} – {currencySymbol}{maxSalary.toLocaleString()} / year
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md pointer-events-none self-start sm:self-auto"
              >
                Apply for this Position
              </button>
            </div>
          </div>

          {/* Description Preview */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900">About the Role</h4>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-6 rounded-2xl border border-slate-100">
              {description || 'No description provided yet.'}
            </div>
          </div>

          {/* Key Competencies Preview */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-slate-900">Target Competencies & Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    s.importance_weight === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : s.importance_weight === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {s.skill_name} • {s.importance_weight} Priority
                </span>
              ))}
            </div>
          </div>

          {/* Perks Preview */}
          {selectedPerks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-slate-900">Benefits & Perks</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPerks.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer inside preview */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
            >
              ← Back to Requisition Builder
            </button>
            <button
              type="button"
              onClick={() => handlePublish('OPEN')}
              disabled={submitting}
              className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              Publish this Job Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
