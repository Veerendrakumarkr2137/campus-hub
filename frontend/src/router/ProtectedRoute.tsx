import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'ADMIN')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-2 border-t-blue-500 border-white/10 animate-spin"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile is still loading in the background
  if (user && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-2 border-t-blue-500 border-white/10 animate-spin"></div>
      </div>
    );
  }

  // Role check
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // If student tries to access admin
    if (profile.role === 'STUDENT' && location.pathname.startsWith('/admin')) {
        return <Navigate to="/dashboard" replace />;
    }
    // If admin tries to access student dashboard (optional, usually admins can see all)
    if (profile.role === 'ADMIN' && location.pathname.startsWith('/dashboard')) {
        return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
