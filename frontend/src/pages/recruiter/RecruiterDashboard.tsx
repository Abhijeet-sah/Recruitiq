import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Users, CheckCircle2, Award, TrendingUp, ShieldCheck, 
  Search, Filter, Eye, GitCompare, ArrowUpRight, Sparkles, ChevronRight, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import { analyticsApi, candidatesApi, jobsApi } from '../../api';
import { RecruiterDashboardAnalytics, Application, Job } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { AIQuestionGeneratorModal } from '../../components/recruiter/AIQuestionGeneratorModal';

const defaultAnalytics: RecruiterDashboardAnalytics = {
  kpis: {
    active_jobs: 0,
    total_candidates: 0,
    shortlisted: 0,
    assessments_completed: 0,
    average_match_score: 0.0,
  },
  funnel: [
    { stage: 'Applied', count: 0, percentage: 0.0 },
    { stage: 'Resume Reviewed', count: 0, percentage: 0.0 },
    { stage: 'Assessment Completed', count: 0, percentage: 0.0 },
    { stage: 'Evaluated', count: 0, percentage: 0.0 },
    { stage: 'Shortlisted', count: 0, percentage: 0.0 },
  ],
  score_distribution: [
    { range: '85-100%', count: 0 },
    { range: '70-84%', count: 0 },
    { range: '50-69%', count: 0 },
    { range: '<50%', count: 0 },
  ],
  top_skills_in_demand: [],
  common_skill_gaps: [],
  status_distribution: { Applied: 0, Reviewed: 0, Assessment: 0, Shortlisted: 0, Rejected: 0 },
  fairness_overview: {
    status: 'No Jobs Posted Yet',
    demographic_parity_gap: '0.0%',
    equal_opportunity_gap: '0.0%',
    flag: 'Post your first job to start screening candidates',
  },
};

