/**
 * Mock data for API responses
 * Used as fallback when API is not available
 */

// Helper function to get mock data based on the endpoint
export const getMockData = (endpoint: string): any => {
  // Extract the path from the endpoint
  const path = endpoint.split('?')[0]; // Remove query parameters

  // Users endpoints
  if (path === '/api/users' || path === 'api/users') {
    return [
      {
        id: 'user-1',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'ADMIN',
        status: 'active',
        permissions: [{ module: '*', action: '*', resource: '*' }],
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: '2023-06-15T10:30:00Z'
      },
      {
        id: 'user-2',
        username: 'warehouse_manager',
        email: 'warehouse@example.com',
        fullName: 'Warehouse Manager',
        role: 'WAREHOUSE_MANAGER',
        status: 'active',
        permissions: [
          { module: 'warehouse', action: 'view', resource: '*' },
          { module: 'warehouse', action: 'create', resource: 'items' },
          { module: 'warehouse', action: 'edit', resource: 'items' },
          { module: 'warehouse', action: 'create', resource: 'inward' },
          { module: 'warehouse', action: 'create', resource: 'outward' },
          { module: 'inventory', action: 'view', resource: '*' }
        ],
        createdAt: '2023-02-15T00:00:00Z',
        lastLogin: '2023-06-14T09:15:00Z'
      },
      {
        id: 'user-3',
        username: 'inventory_manager',
        email: 'inventory@example.com',
        fullName: 'Inventory Manager',
        role: 'INVENTORY_MANAGER',
        status: 'active',
        permissions: [
          { module: 'inventory', action: '*', resource: '*' },
          { module: 'warehouse', action: 'view', resource: '*' }
        ],
        createdAt: '2023-03-10T00:00:00Z',
        lastLogin: '2023-06-13T14:45:00Z'
      }
    ];
  }

  // Single user endpoint
  if (path.match(/\/api\/users\/user-\d+/) || path.match(/api\/users\/user-\d+/)) {
    const userId = path.split('/').pop();

    if (userId === 'user-1') {
      return {
        id: 'user-1',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'ADMIN',
        status: 'active',
        permissions: [{ module: '*', action: '*', resource: '*' }],
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: '2023-06-15T10:30:00Z'
      };
    } else if (userId === 'user-2') {
      return {
        id: 'user-2',
        username: 'warehouse_manager',
        email: 'warehouse@example.com',
        fullName: 'Warehouse Manager',
        role: 'WAREHOUSE_MANAGER',
        status: 'active',
        permissions: [
          { module: 'warehouse', action: 'view', resource: '*' },
          { module: 'warehouse', action: 'create', resource: 'items' },
          { module: 'warehouse', action: 'edit', resource: 'items' },
          { module: 'warehouse', action: 'create', resource: 'inward' },
          { module: 'warehouse', action: 'create', resource: 'outward' },
          { module: 'inventory', action: 'view', resource: '*' }
        ],
        createdAt: '2023-02-15T00:00:00Z',
        lastLogin: '2023-06-14T09:15:00Z'
      };
    } else {
      return {
        id: userId,
        username: 'user',
        email: 'user@example.com',
        fullName: 'Sample User',
        role: 'USER',
        status: 'active',
        permissions: [{ module: 'dashboard', action: 'view', resource: '*' }],
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: '2023-06-15T10:30:00Z'
      };
    }
  }

  // Permissions endpoint
  if (path === '/api/permissions' || path === 'api/permissions') {
    return [
      // Dashboard permissions
      { id: 'dashboard_view', name: 'View Dashboard', description: 'Can view the main dashboard', category: 'Dashboard' },

      // Warehouse permissions
      { id: 'warehouse_view', name: 'View Warehouse', description: 'Can view warehouse data', category: 'Warehouse' },
      { id: 'warehouse_manage_items', name: 'Manage Warehouse Items', description: 'Can add, edit, and delete warehouse items', category: 'Warehouse' },
      { id: 'warehouse_inward', name: 'Manage Inward', description: 'Can record items coming into the warehouse', category: 'Warehouse' },
      { id: 'warehouse_outward', name: 'Manage Outward', description: 'Can transfer items from warehouse to inventory', category: 'Warehouse' },
      { id: 'warehouse_damage', name: 'Manage Damage', description: 'Can report damaged items', category: 'Warehouse' },

      // Inventory permissions
      { id: 'inventory_view', name: 'View Inventory', description: 'Can view inventory data', category: 'Inventory' },
      { id: 'inventory_manage', name: 'Manage Inventory', description: 'Can manage inventory items', category: 'Inventory' },
      { id: 'inventory_transfer', name: 'Transfer Inventory', description: 'Can transfer items between inventories', category: 'Inventory' },

      // Admin permissions
      { id: 'admin_users', name: 'Manage Users', description: 'Can manage user accounts', category: 'Admin' },
      { id: 'admin_permissions', name: 'Manage Permissions', description: 'Can manage permission templates', category: 'Admin' },
      { id: 'admin_settings', name: 'Manage Settings', description: 'Can manage system settings', category: 'Admin' }
    ];
  }

  // Permission templates endpoint
  if (path === '/api/permission-templates' || path === 'api/permission-templates') {
    return [
      {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Standard permissions for Super Admin role',
        permissions: [{ module: '*', action: '*', resource: '*' }],
        isDefault: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'warehouse_manager',
        name: 'Warehouse Manager',
        description: 'Standard permissions for Warehouse Manager role',
        permissions: [
          { module: 'dashboard', action: 'view', resource: '*' },
          { module: 'warehouse', action: '*', resource: '*' },
          { module: 'inventory', action: 'view', resource: '*' }
        ],
        isDefault: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'inventory_manager',
        name: 'Inventory Manager',
        description: 'Standard permissions for Inventory Manager role',
        permissions: [
          { module: 'dashboard', action: 'view', resource: '*' },
          { module: 'inventory', action: '*', resource: '*' },
          { module: 'warehouse', action: 'view', resource: '*' }
        ],
        isDefault: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ];
  }

  // Audit logs endpoint
  if (path.includes('/api/audit/logs') || path.includes('api/audit/logs')) {
    return [
      {
        id: 'log-1',
        userId: 'user-1',
        action: 'login',
        description: 'User logged in',
        entityType: 'user',
        entityId: 'user-1',
        timestamp: '2023-06-14T09:15:00Z'
      },
      {
        id: 'log-2',
        userId: 'user-1',
        action: 'warehouse_inward',
        description: 'Added 5 item(s) to warehouse from Supplier 1',
        entityType: 'warehouse',
        entityId: 'inward-123',
        timestamp: '2023-06-14T10:30:00Z'
      },
      {
        id: 'log-3',
        userId: 'user-1',
        action: 'warehouse_outward',
        description: 'Transferred 3 item(s) from warehouse to Retail Inventory',
        entityType: 'warehouse',
        entityId: 'outward-456',
        timestamp: '2023-06-14T14:45:00Z'
      }
    ];
  }

  // Warehouse Items
  if (path === '/api/warehouse/items' || path === 'api/warehouse/items') {
    return [
      {
        id: 'item-1',
        name: 'Laptop',
        sku: 'LAP-001',
        category: 'Electronics',
        quantity: 25,
        minStockLevel: 10,
        location: 'Rack A-1',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-2',
        name: 'Office Chair',
        sku: 'FUR-001',
        category: 'Furniture',
        quantity: 15,
        minStockLevel: 5,
        location: 'Rack B-2',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-3',
        name: 'Desk',
        sku: 'FUR-002',
        category: 'Furniture',
        quantity: 8,
        minStockLevel: 3,
        location: 'Rack B-3',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  // Warehouse Damage Reports
  if (path === '/api/warehouse/damage' || path === 'api/warehouse/damage') {
    return [
      {
        id: 'damage-1',
        itemId: 'item-1',
        itemName: 'Laptop',
        quantity: 2,
        reason: 'Water damage',
        reportedBy: 'user-2',
        reportedByName: 'Warehouse Manager',
        timestamp: new Date().toISOString()
      },
      {
        id: 'damage-2',
        itemId: 'item-2',
        itemName: 'Office Chair',
        quantity: 1,
        reason: 'Broken parts',
        reportedBy: 'user-2',
        reportedByName: 'Warehouse Manager',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }

  // Inventory Items
  if (path === '/api/inventory/items' || path === 'api/inventory/items') {
    return [
      {
        id: 'inv-item-1',
        name: 'Laptop',
        sku: 'LAP-001',
        category: 'Electronics',
        quantity: 10,
        location: 'Store 1',
        price: 75000,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'inv-item-2',
        name: 'Office Chair',
        sku: 'FUR-001',
        category: 'Furniture',
        quantity: 5,
        location: 'Store 1',
        price: 8500,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'inv-item-3',
        name: 'Desk',
        sku: 'FUR-002',
        category: 'Furniture',
        quantity: 3,
        location: 'Store 2',
        price: 12000,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  // Suppliers
  if (path === '/api/suppliers' || path === 'api/suppliers') {
    return [
      {
        id: 'supplier-1',
        name: 'Tech Solutions Inc.',
        contactPerson: 'John Smith',
        email: 'john@techsolutions.com',
        phone: '+91 9876543210',
        address: '123 Tech Park, Bangalore',
        items: ['Laptop', 'Monitor', 'Keyboard'],
        status: 'active'
      },
      {
        id: 'supplier-2',
        name: 'Office Furniture Ltd.',
        contactPerson: 'Jane Doe',
        email: 'jane@officefurniture.com',
        phone: '+91 9876543211',
        address: '456 Industrial Area, Delhi',
        items: ['Office Chair', 'Desk', 'Cabinet'],
        status: 'active'
      },
      {
        id: 'supplier-3',
        name: 'Stationery Supplies Co.',
        contactPerson: 'Mike Johnson',
        email: 'mike@stationery.com',
        phone: '+91 9876543212',
        address: '789 Business Park, Mumbai',
        items: ['Notebooks', 'Pens', 'Paper'],
        status: 'inactive'
      }
    ];
  }

  // Purchase Orders
  if (path === '/api/purchase-orders' || path === 'api/purchase-orders') {
    return [
      {
        id: 'po-1',
        supplierId: 'supplier-1',
        supplierName: 'Tech Solutions Inc.',
        items: [
          { id: 'item-1', name: 'Laptop', quantity: 10, price: 65000 }
        ],
        totalAmount: 650000,
        currency: 'INR',
        status: 'delivered',
        orderDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        deliveryDate: new Date().toISOString()
      },
      {
        id: 'po-2',
        supplierId: 'supplier-2',
        supplierName: 'Office Furniture Ltd.',
        items: [
          { id: 'item-2', name: 'Office Chair', quantity: 5, price: 7500 },
          { id: 'item-3', name: 'Desk', quantity: 3, price: 10000 }
        ],
        totalAmount: 67500,
        currency: 'INR',
        status: 'pending',
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString()
      }
    ];
  }

  // Default: return empty array
  return [];
};
