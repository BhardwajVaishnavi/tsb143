import React from 'react';
import usePermissions from '../../hooks/usePermissions';

interface PermissionGuardProps {
  module: string;
  action: string;
  resource: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders its children based on user permissions
 * If the user doesn't have the required permission, it renders the fallback or nothing
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  resource,
  fallback = null,
  children
}) => {
  const { checkPermission } = usePermissions();
  
  // Check if the user has the required permission
  const hasRequiredPermission = checkPermission(module, action, resource);
  
  // If the user has the permission, render the children
  if (hasRequiredPermission) {
    return <>{children}</>;
  }
  
  // Otherwise, render the fallback or nothing
  return <>{fallback}</>;
};

export default PermissionGuard;
