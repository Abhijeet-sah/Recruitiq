import React, { useState } from 'react';
import { researchApi } from '../../api';
import { FlaskConical, Play, Sparkles, CheckCircle2, TrendingUp, Clock, FileText, ArrowRight, RefreshCw } from 'lucide-react';

export const ResearchLabView: React.FC = () => {
  const [runningTransformer, setRunningTransformer] = useState(false);
  const [transformerResults, setTransformerResults] = useState<any | null>(null);

  const [runningCat, setRunningCat] = useState(false);
  const [catResults, setCatResults] = useState<any | null>(null);

  const handleRunTransformer = async () => {
    try {
      setRunningTransformer(true);
      const res = await researchApi.runTransformerBenchmark();
      setTransformerResults(res);
    } catch (err) {
      console.error('Transformer benchmark failed', err);
    } finally {
      setRunningTransformer(false);
    }
  };

  const handleRunCat = async () => {
    try {
      setRunningCat(true);
      const res = await researchApi.runAdaptiveBenchmark();
      setCatResults(res);
    } catch (err) {
      console.error('CAT benchmark failed', err);
    } finally {
      setRunningCat(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">RecruitIQ Scientific Research Lab</h1>
              <p className="text-sm text-slate-500">
                Empirical scientific benchmarks evaluating modern machine learning methods against classical baselines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Experiment 1: Transformer vs Sparse Token Baseline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
              Experiment 01 • Semantic Embedding Intelligence
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-2">
              Dense SentenceTransformer (all-MiniLM-L6-v2) vs. Sparse Token Baseline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Measures discrimination accuracy, latent synonym capture (e.g. K8s ↔ Kubernetes, FastAPI ↔ Flask), and latency.
            </p>
          </div>

          <button
            onClick={handleRunTransformer}
            disabled={runningTransformer}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-xs shrink-0 self-start md:self-auto"
          >
            {runningTransformer ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Execute Live Benchmark
          </button>
        </div>

        {transformerResults && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                <div className="text-xs font-medium text-purple-800">Transformer Accuracy</div>
                <div className="text-3xl font-black text-purple-900 mt-1">
                  {transformerResults.transformer_accuracy}%
                </div>
                <div className="text-[11px] text-purple-600 mt-0.5">all-MiniLM-L6-v2 (384d)</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs font-medium text-slate-500">Baseline Accuracy</div>
                <div className="text-3xl font-black text-slate-800 mt-1">
                  {transformerResults.baseline_accuracy}%
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Sparse Token / Jaccard</div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="text-xs font-medium text-emerald-800">Discrimination Gain</div>
                <div className="text-3xl font-black text-emerald-900 mt-1">
                  +{transformerResults.accuracy_gain_pct}%
                </div>
                <div className="text-[11px] text-emerald-600 mt-0.5">Statistically significant</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs font-medium text-slate-500">Inference Latency</div>
                <div className="text-3xl font-black text-slate-800 mt-1">
                  {transformerResults.avg_transformer_latency_ms}ms
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Sub-second CPU inference</div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-purple-300 rounded-2xl text-xs font-mono leading-relaxed border border-purple-500/20">
              <strong>Empirical Findings:</strong> {transformerResults.findings_summary}
            </div>

            {/* Pair Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Skill / Query Pair</th>
                    <th className="py-2.5 px-3">Semantic Relationship</th>
                    <th className="py-2.5 px-3">Dense Transformer Sim</th>
                    <th className="py-2.5 px-3">Sparse Baseline Sim</th>
                    <th className="py-2.5 px-3">Accuracy Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {transformerResults.pairs.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-800">
                        {p.query_pair[0]} <span className="text-slate-400">↔</span> {p.query_pair[1]}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            p.ground_truth_related
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.ground_truth_related ? 'Equivalent / Related' : 'Unrelated Stack'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-purple-700">
                        {p.transformer_similarity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {p.baseline_similarity}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">
                        {p.delta > 0 ? `+${p.delta}` : p.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Experiment 2: 2PL IRT CAT vs Fixed Assessment */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              Experiment 02 • Adaptive Psychometrics
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-2">
              2PL Item Response Theory (CAT) vs. Fixed-Length 10-Question Test
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Simulates candidate testing efficiency, Fisher Information targeting, and Mean Absolute Error across varying ability parameters $\theta$.
            </p>
          </div>

          <button
            onClick={handleRunCat}
            disabled={runningCat}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-xs shrink-0 self-start md:self-auto"
          >
            {runningCat ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Execute CAT Simulation
          </button>
        </div>

        {catResults && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <div className="text-xs font-medium text-indigo-800">Avg CAT Questions</div>
                <div className="text-3xl font-black text-indigo-900 mt-1">
                  {catResults.cat_avg_questions_to_converge}
                </div>
                <div className="text-[11px] text-indigo-600 mt-0.5">vs {catResults.fixed_test_questions} fixed items</div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="text-xs font-medium text-emerald-800">Testing Burden Reduction</div>
                <div className="text-3xl font-black text-emerald-900 mt-1">
                  {catResults.test_length_reduction_pct}%
                </div>
                <div className="text-[11px] text-emerald-600 mt-0.5">Time saved for candidate</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs font-medium text-slate-500">Adaptive MAE (θ)</div>
                <div className="text-3xl font-black text-slate-800 mt-1">
                  {catResults.adaptive_cat_mae}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Error in ability estimation</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs font-medium text-slate-500">Fixed Test MAE (θ)</div>
                <div className="text-3xl font-black text-slate-800 mt-1">
                  {catResults.fixed_test_mae}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Error in fixed test</div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-indigo-300 rounded-2xl text-xs font-mono leading-relaxed border border-indigo-500/20">
              <strong>Empirical Findings:</strong> {catResults.findings_summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
