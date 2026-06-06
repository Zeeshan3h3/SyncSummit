import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

// Component that accepts children (page component) and optional roles array
const ProtectedRoute = ({ children, roles }) => {
  // Get state from Zustand store
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  // SCENARIO 1 — isLoading is true:
  // The app is still checking /me on startup.
  // If we redirect during loading, logged-in users get kicked to login page on every refresh.
  if (isLoading) {
    // Show a simple loading text; do NOT redirect yet.
    return <div>Loading...</div>;
  }

  // SCENARIO 2 — user is null after loading completes:
  // User is definitely not logged in and must be redirected.
  // 'replace' means the login page replaces history entry so browser back button doesn't loop.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // SCENARIO 3 — user exists but role check fails:
  // User is logged in but doesn't have required role (e.g. 'user' trying to access /admin).
  // Do NOT redirect to /login — they are logged in, just not authorized for this specific route.
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to /unauthorized instead.
    return <Navigate to="/unauthorized" replace state={{ attemptedPath: location.pathname, requiredRoles: roles }} />;
  }

  // After all checks pass — render children directly.
  return children;
};

export default ProtectedRoute;
