// Mock data for API responses

// Mock audit logs
exports.mockActivityLogs = [
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
  },
  {
    id: 'log-4',
    userId: 'user-1',
    action: 'inventory_view',
    description: 'Viewed inventory items',
    entityType: 'inventory',
    timestamp: '2023-06-14T16:20:00Z'
  },
  {
    id: 'log-5',
    userId: 'user-1',
    action: 'logout',
    description: 'User logged out',
    entityType: 'user',
    entityId: 'user-1',
    timestamp: '2023-06-14T17:30:00Z'
  }
];

// Mock warehouse items
exports.mockWarehouseItems = [
  {
    id: 'item-1',
    sku: 'WH-001',
    productName: 'Laptop',
    description: 'High-performance laptop for business use',
    categoryId: 'cat-1',
    supplierId: 'sup-1',
    warehouseId: 'wh-1',
    quantity: 50,
    unitPrice: 1200,
    unitCost: 900,
    minStockLevel: 10,
    maxStockLevel: 100,
    reorderPoint: 20,
    location: {
      zone: 'A',
      rack: '1',
      shelf: '2',
      bin: '3'
    },
    tags: ['electronics', 'computers'],
    status: 'active',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-05-20T00:00:00Z'
  },
  {
    id: 'item-2',
    sku: 'WH-002',
    productName: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    categoryId: 'cat-2',
    supplierId: 'sup-2',
    warehouseId: 'wh-1',
    quantity: 30,
    unitPrice: 250,
    unitCost: 150,
    minStockLevel: 5,
    maxStockLevel: 50,
    reorderPoint: 10,
    location: {
      zone: 'B',
      rack: '3',
      shelf: '1',
      bin: '2'
    },
    tags: ['furniture', 'office'],
    status: 'active',
    createdAt: '2023-02-10T00:00:00Z',
    updatedAt: '2023-04-15T00:00:00Z'
  }
];

// Mock inventory items
exports.mockInventoryItems = [
  {
    id: 'inv-1',
    sku: 'INV-001',
    productName: 'Laptop',
    description: 'High-performance laptop for business use',
    categoryId: 'cat-1',
    inventoryId: 'inv-loc-1',
    quantity: 20,
    unitPrice: 1299,
    unitCost: 900,
    minStockLevel: 5,
    maxStockLevel: 30,
    reorderPoint: 10,
    status: 'active',
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2023-05-25T00:00:00Z'
  },
  {
    id: 'inv-2',
    sku: 'INV-002',
    productName: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    categoryId: 'cat-2',
    inventoryId: 'inv-loc-1',
    quantity: 15,
    unitPrice: 299,
    unitCost: 150,
    minStockLevel: 3,
    maxStockLevel: 25,
    reorderPoint: 5,
    status: 'active',
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-04-20T00:00:00Z'
  }
];

// Mock categories
exports.mockCategories = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    parentId: null
  },
  {
    id: 'cat-2',
    name: 'Furniture',
    description: 'Office and home furniture',
    parentId: null
  },
  {
    id: 'cat-3',
    name: 'Computers',
    description: 'Laptops, desktops and computer accessories',
    parentId: 'cat-1'
  }
];

// Mock suppliers
exports.mockSuppliers = [
  {
    id: 'sup-1',
    name: 'Tech Solutions Inc.',
    contactPerson: 'John Smith',
    email: 'john@techsolutions.com',
    phone: '123-456-7890',
    address: '123 Tech St, Silicon Valley, CA',
    status: 'active'
  },
  {
    id: 'sup-2',
    name: 'Office Furniture Co.',
    contactPerson: 'Jane Doe',
    email: 'jane@officefurniture.com',
    phone: '987-654-3210',
    address: '456 Office Blvd, Business Park, NY',
    status: 'active'
  }
];

// Mock locations
exports.mockLocations = [
  {
    id: 'wh-1',
    name: 'Main Warehouse',
    type: 'warehouse',
    address: '789 Warehouse Ave, Storage District, TX',
    capacity: 10000,
    status: 'active'
  },
  {
    id: 'inv-loc-1',
    name: 'Retail Store Inventory',
    type: 'inventory',
    address: '101 Retail St, Shopping Center, FL',
    capacity: 2000,
    status: 'active'
  }
];

// Mock users
exports.mockUsers = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'admin',
    status: 'active',
    permissions: ['all'],
    createdAt: '2023-01-01T00:00:00Z',
    lastLogin: '2023-06-14T09:15:00Z'
  },
  {
    id: 'user-2',
    username: 'warehouse_manager',
    email: 'warehouse@example.com',
    fullName: 'Warehouse Manager',
    role: 'warehouse_manager',
    status: 'active',
    permissions: ['warehouse_view', 'warehouse_manage_items', 'warehouse_inward', 'warehouse_outward', 'inventory_view'],
    createdAt: '2023-02-15T00:00:00Z',
    lastLogin: '2023-06-14T09:15:00Z'
  }
];
