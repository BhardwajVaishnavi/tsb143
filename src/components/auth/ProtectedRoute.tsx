import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import usePermissions from '../../hooks/usePermissions';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requiredPermission?: {
    module: string;
    action: string;
    resource: string;
  };
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = ['admin', 'warehouse_manager', 'inventory_manager', 'viewer'],
  requiredPermission
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { checkPermission } = usePermissions();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={`/auth/login?callbackUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check if user has required role (case-insensitive)
  // Ensure user.role is a string and normalize it
  const userRole = typeof user.role === 'string'
    ? user.role.toUpperCase()
    : String(user.role).toUpperCase();

  console.log('User role:', userRole);
  console.log('User role type:', typeof user.role);
  console.log('Allowed roles:', allowedRoles);

  // Convert allowed roles to uppercase for case-insensitive comparison
  const upperCaseAllowedRoles = allowedRoles.map(role =>
    typeof role === 'string' ? role.toUpperCase() : String(role).toUpperCase()
  );

  console.log('Uppercase allowed roles:', upperCaseAllowedRoles);
  console.log('Role check result:', upperCaseAllowedRoles.includes(userRole));

  // Special case for ADMIN role - always allow access
  if (userRole === 'ADMIN' || userRole === 'USER') {
    console.log('Admin/User role detected, granting access');
    // Admin role has access to everything
    // For Vercel deployment, we're temporarily allowing USER role to access everything
    return <Outlet />;
  } else if (!upperCaseAllowedRoles.includes(userRole)) {
    console.log('Access denied for role:', userRole);
    return <Navigate to="/unauthorized" replace />;
  }

  // If specific permission is required, check it
  if (requiredPermission) {
    const { module, action, resource } = requiredPermission;
    const hasPermission = checkPermission(module, action, resource);

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
