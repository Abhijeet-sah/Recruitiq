import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, CheckCircle2, AlertCircle, Info, KeyRound } from 'lucide-react';
import { authApi } from '../../api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    email_sent: boolean;
    mode: string;
    reset_url?: string;
    reset_token?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setResult(res);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">RecruitIQ</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your registered email address to receive reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-slate-200 sm:rounded-2xl">
          {submitted && result ? (
            <div className="text-center py-2 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {result.email_sent ? 'Reset Email Dispatched' : 'Reset Link Generated'}
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                {result.email_sent ? (
                  <>
                    A secure password reset link has been dispatched to <strong>{email}</strong>. Please check your inbox and spam folder.
                  </>
                ) : (
                  <>
                    Password reset instructions have been generated for <strong>{email}</strong>.
                  </>
                )}
              </p>

              {/* In local simulation mode, provide immediate 1-click reset access */}
              {result.reset_token && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <span>Instant Password Reset Access</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {result.email_sent ? (
                      'You can also use this direct button to reset your password right now:'
                    ) : (
                      'SMTP is in local simulation mode (no external email server configured in backend/.env). Click below to reset your password now:'
                    )}
                  </p>
                  <Link
                    to={`/reset-password?token=${result.reset_token}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all"
                  >
                    Set New Password Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {!result.email_sent && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    How to send real emails to your Gmail inbox:
                  </div>
                  <p>
                    Add your Gmail and 16-character App Password to <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">backend/.env</code> (<code className="text-[11px]">SMTP_USER</code> &amp; <code className="text-[11px]">SMTP_PASSWORD</code>).
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block w-full py-2.5 text-center text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Instructions'}
              </button>
              <div className="text-center text-sm text-slate-600">
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
