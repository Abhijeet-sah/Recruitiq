import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Brain, CheckCircle, ArrowRight,
  TrendingUp, BarChart3, Layers, Award, Users, Shield, Cpu, Lock, CheckCircle2,
  Code2, ExternalLink
} from 'lucide-react';
import { RecruitmentFlow } from '../components/workflow/RecruitmentFlow';
import { useAuth } from '../contexts/AuthContext';

import heroDashboardImg from '../assets/hero_dashboard.jpg';
import semanticMatchImg from '../assets/semantic_match.jpg';
import adaptiveTestImg from '../assets/adaptive_assessment.jpg';
import fairnessGovImg from '../assets/fairness_governance.jpg';

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
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Ambient Radial Gradient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent blur-[140px] pointer-events-none rounded-full z-0" />
      <div className="fixed top-[45%] right-[-150px] w-[600px] h-[600px] bg-gradient-to-bl from-purple-600/10 via-indigo-600/10 to-transparent blur-[150px] pointer-events-none rounded-full z-0" />
      <div className="fixed top-[80%] left-[-150px] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/10 via-indigo-600/10 to-transparent blur-[150px] pointer-events-none rounded-full z-0" />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 lg:pt-28 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 shadow-lg shadow-indigo-500/10 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>RecruitIQ 2.0 &bull; Explainable AI & Adaptive Hiring Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
            Smarter Recruitment.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
              Fairer Decisions.
            </span>
            <br />
            <span className="text-slate-300 font-extrabold text-3xl sm:text-5xl lg:text-6xl">
              Verifiable Talent.
            </span>
          </h1>

          <p className="mt-7 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            An advanced hiring platform combining <strong className="text-white">Sentence-BERT semantic matching</strong>, <strong className="text-cyan-300">dynamic adaptive technical testing</strong>, <strong className="text-indigo-300">transparent score explainability</strong>, and <strong className="text-emerald-400">demographic fairness auditing</strong>.
          </p>

          {/* Call to Actions */}
          {isAuthenticated && user ? (
            <div className="mt-9 max-w-md mx-auto p-5 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-2xl backdrop-blur-xl text-center">
              <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                Active Authenticated Session
              </p>
              <p className="text-base font-bold text-white mt-1">
                {user.full_name} <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono ml-1">{user.role}</span>
              </p>
              <Link
                to={user.role === 'RECRUITER' ? '/recruiter/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/candidate/dashboard'}
                className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Open {user.role === 'RECRUITER' ? 'Recruiter Dashboard' : user.role === 'ADMIN' ? 'Admin Console' : 'Candidate Portal'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register?role=recruiter"
                className="px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-cyan-500/25 hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer"
              >
                Post Jobs (Recruiter) <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/register?role=candidate"
                className="px-6 py-3.5 text-sm font-bold text-slate-100 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-2xl shadow-lg hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
              >
                Apply as Candidate <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDemoRecruiterLogin}
                  className="px-4 py-3.5 text-xs font-bold text-slate-300 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Recruiter Demo <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/30 font-mono">1-Click</span>
                </button>

                <button
                  type="button"
                  onClick={handleDemoCandidateLogin}
                  className="px-4 py-3.5 text-xs font-bold text-slate-300 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Candidate Demo <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">1-Click</span>
                </button>
              </div>
            </div>
          )}

          {/* Key Metric Highlights */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">4-Stage</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Semantic Vector Matching</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">Adaptive</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Dynamic IRT Competency Engine</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">100%</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Explainable Score Breakdown</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">&ge; 80%</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Four-Fifths Fairness Compliance</p>
            </div>
          </div>

          {/* Visual Platform Showcase: Hero Dashboard Mockup Image */}
          <div id="showcase" className="mt-16 relative max-w-6xl mx-auto">
            <div className="relative rounded-3xl p-2 bg-gradient-to-b from-indigo-500/30 via-slate-800/40 to-cyan-500/30 shadow-[0_0_80px_-20px_rgba(99,102,241,0.4)] border border-indigo-500/30">
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl relative">
                {/* Browser Toolbar Header */}
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">
                      https://recruitiq.ai/recruiter/analytics-suite
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Live AI Decision Support Active
                    </span>
                  </div>
                </div>

                {/* Real High-Tech Generated Dashboard Image */}
                <img
                  src={heroDashboardImg}
                  alt="RecruitIQ Enterprise Talent Suite Analytics Dashboard Mockup"
                  className="w-full h-auto object-cover block select-none hover:scale-[1.01] transition-transform duration-500"
                />

                {/* Floating Live Pill Overlays */}
                <div className="absolute top-16 left-6 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-xl shadow-xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-bold text-white">94% Semantic Precision (SBERT)</span>
                </div>

                <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/40 backdrop-blur-xl shadow-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">Demographic Parity Audit Passed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Tech & Partner Band */}
      <section className="relative z-10 py-10 border-y border-slate-800/80 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-6">
            Engineered with Modern Open-Source & Enterprise Cloud Infrastructure
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-300 text-sm font-semibold opacity-85">
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> MongoDB Atlas Cloud
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Python FastAPI 3.12
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Sentence-BERT NLP
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> React 19 + TypeScript
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Galgotias University School of CSE
            </span>
          </div>
        </div>
      </section>

      {/* Interactive 3-Pillar Visual Showcases */}
      <section id="features" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Showcase 1: Semantic Job–Resume Vector Matching */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-indigo-400" /> Pillar 01 &bull; Natural Language Processing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Semantic Vector Matching Beyond Exact Keywords
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Traditional ATS engines miss top engineers whose resumes use synonymous terminology. RecruitIQ leverages dense <strong className="text-white">Sentence-BERT (SBERT) vector representations</strong> to measure conceptual overlap across competencies.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-indigo-400 block mb-1">40% Skill Match</span>
                <span className="text-xs text-slate-400">Contextual subword similarity with importance weights.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 block mb-1">25% Experience Fit</span>
                <span className="text-xs text-slate-400">Tenure and technical depth in relevant engineering domains.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-purple-400 block mb-1">15% Academic Foundation</span>
                <span className="text-xs text-slate-400">Degree relevance and certified educational milestones.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 block mb-1">20% Practical Projects</span>
                <span className="text-xs text-slate-400">Demonstrated code contributions and capstones.</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl p-2.5 bg-gradient-to-tr from-indigo-500/30 to-purple-500/20 border border-indigo-500/30 shadow-2xl overflow-hidden group">
            <img
              src={semanticMatchImg}
              alt="3D Holographic Semantic Job-Resume Matching Visual"
              className="rounded-2xl w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-xl">
              <p className="text-xs font-bold text-white flex items-center justify-between">
                <span>Dense Neural Match Simulation</span>
                <span className="text-emerald-400 font-mono font-extrabold">96% Semantic Similarity</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Cosine distance computed between candidate vector \(e_R\) and requisition vector \(e_J\).
              </p>
            </div>
          </div>
        </div>

        {/* Showcase 2: Computerized Adaptive Technical Testing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative rounded-3xl p-2.5 bg-gradient-to-tr from-cyan-500/30 to-indigo-500/20 border border-cyan-500/30 shadow-2xl overflow-hidden group">
            <img
              src={adaptiveTestImg}
              alt="Adaptive Code Assessment Environment Visual"
              className="rounded-2xl w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-xl">
              <p className="text-xs font-bold text-white flex items-center justify-between">
                <span>Item Response Dynamic Assessment</span>
                <span className="text-cyan-400 font-mono font-extrabold">Level 3: Advanced Difficulty</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Difficulty parameter \(b_i\) escalates dynamically when candidate ability \(\theta\) demonstrates mastery.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Pillar 02 &bull; Demonstrated Capability
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Adaptive Technical Testing Verifies Real Skills
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Anyone can list technologies on a resume. RecruitIQ supplements document screening with a <strong className="text-white">Computerized Adaptive Testing (CAT)</strong> engine that evaluates demonstrated proficiency.
            </p>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Dynamic Difficulty Scaling:</strong> Correct responses unlock higher complexity problems; incorrect answers calibrate to confirm core fundamentals.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Claim vs. Evidence Consistency:</strong> Discrepancies between resume claims and demonstrated quiz performance are flagged neutrally for recruiter verification.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Curated 100+ Problem Bank:</strong> Verified questions spanning Python, React, Cloud Architecture, DevOps, Algorithms, and Machine Learning.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Showcase 3: Algorithmic Fairness & Ethical AI Governance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pillar 03 &bull; Ethical AI Governance
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Audited Fairness & Bias Elimination
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              RecruitIQ isolates sensitive demographic attributes completely from candidate scoring algorithms. Fairness metrics are calculated in an independent audit dashboard to ensure compliance with the <strong className="text-white">EEOC Four-Fifths Disparate Impact rule</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-lg font-bold text-emerald-400 mb-1">&Delta;DP &le; 0.10</div>
                <p className="text-xs text-slate-300 font-semibold">Demographic Parity Audit</p>
                <p className="text-[11px] text-slate-400 mt-1">Measures selection rate parity differences across gender and age cohorts.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-lg font-bold text-cyan-400 mb-1">DI &ge; 0.80</div>
                <p className="text-xs text-slate-300 font-semibold">Disparate Impact Ratio</p>
                <p className="text-[11px] text-slate-400 mt-1">Verifies selection rate ratio adheres strictly to standard adverse impact thresholds.</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl p-2.5 bg-gradient-to-tr from-emerald-500/30 to-cyan-500/20 border border-emerald-500/30 shadow-2xl overflow-hidden group">
            <img
              src={fairnessGovImg}
              alt="Holographic Ethical AI Governance Balance Scale Visual"
              className="rounded-2xl w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-xl">
              <p className="text-xs font-bold text-white flex items-center justify-between">
                <span>Fairness & Counterfactual Invariance</span>
                <span className="text-emerald-400 font-mono font-extrabold">100% Equal Opportunity</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero proxy scoring guarantees demographic perturbations result in zero score change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complete System Workflow Section */}
      <section id="workflow" className="relative z-10 py-24 bg-slate-950/80 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/15 px-3.5 py-1.5 rounded-full border border-indigo-500/30">
              Complete End-to-End Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">
              How RecruitIQ Operates
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Explore the 8 interconnected stages connecting initial job requisition drafting to recruiter final hiring dossiers.
            </p>
          </div>
          <RecruitmentFlow />
        </div>
      </section>

      {/* Recruiter & Candidate Experience Cards */}
      <section className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recruiter Card */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
              For Talent Acquisition Teams
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-4 mb-3">Empowering Recruiters with Rigor</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Accelerate candidate shortlisting while eliminating subjective bias and unverified claims.
            </p>
            <ul className="space-y-3.5 text-sm text-slate-300 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>AI Job Requisition Studio:</strong> 1-click industry templates, knockouts, and multi-currency compensation.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Multi-Candidate Comparison Dossier:</strong> Side-by-side radar charts, code test scores, and consistency flags.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Strict Human Oversight:</strong> Automated rankings provide transparent recommendations; hiring authority stays with you.</span>
              </li>
            </ul>
            <Link
              to="/register?role=recruiter"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-indigo-600/30"
            >
              Access Recruiter Studio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Candidate Card */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
              For Job Seekers & Developers
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-4 mb-3">Transparent, Fair & Developmental</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Never get rejected by an unthinking keyword bot again. Prove real capability and receive personalized upskilling plans.
            </p>
            <ul className="space-y-3.5 text-sm text-slate-300 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Explore Open Roles:</strong> Semantic matching finds roles aligned with your genuine technical competencies.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Adaptive Skill Passport:</strong> Prove hands-on coding mastery through calibrated adaptive assessments.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Personalized Upskilling Roadmap:</strong> Receive targeted learning topics, capstone ideas, and documentation links.</span>
              </li>
            </ul>
            <Link
              to="/register?role=candidate"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-cyan-600/30"
            >
              Open Candidate Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/30">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3">Governance & Architecture FAQ</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md">
            <h4 className="text-base font-bold text-white mb-1.5">Does RecruitIQ make fully autonomous hiring decisions?</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              No. RecruitIQ is architected as an <strong className="text-white">Explainable Decision-Support Tool</strong>. It provides transparent score decompositions, verified test evidence, and fairness indicators. Final interview invitations and employment offers remain strictly under human recruiter authority.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md">
            <h4 className="text-base font-bold text-white mb-1.5">How does the platform handle adversarial prompt-injection attacks?</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              RecruitIQ treats resume content as untrusted input data. Inbound text is sanitized to separate system instructions from candidate text, screening for prompt override patterns and hidden text instructions.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md">
            <h4 className="text-base font-bold text-white mb-1.5">Where are candidate credentials and applications stored?</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              All credentials are encrypted with bcrypt and synchronized in real time to <strong className="text-white">MongoDB Atlas Cloud Database</strong> alongside local PostgreSQL/SQLite relational models, guaranteeing persistent, zero-loss storage across server resets.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-12 bg-slate-950 text-center text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-white text-base">RecruitIQ</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">Final Year Project 2026–27</span>
          </div>
          <p className="font-medium text-slate-300">
            School of Computer Science & Engineering &bull; Galgotias University
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Engineered by Abhijeet Sah &amp; Manish Kumar under faculty guidance.
          </p>
        </div>
      </footer>
    </div>
  );
};
