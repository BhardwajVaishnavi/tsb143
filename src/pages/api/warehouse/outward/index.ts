import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { logEmployeeAction, generateAuditDetails } from '../../../../utils/auditLogger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      // Get all outward entries with employee information
      const outwardEntries = await prisma.outwardEntry.findMany({
        include: {
          warehouseItem: {
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(outwardEntries);
    } catch (error) {
      console.error('Error fetching outward entries:', error);
      return res.status(500).json({ error: 'Failed to fetch outward entries' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        warehouseId,
        itemId,
        quantity,
        destination,
        transferredById,
        transferDate,
        status = 'completed',
        notes
      } = req.body;

      // Validate required fields
      if (!warehouseId || !itemId || !quantity || !destination || !transferredById || !transferDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if there's enough quantity in warehouse
      const warehouseItem = await prisma.warehouseItem.findUnique({
        where: { id: itemId },
        include: { product: true }
      });

      if (!warehouseItem) {
        return res.status(404).json({ error: 'Warehouse item not found' });
      }

      if (warehouseItem.quantity < parseInt(quantity)) {
        return res.status(400).json({ error: 'Not enough quantity in warehouse' });
      }

      // Create outward entry
      const outwardEntry = await prisma.outwardEntry.create({
        data: {
          warehouseId,
          itemId,
          quantity: parseInt(quantity),
          destination,
          transferredById,
          transferDate: new Date(transferDate),
          status,
          notes
        },
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
          transferredBy: true
        }
      });

      // Update warehouse item quantity
      await prisma.warehouseItem.update({
        where: { id: itemId },
        data: {
          quantity: {
            decrement: parseInt(quantity)
          },
          lastOutwardDate: new Date()
        }
      });

      // Log employee action
      await logEmployeeAction(
        transferredById,
        'TRANSFER',
        'OutwardEntry',
        outwardEntry.id,
        generateAuditDetails(
          'TRANSFER',
          'OutwardEntry',
          warehouseItem.product?.name || 'Unknown Product',
          parseInt(quantity),
          `To destination: ${destination}`
        )
      );

      return res.status(201).json(outwardEntry);
    } catch (error) {
      console.error('Error creating outward entry:', error);
      return res.status(500).json({ error: 'Failed to create outward entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
