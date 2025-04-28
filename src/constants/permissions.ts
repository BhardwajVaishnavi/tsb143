/**
 * Permission constants for the application
 * These are used to define and check user permissions
 */

// Permission modules
export const PERMISSION_MODULES = {
  DASHBOARD: 'dashboard',
  WAREHOUSE: 'warehouse',
  INVENTORY: 'inventory',
  SUPPLIERS: 'suppliers',
  CATEGORIES: 'categories',
  AUDIT: 'audit',
  ADMIN: 'admin',
  REPORTS: 'reports',
  USERS: 'users',
};

// Permission actions
export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
  IMPORT: 'import',
  TRANSFER: 'transfer',
};

// Permission resources
export const PERMISSION_RESOURCES = {
  // Dashboard resources
  DASHBOARD_STATS: 'stats',
  DASHBOARD_CHARTS: 'charts',
  DASHBOARD_ALERTS: 'alerts',
  
  // Warehouse resources
  WAREHOUSE_ITEMS: 'items',
  WAREHOUSE_INWARD: 'inward',
  WAREHOUSE_OUTWARD: 'outward',
  WAREHOUSE_DAMAGE: 'damage',
  WAREHOUSE_CLOSING_STOCK: 'closing_stock',
  WAREHOUSE_AUDIT: 'audit',
  
  // Inventory resources
  INVENTORY_ITEMS: 'items',
  INVENTORY_TRANSFER: 'transfer',
  INVENTORY_AUDIT: 'audit',
  
  // Supplier resources
  SUPPLIER_LIST: 'list',
  SUPPLIER_DETAILS: 'details',
  SUPPLIER_CONTACTS: 'contacts',
  SUPPLIER_DOCUMENTS: 'documents',
  SUPPLIER_PERFORMANCE: 'performance',
  
  // Category resources
  CATEGORY_LIST: 'list',
  
  // Audit resources
  AUDIT_LOGS: 'logs',
  AUDIT_REPORTS: 'reports',
  
  // Admin resources
  ADMIN_SETTINGS: 'settings',
  
  // Reports resources
  REPORTS_INVENTORY: 'inventory',
  REPORTS_WAREHOUSE: 'warehouse',
  REPORTS_SUPPLIERS: 'suppliers',
  REPORTS_EMPLOYEE: 'employee',
  
  // User resources
  USERS_LIST: 'list',
  USERS_DETAILS: 'details',
  USERS_PERMISSIONS: 'permissions',
};

// Permission templates
export const PERMISSION_TEMPLATES = {
  SUPER_ADMIN: 'super_admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  INVENTORY_MANAGER: 'inventory_manager',
  SUPPLIER_MANAGER: 'supplier_manager',
  VIEWER: 'viewer',
  CUSTOM: 'custom',
};

