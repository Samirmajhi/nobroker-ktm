import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'tenant' | 'owner' | 'staff' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement if specified
  if (requiredRole && user && user.role !== requiredRole) {
    // Redirect based on user role
    switch (user.role) {
      case 'tenant':
        return <Navigate to="/dashboard" replace />;
      case 'owner':
        return <Navigate to="/dashboard" replace />;
      case 'staff':
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
