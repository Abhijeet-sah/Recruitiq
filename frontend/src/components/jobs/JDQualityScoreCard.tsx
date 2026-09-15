import React from 'react';
import { JDQualityResult } from '../../types';
import { ShieldCheck, AlertCircle, AlertTriangle, Sparkles, CheckCircle2, FileText } from 'lucide-react';

interface JDQualityScoreCardProps {
  result: JDQualityResult;
}

export const JDQualityScoreCard: React.FC<JDQualityScoreCardProps> = ({ result }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'GOOD':
        return 'text-indigo-700 bg-indigo-100 border-indigo-200';
      case 'NEEDS_IMPROVEMENT':
      default:
        return 'text-amber-700 bg-amber-100 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-lg">Job Description Quality & Inclusivity Audit</h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audits job postings for exclusionary wording, credential restrictions, and unrealistic experience demands.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-800">{result.overall_quality_score}/100</div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(result.status)}`}>
              {result.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Inclusivity & Neutrality</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{result.inclusivity_score}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Freedom from gendered & elite bias</div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Expectation Realism</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{result.realism_score}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Seniority vs stack age balance</div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Clarity & Brevity</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{result.clarity_score}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{result.word_count} words in posting</div>
        </div>
      </div>

      {/* Findings */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Audit Findings & Recommendations ({result.findings.length})
        </div>

        {result.findings.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Job description demonstrates exemplary inclusivity and market-realistic expectations. No biases detected.
          </div>
        ) : (
          <div className="space-y-3">
            {result.findings.map((finding, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {finding.severity === 'HIGH' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-bold text-xs text-slate-800">{finding.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      finding.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : finding.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {finding.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 pl-6">{finding.message}</p>
                <div className="ml-6 p-2 bg-white rounded-lg border border-slate-200 text-xs text-indigo-700 font-medium">
                  💡 Suggestion: {finding.suggestion}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
