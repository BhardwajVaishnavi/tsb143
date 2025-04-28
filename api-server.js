const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const path = require('path');

// Import route handlers
const { handleAuditLogs } = require('./src/pages/api/audit/logs/index');
const { getAuditLogsByAction } = require('./src/pages/api/audit/logs/action/[action]');
const { getAuditLogsByEntity } = require('./src/pages/api/audit/logs/entity/[entityType]/[entityId]');
const { getAuditLogsByUser } = require('./src/pages/api/audit/logs/user/[userId]');
const { generateClosingStock } = require('./src/pages/api/warehouse/closing-stock/generate');
const {
  handleWarehouseRoutes,
  handleInventoryRoutes,
  handleLocationRoutes,
  handleTransferRoutes
} = require('./src/utils/apiRouteHandler');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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
        role: 'admin'
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
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ error: 'Unauthorized' });
});

// Audit logs routes
app.get('/api/audit/logs', handleAuditLogs);
app.post('/api/audit/logs', handleAuditLogs);
app.get('/api/audit/logs/action/:action', getAuditLogsByAction);
app.get('/api/audit/logs/entity/:entityType/:entityId', getAuditLogsByEntity);
app.get('/api/audit/logs/user/:userId', getAuditLogsByUser);

// Warehouse routes
app.post('/api/warehouse/closing-stock/generate', generateClosingStock);
app.get('/api/audit/logs/date-range', (req, res) => {
  // Simple mock implementation for date range endpoint
  return res.status(200).json([]);
});

// Warehouse routes
app.get('/api/warehouse/items', handleWarehouseRoutes);
app.get('/api/warehouse/items/:id', handleWarehouseRoutes);
app.post('/api/warehouse/items', handleWarehouseRoutes);
app.put('/api/warehouse/items/:id', handleWarehouseRoutes);
app.delete('/api/warehouse/items/:id', handleWarehouseRoutes);
app.get('/api/warehouse/inward', handleWarehouseRoutes);
app.post('/api/warehouse/inward', handleWarehouseRoutes);
app.get('/api/warehouse/outward', handleWarehouseRoutes);
app.post('/api/warehouse/outward', handleWarehouseRoutes);
app.get('/api/warehouse/damage', handleWarehouseRoutes);
app.post('/api/warehouse/damage', handleWarehouseRoutes);
app.put('/api/warehouse/damage/:id/approve', handleWarehouseRoutes);
app.post('/api/warehouse/closing-stock/generate', handleWarehouseRoutes);

// Inventory routes
app.get('/api/inventory/items', handleInventoryRoutes);
app.get('/api/inventory/items/:id', handleInventoryRoutes);
app.post('/api/inventory/items', handleInventoryRoutes);
app.put('/api/inventory/items/:id', handleInventoryRoutes);
app.delete('/api/inventory/items/:id', handleInventoryRoutes);
app.get('/api/inventory/audit', handleInventoryRoutes);
app.post('/api/inventory/audit', handleInventoryRoutes);
app.get('/api/inventory/audit/:id', handleInventoryRoutes);
app.get('/api/inventory/inward', handleInventoryRoutes);
app.post('/api/inventory/inward', handleInventoryRoutes);
app.get('/api/inventory/inward/:id', handleInventoryRoutes);
app.get('/api/inventory/outward', handleInventoryRoutes);
app.post('/api/inventory/outward', handleInventoryRoutes);
app.get('/api/inventory/outward/:id', handleInventoryRoutes);
app.get('/api/inventory/reports', handleInventoryRoutes);
app.get('/api/inventory/transfers', handleInventoryRoutes);
app.post('/api/inventory/transfers', handleInventoryRoutes);
app.get('/api/inventory/transfers/:id', handleInventoryRoutes);

// Location routes
app.get('/api/locations', handleLocationRoutes);
app.get('/api/locations/:id', handleLocationRoutes);
app.post('/api/locations', handleLocationRoutes);
app.put('/api/locations/:id', handleLocationRoutes);
app.delete('/api/locations/:id', handleLocationRoutes);

// Transfer routes
app.get('/api/transfers', handleTransferRoutes);
app.post('/api/transfers', handleTransferRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
