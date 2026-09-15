import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, Info, ArrowLeft, RefreshCw, 
  BarChart3, CheckCircle2, Sliders 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend 
} from 'recharts';
import { fairnessApi, jobsApi } from '../../api';
import { FairnessAudit, Job, DisparityFlag } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SelectionThresholdSimulator } from '../../components/fairness/SelectionThresholdSimulator';

export const FairnessDashboard: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();

  const [audit, setAudit] = useState<FairnessAudit | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(jobId ? parseInt(jobId) : null);
  const [category, setCategory] = useState<string>('Gender');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedJobId, category]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobsData = await jobsApi.getMyJobs();
      setJobs(jobsData);

      if (jobsData.length === 0) {
        setAudit(null);
        setLoading(false);
        return;
      }

      let targetJobId = selectedJobId;
      if (!targetJobId || !jobsData.some(j => j.id === targetJobId)) {
        targetJobId = jobsData[0].id;
        setSelectedJobId(targetJobId);
      }

      const auditData = await fairnessApi.getAudit(targetJobId, category);
      setAudit(auditData);
    } catch (err: any) {
      console.error('Fairness load error:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load fairness audit metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Computing Fairlearn demographic parity metrics..." />;
  }

  if (jobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No Job Requisitions Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You have not published any job postings yet. Create your first job posting to view demographic fairness audits and parity metrics.
        </p>
        <Link
          to="/recruiter/jobs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs"
        >
          Create Job Posting
        </Link>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Fairness Audit Unavailable</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {error || 'No candidate applications available yet to calculate statistically significant demographic parity.'}
        </p>
        <Link
          to="/recruiter/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Chart data
  const chartData = audit.metrics_table.map(m => ({
    group: m.group_name,
    'Selection Rate (%)': m.selection_rate,
    'Avg Score': m.avg_score,
    'True Positive Rate (%)': m.true_positive_rate
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                Fairness & Bias Auditing Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Algorithmic Parity Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Auditing demographic parity, selection-rate differences, and equal opportunity across controlled proxy segments.
            </p>
          </div>
        </div>

        {/* Job & Category Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {jobs.length > 1 && (
            <select
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 focus:outline-hidden"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setCategory('Gender')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              category === 'Gender' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Audit by Gender
          </button>
          <button
            onClick={() => setCategory('Age Group')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              category === 'Age Group' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Audit by Age Group
          </button>
        </div>
      </div>

      {/* Disparity Status Banner */}
      <div className="p-5 rounded-2xl border bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-slate-900">Current Disparity Assessment</h3>
            <Badge
              variant={
                audit.disparity_flag === 'No obvious disparity' ? 'success' :
                audit.disparity_flag === 'Potential disparity' ? 'warning' : 'danger'
              }
              size="md"
            >
              {audit.disparity_flag}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{audit.summary_text}</p>
        </div>

        <div className="flex gap-4 text-center shrink-0">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Selection Delta</span>
            <p className="text-lg font-extrabold text-slate-900">{audit.selection_rate_difference}%</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Equal Opp Delta</span>
            <p className="text-lg font-extrabold text-slate-900">{audit.equal_opportunity_diff}%</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Demographic Group Comparisons</h3>
              <p className="text-xs text-slate-500">Selection rate & verified TPR across {category} segments</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Selection Rate (%)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="True Positive Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Methodology Notes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Info className="w-4 h-4" /> Algorithmic Safety Notice
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Ethical Compliance & Governance</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {audit.methodology_note}
            </p>
          </div>

          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600">
            <p><strong>Demographic Parity:</strong> Requires candidate selection rates to be independent of protected attributes.</p>
            <p><strong>Equal Opportunity:</strong> Requires qualified candidates to have an equal chance of receiving a positive recommendation.</p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Demographic Audit Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Demographic Cohort</th>
                <th className="p-4">Candidates Tested</th>
                <th className="p-4">Candidates Selected</th>
                <th className="p-4">Selection Rate</th>
                <th className="p-4">Average Score</th>
                <th className="p-4">True Positive Rate</th>
                <th className="p-4">False Positive Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audit.metrics_table.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900 text-sm">{m.group_name}</td>
                  <td className="p-4 font-mono">{m.total_candidates}</td>
                  <td className="p-4 font-mono">{m.selected_count}</td>
                  <td className="p-4 font-bold text-indigo-600">{m.selection_rate}%</td>
                  <td className="p-4 font-mono">{m.avg_score}</td>
                  <td className="p-4 font-mono text-emerald-700">{m.true_positive_rate}%</td>
                  <td className="p-4 font-mono text-slate-500">{m.false_positive_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Selection Threshold Sensitivity Simulator */}
      {selectedJobId && (
        <SelectionThresholdSimulator jobId={selectedJobId} />
      )}
    </div>
  );
};
