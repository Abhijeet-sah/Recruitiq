import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, Globe } from 'lucide-react';
import { Modal } from './Modal';
import { resolveBackendUrl, testBackendHealth } from '../../api/client';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(resolveBackendUrl());
      setStatus('idle');
      setStatusMsg('');
    }
  }, [isOpen]);

  const handleTest = async () => {
    if (!url.trim()) {
      setStatus('error');
      setStatusMsg('Please enter a valid backend URL.');
      return;
    }
    setStatus('testing');
    setStatusMsg('Pinging /health endpoint on backend server...');
    const res = await testBackendHealth(url.trim());
    if (res.success) {
      setStatus('success');
      setStatusMsg(res.message);
    } else {
      setStatus('error');
      setStatusMsg(`${res.message}. If the server was sleeping, wait 20-30 seconds and test again.`);
    }
  };

  const handleSave = () => {
    const cleanUrl = url.trim().replace(/\/$/, '');
    localStorage.setItem('recruitiq_backend_url', cleanUrl);
    setStatus('success');
    setStatusMsg('Saved! All API calls will now route to this backend.');
    if (onConnected) onConnected();
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 800);
  };

  const handleReset = () => {
    localStorage.removeItem('recruitiq_backend_url');
    setUrl(resolveBackendUrl());
    setStatus('idle');
    setStatusMsg('Reset to default configuration.');
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backend API Configuration" maxWidth="md">
      <div className="space-y-4 text-sm text-slate-600">
        <p>
          Connect this frontend to your deployed Render backend service (or custom backend URL).
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Backend API URL
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setStatus('idle');
              }}
              placeholder="https://recruitiq-backend-xxxx.onrender.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-slate-800 font-mono"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Copy this from your Render Dashboard &gt; <strong>recruitiq-backend</strong> service URL.
          </p>
        </div>

        {status !== 'idle' && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
              status === 'testing'
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : status === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {status === 'testing' && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin shrink-0 mt-0.5" />}
            {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {status === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={status === 'testing'}
              onClick={handleTest}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
            >
              Test Connection
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs hover:shadow-md transition-all"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
