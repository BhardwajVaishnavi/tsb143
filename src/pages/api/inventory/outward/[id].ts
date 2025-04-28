import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Get the outward entry with related data
      const outwardEntry = await prisma.outwardEntry.findUnique({
        where: { 
          id: id as string,
          source: 'inventory'
        },
        include: {
          inventoryItem: {
            include: {
              product: true
            }
          },
          transferredBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!outwardEntry) {
        return res.status(404).json({ error: 'Outward entry not found' });
      }

      return res.status(200).json(outwardEntry);
    } catch (error) {
      console.error('Error fetching outward entry:', error);
      return res.status(500).json({ error: 'Failed to fetch outward entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
