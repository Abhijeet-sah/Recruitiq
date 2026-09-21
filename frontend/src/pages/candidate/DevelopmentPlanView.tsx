import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  TrendingUp, CheckCircle2, BookOpen, Rocket, ArrowLeft, 
  Calendar, Award, Sparkles, ChevronRight 
} from 'lucide-react';
import { devPlansApi } from '../../api';
import { DevelopmentPlan } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DevelopmentPlanView: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const appId = parseInt(applicationId || '0');

  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appId) {
      loadPlan();
    } else {
      setLoading(false);
    }
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, [appId]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const data = await devPlansApi.getApplicationPlan(appId);
      setPlan(data);
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Synthesizing personalized competency roadmap..." />;
  }

  if (!plan) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs space-y-4">
        <Rocket className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No Development Plan Available</h2>
        <p className="text-sm text-slate-500">
          Your tailored skill development roadmap will be generated based on your application and competency evaluation.
        </p>
        <div className="pt-2">
          <Link to="/candidate/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <Link
          to="/candidate/dashboard"
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Personalized Upskilling Roadmap
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Your Tailored Skill Development Plan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Targeting: <strong className="text-slate-800">{plan.target_role}</strong> &bull; Generated from real competency gap evidence
          </p>
        </div>
      </div>

      {/* Priority Modules */}
      <div className="space-y-6">
        {plan?.priorities.map((p) => (
          <div
            key={p.priority_level}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
          >
            {/* Priority Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
                  #{p.priority_level}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{p.skill_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.importance_reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Current: <span className="font-semibold text-rose-700">{p.current_level}</span></span>
                <span className="text-xs text-slate-400">&rarr;</span>
                <span className="text-xs text-slate-500">Goal: <span className="font-semibold text-emerald-700">{p.target_level}</span></span>
              </div>
            </div>

            {/* Curriculum Modules */}
            <div className="space-y-4">
              {p.learning_modules.map((mod, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" /> {mod.module_title}
                    </h4>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> ~{mod.estimated_weeks} Weeks
                    </span>
                  </div>

                  {/* Topics List */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Key Competency Focus Areas:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {mod.recommended_topics.map((t, ti) => (
                        <li key={ti} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Project Specification */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Rocket className="w-4 h-4 text-emerald-600" /> Capstone Practical Project
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {mod.practice_project_idea}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
