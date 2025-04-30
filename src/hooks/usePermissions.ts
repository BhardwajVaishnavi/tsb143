import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../constants/permissions';

/**
 * Hook to check if the current user has a specific permission
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if the current user has a specific permission
   * @param module The module to check permission for
   * @param action The action to check permission for
   * @param resource The resource to check permission for
   * @returns boolean indicating if the user has the permission
   */
  const checkPermission = (module: string, action: string, resource: string): boolean => {
    if (!user) {
      return false;
    }

    // Admin role has all permissions
    // Ensure user.role is a string and normalize it
    const userRole = typeof user.role === 'string'
      ? user.role.toUpperCase()
      : String(user.role).toUpperCase();

    console.log('Checking permission for role:', userRole);

    // For Vercel deployment, we're temporarily allowing USER role to have all permissions
    if (userRole === 'ADMIN' || userRole === 'USER') {
      console.log('Admin/User role detected, granting all permissions');
      return true;
    }

    // Convert user permissions from the API format to the format expected by hasPermission
    const userPermissions = user.permissions?.map((p: any) => {
      // If the permission is a string (old format), convert it to the new format
      if (typeof p === 'string') {
        // Handle special case for 'all' permission
        if (p === 'all') {
          return { module: '*', action: '*', resource: '*' };
        }

        // Try to parse the permission string (e.g., 'warehouse_view')
        const parts = p.split('_');
        if (parts.length >= 2) {
          return {
            module: parts[0],
            action: parts[1],
            resource: parts.length > 2 ? parts.slice(2).join('_') : '*'
          };
        }

        // Default fallback
        return { module: p, action: 'view', resource: '*' };
      }

      // If it's already in the correct format, return as is
      return p;
    }) || [];

    return hasPermission(userPermissions, module, action, resource);
  };

  /**
   * Check if the current user has any of the specified permissions
   * @param permissions Array of permissions to check
   * @returns boolean indicating if the user has any of the permissions
   */
  const checkAnyPermission = (
    permissions: Array<{ module: string; action: string; resource: string }>
  ): boolean => {
    return permissions.some(p => checkPermission(p.module, p.action, p.resource));
  };

  /**
   * Check if the current user has all of the specified permissions
   * @param permissions Array of permissions to check
   * @returns boolean indicating if the user has all of the permissions
   */
  const checkAllPermissions = (
    permissions: Array<{ module: string; action: string; resource: string }>
  ): boolean => {
    return permissions.every(p => checkPermission(p.module, p.action, p.resource));
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions
  };
};

export default usePermissions;
