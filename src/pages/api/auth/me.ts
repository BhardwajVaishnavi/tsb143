import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the session
    const session = await getSession({ req });

    // If no session, return unauthorized
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return the user data
    return res.status(200).json({
      id: 'user-1',
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: 'admin',
      status: 'active',
      permissions: ['all'],
      createdAt: '2023-01-01T00:00:00Z',
      lastLogin: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
