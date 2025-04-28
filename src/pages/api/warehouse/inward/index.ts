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
      // Get all inward entries with employee information
      const inwardEntries = await prisma.inwardEntry.findMany({
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(inwardEntries);
    } catch (error) {
      console.error('Error fetching inward entries:', error);
      return res.status(500).json({ error: 'Failed to fetch inward entries' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        warehouseId,
        itemId,
        supplierId,
        quantity,
        unitCost,
        totalCost,
        receivedById,
        receivedDate,
        batchNumber,
        invoiceNumber,
        notes,
        status = 'received'
      } = req.body;

      // Validate required fields
      if (!warehouseId || !itemId || !supplierId || !quantity || !unitCost || !receivedById || !receivedDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create inward entry
      const inwardEntry = await prisma.inwardEntry.create({
        data: {
          warehouseId,
          itemId,
          supplierId,
          quantity: parseInt(quantity),
          unitCost: parseFloat(unitCost),
          totalCost: parseFloat(totalCost || (quantity * unitCost).toString()),
          receivedById,
          receivedDate: new Date(receivedDate),
          batchNumber,
          invoiceNumber,
          notes,
          status
        },
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
          supplier: true,
          receivedBy: true
        }
      });

      // Update warehouse item quantity
      await prisma.warehouseItem.update({
        where: { id: itemId },
        data: {
          quantity: {
            increment: parseInt(quantity)
          },
          lastRestockDate: new Date()
        }
      });

      // Get product name for audit log
      const warehouseItem = await prisma.warehouseItem.findUnique({
        where: { id: itemId },
        include: { product: true }
      });

      // Log employee action
      await logEmployeeAction(
        receivedById,
        'RECEIVE',
        'InwardEntry',
        inwardEntry.id,
        generateAuditDetails(
          'RECEIVE',
          'InwardEntry',
          warehouseItem?.product?.name || 'Unknown Product',
          parseInt(quantity),
          `From supplier: ${inwardEntry.supplier.name}`
        )
      );

      return res.status(201).json(inwardEntry);
    } catch (error) {
      console.error('Error creating inward entry:', error);
      return res.status(500).json({ error: 'Failed to create inward entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