export const RecruiterDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<RecruiterDashboardAnalytics>(defaultAnalytics);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const timer = setTimeout(() => {
      setLoading(false);
      setFetching(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    setFetching(true);
    try {
      const [analyticsData, jobsData] = await Promise.all([
        analyticsApi.getRecruiter().catch((err) => {
          console.warn('Analytics API delayed or error, using default metrics:', err);
          return defaultAnalytics;
        }),
        jobsApi.getMyJobs().catch((err) => {
          console.warn('Jobs API delayed or error, using empty list:', err);
          return [] as Job[];
        })
      ]);

      setAnalytics(analyticsData || defaultAnalytics);
      setJobs(jobsData || []);

      if (jobsData && jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id);
        const apps = await candidatesApi.getJobApplications(jobsData[0].id).catch(() => []);
        setApplications(apps || []);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err);
      setAnalytics((prev) => prev || defaultAnalytics);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const handleJobChange = async (jobId: string) => {
    if (jobId === 'ALL') {
      setSelectedJobId('ALL');
      if (jobs.length > 0) {
        const apps = await candidatesApi.getJobApplications(jobs[0].id).catch(() => []);
        setApplications(apps || []);
      }
    } else {
      const id = parseInt(jobId);
      setSelectedJobId(id);
      const apps = await candidatesApi.getJobApplications(id).catch(() => []);
      setApplications(apps || []);
    }
  };

  const toggleCompare = (appId: number) => {
    if (selectedForCompare.includes(appId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== appId));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare up to 4 candidates simultaneously.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, appId]);
    }
  };

  const handleProceedToCompare = () => {
    if (selectedForCompare.length < 2) {
      alert('Please select at least 2 candidates to compare.');
      return;
    }
    navigate('/recruiter/candidates/compare', { state: { applicationIds: selectedForCompare } });
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      (app.candidate_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.candidate_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const DONUT_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];
  const statusDist = analytics?.status_distribution || { Applied: 0, Reviewed: 0, Assessment: 0, Shortlisted: 0, Rejected: 0 };
  const statusPieData = Object.entries(statusDist).map(([name, value]) => ({
    name,
    value: value || 1
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
              Talent Acquisition Overview
            </span>
            {fetching && (
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-800/80 px-2.5 py-0.5 rounded-full border border-indigo-700/50 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Syncing data...
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Recruiter Decision Support</h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Real-time candidate pipelines, explainable match evaluations, adaptive competency metrics, and fairness audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-sm font-semibold text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> ✨ AI Question Generator
          </button>
          <Link
            to="/recruiter/jobs/new"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-xs transition-all flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> Create New Job
          </Link>
          <Link
            to={jobs.length > 0 ? `/recruiter/fairness/${jobs[0].id}` : '/recruiter/fairness'}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Fairness Audit
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Jobs"
          value={analytics.kpis.active_jobs}
          icon={Briefcase}
          color="indigo"
          subtitle="Open requisitions"
        />
        <StatCard
          title="Total Candidates"
          value={analytics.kpis.total_candidates}
          icon={Users}
          color="sky"
          trend="up"
          trendText="+14% this month"
        />
        <StatCard
          title="Avg Match Score"
          value={`${analytics.kpis.average_match_score}%`}
          icon={Award}
          color="emerald"
          subtitle="Semantic score"
        />
        <StatCard
          title="Assessments Done"
          value={analytics.kpis.assessments_completed}
          icon={CheckCircle2}
          color="amber"
          subtitle="Empirically verified"
        />
        <StatCard
          title="Shortlisted"
          value={analytics.kpis.shortlisted}
          icon={TrendingUp}
          color="indigo"
          trend="up"
          trendText="Ready for interview"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Candidate Pipeline Funnel</h3>
              <p className="text-xs text-slate-500">Conversion across evaluation stages</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              End-to-End
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.funnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} Candidates`, 'Volume']}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Application Status</h3>
            <p className="text-xs text-slate-500">Current applicant distributions</p>
          </div>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
            {statusPieData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                <span className="truncate">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Pipeline Table & Multi-Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Candidate Evaluation Roster</h3>
            <p className="text-xs text-slate-500">Live multi-factor ranking and decision support</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            {/* Job Filter */}
            <select
              value={selectedJobId}
              onChange={(e) => handleJobChange(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 py-1.5 px-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              disabled={jobs.length === 0}
            >
              {jobs.length === 0 ? (
                <option value="ALL">No jobs posted yet</option>
              ) : (
                jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))
              )}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 py-1.5 px-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ASSESSMENT_COMPLETED">Assessment Completed</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Compare Trigger Button */}
            {selectedForCompare.length > 0 && (
              <button
                onClick={handleProceedToCompare}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <GitCompare className="w-3.5 h-3.5" /> Compare ({selectedForCompare.length})
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100/75 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4 w-10 text-center">Compare</th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Semantic Match</th>
                <th className="p-4">Assessment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No jobs posted yet</p>
                    <p className="text-xs text-slate-400 mt-1">Create your first job requisition above to start receiving candidates.</p>
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No candidates found matching the active filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isSelected = selectedForCompare.includes(app.id);
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompare(app.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{app.candidate_name}</div>
                        <div className="text-xs text-slate-400">{app.candidate_email}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {app.overall_match_score != null ? `${app.overall_match_score}%` : 'Pending'}
                          </span>
                          {app.overall_match_score != null && (
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${app.overall_match_score}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={app.assessment_percentage != null && app.assessment_percentage >= 70 ? 'success' : 'neutral'}>
                          {app.assessment_percentage != null ? `${app.assessment_percentage}% Verified` : 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            app.status === 'SHORTLISTED' ? 'success' :
                            app.status === 'REJECTED' ? 'danger' :
                            app.status === 'ASSESSMENT_COMPLETED' ? 'info' : 'neutral'
                          }
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/recruiter/candidates/${app.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Evaluate Dossier
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AIQuestionGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        jobs={jobs}
        onSuccess={loadData}
      />
    </div>
  );
};
