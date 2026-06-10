import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-violet, #8b5cf6)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace state={{ attemptedPath: location.pathname, requiredRoles: roles }} />;
  }

  return children;
};

export default ProtectedRoute;
