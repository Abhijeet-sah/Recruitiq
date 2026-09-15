import React, { useState, useEffect } from 'react';
import { governanceApi } from '../../api';
import { ModelRegistryStatus } from '../../types';
import { Cpu, ShieldCheck, Activity, RefreshCw, AlertTriangle, Layers, CheckCircle2, Clock } from 'lucide-react';

export const ModelRegistryView: React.FC = () => {
  const [registry, setRegistry] = useState<ModelRegistryStatus | null>(null);
  const [drifts, setDrifts] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modelsData, driftData] = await Promise.all([
        governanceApi.getModels(),
        governanceApi.getDrifts(),
      ]);
      setRegistry(modelsData);
      setDrifts(driftData);
    } catch (err) {
      console.error('Failed to load model registry', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">AI Model Registry & Health Monitor</h1>
              <p className="text-sm text-slate-500">
                Live governance status, active model versions, fallback readiness, and statistical drift metrics.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Fallback Guarantee Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Zero-Downtime Deterministic Fallback Active:</strong> Every advanced ML service (Sentence Transformers, IRT CAT, Fairness Simulator) is paired with an automatic deterministic local fallback (`LocalSemanticVectorizer`, Classical Adaptive Engine). In offline or low-compute conditions, the system switches transparently with zero downtime.
        </div>
      </div>

      {/* Models Grid */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Registered Machine Learning Models ({registry?.models.length || 0})
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            Querying Model Registry...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registry?.models.map((m, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-slate-800">{m.model_name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          v{m.version}
                        </span>
                      </div>
                      <span className="text-xs text-indigo-600 font-semibold">{m.type}</span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {m.purpose}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {m.dimension && (
                      <div>
                        <span className="text-slate-400 block">Embedding Dims:</span>
                        <strong className="text-slate-700">{m.dimension} dense</strong>
                      </div>
                    )}
                    {m.lru_cache_entries !== undefined && (
                      <div>
                        <span className="text-slate-400 block">LRU Cache:</span>
                        <strong className="text-slate-700">{m.lru_cache_entries} vectors cached</strong>
                      </div>
                    )}
                    {m.estimation_method && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block">Estimation Method:</span>
                        <strong className="text-slate-700">{m.estimation_method}</strong>
                      </div>
                    )}
                    {m.features && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block">Inspection Modules:</span>
                        <strong className="text-slate-700">{m.features.join(' • ')}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Fallback: {m.fallback_name || 'Standard Deterministic'}
                  </span>
                  <span className="text-emerald-600 font-semibold">Healthy</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistical Drift Metrics */}
      {drifts && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-800">Model Drift & Distribution Shift Monitoring</h3>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              Status: {drifts.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {drifts.metrics.map((dm: any, i: number) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-700">{dm.name}</div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-800">{dm.current_value}</span>
                  <span className="text-xs text-slate-400">baseline: {dm.baseline_value}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-500">
                  <span>Delta: {dm.drift_delta > 0 ? `+${dm.drift_delta}` : dm.drift_delta}</span>
                  <span>p-value: {dm.p_value}</span>
                  <span className="font-bold text-emerald-600">{dm.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
