import React, { useState, useEffect } from 'react';
import { governanceApi } from '../../api';
import { DecisionTraceItem } from '../../types';
import { GitCommit, UserCheck, Bot, Clock, Shield, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface DecisionTraceTimelineProps {
  applicationId: number;
}

export const DecisionTraceTimeline: React.FC<DecisionTraceTimelineProps> = ({ applicationId }) => {
  const [traces, setTraces] = useState<DecisionTraceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadTraces();
  }, [applicationId]);

  const loadTraces = async () => {
    try {
      setLoading(true);
      const data = await governanceApi.getTraces(applicationId);
      setTraces(data);
      if (data.length > 0) {
        setExpandedId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load decision traces', err);
    } finally {
      setLoading(false);
    }
  };

  const getActorIcon = (actorType: string) => {
    switch (actorType) {
      case 'RECRUITER':
      case 'ADMIN':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'AI_SERVICE':
      default:
        return <Bot className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">Immutable Decision Trace & Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Complete chronological provenance of automated AI evaluations and human recruiter decisions.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
          {traces.length} Logged Events
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs">Loading audit trail...</div>
      ) : traces.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No audit traces recorded yet for this application.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {traces.map((trace) => {
            const isExpanded = expandedId === trace.id;
            const isHuman = trace.actor_type === 'RECRUITER';

            return (
              <div key={trace.id} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-6 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white shadow-xs ${
                    isHuman ? 'border-emerald-500 text-emerald-600' : 'border-indigo-500 text-indigo-600'
                  }`}
                >
                  {getActorIcon(trace.actor_type)}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : trace.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-800">{trace.action_name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isHuman
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {trace.actor_type}
                        </span>
                        {trace.model_version && trace.model_version !== 'N/A' && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            v{trace.model_version}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {trace.timestamp ? new Date(trace.timestamp).toLocaleString() : 'Recent'} • Service: {trace.service_used || 'RecruitIQ Core'}
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2 text-xs">
                      {trace.reasoning_text && (
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]">
                          <strong>Decision Rationale:</strong> {trace.reasoning_text}
                        </div>
                      )}

                      {trace.input_summary && (
                        <div className="text-slate-500 text-[11px]">
                          <strong>Input Context:</strong> {trace.input_summary}
                        </div>
                      )}

                      {trace.output_summary && Object.keys(trace.output_summary).length > 0 && (
                        <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[10px] overflow-x-auto max-h-40">
                          <pre>{JSON.stringify(trace.output_summary, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
