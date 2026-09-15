import React, { useState } from 'react';
import { Sparkles, Database, X, CheckCircle2, AlertCircle, Loader2, Code2, Layers } from 'lucide-react';
import { assessmentsApi } from '../../api';
import { Job } from '../../types';

interface AIQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onSuccess?: () => void;
}

export const AIQuestionGeneratorModal: React.FC<AIQuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onSuccess,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number>(jobs[0]?.id || 0);
  const [mode, setMode] = useState<'AI' | 'BENCHMARK'>('AI');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [count, setCount] = useState<number>(3);
  const [skills, setSkills] = useState<string>('Python, Algorithms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  React.useEffect(() => {
    if ((!selectedJobId || selectedJobId === 0) && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!selectedJobId) {
      setError('Please select a job.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      if (mode === 'AI') {
        const skillList = skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const res = await assessmentsApi.generateAIQuestions(selectedJobId, {
          skills: skillList,
          count,
          difficulty,
          question_type: 'CODE',
        });
        setSuccessResult(res);
      } else {
        const res = await assessmentsApi.importBenchmarkPool(selectedJobId, {
          count,
          difficulty,
          skill: 'Python',
        });
        setSuccessResult(res);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Question generation failed:', err);
      setError(err?.message || err?.response?.data?.detail || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Hybrid Question Generator</h2>
              <p className="text-xs text-slate-300">Generate on-demand with Gemini AI or import from 900+ MBPP problems</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {successResult.message || 'Questions generated successfully!'}
              </div>
              <p className="text-xs text-emerald-700">
                Total questions in this job assessment pool: <strong>{successResult.total_assessment_questions}</strong>
              </p>
              {successResult.generated_questions && (
                <div className="mt-2 space-y-1">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Added Problems:</span>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {successResult.generated_questions.map((q: any) => (
                      <div key={q.id} className="text-xs bg-white/80 p-1.5 rounded border border-emerald-200 flex justify-between items-center">
                        <span className="font-medium text-slate-800">#{q.id} {q.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">{q.difficulty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Question Source
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('AI')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  mode === 'AI'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'AI' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">Google Gemini AI</div>
                  <div className="text-[11px] text-slate-500">Tailored custom problems</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('BENCHMARK')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  mode === 'BENCHMARK'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'BENCHMARK' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">MBPP Benchmark (900+)</div>
                  <div className="text-[11px] text-slate-500">Google open-source pool</div>
                </div>
              </button>
            </div>
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Job Requisition
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.department})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty & Count Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="Beginner">Beginner (Easy)</option>
                <option value="Intermediate">Intermediate (Medium)</option>
                <option value="Advanced">Advanced (Hard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Number of Questions
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                {mode === 'BENCHMARK' && <option value={25}>25 Questions (Bulk)</option>}
              </select>
            </div>
          </div>

          {/* Skills Input (Only for AI Mode) */}
          {mode === 'AI' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Competencies / Skills (Comma-Separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, Algorithms, Hash Table, Dynamic Programming"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                AI will generate custom algorithmic challenges specifically targeting these skills.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Code2 className="w-3.5 h-3.5" />
            <span>Includes auto sandbox test cases & starter code</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'AI' ? 'Generate AI Questions' : 'Import Benchmark Pool'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
