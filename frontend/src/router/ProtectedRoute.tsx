import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  // 1. Initial auth check
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-2 border-t-blue-500 border-white/10 animate-spin"></div>
      </div>
    );
  }

  // 2. Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Profile is fetching
  if (profileLoading && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-2 border-t-blue-500 border-white/10 animate-spin"></div>
      </div>
    );
  }

  // 4. Profile not found after fetch
  if (!profile && !profileLoading) {
     // This happens if the user exists in Auth but has no entry in public.profiles
     // We should probably sign them out or redirect to a 'complete profile' page
     return <Navigate to="/login" replace />;
  }

  // 5. Role check
  if (allowedRoles && profile) {
    const userRole = (profile.role || '').toUpperCase();
    const isAllowed = allowedRoles.some(role => role.toUpperCase() === userRole);

    console.log('[ProtectedRoute] User Role:', userRole, 'Allowed:', allowedRoles, 'IsAllowed:', isAllowed);

    if (!isAllowed) {
      if (userRole === 'STUDENT') return <Navigate to="/dashboard" replace />;
      if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
