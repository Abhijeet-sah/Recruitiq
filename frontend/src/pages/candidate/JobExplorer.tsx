import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, Clock, DollarSign, Search, Filter, 
  ArrowRight, CheckCircle2, AlertCircle, Send 
} from 'lucide-react';
import { jobsApi, candidatesApi } from '../../api';
import { Job } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const JobExplorer: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsApi.list();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    setMessage(null);
    try {
      const app = await candidatesApi.apply(selectedJob.id, coverLetter);
      setMessage({ type: 'success', text: `Successfully applied to ${selectedJob.title}! Semantic match computed.` });
      setTimeout(() => {
        setSelectedJob(null);
        setCoverLetter('');
        navigate('/candidate/dashboard');
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Unable to submit application.' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading open engineering opportunities..." />;
  }

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || j.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['ALL', ...Array.from(new Set(jobs.map(j => j.department)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Career Opportunities
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Explore Open Roles
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Apply to positions matching your competencies. Our system provides transparent feedback and skill development plans.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title, technology, keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="text-xs rounded-xl border border-slate-300 py-2 px-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 sm:w-56"
        >
          {departments.map(d => (
            <option key={d} value={d}>
              {d === 'ALL' ? 'All Departments' : d}
            </option>
          ))}
        </select>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  <span className="text-xs font-semibold text-indigo-600">{job.department}</span>
                </div>
                <Badge variant="primary">{job.employment_type}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {job.experience_required}
                </span>
                {job.min_salary && (
                  <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    ${(job.min_salary / 1000).toFixed(0)}k &ndash; ${(job.max_salary! / 1000).toFixed(0)}k
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {job.description}
              </p>

              {/* Skills required */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {job.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                      s.importance_weight === 'High'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s.skill_name}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedJob(job)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Apply for Role <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Apply: ${selectedJob.title}`}
        >
          <div className="space-y-4">
            {message && (
              <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{message.text}</span>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-2">
                Your profile credentials will be automatically matched against role requirements:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
                <p><strong>Department:</strong> {selectedJob.department}</p>
                <p><strong>Experience Benchmark:</strong> {selectedJob.experience_required}</p>
                <p><strong>Required Education:</strong> {selectedJob.education_required}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Optional Cover Letter / Note to Recruiter
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Highlight key engineering contributions or projects relevant to this role..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={applying}
                onClick={handleApply}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
