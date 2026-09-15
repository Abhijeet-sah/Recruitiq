import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogOut, User as UserIcon, Shield, Briefcase, Award, BarChart3, Users, Cpu, FlaskConical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
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
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md shadow-indigo-500/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
