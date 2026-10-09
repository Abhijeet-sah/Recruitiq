import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogOut, User as UserIcon, Shield, Briefcase, Award, BarChart3, Users, Cpu, FlaskConical, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScrollTo = (sectionId: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#' + sectionId);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              RecruitIQ
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              AI 2.0
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => handleScrollTo('showcase')}
                className="hover:text-white hover:scale-105 transition-all cursor-pointer font-medium text-slate-300"
              >
                Platform Showcase
              </button>
              <button
                onClick={() => handleScrollTo('features')}
                className="hover:text-white hover:scale-105 transition-all cursor-pointer font-medium text-slate-300"
              >
                Core Modules
              </button>
              <button
                onClick={() => handleScrollTo('fairness')}
                className="hover:text-white hover:scale-105 transition-all cursor-pointer font-medium text-slate-300"
              >
                Fairness & Ethics
              </button>
              <button
                onClick={() => handleScrollTo('workflow')}
                className="hover:text-white hover:scale-105 transition-all cursor-pointer font-medium text-slate-300"
              >
                How It Works
              </button>
              <button
                onClick={() => handleScrollTo('faq')}
                className="hover:text-white hover:scale-105 transition-all cursor-pointer font-medium text-slate-300"
              >
                FAQ
              </button>
            </>
          ) : user?.role === 'RECRUITER' ? (
            <>
              <Link to="/recruiter/dashboard" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Dashboard
              </Link>
              <Link to="/recruiter/jobs/new" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Briefcase className="w-4 h-4 text-cyan-400" /> Post Requisition
              </Link>
              <Link to="/recruiter/rankings" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Award className="w-4 h-4 text-amber-400" /> Explainable Rankings
              </Link>
              <Link to="/recruiter/fairness" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Shield className="w-4 h-4 text-emerald-400" /> Fairness Audit
              </Link>
              <Link to="/admin/models" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Cpu className="w-4 h-4 text-purple-400" /> Models
              </Link>
            </>
          ) : user?.role === 'CANDIDATE' ? (
            <>
              <Link to="/candidate/dashboard" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> My Dashboard
              </Link>
              <Link to="/candidate/jobs" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Briefcase className="w-4 h-4 text-cyan-400" /> Explore Jobs
              </Link>
              <Link to="/candidate/profile" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <UserIcon className="w-4 h-4 text-emerald-400" /> Profile & Resume
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin/dashboard" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Shield className="w-4 h-4 text-indigo-400" /> Admin Console
              </Link>
              <Link to="/recruiter/dashboard" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Recruiter View
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / User controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.full_name[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-200 leading-none">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 capitalize font-medium">{user.role.toLowerCase()}</p>
                </div>
                <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'RECRUITER' ? 'primary' : 'success'} size="sm">
                  {user.role}
                </Badge>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-2.5 shadow-2xl backdrop-blur-xl">
          {!isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { handleScrollTo('showcase'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900"
              >
                Platform Showcase
              </button>
              <button
                onClick={() => { handleScrollTo('features'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900"
              >
                Core Modules
              </button>
              <button
                onClick={() => { handleScrollTo('fairness'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900"
              >
                Fairness & Ethics
              </button>
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : user?.role === 'RECRUITER' ? (
            <div className="flex flex-col gap-1.5">
              <Link
                to="/recruiter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Recruiter Dashboard
              </Link>
              <Link
                to="/recruiter/jobs/new"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-cyan-400" /> Post New Job
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Link
                to="/candidate/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" /> My Career Dashboard
              </Link>
              <Link
                to="/candidate/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-cyan-400" /> Explore Open Roles
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
