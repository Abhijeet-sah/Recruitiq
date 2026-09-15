import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Plus, Trash2, ArrowRight, Briefcase, CheckCircle2, 
  Layers, AlertCircle, Loader2, Sliders, ShieldCheck 
} from 'lucide-react';
import { jobsApi } from '../../api';
import { JobSkill, SkillImportance, JDQualityResult } from '../../types';
import { Badge } from '../../components/common/Badge';
import { JDQualityScoreCard } from '../../components/jobs/JDQualityScoreCard';

export const JobCreator: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote / Hybrid');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceRequired, setExperienceRequired] = useState('3-5 years');
  const [minSalary, setMinSalary] = useState<number>(120000);
  const [maxSalary, setMaxSalary] = useState<number>(160000);
  const [description, setDescription] = useState('');
  const [educationRequired, setEducationRequired] = useState("Bachelor's Degree in Computer Science or equivalent");
  const [skills, setSkills] = useState<JobSkill[]>([
    { skill_name: 'Python', is_required: true, importance_weight: 'High', category: 'Core' },
    { skill_name: 'SQL', is_required: true, importance_weight: 'High', category: 'Database' }
  ]);

  // AI Analysis & Quality state
  const [analyzing, setAnalyzing] = useState(false);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [jdQuality, setJdQuality] = useState<JDQualityResult | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSkillName, setNewSkillName] = useState('');

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
      if (res.extracted_skills) {
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

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      { skill_name: newSkillName.trim(), is_required: true, importance_weight: 'Medium', category: 'Technical' }
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleWeightChange = (idx: number, weight: SkillImportance) => {
    const updated = [...skills];
    updated[idx].importance_weight = weight;
    setSkills(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please fill in all required job fields.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const newJob = await jobsApi.create({
        title,
        department,
        location,
        employment_type: employmentType,
        experience_required: experienceRequired,
        min_salary: minSalary,
        max_salary: maxSalary,
        description,
        education_required: educationRequired,
        status: 'OPEN',
        skills
      });
      navigate('/recruiter/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create job requisition.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Job Requisition Module
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Create New Job with AI Extraction
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Draft job specifications, trigger AI requirement extraction, and configure importance weights.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Metadata Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Role Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Machine Learning Engineer"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Experience Level Required</label>
              <input
                type="text"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                placeholder="e.g. 3-5 years"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Education Requirement</label>
              <input
                type="text"
                value={educationRequired}
                onChange={(e) => setEducationRequired(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Description & AI Extraction Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Job Description</h3>
              <p className="text-xs text-slate-500">Provide description or paste raw text to trigger AI extraction</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCheckQuality}
                disabled={checkingQuality}
                className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {checkingQuality ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Auditing Quality...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Audit Quality & Inclusivity
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={analyzing}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Analyze Job with AI
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            rows={6}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste complete job description here. Mention required languages, tools, databases, and responsibilities..."
            className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
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

        {/* Extracted Requirements & Skill Weighting Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Skill Competencies & Weights</h3>
              <p className="text-xs text-slate-500">
                Adjust importance (High, Medium, Low) to configure the semantic matching weights
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {skills.length} Competencies
            </span>
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add additional skill (e.g. Redis, Kubernetes)..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Skill List with Weight Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60"
              >
                <div>
                  <span className="font-semibold text-sm text-slate-900">{skill.skill_name}</span>
                  <span className="text-[10px] text-slate-400 block">{skill.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Weight Toggle Buttons */}
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                    {(['High', 'Medium', 'Low'] as SkillImportance[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleWeightChange(idx, lvl)}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all ${
                          skill.importance_weight === lvl
                            ? lvl === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : lvl === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Requisition */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Publishing Job...' : 'Publish Job Requisition'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
