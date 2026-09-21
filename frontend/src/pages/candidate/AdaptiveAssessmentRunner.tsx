import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  HelpCircle, Clock, Award, CheckCircle2, ArrowRight, 
  Layers, AlertTriangle, RefreshCw, BarChart2, TrendingUp,
  Code2, Play, RotateCcw, XCircle, Terminal, FileCode, Check, X,
  ChevronDown, ChevronUp, BookOpen, ListChecks, Lightbulb,
  Maximize2, Minimize2, Sparkles, CheckCheck, PlayCircle
} from 'lucide-react';
import { assessmentsApi } from '../../api';
import { 
  AssessmentStartResponse, AssessmentQuestionClient, 
  DifficultyLevel, AnswerSubmitResponse, CodeRunResponse 
} from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python 3', ext: 'py' },
  { id: 'javascript', label: 'JavaScript (Node.js)', ext: 'js' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
];

export const AdaptiveAssessmentRunner: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const appId = parseInt(applicationId || '0');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestionClient | null>(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalPlanned, setTotalPlanned] = useState(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  
  // MCQ state
  const [selectedOption, setSelectedOption] = useState<string>('');
  
  // Coding challenge state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [codeAnswer, setCodeAnswer] = useState<string>('');
  const [codeByLang, setCodeByLang] = useState<Record<string, string>>({});
  const [runningCode, setRunningCode] = useState(false);
  const [codeRunResult, setCodeRunResult] = useState<CodeRunResponse | null>(null);
  
  // UI Tabs & Views
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'examples' | 'hints'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(0);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
  const [isWideMode, setIsWideMode] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Completed Test State
  const [isCompleted, setIsCompleted] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (appId) {
      startTest();
      const timer = setTimeout(() => setLoading(false), 8000);
      return () => clearTimeout(timer);
    } else {
      setError("Invalid application ID specified.");
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    let interval: any = null;
    if (!isCompleted) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Global Keyboard Shortcuts (Ctrl + Enter to run code)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentQuestion?.question_type === 'CODE' && !runningCode && codeAnswer.trim()) {
          handleRunCode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, runningCode, codeAnswer, selectedLanguage]);

  // Setup question state when question changes
  const setupQuestionState = (q: AssessmentQuestionClient) => {
    setCurrentQuestion(q);
    setSelectedOption('');
    setCodeRunResult(null);
    setSelectedCaseIndex(0);
    setActiveConsoleTab('testcase');
    setActiveLeftTab('description');

    if (q.question_type === 'CODE') {
      const initialLang = q.language === 'sql' ? 'sql' : 'python';
      setSelectedLanguage(initialLang);

      // Populate templates
      const starterCode = q.starter_code || (q.starter_templates && q.starter_templates[initialLang]) || '';
      const initialCodeMap: Record<string, string> = {
        [initialLang]: starterCode,
        ...(q.starter_templates || {})
      };
      setCodeByLang(initialCodeMap);
      setCodeAnswer(starterCode);
    } else {
      setCodeAnswer('');
    }
  };

  const handleLanguageChange = (newLang: string) => {
    // Save current code for current language
    setCodeByLang(prev => ({
      ...prev,
      [selectedLanguage]: codeAnswer
    }));

    setSelectedLanguage(newLang);

    // Load code for new language
    if (codeByLang[newLang]) {
      setCodeAnswer(codeByLang[newLang]);
    } else if (currentQuestion?.starter_templates && currentQuestion.starter_templates[newLang]) {
      setCodeAnswer(currentQuestion.starter_templates[newLang]);
    } else {
      const fallback = `// Solution in ${newLang.toUpperCase()}\n`;
      setCodeAnswer(fallback);
    }
  };

  const startTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: AssessmentStartResponse = await assessmentsApi.start(appId);
      setAttemptId(res.attempt_id);
      setupQuestionState(res.question);
      setQuestionIndex(res.current_question_index);
      setTotalPlanned(res.total_questions_planned);
      setDifficulty(res.current_difficulty);
    } catch (err: any) {
      console.error('Failed to start assessment:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to initialize assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (opt: string) => {
    setSelectedOption(opt);
  };

  // Handle Tab key inside code editor
  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setCodeAnswer(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleResetCode = () => {
    if (!currentQuestion) return;
    let template = '';
    if (currentQuestion.starter_templates && currentQuestion.starter_templates[selectedLanguage]) {
      template = currentQuestion.starter_templates[selectedLanguage];
    } else if (currentQuestion.starter_code && selectedLanguage === 'python') {
      template = currentQuestion.starter_code;
    }
    if (template) {
      setCodeAnswer(template);
      setCodeByLang(prev => ({ ...prev, [selectedLanguage]: template }));
      setCodeRunResult(null);
    }
  };

  const handleRunCode = async () => {
    if (!currentQuestion) return;
    setRunningCode(true);
    setIsConsoleOpen(true);
    setActiveConsoleTab('result');

    try {
      const res = await assessmentsApi.runCode(currentQuestion.id, codeAnswer, selectedLanguage);
      setCodeRunResult(res);
    } catch (err: any) {
      console.error('Code run failed:', err);
      setCodeRunResult({
        passed: false,
        passed_count: 0,
        total_count: 0,
        all_passed: false,
        test_results: [],
        error: err?.response?.data?.detail || 'Failed to execute code in sandbox.',
      });
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!attemptId || !currentQuestion) return;

    let answerPayload: any;
    if (currentQuestion.question_type === 'CODE') {
      answerPayload = JSON.stringify({
        code: codeAnswer,
        language: selectedLanguage
      });
    } else {
      answerPayload = selectedOption;
    }

    if (typeof answerPayload === 'string' && !answerPayload.trim()) return;

    setSubmittingAnswer(true);

    try {
      const res: AnswerSubmitResponse = await assessmentsApi.submitAnswer(
        attemptId,
        currentQuestion.id,
        answerPayload,
        45
      );

      if (res.is_completed) {
        setIsCompleted(true);
        setTestResult(res.result);
      } else if (res.next_question) {
        setupQuestionState(res.next_question);
        setQuestionIndex(res.current_question_index);
        setDifficulty(res.current_difficulty);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Configuring adaptive item response engine & code sandbox..." />;
  }

  // =========================================================================
  // COMPLETED TEST SCREEN
  // =========================================================================
  if (isCompleted && testResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Assessment Concluded
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-3">
              Adaptive Evaluation Complete
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your empirical and hands-on coding capabilities have been verified and recorded into the decision support pipeline.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto">
            <span className="text-xs font-bold text-slate-400 uppercase">Verified Score</span>
            <div className="text-4xl font-extrabold text-indigo-600 my-1 font-mono">
              {testResult.percentage}%
            </div>
            <p className="text-xs font-medium text-slate-600">
              {testResult.correct_count} of {testResult.total_questions} challenges & questions solved successfully
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-400 font-semibold uppercase">Difficulty Level Reached</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" /> {testResult.difficulty_reached}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Time Invested</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" /> {formatTimer(timerSeconds)}
              </p>
            </div>
          </div>

          {testResult.topic_performance && Object.keys(testResult.topic_performance).length > 0 && (
            <div className="text-left pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Topic Performance</h4>
              <div className="space-y-2">
                {Object.entries(testResult.topic_performance).map(([skill, score]: [string, any]) => (
                  <div key={skill} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-800">{skill}</span>
                    <span className="font-mono font-bold text-indigo-600">{score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={`/candidate/development-plan/${appId}`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" /> View Upskilling Roadmap
            </Link>
            <Link
              to="/candidate/dashboard"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ERROR SCREEN
  // =========================================================================
  if (error || !currentQuestion) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Assessment Unavailable</h2>
        <p className="text-sm text-slate-500">
          {error || 'Unable to start assessment. Please ensure you have permission to take the assessment for this application.'}
        </p>
        <div className="pt-2">
          <Link to="/candidate/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isCodeQuestion = currentQuestion.question_type === 'CODE';
  const codeLinesCount = (codeAnswer.match(/\n/g) || []).length + 1;
  const lineNumbers = Array.from({ length: Math.max(codeLinesCount + 3, 14) }, (_, i) => i + 1);

  // Derive rich problem fields with safe fallbacks
  const problemTitle = currentQuestion.title || (
    currentQuestion.question_text.length > 50 
      ? currentQuestion.question_text.slice(0, 50) + '...' 
      : currentQuestion.question_text
  );

  const problemDescription = currentQuestion.description || currentQuestion.question_text;

  const problemExamples = (currentQuestion.examples && currentQuestion.examples.length > 0)
    ? currentQuestion.examples
    : (currentQuestion.test_cases?.map((tc, idx) => ({
        id: idx + 1,
        input: tc.input || '',
        output: tc.expected || '',
        explanation: undefined
      })) || []);

  const problemConstraints = (currentQuestion.constraints && currentQuestion.constraints.length > 0)
    ? currentQuestion.constraints
    : [
        "Input parameters are guaranteed to match declared types.",
        "Expected optimal time and space complexity.",
        "Handle edge cases (boundary values, empty inputs)."
      ];

  const problemHints = currentQuestion.hints || [];

  // Available languages for this question
  const availableLanguages = currentQuestion.language === 'sql' 
    ? [{ id: 'sql', label: 'SQL (SQLite)', ext: 'sql' }]
    : SUPPORTED_LANGUAGES;

  return (
    <div className={`mx-auto px-3 sm:px-6 py-4 transition-all ${isWideMode || isCodeQuestion ? 'max-w-[1600px]' : 'max-w-4xl'}`}>
      {/* Top Universal Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-md mb-4 flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/80">
            Question {questionIndex} of {totalPlanned}
          </span>
          
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            difficulty === 'Advanced' 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
              : difficulty === 'Intermediate' 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {difficulty}
          </span>

          <span className="hidden sm:inline-flex text-xs font-semibold text-slate-400 bg-slate-800/60 px-2.5 py-0.5 rounded-md border border-slate-700/60">
            Skill: {currentQuestion.skill_tested}
          </span>

          {isCodeQuestion && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Hands-on Coding Challenge
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Time: {formatTimer(timerSeconds)}</span>
          </div>

          {isCodeQuestion && (
            <button
              type="button"
              onClick={() => setIsWideMode(!isWideMode)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer hidden md:block"
              title={isWideMode ? "Standard View" : "Expanded Wide View"}
            >
              {isWideMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            disabled={submittingAnswer || (isCodeQuestion ? !codeAnswer.trim() : !selectedOption)}
            onClick={handleSubmitAnswer}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            {submittingAnswer 
              ? (isCodeQuestion ? 'Evaluating...' : 'Submitting...') 
              : (isCodeQuestion ? 'Submit Solution' : 'Confirm & Next')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. LEETCODE-STYLE DUAL-PANE WORKSPACE FOR CODING CHALLENGES */}
      {/* ========================================================================= */}
      {isCodeQuestion ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* ------------------------------------------------------------- */}
          {/* LEFT COLUMN: PROBLEM SPECIFICATION (LeetCode Problem Tab)     */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[750px]">
            {/* Tab Header */}
            <div className="bg-slate-100/80 border-b border-slate-200 px-3 pt-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveLeftTab('description')}
                className={`text-xs font-semibold px-3 py-2 rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
                  activeLeftTab === 'description'
                    ? 'bg-white text-indigo-700 border-slate-200 -mb-px font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 border-transparent'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Description
              </button>
              <button
                type="button"
                onClick={() => setActiveLeftTab('examples')}
                className={`text-xs font-semibold px-3 py-2 rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
                  activeLeftTab === 'examples'
                    ? 'bg-white text-indigo-700 border-slate-200 -mb-px font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 border-transparent'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" /> Examples & Constraints
              </button>
              {problemHints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveLeftTab('hints')}
                  className={`text-xs font-semibold px-3 py-2 rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer border-t border-x ${
                    activeLeftTab === 'hints'
                      ? 'bg-white text-indigo-700 border-slate-200 -mb-px font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Hints ({problemHints.length})
                </button>
              )}
            </div>

            {/* Tab Content Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              
              {/* TAB 1: DESCRIPTION */}
              {activeLeftTab === 'description' && (
                <div className="space-y-6">
                  {/* Problem Title & Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{currentQuestion.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        difficulty === 'Advanced' 
                          ? 'bg-rose-100 text-rose-700' 
                          : difficulty === 'Intermediate' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {difficulty}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {currentQuestion.skill_tested}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      {problemTitle}
                    </h1>
                  </div>

                  {/* Problem Statement */}
                  <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line space-y-3 font-normal">
                    {problemDescription}
                  </div>

                  {/* Examples Section */}
                  {problemExamples.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Examples
                      </h3>
                      {problemExamples.map((ex, idx) => (
                        <div key={idx} className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                          <span className="font-bold font-sans text-slate-900 block text-xs">
                            Example {ex.id || idx + 1}:
                          </span>
                          <div className="space-y-1">
                            <div>
                              <strong className="text-slate-400 font-sans mr-2">Input:</strong>
                              <span className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200/60 inline-block">
                                {ex.input}
                              </span>
                            </div>
                            <div>
                              <strong className="text-slate-400 font-sans mr-2">Output:</strong>
                              <span className="text-indigo-600 font-bold bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
                                {ex.output}
                              </span>
                            </div>
                            {ex.explanation && (
                              <div className="text-slate-600 font-sans pt-1 border-t border-slate-200/50">
                                <strong className="text-slate-400 mr-2">Explanation:</strong>
                                <span>{ex.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints Section */}
                  <div className="pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                      Constraints
                    </h3>
                    <ul className="space-y-1.5 bg-slate-50/60 border border-slate-200/80 rounded-xl p-3 text-xs font-mono text-slate-700">
                      {problemConstraints.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: EXAMPLES & CONSTRAINTS */}
              {activeLeftTab === 'examples' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-1">
                      Structured Input / Output Specifications
                    </h2>
                    <p className="text-xs text-slate-500">
                      Review sample cases and verification boundaries.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {problemExamples.map((ex, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-700 uppercase">
                            Case #{ex.id || idx + 1}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono space-y-1">
                          <p><strong className="text-slate-400 font-sans">Input:</strong> {ex.input}</p>
                          <p><strong className="text-indigo-500 font-sans">Expected Output:</strong> {ex.output}</p>
                          {ex.explanation && (
                            <p className="text-slate-600 font-sans pt-1 border-t border-slate-100">
                              <strong className="text-slate-400">Explanation:</strong> {ex.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase">Operational Limits</h4>
                    <ul className="space-y-1 text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {problemConstraints.map((c, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: HINTS */}
              {activeLeftTab === 'hints' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" /> Solution Hints
                    </h2>
                    <p className="text-xs text-slate-500">
                      Algorithmic considerations and complexity advice.
                    </p>
                  </div>

                  {problemHints.map((hint, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 text-xs text-amber-950 space-y-1">
                      <span className="font-bold uppercase tracking-wider text-amber-800 text-[10px] block">
                        Hint {idx + 1}
                      </span>
                      <p className="leading-relaxed font-medium">{hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT COLUMN: LEETCODE CODE EDITOR & BOTTOM CONSOLE DRAWER     */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            
            {/* Code Editor Container */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-[460px]">
              
              {/* LeetCode Editor Header Bar */}
              <div className="bg-slate-900 text-slate-200 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  {/* Language Selector Dropdown */}
                  <div className="relative flex items-center">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400 mr-2" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-slate-800 text-slate-100 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer pr-7"
                    >
                      {availableLanguages.map(lang => (
                        <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
                    Tab = 4 spaces
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCode}
                    className="px-2.5 py-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                    title="Reset starter template"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>

                  <button
                    type="button"
                    disabled={runningCode || !codeAnswer.trim()}
                    onClick={handleRunCode}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    title="Run code against test cases (Ctrl + Enter)"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {runningCode ? 'Executing...' : 'Run Code'}
                  </button>
                </div>
              </div>

              {/* Code Editor Body */}
              <div className="relative flex flex-1 overflow-hidden bg-slate-950 font-mono text-xs sm:text-sm">
                {/* Line numbers column */}
                <div className="bg-slate-900/60 select-none py-3 px-2 text-right text-slate-600 border-r border-slate-800/80 w-10 font-mono text-xs shrink-0">
                  {lineNumbers.map(n => (
                    <div key={n} className="leading-6">{n}</div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={codeAnswer}
                  onChange={(e) => setCodeAnswer(e.target.value)}
                  onKeyDown={handleCodeKeyDown}
                  placeholder={`// Implement your ${selectedLanguage.toUpperCase()} solution here...`}
                  spellCheck={false}
                  className="w-full bg-transparent p-3 font-mono text-xs sm:text-sm text-emerald-300 placeholder-slate-600 focus:outline-hidden resize-none leading-6 selection:bg-indigo-600 selection:text-white overflow-y-auto"
                />
              </div>
            </div>

            {/* Bottom Testcase & Results Drawer (LeetCode Console) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              {/* Console Header Bar */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConsoleTab('testcase');
                      setIsConsoleOpen(true);
                    }}
                    className={`font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeConsoleTab === 'testcase' && isConsoleOpen
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Testcase
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConsoleTab('result');
                      setIsConsoleOpen(true);
                    }}
                    className={`font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeConsoleTab === 'result' && isConsoleOpen
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Test Result
                    {codeRunResult && (
                      <span className={`w-2 h-2 rounded-full ${codeRunResult.all_passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    Ctrl + Enter to run
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                    title={isConsoleOpen ? "Collapse Console" : "Expand Console"}
                  >
                    {isConsoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Console Body */}
              {isConsoleOpen && (
                <div className="p-4 h-[240px] overflow-y-auto font-mono text-xs">
                  
                  {/* CONSOLE TAB 1: TEST CASES INPUT INSPECTION */}
                  {activeConsoleTab === 'testcase' && (
                    <div className="space-y-3">
                      {/* Case Pill Switcher */}
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        {problemExamples.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedCaseIndex(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              selectedCaseIndex === idx
                                ? 'bg-slate-900 text-white font-bold'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Selected Case Details */}
                      {problemExamples[selectedCaseIndex] && (
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1 font-sans">
                              Input
                            </span>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800">
                              {problemExamples[selectedCaseIndex].input}
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1 font-sans">
                              Expected Output
                            </span>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-indigo-700 font-bold">
                              {problemExamples[selectedCaseIndex].output}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONSOLE TAB 2: EXECUTION RESULTS */}
                  {activeConsoleTab === 'result' && (
                    <div>
                      {!codeRunResult ? (
                        <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 space-y-2 font-sans">
                          <PlayCircle className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs">
                            Run your code to compile and verify test cases in the sandbox.
                          </p>
                          <button
                            type="button"
                            onClick={handleRunCode}
                            disabled={runningCode || !codeAnswer.trim()}
                            className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Run Test Cases
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Status Banner */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-sans">
                              <span className={`text-base font-extrabold ${
                                codeRunResult.all_passed ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {codeRunResult.all_passed ? 'Accepted' : 'Wrong Answer'}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({codeRunResult.passed_count}/{codeRunResult.total_count} test cases passed)
                              </span>
                            </div>

                            {codeRunResult.test_results?.[0]?.execution_time_ms !== undefined && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                Runtime: {codeRunResult.test_results[0].execution_time_ms} ms
                              </span>
                            )}
                          </div>

                          {/* Error if present */}
                          {codeRunResult.error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-mono text-xs">
                              <strong className="block mb-1">Execution Trace / Error:</strong>
                              <pre className="whitespace-pre-wrap">{codeRunResult.error}</pre>
                            </div>
                          )}

                          {/* Test results per case */}
                          <div className="space-y-2">
                            {codeRunResult.test_results.map((tr) => (
                              <div
                                key={tr.case_number}
                                className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                                  tr.passed
                                    ? 'bg-slate-50/60 border-slate-200'
                                    : 'bg-rose-50/40 border-rose-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800">
                                    Case #{tr.case_number}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                    tr.passed
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-rose-100 text-rose-700'
                                  }`}>
                                    {tr.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    {tr.passed ? 'PASSED' : 'FAILED'} ({tr.execution_time_ms}ms)
                                  </span>
                                </div>

                                <div>
                                  <span className="text-slate-400 mr-2 font-sans">Input:</span>
                                  <span className="text-slate-800">{tr.input_repr}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 mr-2 font-sans">Expected:</span>
                                  <span className="text-slate-800">{tr.expected_repr}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 mr-2 font-sans">Your Output:</span>
                                  <span className={tr.passed ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                    {tr.actual_repr}
                                  </span>
                                </div>
                                {tr.error && (
                                  <div className="text-rose-600 italic">
                                    <span className="text-slate-400 mr-2 font-sans">Error:</span>
                                    {tr.error}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. STANDARD CONCEPTUAL / MCQ / SCENARIO QUESTIONS                         */
        /* ========================================================================= */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Testing Competency: <strong className="text-slate-700">{currentQuestion.skill_tested}</strong>
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {currentQuestion.question_text}
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionSelect(opt)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Item response theory calibrates question difficulty dynamically.
            </span>
            <button
              type="button"
              disabled={submittingAnswer || !selectedOption}
              onClick={handleSubmitAnswer}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submittingAnswer ? 'Evaluating...' : 'Confirm & Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
