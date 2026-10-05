import React, { useState } from 'react';
import { X, AlertCircle, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isGoogle = provider === 'google';

  const defaultProfiles = isGoogle ? [
    { name: 'Abhijeet Sah', email: 'abhijeet.recruitiq@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abhijeet' },
    { name: 'Manish Kumar', email: 'manish.dev@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manish' },
  ] : [
    { name: 'Alex Rivera', email: 'alex.rivera@facebook.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { name: 'Samantha Vance', email: 'samantha.vance@facebook.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samantha' },
  ];

  const handleSelectProfile = async (profName: string, profEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      const user = await socialLogin({
        provider,
        email: profEmail,
        full_name: profName,
        role: selectedRole,
      });
      onSuccess(user.role || selectedRole);
    } catch (err: any) {
      setError(err.message || 'Social authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      setError('Please provide your name and email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await socialLogin({
        provider,
        email,
        full_name: fullName,
        role: selectedRole,
      });
      onSuccess(user.role || selectedRole);
    } catch (err: any) {
      setError(err.message || 'Social authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${isGoogle ? 'bg-white border-b border-slate-100' : 'bg-[#1877F2] text-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isGoogle ? (
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              ) : (
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              <div>
                <h3 className={`text-base font-bold ${isGoogle ? 'text-slate-900' : 'text-white'}`}>
                  {isGoogle ? 'Sign in with Google' : 'Log in with Facebook'}
                </h3>
                <p className={`text-xs ${isGoogle ? 'text-slate-500' : 'text-blue-100'}`}>
                  to continue to RecruitIQ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isGoogle ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role confirmation if registering */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Join RecruitIQ as
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CANDIDATE')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedRole === 'CANDIDATE'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('RECRUITER')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedRole === 'RECRUITER'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" /> Recruiter
                </button>
              </div>
            </div>
          )}

          {/* Quick 1-Click Social Accounts */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Choose an account
            </p>
            <div className="space-y-2">
              {defaultProfiles.map((prof) => (
                <button
                  key={prof.email}
                  disabled={loading}
                  onClick={() => handleSelectProfile(prof.name, prof.email)}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 transition-all flex items-center justify-between text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {prof.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{prof.email}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or enter your account</span>
            </div>
          </div>

          {/* Custom Google/Facebook Account Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isGoogle ? 'Google / Gmail Address' : 'Facebook Email / Username'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isGoogle ? 'youremail@gmail.com' : 'youremail@facebook.com'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isGoogle ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#1877F2] hover:bg-[#166fe5]'
              }`}
            >
              {loading ? 'Authenticating...' : `Continue with ${isGoogle ? 'Google' : 'Facebook'}`} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400">
            By connecting your {isGoogle ? 'Google' : 'Facebook'} account, you agree to RecruitIQ's Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
