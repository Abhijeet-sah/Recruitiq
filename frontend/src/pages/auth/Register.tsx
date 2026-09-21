import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, Briefcase, UserCheck, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import clsx from 'clsx';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role')?.toUpperCase();
  const initialRole: UserRole = roleParam === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, logout } = useAuth();
  const navigate = useNavigate();

  // If user opened register page from role param, keep in sync
  useEffect(() => {
    if (roleParam === 'RECRUITER' || roleParam === 'CANDIDATE') {
      setRole(roleParam as UserRole);
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Please accept the data privacy terms to proceed.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const registeredUser = await register({
        full_name: fullName,
        email,
        password,
        role,
      });

      const targetRole = registeredUser?.role || role;
      if (targetRole === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else if (targetRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">RecruitIQ</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Join RecruitIQ for explainable, fair, and AI-assisted hiring decision support
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-slate-200 sm:rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Prominent High-Contrast Role Selection Cards */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2.5">
                Choose your role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Candidate Option */}
                <button
                  type="button"
                  onClick={() => setRole('CANDIDATE')}
                  className={clsx(
                    'relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between',
                    role === 'CANDIDATE'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={clsx(
                        'w-9 h-9 rounded-lg flex items-center justify-center',
                        role === 'CANDIDATE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      )}>
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Candidate</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 inline-block mt-0.5">
                          Career Portal
                        </span>
                      </div>
                    </div>
                    {role === 'CANDIDATE' && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Upload resume, discover matching jobs, complete skill assessments, and track applications.
                  </p>
                </button>

                {/* Recruiter Option */}
                <button
                  type="button"
                  onClick={() => setRole('RECRUITER')}
                  className={clsx(
                    'relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between',
                    role === 'RECRUITER'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={clsx(
                        'w-9 h-9 rounded-lg flex items-center justify-center',
                        role === 'RECRUITER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      )}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Recruiter</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 inline-block mt-0.5">
                          Hiring Portal
                        </span>
                      </div>
                    </div>
                    {role === 'RECRUITER' && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Post jobs, review applicants with explainable AI, run fairness audits, and compare candidates.
                  </p>
                </button>
              </div>

              {/* Active Role Confirmation Banner */}
              <div className="mt-3 py-2 px-3 rounded-lg bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  {role === 'RECRUITER' ? (
                    <>💼 Registering as <strong>Recruiter (Employer)</strong></>
                  ) : (
                    <>👤 Registering as <strong>Candidate (Job Seeker)</strong></>
                  )}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Routes to {role === 'RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full name</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'RECRUITER' ? 'e.g. Sarah Connor' : 'e.g. Alex Johnson'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'RECRUITER' ? 'recruiter@company.com' : 'candidate@example.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Role-Sensitive Privacy Notice & Consent Checkbox */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the <strong>Privacy Policy</strong>. {role === 'RECRUITER' ? (
                    'Recruiter account data is used strictly for job management, applicant screening, and algorithmic fairness auditing.'
                  ) : (
                    'Candidate data is processed solely for competency evaluation and fairness auditing. Demographic proxies are never used to compute hiring scores.'
                  )}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Creating account...' : `Create ${role === 'RECRUITER' ? 'Recruiter' : 'Candidate'} Account`} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
