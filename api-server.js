const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const path = require('path');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Mock login for testing
  if (email === 'admin@example.com' && password === 'admin123') {
    const token = 'mock-token-123';

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200).json({
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'ADMIN',
        permissions: [{ module: '*', action: '*', resource: '*' }]
      },
      token
    });
  }

  return res.status(401).json({ error: 'Invalid email or password' });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (token === 'mock-token-123') {
    return res.status(200).json({
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'ADMIN',
        permissions: [{ module: '*', action: '*', resource: '*' }]
      }
    });
  }

  return res.status(401).json({ error: 'Unauthorized' });
});

// Mock data for various endpoints
const mockData = {
  warehouseItems: [
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
  ],
  inventoryItems: [
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
  ],
  suppliers: [
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
  ],
  purchaseOrders: [
    {
      id: 'po-1',
      orderNumber: 'PO-2023-001',
      supplierId: 'sup-1',
      status: 'delivered',
      orderDate: '2023-01-10T00:00:00Z',
      deliveryDate: '2023-01-20T00:00:00Z',
      totalAmount: 4500,
      items: [
        {
          id: 'poi-1',
          productId: 'item-1',
          quantity: 5,
          unitPrice: 900,
          totalPrice: 4500
        }
      ]
    },
    {
      id: 'po-2',
      orderNumber: 'PO-2023-002',
      supplierId: 'sup-2',
      status: 'pending',
      orderDate: '2023-02-05T00:00:00Z',
      expectedDeliveryDate: '2023-02-15T00:00:00Z',
      totalAmount: 1500,
      items: [
        {
          id: 'poi-2',
          productId: 'item-2',
          quantity: 10,
          unitPrice: 150,
          totalPrice: 1500
        }
      ]
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      userId: 'user-1',
      userName: 'Admin User',
      action: 'login',
      description: 'User logged in',
      entityType: 'user',
      entityId: 'user-1',
      timestamp: '2023-06-14T09:15:00Z'
    },
    {
      id: 'log-2',
      userId: 'user-1',
      userName: 'Admin User',
      action: 'warehouse_inward',
      description: 'Added 5 item(s) to warehouse from Supplier 1',
      entityType: 'warehouse',
      entityId: 'inward-123',
      timestamp: '2023-06-14T10:30:00Z'
    },
    {
      id: 'log-3',
      userId: 'user-1',
      userName: 'Admin User',
      action: 'warehouse_outward',
      description: 'Transferred 3 item(s) from warehouse to Retail Inventory',
      entityType: 'warehouse',
      entityId: 'outward-456',
      timestamp: '2023-06-14T14:45:00Z'
    }
  ],
  damage: [
    {
      id: 'dmg-1',
      itemId: 'item-1',
      warehouseId: 'wh-1',
      quantity: 2,
      reason: 'Damaged during transport',
      reportedById: 'user-2',
      reportedDate: '2023-03-10T00:00:00Z',
      status: 'pending',
      notes: 'Packaging was compromised'
    },
    {
      id: 'dmg-2',
      itemId: 'item-2',
      warehouseId: 'wh-1',
      quantity: 1,
      reason: 'Manufacturing defect',
      reportedById: 'user-3',
      reportedDate: '2023-04-05T00:00:00Z',
      status: 'approved',
      approvedById: 'user-1',
      approvedDate: '2023-04-06T00:00:00Z',
      notes: 'Chair leg was broken'
    }
  ]
};

// Generic API response for all routes
const handleGenericRoute = (req, res) => {
  const path = req.path;
  console.log(`Handling request for: ${path}`);

  // Return appropriate mock data based on the path
  if (path.includes('/warehouse/items')) {
    return res.status(200).json(mockData.warehouseItems);
  } else if (path.includes('/inventory/items')) {
    return res.status(200).json(mockData.inventoryItems);
  } else if (path.includes('/suppliers')) {
    return res.status(200).json(mockData.suppliers);
  } else if (path.includes('/purchase-orders')) {
    return res.status(200).json(mockData.purchaseOrders);
  } else if (path.includes('/audit/logs')) {
    return res.status(200).json(mockData.auditLogs);
  } else if (path.includes('/warehouse/damage')) {
    return res.status(200).json(mockData.damage);
  }

  // Default response
  console.log(`No specific handler for path: ${path}, returning default response`);
  return res.status(200).json({ message: 'API endpoint placeholder' });
};

