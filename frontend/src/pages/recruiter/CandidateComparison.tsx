import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCompare, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { comparisonApi } from '../../api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CandidateComparison: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const applicationIds: number[] = location.state?.applicationIds || [];

  useEffect(() => {
    if (applicationIds.length >= 2) {
      loadComparison();
    } else {
      setLoading(false);
    }
  }, []);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const res = await comparisonApi.compare(applicationIds);
      setCandidates(res.candidates || []);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Synthesizing multi-candidate radar comparison..." />;
  }

  if (applicationIds.length < 2 || candidates.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <GitCompare className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Select Candidates to Compare</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please select at least 2 candidates using the checkboxes on your Recruiter Dashboard, then click "Compare" to view side-by-side radar analysis.
        </p>
        <Link
          to="/recruiter/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Build Radar Chart Data
  const dimensions = ['Match', 'Assessment', 'Experience', 'Skill Alignment', 'Project Relevance'];
  const radarData = dimensions.map(dim => {
    const row: any = { subject: dim };
    candidates.forEach((c, idx) => {
      row[c.name] = c.radar_metrics[dim] || 70;
    });
    return row;
  });

  const RADAR_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Multi-Candidate Evaluation
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Side-by-Side Candidate Comparison ({candidates.length} Profiles)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare semantic alignment, verified assessment benchmarks, and competency gaps
          </p>
        </div>
      </div>

      {/* Radar Chart Visual Comparison */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Dimensional Capability Radar</h3>
        <p className="text-xs text-slate-500 mb-6">Normalized across all 5 evaluation dimensions</p>

        <div className="h-80 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
              {candidates.map((c, idx) => (
                <Radar
                  key={c.candidate_id}
                  name={c.name}
                  dataKey={c.name}
                  stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                  fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                  fillOpacity={0.25}
                />
              ))}
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Attributes Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Attribute Comparison Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100/75 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 w-48 bg-slate-50">Dimension</th>
                {candidates.map((c, idx) => (
                  <th key={c.candidate_id} className="p-4 min-w-[220px]">
                    <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.email}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Semantic Match</td>
                {candidates.map(c => (
                  <td key={c.candidate_id} className="p-4 font-bold text-indigo-600">
                    {c.overall_match_score}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Assessment Score</td>
                {candidates.map(c => (
                  <td key={c.candidate_id} className="p-4">
                    <Badge variant={c.assessment_score >= 70 ? 'success' : 'neutral'}>
                      {c.assessment_score}% Verified
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Experience</td>
                {candidates.map(c => (
                  <td key={c.candidate_id} className="p-4 font-medium text-slate-800">
                    {c.years_of_experience} years
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Education</td>
                {candidates.map(c => (
                  <td key={c.candidate_id} className="p-4 text-xs">
                    {c.education_level}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Strong Competencies</td>
                {candidates.map(c => (
                  <td key={c.candidate_id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {c.strong_skills.map((s: string, si: number) => (
                        <span key={si} className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Identified Gaps</td>
                {candidates.map(c => (
                  <td key={c.candidate_id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {c.missing_skills.length > 0 ? (
                        c.missing_skills.map((s: string, si: number) => (
                          <span key={si} className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No critical gaps</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Consistency Status</td>
                {candidates.map(c => (
                  <td key={c.candidate_id} className="p-4">
                    <Badge variant={c.consistency_status === 'Consistent' ? 'success' : 'warning'}>
                      {c.consistency_status}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Profile Dossier</td>
                {candidates.map(c => (
                  <td key={c.candidate_id} className="p-4">
                    <Link
                      to={`/recruiter/candidates/${c.application_id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Full Dossier &rarr;
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
