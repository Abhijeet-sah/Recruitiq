import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogOut, User as UserIcon, Shield, Briefcase, Award, BarChart3, Users, Cpu, FlaskConical, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                RecruitIQ
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-indigo-100 text-indigo-700">
                AI
              </span>
            </div>
          </div>
        </Link>

        {/* Dynamic Center Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => handleScrollTo('workflow')}
                className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
              >
                How It Works
              </button>
              <button
                onClick={() => handleScrollTo('features')}
                className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
              >
                Core Features
              </button>
              <button
                onClick={() => handleScrollTo('fairness')}
                className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
              >
                Fairness Audit
              </button>
              <button
                onClick={() => handleScrollTo('faq')}
                className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
              >
                FAQ
              </button>
            </>
          ) : user?.role === 'RECRUITER' ? (
            <>
              <Link to="/recruiter/dashboard" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Dashboard
              </Link>
              <Link to="/recruiter/jobs/new" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Post Job
              </Link>
              <Link to="/recruiter/rankings" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <Award className="w-4 h-4 text-indigo-500" /> Explainable Rankings
              </Link>
              <Link to="/recruiter/fairness" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <Shield className="w-4 h-4 text-indigo-500" /> Fairness Audit
              </Link>
              <Link to="/admin/models" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <Cpu className="w-4 h-4 text-indigo-500" /> Models
              </Link>
              <Link to="/admin/research" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <FlaskConical className="w-4 h-4 text-indigo-500" /> Research
              </Link>
            </>
          ) : user?.role === 'CANDIDATE' ? (
            <>
              <Link to="/candidate/dashboard" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> My Dashboard
              </Link>
              <Link to="/candidate/jobs" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Explore Jobs
              </Link>
              <Link to="/candidate/profile" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <UserIcon className="w-4 h-4 text-indigo-500" /> Profile & Resume
              </Link>
            </>
          ) : user?.role === 'ADMIN' ? (
            <>
              <Link to="/admin/dashboard" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium">
                <Shield className="w-4 h-4 text-indigo-500" /> Admin
              </Link>
              <Link to="/recruiter/dashboard" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Recruiter
              </Link>
              <Link to="/recruiter/jobs/new" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Post Job
              </Link>
              <Link to="/recruiter/rankings" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium">
                <Award className="w-4 h-4 text-indigo-500" /> Rankings
              </Link>
              <Link to="/recruiter/fairness" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium">
                <Shield className="w-4 h-4 text-indigo-500" /> Fairness
              </Link>
              <Link to="/admin/models" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium">
                <Cpu className="w-4 h-4 text-indigo-500" /> Models
              </Link>
              <Link to="/admin/research" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium">
                <FlaskConical className="w-4 h-4 text-indigo-500" /> Research
              </Link>
            </>
          ) : (
            <Link to="/admin/dashboard" className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
              <Shield className="w-4 h-4 text-indigo-500" /> Admin Console
            </Link>
          )}
        </nav>

        {/* Right CTA / User controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.full_name[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500 leading-none mt-1 capitalize font-medium">{user.role.toLowerCase()}</p>
                </div>
                <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'RECRUITER' ? 'primary' : 'success'} size="sm">
                  {user.role}
                </Badge>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md shadow-indigo-500/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {!isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { handleScrollTo('workflow'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </button>
              <button
                onClick={() => { handleScrollTo('features'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Core Features
              </button>
              <button
                onClick={() => { handleScrollTo('fairness'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Fairness Audit
              </button>
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            </div>
          ) : user?.role === 'RECRUITER' ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2 mb-1 bg-indigo-50/70 rounded-lg text-xs font-semibold text-indigo-800 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Recruiter Portal ({user.full_name})
              </div>
              <Link
                to="/recruiter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Dashboard
              </Link>
              <Link
                to="/recruiter/jobs/new"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-indigo-500" /> Post New Job
              </Link>
              <Link
                to="/recruiter/rankings"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-indigo-500" /> Candidate Rankings
              </Link>
              <Link
                to="/recruiter/fairness"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-indigo-500" /> Fairness Audit
              </Link>
              <Link
                to="/admin/models"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-indigo-500" /> Model Registry
              </Link>
            </div>
          ) : user?.role === 'CANDIDATE' ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2 mb-1 bg-emerald-50/70 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Candidate Portal ({user.full_name})
              </div>
              <Link
                to="/candidate/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-indigo-500" /> My Career Dashboard
              </Link>
              <Link
                to="/candidate/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-indigo-500" /> Explore Jobs
              </Link>
              <Link
                to="/candidate/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-indigo-500" /> Profile & Resume
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-indigo-500" /> Admin Console
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
