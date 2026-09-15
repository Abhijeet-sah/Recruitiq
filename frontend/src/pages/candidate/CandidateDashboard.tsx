import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, CheckCircle2, AlertCircle, TrendingUp, HelpCircle, 
  ArrowRight, FileText, Sparkles, Clock, Eye 
} from 'lucide-react';
import { candidatesApi } from '../../api';
import { Application } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyApplications();
  }, []);

  const loadMyApplications = async () => {
    setLoading(true);
    try {
      const apps = await candidatesApi.getMyApplications();
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading candidate career portal..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
            Candidate Career Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Track your job applications, complete adaptive competency assessments, and view your personalized skill development roadmap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/candidate/jobs"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-xs transition-all flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> Explore Open Roles
          </Link>
          <Link
            to="/candidate/profile"
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-sky-400" /> Resume & Profile
          </Link>
        </div>
      </div>

      {/* Profile & Assessment Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Applications Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Applications</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{applications.length}</p>
          <p className="text-xs text-slate-500 mt-2">Roles undergoing decision support review</p>
        </div>

        {/* Card 2: Skill Growth Plan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Upskilling Roadmap</span>
          <p className="text-xl font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5" /> {applications.length > 0 ? 'Priorities Ready' : 'Pending Applications'}
          </p>
          {applications.length > 0 ? (
            <Link
              to={`/candidate/development-plan/${applications[0].id}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Tailored Plan &rarr;
            </Link>
          ) : (
            <Link
              to="/candidate/jobs"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Apply to Jobs to Unlock &rarr;
            </Link>
          )}
        </div>

        {/* Card 3: Adaptive Verification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Assessment Verification</span>
          <p className="text-xl font-bold text-indigo-600 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> Adaptive Engine Active
          </p>
          <p className="text-xs text-slate-500 mt-2">Questions adapt dynamically to responses</p>
        </div>
      </div>

      {/* Applied Roles and Status Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Your Applications & Verification Status</h3>
          <p className="text-xs text-slate-500">Multi-stage evaluation timeline</p>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <p className="text-base font-semibold text-slate-700">No applications submitted yet.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Explore open positions to apply, run semantic matching, and verify your capabilities with adaptive assessments.
            </p>
            <Link
              to="/candidate/jobs"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Browse Open Jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{app.job_title}</h4>
                    <p className="text-xs text-slate-500">
                      Applied {new Date(app.applied_at).toLocaleDateString()} &bull; Enterprise Engineering
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        app.status === 'SHORTLISTED' ? 'success' :
                        app.status === 'REJECTED' ? 'danger' :
                        app.status === 'ASSESSMENT_COMPLETED' ? 'info' : 'neutral'
                      }
                      size="md"
                    >
                      {app.status}
                    </Badge>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-semibold text-slate-500 pt-2">
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-indigo-600 rounded-full" />
                    <span className="text-indigo-700 font-bold">1. Applied</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 w-full rounded-full ${['REVIEWED', 'ASSESSMENT_PENDING', 'ASSESSMENT_COMPLETED', 'EVALUATED', 'SHORTLISTED'].includes(app.status) ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <span>2. Reviewed</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 w-full rounded-full ${['ASSESSMENT_COMPLETED', 'EVALUATED', 'SHORTLISTED'].includes(app.status) ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <span>3. Assessment</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 w-full rounded-full ${['EVALUATED', 'SHORTLISTED'].includes(app.status) ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <span>4. Evaluation</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 w-full rounded-full ${app.status === 'SHORTLISTED' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                    <span>5. Decision</span>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-4 text-slate-600">
                    {app.overall_match_score && (
                      <span>Semantic Match: <strong className="text-indigo-600">{app.overall_match_score}%</strong></span>
                    )}
                    {app.assessment_percentage && (
                      <span>Assessment Score: <strong className="text-emerald-600">{app.assessment_percentage}%</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/candidate/assessment/${app.id}`}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {app.status === 'ASSESSMENT_COMPLETED' ? 'Retake / Review Test' : 'Take Adaptive Assessment'}
                    </Link>
                    <Link
                      to={`/candidate/development-plan/${app.id}`}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <TrendingUp className="w-3.5 h-3.5" /> View Skill Plan
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
