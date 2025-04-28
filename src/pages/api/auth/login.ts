import { NextApiRequest, NextApiResponse } from 'next';

// Mock users for demo
const mockUsers = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, passwords would be hashed
    fullName: 'Admin User',
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastLogin: new Date().toISOString(),
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    permissions: [{ module: '*', action: '*', resource: '*' }]
  },
  {
    id: 'user-2',
    username: 'warehouse',
    email: 'warehouse@example.com',
    password: 'warehouse123',
    fullName: 'Warehouse Manager',
    role: 'warehouse_manager',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastLogin: new Date().toISOString(),
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    permissions: [
      { module: 'warehouse', action: '*', resource: '*' },
      { module: 'inventory', action: 'view', resource: '*' },
      { module: 'suppliers', action: '*', resource: '*' },
      { module: 'categories', action: '*', resource: '*' },
      { module: 'dashboard', action: 'view', resource: '*' },
      { module: 'reports', action: 'view', resource: 'warehouse' },
      { module: 'reports', action: 'export', resource: 'warehouse' }
    ]
  },
  {
    id: 'user-3',
    username: 'inventory',
    email: 'inventory@example.com',
    password: 'inventory123',
    fullName: 'Inventory Manager',
    role: 'inventory_manager',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    lastLogin: new Date().toISOString(),
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    permissions: [
      { module: 'inventory', action: '*', resource: '*' },
      { module: 'warehouse', action: 'view', resource: '*' },
      { module: 'categories', action: 'view', resource: '*' },
      { module: 'dashboard', action: 'view', resource: '*' },
      { module: 'reports', action: 'view', resource: 'inventory' },
      { module: 'reports', action: 'export', resource: 'inventory' }
    ]
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = mockUsers.find(
      user => user.email === email && user.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create a token
    const token = 'mock-token-' + Date.now();

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
