import React, { useState } from 'react';
import { X, AlertCircle, ArrowRight, UserCheck, Briefcase, Lock, Mail, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface SocialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google' | 'facebook';
  mode: 'login' | 'register';
  role?: UserRole;
  onSuccess: (role: UserRole) => void;
}

export const SocialAuthModal: React.FC<SocialAuthModalProps> = ({
  isOpen,
  onClose,
  provider,
  mode,
  role = 'CANDIDATE',
  onSuccess,
}) => {
  const { socialLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isGoogle = provider === 'google';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const user = await socialLogin({
        provider,
        email: cleanEmail,
        full_name: fullName.trim() || cleanEmail.split('@')[0],
        password: password || undefined,
        role: selectedRole,
      });
      onSuccess(user.role || selectedRole);
    } catch (err: any) {
      setError(err.message || `${isGoogle ? 'Google' : 'Facebook'} authentication failed. Please verify your credentials.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${isGoogle ? 'bg-white border-b border-slate-100' : 'bg-[#1877F2] text-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isGoogle ? (
                <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              )}
              <div>
                <h3 className={`text-base font-bold ${isGoogle ? 'text-slate-900' : 'text-white'}`}>
                  {isGoogle ? 'Sign in with Google' : 'Log in with Facebook'}
                </h3>
                <p className={`text-xs ${isGoogle ? 'text-slate-500' : 'text-blue-100'}`}>
                  to continue to RecruitIQ Cloud
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isGoogle ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select your role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('CANDIDATE')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'CANDIDATE'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('RECRUITER')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'RECRUITER'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Recruiter</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={selectedRole === 'RECRUITER' ? 'e.g. Sarah Jenkins' : 'e.g. Rahul Sharma'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isGoogle ? 'Google / Gmail Address' : 'Facebook Email / Username'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isGoogle ? 'youremail@gmail.com' : 'youremail@facebook.com'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Required for secure MongoDB credential verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isGoogle
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  : 'bg-[#1877F2] hover:bg-[#166fe5] shadow-blue-500/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Continue with {isGoogle ? 'Google' : 'Facebook'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted with OAuth 2.0 &bull; Synced with MongoDB Atlas Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
