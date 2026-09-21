import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Brain, CheckCircle, ArrowRight,
  TrendingUp, BarChart3, HelpCircle, Layers, Award, Users, ChevronRight
} from 'lucide-react';
import { RecruitmentFlow } from '../components/workflow/RecruitmentFlow';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleDemoRecruiterLogin = async () => {
    try {
      await login('recruiter@recruitiq.com', 'password123');
      navigate('/recruiter/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoCandidateLogin = async () => {
    try {
      await login('candidate1@recruitiq.com', 'password123');
      navigate('/candidate/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Next-Generation Explainable Hiring Decision Support
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Smarter Recruitment. <br />
            <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
              Fairer Decisions.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            An AI-powered recruitment platform that understands candidate skills, evaluates real capabilities through adaptive testing, explains every score, and identifies actionable skill gaps.
          </p>

          {/* If already authenticated, show personalized dashboard quick launch */}
          {isAuthenticated && user ? (
            <div className="mt-8 max-w-md mx-auto p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 shadow-sm text-center">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Signed In Session Active
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {user.full_name} ({user.role})
              </p>
              <Link
                to={user.role === 'RECRUITER' ? '/recruiter/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/candidate/dashboard'}
                className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                Go to {user.role === 'RECRUITER' ? 'Recruiter Dashboard' : user.role === 'ADMIN' ? 'Admin Console' : 'Career Portal'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/register?role=recruiter"
                className="px-5 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                Recruiter Sign Up <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/register?role=candidate"
                className="px-5 py-3.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                Candidate Sign Up <ArrowRight className="w-4 h-4" />
              </Link>
              
              <button
                onClick={handleDemoRecruiterLogin}
                className="px-4 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Recruiter Demo <span className="text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">1-Click</span>
              </button>

              <button
                onClick={handleDemoCandidateLogin}
                className="px-4 py-3.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 bg-transparent hover:bg-slate-100/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Candidate Demo <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">1-Click</span>
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="mt-16 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">4-Stage</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Multi-Dimensional Semantic Match</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">Adaptive</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Dynamic IRT Skill Evaluation</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">SHAP Feature Explainability</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">Fairlearn</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Controlled Disparity Auditing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecruitmentFlow />
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-slate-100/60 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Core Innovations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Built for Transparency, Rigor & Candidate Respect
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              RecruitIQ rejects superficial keyword filters in favor of verified capabilities and transparent decision support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Semantic Subword Matching</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Evaluates candidates using contextual subword embeddings. We separate Skill Match (40%), Experience (25%), Education (20%), and Projects (15%) for complete transparency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Adaptive Dynamic Testing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rather than giving static tests, our Item Response engine adjusts question difficulty (Beginner, Intermediate, Advanced) in real time based on candidate answers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Skill Consistency Analysis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cross-compares self-reported resume claims against verified assessment results. Uses neutral, non-accusatory phrasing to detect alignment or evidence gaps.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Explainable AI & SHAP Cards</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every score provides an explicit breakdown showing positive driving factors, missing competencies, and configurable weight contributions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fairness & Counterfactual Audit</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Audits selection rate differences, demographic parity, and equal opportunity without using demographic proxies in scoring models.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Personalized Skill Roadmap</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empowers rejected or developing candidates with an actionable 3-priority learning roadmap with realistic milestones and capstone project specs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fairness & Algorithmic Integrity Showcase Section */}
      <section id="fairness" className="py-20 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white border-y border-indigo-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 bg-indigo-800/60 px-3.5 py-1 rounded-full border border-indigo-700">
              Ethical AI & Fair Hiring Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3">
              Independent Fairness & Bias Auditing
            </h2>
            <p className="text-indigo-200 mt-3 text-base">
              Demographic proxies are strictly isolated from candidate scoring algorithms and evaluated exclusively post-hoc to guarantee equitable hiring across gender and age groups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-5">
                &Delta;
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Demographic Parity Audit</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Measures selection rate disparities between demographic cohorts. Highlights any discrepancy against the standard 10% tolerance boundary for human oversight.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-5">
                &cong;
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Equal Opportunity Ratio</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Compares true positive qualification rates among candidates meeting assessment benchmarks, verifying equal opportunity regardless of background.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg mb-5">
                0.0
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Counterfactual Invariance</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Perturbs protected proxy attributes (e.g. swapping gender flags) and verifies that evaluation scores remain 100% mathematically invariant (&Delta; = 0.0 pts).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter & Candidate Benefits */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recruiter side */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              For Hiring Teams
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 mb-4">Empowering Recruiters with Rigor</h3>
            <ul className="space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>AI Job Requirement Analysis:</strong> Automatically extracts skills and assigns importance weights with full manual override.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Explainable Score Weighting:</strong> Tune weights (Match, Assessment, Experience) dynamically according to hiring priorities.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Side-by-Side Comparison:</strong> Compare 2 to 4 candidates with multi-dimensional radar charts and structured gap analysis.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Controlled Fairness Auditing:</strong> Inspect demographic parity differences without introducing algorithmic bias into scoring.</span>
              </li>
            </ul>
          </div>

          {/* Candidate side */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              For Candidates
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-4 mb-4">Transparent, Fair & Developmental</h3>
            <ul className="space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Real Capability Verification:</strong> Prove genuine abilities through interactive adaptive assessments rather than keyword stuffing.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Clear Application Pipeline:</strong> Track every stage from submission to evaluation on an interactive timeline.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Objective Consistency Check:</strong> Neutral evidence-based feedback on self-reported resume claims.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Actionable Skill Roadmap:</strong> Receive a curated learning curriculum based on specific gaps rather than a generic rejection letter.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack Highlights */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase font-bold tracking-widest text-indigo-400">Enterprise Technology Foundation</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-8">Modern, Modular & Offline-Resilient</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
            {['FastAPI', 'Python 3.14', 'React 19', 'TypeScript', 'Tailwind CSS', 'SQLAlchemy 2.0', 'PostgreSQL', 'SQLite', 'PyMuPDF', 'python-docx', 'Scikit-Learn', 'Recharts', 'TanStack Query', 'Docker'].map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Governance & Methodology</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h4 className="text-base font-bold text-slate-900 mb-1">Does RecruitIQ make automated hiring decisions?</h4>
            <p className="text-sm text-slate-600">
              No. RecruitIQ is strictly a <strong>Decision-Support Tool</strong>. It provides transparent evidence, explainable scores, and consistency reports. Final hiring decisions remain under human recruiter supervision.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h4 className="text-base font-bold text-slate-900 mb-1">How are demographic proxy attributes used in fairness audits?</h4>
            <p className="text-sm text-slate-600">
              Demographic attributes (e.g. gender, age group) are <strong>strictly prohibited</strong> from scoring and ranking algorithms. They are evaluated exclusively in isolated post-hoc audit dashboards to inspect potential disparities.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h4 className="text-base font-bold text-slate-900 mb-1">What happens if external AI APIs are offline?</h4>
            <p className="text-sm text-slate-600">
              RecruitIQ has a resilient, zero-crash fallback design. The system runs fully functional local vectorizers, PyMuPDF parsers, and validated question banks, guaranteeing 100% operational uptime without external API keys.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 bg-white text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-700">RecruitIQ &bull; Smart AI-Based Recruitment and Candidate Evaluation System</p>
          <p className="text-xs text-slate-400 mt-1">Designed for Explainable, Fair, and Human-Supervised Talent Acquisition.</p>
        </div>
      </footer>
    </div>
  );
};
