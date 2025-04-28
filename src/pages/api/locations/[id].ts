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

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Get the location
      const location = await prisma.location.findUnique({
        where: { id: id as string }
      });

      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }

      return res.status(200).json(location);
    } catch (error) {
      console.error('Error fetching location:', error);
      return res.status(500).json({ error: 'Failed to fetch location' });
    }
  } else if (req.method === 'PUT') {
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
        status
      } = req.body;

      // Validate required fields
      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      // Update the location
      const location = await prisma.location.update({
        where: { id: id as string },
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

      return res.status(200).json(location);
    } catch (error) {
      console.error('Error updating location:', error);
      return res.status(500).json({ error: 'Failed to update location' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Check if the location is being used
      const inventoryItems = await prisma.inventoryItem.count({
        where: { locationId: id as string }
      });

      if (inventoryItems > 0) {
        return res.status(400).json({ error: 'Cannot delete location that is being used by inventory items' });
      }

      // Delete the location
      await prisma.location.delete({
        where: { id: id as string }
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting location:', error);
      return res.status(500).json({ error: 'Failed to delete location' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
