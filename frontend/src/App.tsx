import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { resolveBackendUrl } from './api/client';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Recruiter
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { JobCreator } from './pages/recruiter/JobCreator';
import { CandidateProfileView } from './pages/recruiter/CandidateProfileView';
import { CandidateComparison } from './pages/recruiter/CandidateComparison';
import { FairnessDashboard } from './pages/recruiter/FairnessDashboard';
import { CandidateRankingsView } from './pages/recruiter/CandidateRankingsView';

// Candidate
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage';
import { JobExplorer } from './pages/candidate/JobExplorer';
import { AdaptiveAssessmentRunner } from './pages/candidate/AdaptiveAssessmentRunner';
import { DevelopmentPlanView } from './pages/candidate/DevelopmentPlanView';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ModelRegistryView } from './pages/admin/ModelRegistryView';
import { ResearchLabView } from './pages/admin/ResearchLabView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role) && role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  React.useEffect(() => {
    try {
      const target = resolveBackendUrl();
      if (target) {
        fetch(`${target}/health`, { method: 'GET' }).catch(() => {});
      }
    } catch (_) {}
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Recruiter */}
                <Route
                  path="/recruiter/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs/new"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <JobCreator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/candidates/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <CandidateProfileView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/candidates/compare"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <CandidateComparison />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/fairness/:jobId"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <FairnessDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/fairness"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <FairnessDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/rankings/:jobId"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <CandidateRankingsView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/rankings"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <CandidateRankingsView />
                    </ProtectedRoute>
                  }
                />

                {/* Candidate */}
                <Route
                  path="/candidate/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                      <CandidateDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/profile"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                      <CandidateProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/jobs"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                      <JobExplorer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/assessment/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                      <AdaptiveAssessmentRunner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/development-plan/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                      <DevelopmentPlanView />
                    </ProtectedRoute>
                  }
                />

                {/* Admin */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/models"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                      <ModelRegistryView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/research"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                      <ResearchLabView />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
