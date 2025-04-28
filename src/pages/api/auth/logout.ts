import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real app, you would invalidate the session/token here
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in /api/auth/logout:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
