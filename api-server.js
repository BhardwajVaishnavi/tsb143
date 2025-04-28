const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
