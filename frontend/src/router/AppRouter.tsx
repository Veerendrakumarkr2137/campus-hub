import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy-loaded feature pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const StudentDashboard = lazy(() => import('@/features/student/pages/StudentDashboard'));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[400px]">
    <div className="h-12 w-12 rounded-full border-2 border-t-blue-500 border-white/10 animate-spin"></div>
  </div>
);

export const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Student Routes */}
        <Route 
          path="/dashboard/:tab?" 
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin/:tab?" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
