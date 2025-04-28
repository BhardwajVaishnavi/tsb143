const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const path = require('path');

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

// Generic API response for all routes
const handleGenericRoute = (req, res) => {
  return res.status(200).json({ message: 'API endpoint placeholder' });
};

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
