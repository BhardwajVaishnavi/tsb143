import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      // Get all locations
      const locations = await prisma.location.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      return res.status(200).json(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      return res.status(500).json({ error: 'Failed to fetch locations' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name,
        type,
        address,
        city,
        state,
        postalCode,
        country,
        contactName,
        contactPhone,
        contactEmail,
        notes,
        status = 'active'
      } = req.body;

      // Validate required fields
      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      // Create the location
      const location = await prisma.location.create({
        data: {
          name,
          type,
          address,
          city,
          state,
          postalCode,
          country,
          contactName,
          contactPhone,
          contactEmail,
          notes,
          status
        }
      });

      return res.status(201).json(location);
    } catch (error) {
      console.error('Error creating location:', error);
      return res.status(500).json({ error: 'Failed to create location' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
