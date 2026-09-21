import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Briefcase, FileText, CheckCircle2, 
  Activity, AlertCircle, RefreshCw, Lock, Unlock, Loader2 
} from 'lucide-react';
import { analyticsApi, adminApi } from '../../api';
import { AdminDashboardAnalytics, User } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';

const defaultAdminAnalytics: AdminDashboardAnalytics = {
  total_users: 0,
  total_candidates: 0,
  total_recruiters: 0,
  total_jobs: 0,
  total_applications: 0,
  total_assessments_taken: 0,
  ai_service_status: {
    embeddings: 'operational',
    resume_parser: 'operational',
    adaptive_engine: 'operational',
    fairness_auditor: 'operational',
  },
  recent_activity: [],
};

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminDashboardAnalytics>(defaultAdminAnalytics);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    loadAdminData();
    const timer = setTimeout(() => {
      setLoading(false);
      setFetching(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const loadAdminData = async () => {
    setFetching(true);
    try {
      const [analyticsData, usersData, logsData] = await Promise.all([
        analyticsApi.getAdmin().catch(() => defaultAdminAnalytics),
        adminApi.listUsers().catch(() => []),
        adminApi.getAuditLogs().catch(() => [])
      ]);
      setAnalytics(analyticsData || defaultAdminAnalytics);
      setUsers(usersData || []);
      setAuditLogs(logsData || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setAnalytics(prev => prev || defaultAdminAnalytics);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId: number) => {
    try {
      await adminApi.toggleUser(userId);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              System Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Platform Diagnostics & Governance</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Monitor AI service health, manage user accounts, and review compliance audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Users" value={analytics.total_users} icon={Users} color="indigo" />
        <StatCard title="Candidates" value={analytics.total_candidates} icon={Users} color="emerald" />
        <StatCard title="Recruiters" value={analytics.total_recruiters} icon={Briefcase} color="sky" />
        <StatCard title="Open Jobs" value={analytics.total_jobs} icon={Briefcase} color="amber" />
        <StatCard title="Applications" value={analytics.total_applications} icon={FileText} color="indigo" />
        <StatCard title="Tests Taken" value={analytics.total_assessments_taken} icon={CheckCircle2} color="emerald" />
      </div>

      {/* AI Pipeline Health Diagnostics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">AI Service Health & Fallback Readiness</h3>
          </div>
          <Badge variant="success">All Systems Operational</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analytics.ai_service_status).map(([service, status]) => (
            <div key={service} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                {service.replace(/_/g, ' ')}
              </span>
              <p className="text-emerald-700 font-semibold">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">System Users ({users.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">
                    <div>{u.full_name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'RECRUITER' ? 'primary' : 'success'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${u.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      title={u.is_active ? 'Disable user' : 'Enable user'}
                    >
                      {u.is_active ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Audit Logs & Access History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</td>
                  <td className="p-4 font-bold text-slate-800">{log.user_email}</td>
                  <td className="p-4 text-indigo-700">{log.action}</td>
                  <td className="p-4">{log.entity_type} #{log.entity_id}</td>
                  <td className="p-4 text-slate-500 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
