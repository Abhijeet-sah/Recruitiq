import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Sliders, ArrowLeft, RefreshCw, Eye, CheckCircle2 } from 'lucide-react';
import { rankingsApi, jobsApi } from '../../api';
import { CandidateRanking, RankingWeights, Job } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CandidateRankingsView: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();

  const [rankings, setRankings] = useState<CandidateRanking[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(jobId ? parseInt(jobId) : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configurable Weights
  const [weights, setWeights] = useState<RankingWeights>({
    match_score: 0.35,
    assessment_score: 0.30,
    experience_score: 0.15,
    skill_relevance_score: 0.10,
    project_score: 0.10,
  });

  useEffect(() => {
    loadRankings();
  }, [selectedJobId]);

  const loadRankings = async (customWeights?: RankingWeights) => {
    setLoading(true);
    setError(null);
    try {
      const jobsData = await jobsApi.getMyJobs();
      setJobs(jobsData);

      if (jobsData.length === 0) {
        setRankings([]);
        setLoading(false);
        return;
      }

      let targetJobId = selectedJobId;
      if (!targetJobId || !jobsData.some(j => j.id === targetJobId)) {
        targetJobId = jobsData[0].id;
        setSelectedJobId(targetJobId);
      }

      const rankingsData = await rankingsApi.getRankings(targetJobId, customWeights || weights);
      setRankings(rankingsData);
    } catch (err: any) {
      console.error('Failed to load rankings:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to compute candidate rankings.');
    } finally {
      setLoading(false);
    }
  };

  const handleWeightSlider = (field: keyof RankingWeights, val: number) => {
    const updated = { ...weights, [field]: val / 100 };
    setWeights(updated);
  };

  const handleApplyWeights = () => {
    loadRankings(weights);
  };

  const handleResetWeights = () => {
    const defaults: RankingWeights = {
      match_score: 0.35,
      assessment_score: 0.30,
      experience_score: 0.15,
      skill_relevance_score: 0.10,
      project_score: 0.10,
    };
    setWeights(defaults);
    loadRankings(defaults);
  };

  if (loading && rankings.length === 0) {
    return <LoadingSpinner fullScreen message="Computing multi-factor candidate rankings..." />;
  }

  if (jobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No Job Requisitions Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You have not published any job postings yet. Create your first job posting to evaluate and rank applicants.
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Explainable Decision Support
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Configurable Candidate Rankings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic weighting: Adjust sliders to instantly recalculate ranking scores transparently.
          </p>
        </div>

        {/* Job Selector */}
        <select
          value={selectedJobId || ''}
          onChange={(e) => setSelectedJobId(parseInt(e.target.value))}
          className="text-xs rounded-xl border border-slate-300 py-2 px-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          {jobs.map(j => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      </div>

      {/* Weight Controls Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Configurable Evaluation Weights</h3>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResetWeights}
              className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleApplyWeights}
              className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Recalculate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Semantic Match</span>
              <span className="font-mono font-bold text-indigo-600">{(weights.match_score * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.match_score * 100}
              onChange={(e) => handleWeightSlider('match_score', parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Assessment Score</span>
              <span className="font-mono font-bold text-indigo-600">{(weights.assessment_score * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.assessment_score * 100}
              onChange={(e) => handleWeightSlider('assessment_score', parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Experience Alignment</span>
              <span className="font-mono font-bold text-indigo-600">{(weights.experience_score * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.experience_score * 100}
              onChange={(e) => handleWeightSlider('experience_score', parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Skill Relevance</span>
              <span className="font-mono font-bold text-indigo-600">{(weights.skill_relevance_score * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.skill_relevance_score * 100}
              onChange={(e) => handleWeightSlider('skill_relevance_score', parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Project Relevance</span>
              <span className="font-mono font-bold text-indigo-600">{(weights.project_score * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.project_score * 100}
              onChange={(e) => handleWeightSlider('project_score', parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Ranked Candidate Roster</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {rankings.length} Applicants Ranked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100/75 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">Rank</th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Overall Score</th>
                <th className="p-4">Match</th>
                <th className="p-4">Assessment</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Recommendation</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No candidates have applied to this job yet.
                  </td>
                </tr>
              ) : (
                rankings.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                      r.rank === 1 ? 'bg-amber-100 text-amber-800' :
                      r.rank === 2 ? 'bg-slate-200 text-slate-800' :
                      r.rank === 3 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{r.rank}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{r.candidate_name}</div>
                    <div className="text-xs text-slate-400">{r.candidate_email}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-base font-extrabold text-indigo-600 font-mono">
                      {r.overall_score}%
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs">{r.match_score}%</td>
                  <td className="p-4 font-mono text-xs">{r.assessment_score}%</td>
                  <td className="p-4 font-mono text-xs">{r.experience_score}%</td>
                  <td className="p-4">
                    <Badge
                      variant={
                        r.recommendation === 'Highly Recommended' ? 'success' :
                        r.recommendation === 'Recommended' ? 'info' :
                        r.recommendation === 'Consider with Upskilling' ? 'warning' : 'neutral'
                      }
                    >
                      {r.recommendation}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/recruiter/candidates/${r.application_id}`}
                      className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Dossier
                    </Link>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
