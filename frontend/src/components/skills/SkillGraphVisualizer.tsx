import React, { useState, useEffect } from 'react';
import { skillsApi } from '../../api';
import { SkillGraphData, SkillTransferabilityResult } from '../../types';
import { Network, ArrowRight, Sparkles, CheckCircle2, RefreshCw, Cpu, Layers } from 'lucide-react';

export const SkillGraphVisualizer: React.FC = () => {
  const [graphData, setGraphData] = useState<SkillGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Transferability Simulator State
  const [testCandidateSkills, setTestCandidateSkills] = useState('Flask, Python, Docker, PostgreSQL');
  const [testTargetSkill, setTestTargetSkill] = useState('FastAPI');
  const [transferResult, setTransferResult] = useState<SkillTransferabilityResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const data = await skillsApi.getGraph();
      setGraphData(data);
    } catch (err) {
      console.error('Failed to load skill graph', err);
    } finally {
      setLoading(false);
    }
  };

  const runTransferabilityCheck = async () => {
    try {
      setCalculating(true);
      const skillsArray = testCandidateSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await skillsApi.transferability(skillsArray, testTargetSkill);
      setTransferResult(res);
    } catch (err) {
      console.error('Transferability calculation failed', err);
    } finally {
      setCalculating(false);
    }
  };

  const categories = graphData
    ? ['All', ...Array.from(new Set(graphData.nodes.map((n) => n.category)))]
    : ['All'];

  const filteredNodes = graphData
    ? selectedCategory === 'All'
      ? graphData.nodes
      : graphData.nodes.filter((n) => n.category === selectedCategory)
    : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-800">Skill Knowledge Graph & Transferable Intelligence</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Standardizes canonical taxonomy, alias resolution, and transferable capabilities instead of penalizing equivalent frameworks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ontology Nodes Visual Grid */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          Canonical Ontology Nodes ({filteredNodes.length} mapped skills)
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading ontology nodes...</div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-400 transition-all text-xs font-medium text-slate-700 flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="font-semibold">{node.label}</span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md">
                  {node.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transferability Simulator */}
      <div className="bg-linear-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h4 className="font-bold text-slate-800 text-base">Interactive Transferability Calculator</h4>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Test how RecruitIQ computes skill transferability. If a candidate knows Flask & Python, how ready are they to succeed with FastAPI?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Verified Skills (comma-separated)</label>
            <input
              type="text"
              value={testCandidateSkills}
              onChange={(e) => setTestCandidateSkills(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Requirement</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={testTargetSkill}
                onChange={(e) => setTestTargetSkill(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={runTransferabilityCheck}
                disabled={calculating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shrink-0 flex items-center gap-1 transition-colors"
              >
                {calculating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                Evaluate
              </button>
            </div>
          </div>
        </div>

        {transferResult && (
          <div className="p-4 bg-white border border-indigo-200 rounded-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-800">Target: {transferResult.required_skill}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    transferResult.transferability_score >= 80
                      ? 'bg-emerald-100 text-emerald-700'
                      : transferResult.transferability_score >= 50
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {transferResult.status} ({Math.round(transferResult.transferability_score)}% Readiness)
                </span>
              </div>
              {transferResult.matched_via && (
                <span className="text-xs text-slate-500 font-medium">
                  Bridge Competency: <strong className="text-indigo-600">{transferResult.matched_via}</strong>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {transferResult.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
