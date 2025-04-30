/**
 * API server for development and production
 * This server provides API endpoints for the admin panel
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://tsb143.vercel.app'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// In-memory data store (for development)
let users = [
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

const permissions = [
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

let permissionTemplates = [
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

let activityLogs = [
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

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API Routes

// Users
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const newUser = {
    ...req.body,
    id: req.body.id || `user-${Date.now()}`,
    createdAt: req.body.createdAt || new Date().toISOString()
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    res.json(users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    const deletedUser = users[index];
    users.splice(index, 1);
    res.json(deletedUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Permissions
app.get('/api/permissions', (req, res) => {
  res.json(permissions);
});

// Permission Templates
app.get('/api/permission-templates', (req, res) => {
  res.json(permissionTemplates);
});

app.get('/api/permission-templates/:id', (req, res) => {
  const template = permissionTemplates.find(t => t.id === req.params.id);
  if (template) {
    res.json(template);
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

app.post('/api/permission-templates', (req, res) => {
  const newTemplate = {
    ...req.body,
    id: req.body.id || `template-${Date.now()}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  permissionTemplates.push(newTemplate);
  res.status(201).json(newTemplate);
});

app.put('/api/permission-templates/:id', (req, res) => {
  const index = permissionTemplates.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    permissionTemplates[index] = {
      ...permissionTemplates[index],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    res.json(permissionTemplates[index]);
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

app.delete('/api/permission-templates/:id', (req, res) => {
  const index = permissionTemplates.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    const deletedTemplate = permissionTemplates[index];
    permissionTemplates.splice(index, 1);
    res.json(deletedTemplate);
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

// Activity Logs
app.get('/api/audit/logs', (req, res) => {
  let filteredLogs = [...activityLogs];

  // Filter by userId if provided
  if (req.query.userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === req.query.userId);
  }

  // Sort by timestamp (newest first)
  filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(filteredLogs);
});

app.post('/api/audit/logs', (req, res) => {
  const newLog = {
    ...req.body,
    id: `log-${Date.now()}`,
    timestamp: req.body.timestamp || new Date().toISOString()
  };
  activityLogs.push(newLog);
  res.status(201).json(newLog);
});

// Warehouse Items
app.get('/api/warehouse/items', (req, res) => {
  const warehouseItems = [
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

  res.json(warehouseItems);
});

// Warehouse Damage Reports
app.get('/api/warehouse/damage', (req, res) => {
  const damageReports = [
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

  res.json(damageReports);
});

// Inventory Items
app.get('/api/inventory/items', (req, res) => {
  const inventoryItems = [
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

  res.json(inventoryItems);
});

// Suppliers
app.get('/api/suppliers', (req, res) => {
  const suppliers = [
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

  res.json(suppliers);
});

// Purchase Orders
app.get('/api/purchase-orders', (req, res) => {
  const purchaseOrders = [
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

  res.json(purchaseOrders);
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = users.find(u => u.email === email);

  // Check if user exists and password is correct (in a real app, you'd hash passwords)
  if (user && (password === 'admin123' || password === 'password123')) {
    // Update last login time
    user.lastLogin = new Date().toISOString();

    // Create a simple token
    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Return user data and token
    res.json({
      user,
      token
    });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

app.get('/api/auth/me', (req, res) => {
  // In a real app, you'd verify the token from Authorization header
  // For this mock API, we'll just return the admin user
  const adminUser = users.find(u => u.role === 'ADMIN');

  if (adminUser) {
    res.json(adminUser);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // In a real app, you'd invalidate the token
  // For this mock API, we'll just return success
  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