// Make sure all routes are registered

// Suppliers routes
app.get('/api/suppliers', handleGenericRoute);
app.post('/api/suppliers', handleGenericRoute);
app.get('/api/suppliers/:id', handleGenericRoute);
app.put('/api/suppliers/:id', handleGenericRoute);
app.delete('/api/suppliers/:id', handleGenericRoute);

// Purchase orders routes
app.get('/api/purchase-orders', handleGenericRoute);
app.post('/api/purchase-orders', handleGenericRoute);
app.get('/api/purchase-orders/:id', handleGenericRoute);
app.put('/api/purchase-orders/:id', handleGenericRoute);
app.delete('/api/purchase-orders/:id', handleGenericRoute);

// Audit logs routes
app.get('/api/audit/logs', handleGenericRoute);
app.post('/api/audit/logs', handleGenericRoute);
app.get('/api/audit/logs/action/:action', handleGenericRoute);
app.get('/api/audit/logs/entity/:entityType/:entityId', handleGenericRoute);
app.get('/api/audit/logs/user/:userId', handleGenericRoute);
app.get('/api/audit/logs/date-range', handleGenericRoute);

// Warehouse routes
app.get('/api/warehouse/items', handleGenericRoute);
app.get('/api/warehouse/items/:id', handleGenericRoute);
app.post('/api/warehouse/items', handleGenericRoute);
app.put('/api/warehouse/items/:id', handleGenericRoute);
app.delete('/api/warehouse/items/:id', handleGenericRoute);
app.get('/api/warehouse/inward', handleGenericRoute);
app.post('/api/warehouse/inward', handleGenericRoute);
app.get('/api/warehouse/outward', handleGenericRoute);
app.post('/api/warehouse/outward', handleGenericRoute);
app.get('/api/warehouse/damage', handleGenericRoute);
app.post('/api/warehouse/damage', handleGenericRoute);
app.put('/api/warehouse/damage/:id/approve', handleGenericRoute);
app.post('/api/warehouse/closing-stock/generate', handleGenericRoute);

// Inventory routes
app.get('/api/inventory/items', handleGenericRoute);
app.get('/api/inventory/items/:id', handleGenericRoute);
app.post('/api/inventory/items', handleGenericRoute);
app.put('/api/inventory/items/:id', handleGenericRoute);
app.delete('/api/inventory/items/:id', handleGenericRoute);
app.get('/api/inventory/audit', handleGenericRoute);
app.post('/api/inventory/audit', handleGenericRoute);
app.get('/api/inventory/audit/:id', handleGenericRoute);
app.get('/api/inventory/inward', handleGenericRoute);
app.post('/api/inventory/inward', handleGenericRoute);
app.get('/api/inventory/inward/:id', handleGenericRoute);
app.get('/api/inventory/outward', handleGenericRoute);
app.post('/api/inventory/outward', handleGenericRoute);
app.get('/api/inventory/outward/:id', handleGenericRoute);
app.get('/api/inventory/reports', handleGenericRoute);
app.get('/api/inventory/transfers', handleGenericRoute);
app.post('/api/inventory/transfers', handleGenericRoute);
app.get('/api/inventory/transfers/:id', handleGenericRoute);

// Location routes
app.get('/api/locations', handleGenericRoute);
app.get('/api/locations/:id', handleGenericRoute);
app.post('/api/locations', handleGenericRoute);
app.put('/api/locations/:id', handleGenericRoute);
app.delete('/api/locations/:id', handleGenericRoute);

// Transfer routes
app.get('/api/transfers', handleGenericRoute);
app.post('/api/transfers', handleGenericRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
