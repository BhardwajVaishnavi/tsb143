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
      // Get the inward entry with related data
      const inwardEntry = await prisma.inwardEntry.findUnique({
        where: { 
          id: id as string,
          destination: 'inventory'
        },
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
          supplier: true,
          receivedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!inwardEntry) {
        return res.status(404).json({ error: 'Inward entry not found' });
      }

      return res.status(200).json(inwardEntry);
    } catch (error) {
      console.error('Error fetching inward entry:', error);
      return res.status(500).json({ error: 'Failed to fetch inward entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
