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
      // Get all damage entries with employee information
      const damageEntries = await prisma.damageEntry.findMany({
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          approvedBy: {
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

      return res.status(200).json(damageEntries);
    } catch (error) {
      console.error('Error fetching damage entries:', error);
      return res.status(500).json({ error: 'Failed to fetch damage entries' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        warehouseId,
        itemId,
        quantity,
        reason,
        reportedById,
        reportedDate,
        status = 'pending',
        notes
      } = req.body;

      // Validate required fields
      if (!warehouseId || !itemId || !quantity || !reason || !reportedById || !reportedDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get warehouse item for audit log
      const warehouseItem = await prisma.warehouseItem.findUnique({
        where: { id: itemId },
        include: { product: true }
      });

      if (!warehouseItem) {
        return res.status(404).json({ error: 'Warehouse item not found' });
      }

      // Create damage entry
      const damageEntry = await prisma.damageEntry.create({
        data: {
          warehouseId,
          itemId,
          quantity: parseInt(quantity),
          reason,
          reportedById,
          reportedDate: new Date(reportedDate),
          status,
          notes
        },
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
          reportedBy: true
        }
      });

      // Log employee action
      await logEmployeeAction(
        reportedById,
        'DAMAGE',
        'DamageEntry',
        damageEntry.id,
        generateAuditDetails(
          'DAMAGE',
          'DamageEntry',
          warehouseItem.product?.name || 'Unknown Product',
          parseInt(quantity),
          `Reason: ${reason}`
        )
      );

      return res.status(201).json(damageEntry);
    } catch (error) {
      console.error('Error creating damage entry:', error);
      return res.status(500).json({ error: 'Failed to create damage entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