// Define permission sets for each role
export const ROLE_PERMISSIONS = {
  // Super admin has all permissions
  [PERMISSION_TEMPLATES.SUPER_ADMIN]: [
    { module: '*', action: '*', resource: '*' }
  ],
  
  // Warehouse manager permissions
  [PERMISSION_TEMPLATES.WAREHOUSE_MANAGER]: [
    // Dashboard permissions
    { module: PERMISSION_MODULES.DASHBOARD, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    
    // Warehouse permissions - full access
    { module: PERMISSION_MODULES.WAREHOUSE, action: '*', resource: '*' },
    
    // Inventory permissions - view only
    { module: PERMISSION_MODULES.INVENTORY, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    { module: PERMISSION_MODULES.INVENTORY, action: PERMISSION_ACTIONS.TRANSFER, resource: PERMISSION_RESOURCES.INVENTORY_TRANSFER },
    
    // Supplier permissions
    { module: PERMISSION_MODULES.SUPPLIERS, action: '*', resource: '*' },
    
    // Category permissions
    { module: PERMISSION_MODULES.CATEGORIES, action: '*', resource: '*' },
    
    // Reports permissions - warehouse related
    { module: PERMISSION_MODULES.REPORTS, action: PERMISSION_ACTIONS.VIEW, resource: PERMISSION_RESOURCES.REPORTS_WAREHOUSE },
    { module: PERMISSION_MODULES.REPORTS, action: PERMISSION_ACTIONS.EXPORT, resource: PERMISSION_RESOURCES.REPORTS_WAREHOUSE },
  ],
  
  // Inventory manager permissions
  [PERMISSION_TEMPLATES.INVENTORY_MANAGER]: [
    // Dashboard permissions
    { module: PERMISSION_MODULES.DASHBOARD, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    
    // Warehouse permissions - view only
    { module: PERMISSION_MODULES.WAREHOUSE, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    
    // Inventory permissions - full access
    { module: PERMISSION_MODULES.INVENTORY, action: '*', resource: '*' },
    
    // Category permissions - view only
    { module: PERMISSION_MODULES.CATEGORIES, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    
    // Reports permissions - inventory related
    { module: PERMISSION_MODULES.REPORTS, action: PERMISSION_ACTIONS.VIEW, resource: PERMISSION_RESOURCES.REPORTS_INVENTORY },
    { module: PERMISSION_MODULES.REPORTS, action: PERMISSION_ACTIONS.EXPORT, resource: PERMISSION_RESOURCES.REPORTS_INVENTORY },
  ],
  
  // Supplier manager permissions
  [PERMISSION_TEMPLATES.SUPPLIER_MANAGER]: [
    // Dashboard permissions
    { module: PERMISSION_MODULES.DASHBOARD, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    
    // Supplier permissions - full access
    { module: PERMISSION_MODULES.SUPPLIERS, action: '*', resource: '*' },
    
    // Warehouse permissions - limited
    { module: PERMISSION_MODULES.WAREHOUSE, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    { module: PERMISSION_MODULES.WAREHOUSE, action: PERMISSION_ACTIONS.CREATE, resource: PERMISSION_RESOURCES.WAREHOUSE_INWARD },
    
    // Reports permissions - supplier related
    { module: PERMISSION_MODULES.REPORTS, action: PERMISSION_ACTIONS.VIEW, resource: PERMISSION_RESOURCES.REPORTS_SUPPLIERS },
    { module: PERMISSION_MODULES.REPORTS, action: PERMISSION_ACTIONS.EXPORT, resource: PERMISSION_RESOURCES.REPORTS_SUPPLIERS },
  ],
  
  // Viewer permissions
  [PERMISSION_TEMPLATES.VIEWER]: [
    // Dashboard permissions
    { module: PERMISSION_MODULES.DASHBOARD, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    
    // View-only permissions for all modules
    { module: PERMISSION_MODULES.WAREHOUSE, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    { module: PERMISSION_MODULES.INVENTORY, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    { module: PERMISSION_MODULES.SUPPLIERS, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    { module: PERMISSION_MODULES.CATEGORIES, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
    { module: PERMISSION_MODULES.REPORTS, action: PERMISSION_ACTIONS.VIEW, resource: '*' },
  ],
};

// Helper function to check if a user has a specific permission
export const hasPermission = (
  userPermissions: Array<{ module: string; action: string; resource: string }>,
  module: string,
  action: string,
  resource: string
): boolean => {
  // Super admin check - if user has wildcard permission
  const hasWildcardPermission = userPermissions.some(
    (p) => p.module === '*' && p.action === '*' && p.resource === '*'
  );
  
  if (hasWildcardPermission) {
    return true;
  }
  
  // Module wildcard check
  const hasModuleWildcard = userPermissions.some(
    (p) => p.module === module && p.action === '*' && p.resource === '*'
  );
  
  if (hasModuleWildcard) {
    return true;
  }
  
  // Action wildcard check
  const hasActionWildcard = userPermissions.some(
    (p) => p.module === module && p.action === '*' && (p.resource === resource || p.resource === '*')
  );
  
  if (hasActionWildcard) {
    return true;
  }
  
  // Resource wildcard check
  const hasResourceWildcard = userPermissions.some(
    (p) => p.module === module && p.action === action && p.resource === '*'
  );
  
  if (hasResourceWildcard) {
    return true;
  }
  
  // Specific permission check
  return userPermissions.some(
    (p) => p.module === module && p.action === action && p.resource === resource
  );
};

// Helper function to get a list of all available permissions
export const getAllPermissions = (): Array<{ module: string; action: string; resource: string; description: string }> => {
  const permissions: Array<{ module: string; action: string; resource: string; description: string }> = [];
  
  // Generate all possible combinations of module, action, and resource
  Object.values(PERMISSION_MODULES).forEach(module => {
    Object.values(PERMISSION_ACTIONS).forEach(action => {
      // For each module, determine relevant resources
      const relevantResources = getRelevantResourcesForModule(module);
      
      relevantResources.forEach(resource => {
        permissions.push({
          module,
          action,
          resource,
          description: `Can ${action} ${resource} in ${module}`
        });
      });
    });
  });
  
  return permissions;
};

// Helper function to get relevant resources for a module
const getRelevantResourcesForModule = (module: string): string[] => {
  switch (module) {
    case PERMISSION_MODULES.DASHBOARD:
      return [
        PERMISSION_RESOURCES.DASHBOARD_STATS,
        PERMISSION_RESOURCES.DASHBOARD_CHARTS,
        PERMISSION_RESOURCES.DASHBOARD_ALERTS,
      ];
    case PERMISSION_MODULES.WAREHOUSE:
      return [
        PERMISSION_RESOURCES.WAREHOUSE_ITEMS,
        PERMISSION_RESOURCES.WAREHOUSE_INWARD,
        PERMISSION_RESOURCES.WAREHOUSE_OUTWARD,
        PERMISSION_RESOURCES.WAREHOUSE_DAMAGE,
        PERMISSION_RESOURCES.WAREHOUSE_CLOSING_STOCK,
        PERMISSION_RESOURCES.WAREHOUSE_AUDIT,
      ];
    case PERMISSION_MODULES.INVENTORY:
      return [
        PERMISSION_RESOURCES.INVENTORY_ITEMS,
        PERMISSION_RESOURCES.INVENTORY_TRANSFER,
        PERMISSION_RESOURCES.INVENTORY_AUDIT,
      ];
    case PERMISSION_MODULES.SUPPLIERS:
      return [
        PERMISSION_RESOURCES.SUPPLIER_LIST,
        PERMISSION_RESOURCES.SUPPLIER_DETAILS,
        PERMISSION_RESOURCES.SUPPLIER_CONTACTS,
        PERMISSION_RESOURCES.SUPPLIER_DOCUMENTS,
        PERMISSION_RESOURCES.SUPPLIER_PERFORMANCE,
      ];
    case PERMISSION_MODULES.CATEGORIES:
      return [
        PERMISSION_RESOURCES.CATEGORY_LIST,
      ];
    case PERMISSION_MODULES.AUDIT:
      return [
        PERMISSION_RESOURCES.AUDIT_LOGS,
        PERMISSION_RESOURCES.AUDIT_REPORTS,
      ];
    case PERMISSION_MODULES.ADMIN:
      return [
        PERMISSION_RESOURCES.ADMIN_SETTINGS,
      ];
    case PERMISSION_MODULES.REPORTS:
      return [
        PERMISSION_RESOURCES.REPORTS_INVENTORY,
        PERMISSION_RESOURCES.REPORTS_WAREHOUSE,
        PERMISSION_RESOURCES.REPORTS_SUPPLIERS,
        PERMISSION_RESOURCES.REPORTS_EMPLOYEE,
      ];
    case PERMISSION_MODULES.USERS:
      return [
        PERMISSION_RESOURCES.USERS_LIST,
        PERMISSION_RESOURCES.USERS_DETAILS,
        PERMISSION_RESOURCES.USERS_PERMISSIONS,
      ];
    default:
      return [];
  }
};
