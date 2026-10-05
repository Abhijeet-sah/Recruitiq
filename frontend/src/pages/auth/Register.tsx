import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, Briefcase, UserCheck, AlertCircle, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { SocialAuthModal } from '../../components/auth/SocialAuthModal';
import clsx from 'clsx';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role')?.toUpperCase();
  const initialRole: UserRole = roleParam === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialModal, setSocialModal] = useState<{ open: boolean; provider: 'google' | 'facebook' }>({
    open: false,
    provider: 'google',
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  // If user opened register page from role param, keep in sync
  useEffect(() => {
    if (roleParam === 'RECRUITER' || roleParam === 'CANDIDATE') {
      setRole(roleParam as UserRole);
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (!consent) {
      setError('Please accept the data privacy terms to proceed.');
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
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
      setError(err.message || 'Failed to create account. An account with this email may already exist.');
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
          Join RecruitIQ for fair, explainable, and AI-assisted hiring decision support
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-slate-200 sm:rounded-3xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Choose your account role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Candidate Option */}
                <button
                  type="button"
                  onClick={() => setRole('CANDIDATE')}
                  className={clsx(
                    'relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between',
                    role === 'CANDIDATE'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={clsx(
                        'w-9 h-9 rounded-xl flex items-center justify-center',
                        role === 'CANDIDATE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      )}>
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Candidate</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 inline-block mt-0.5">
                          Job Seeker
                        </span>
                      </div>
                    </div>
                    {role === 'CANDIDATE' && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Explore jobs, upload resume, complete skill assessments, and track job applications.
                  </p>
                </button>

                {/* Recruiter Option */}
                <button
                  type="button"
                  onClick={() => setRole('RECRUITER')}
                  className={clsx(
                    'relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between',
                    role === 'RECRUITER'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={clsx(
                        'w-9 h-9 rounded-xl flex items-center justify-center',
                        role === 'RECRUITER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      )}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Recruiter</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 inline-block mt-0.5">
                          Employer
                        </span>
                      </div>
                    </div>
                    {role === 'RECRUITER' && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Post job openings, review applicants with AI scoring, and run algorithmic fairness audits.
                  </p>
                </button>
              </div>

              {/* Active Role Confirmation Banner */}
              <div className="mt-3 py-2 px-3 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
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

              {/* Social Sign-Up Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setSocialModal({ open: true, provider: 'google' })}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  Sign up with Google
                </button>
                <button
                  type="button"
                  onClick={() => setSocialModal({ open: true, provider: 'facebook' })}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-[#1877F2] bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Sign up with Facebook
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2.5 text-slate-400 font-semibold tracking-wider">Or register with email</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'RECRUITER' ? 'e.g. Sarah Jenkins' : 'e.g. Rahul Sharma'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'RECRUITER' ? 'recruiter@company.com' : 'candidate@example.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role-Sensitive Privacy Notice & Consent Checkbox */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account in MongoDB Atlas...</span>
                </>
              ) : (
                <>
                  <span>Create {role === 'RECRUITER' ? 'Recruiter' : 'Candidate'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* MongoDB Security Guarantee */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted with bcrypt &bull; Synced with MongoDB Atlas Cloud Database</span>
          </div>

          <div className="mt-5 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <SocialAuthModal
        isOpen={socialModal.open}
        onClose={() => setSocialModal({ ...socialModal, open: false })}
        provider={socialModal.provider}
        mode="register"
        role={role}
        onSuccess={(targetRole) => {
          setSocialModal({ ...socialModal, open: false });
          if (targetRole === 'RECRUITER') {
            navigate('/recruiter/dashboard', { replace: true });
          } else if (targetRole === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/candidate/dashboard', { replace: true });
          }
        }}
      />
    </div>
  );
};
