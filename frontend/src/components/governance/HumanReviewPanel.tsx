import React, { useState } from 'react';
import { governanceApi } from '../../api';
import { UserCheck, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

interface HumanReviewPanelProps {
  applicationId: number;
  currentAiRecommendation: string;
  onDecisionRecorded?: () => void;
}

export const HumanReviewPanel: React.FC<HumanReviewPanelProps> = ({
  applicationId,
  currentAiRecommendation,
  onDecisionRecorded,
}) => {
  const [decision, setDecision] = useState<'SHORTLIST' | 'REJECT' | 'INTERVIEW' | 'HOLD'>('SHORTLIST');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setErrorMsg('Please provide a substantive justification (minimum 10 characters) for regulatory governance.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await governanceApi.submitOverride({
        application_id: applicationId,
        ai_recommendation: currentAiRecommendation,
        human_decision: decision,
        override_reason: reason.trim(),
      });
      setSuccessMsg('Human decision recorded and permanently appended to audit trail.');
      setReason('');
      if (onDecisionRecorded) {
        onDecisionRecorded();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to submit override.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
        <UserCheck className="w-5 h-5 text-indigo-600" />
        <h4 className="font-bold text-slate-800 text-base">Human-in-the-Loop Decision & Override Control</h4>
      </div>

      <p className="text-xs text-slate-500">
        AI provides decision-support only. The human recruiter maintains ultimate authority. Any divergence from AI recommendations requires reasoned justification logged into the immutable audit trail.
      </p>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
        <span className="text-slate-500">Current AI Recommendation:</span>
        <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
          {currentAiRecommendation || 'Recommended'}
        </span>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOverride} className="space-y-4 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Recruiter Final Decision
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['SHORTLIST', 'INTERVIEW', 'HOLD', 'REJECT'] as const).map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setDecision(opt)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  decision === opt
                    ? opt === 'SHORTLIST'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : opt === 'REJECT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Decision Justification & Context <span className="text-slate-400 font-normal">(Required for compliance)</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Document rationale, interview performance notes, transferable skill considerations, or team fit context..."
            className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || reason.trim().length < 10}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
          Record Human Decision to Audit Trail
        </button>
      </form>
    </div>
  );
};
