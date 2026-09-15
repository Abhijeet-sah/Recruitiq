import React, { useState, useEffect } from 'react';
import { fairnessLabApi } from '../../api';
import { ThresholdSimulationResult } from '../../types';
import { Sliders, AlertTriangle, CheckCircle2, Info, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface SelectionThresholdSimulatorProps {
  jobId: number;
}

export const SelectionThresholdSimulator: React.FC<SelectionThresholdSimulatorProps> = ({ jobId }) => {
  const [selectedCategory, setSelectedCategory] = useState<'gender' | 'age_group'>('gender');
  const [simulation, setSimulation] = useState<ThresholdSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeThreshold, setActiveThreshold] = useState<number>(70);

  useEffect(() => {
    runSimulation();
  }, [jobId, selectedCategory]);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const res = await fairnessLabApi.simulateThreshold({
        job_id: jobId,
        category: selectedCategory,
        min_thresh: 40,
        max_thresh: 95,
        step: 5,
      });
      setSimulation(res);
      setActiveThreshold(res.recommended_threshold || 70);
    } catch (err) {
      console.error('Threshold simulation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const activePoint = simulation?.simulation_curve.find((p) => p.threshold === activeThreshold) ||
    simulation?.simulation_curve[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-800">Dynamic Selection Threshold Simulator</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Model how shifting minimum cut-off thresholds affects Disparate Impact (4/5ths Rule) and candidate pool diversity before advancing candidates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedCategory('gender')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedCategory === 'gender' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Gender Parity
          </button>
          <button
            onClick={() => setSelectedCategory('age_group')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedCategory === 'age_group' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Age Group Parity
          </button>
        </div>
      </div>

      {simulation?.sample_size_warning && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{simulation.sample_size_warning}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
          Simulating selection thresholds...
        </div>
      ) : simulation ? (
        <div className="space-y-6">
          {/* Interactive Threshold Slider */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Audited Minimum Score Threshold
                </span>
                <div className="text-2xl font-black text-indigo-600">{activeThreshold} / 100</div>
              </div>

              {simulation.recommended_threshold && (
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400">Fairness-Utility Optimum</span>
                  <button
                    onClick={() => setActiveThreshold(simulation.recommended_threshold)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Set Recommended: {simulation.recommended_threshold}
                  </button>
                </div>
              )}
            </div>

            <input
              type="range"
              min="40"
              max="95"
              step="5"
              value={activeThreshold}
              onChange={(e) => setActiveThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            {/* Current Point Metrics Banner */}
            {activePoint && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium">Selected Candidates</div>
                  <div className="text-lg font-bold text-slate-800">
                    {activePoint.total_selected} / {simulation.total_candidates}
                  </div>
                  <div className="text-[10px] text-slate-500">{activePoint.overall_selection_rate}% pass rate</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium">Disparate Impact Ratio</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {activePoint.disparate_impact_ratio}
                  </div>
                  <div className="text-[10px] text-slate-500">Legal 4/5ths threshold: 0.80</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium">4/5ths Rule Status</div>
                  <div className="flex items-center gap-1 mt-1">
                    {activePoint.four_fifths_compliant ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> PASS
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> ADVERSE IMPACT
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">EEOC Compliance Metric</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium">Demographic Parity Gap</div>
                  <div className="text-lg font-bold text-slate-800">
                    {activePoint.demographic_parity_diff}%
                  </div>
                  <div className="text-[10px] text-slate-500">Difference in pass rates</div>
                </div>
              </div>
            )}
          </div>

          {/* Simulation Curve Chart */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Disparate Impact Ratio vs. Cut-off Score
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Green line at 0.80 indicates 4/5ths rule legal boundary
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation.simulation_curve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="threshold" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 1.2]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine y={0.8} stroke="#10b981" strokeDasharray="4 4" label={{ value: '4/5ths Rule (0.80)', fill: '#10b981', fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="disparate_impact_ratio"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 7 }}
                    name="Disparate Impact Ratio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
