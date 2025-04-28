import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { logEmployeeAction, generateAuditDetails } from '../../../utils/auditLogger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      // Get all transfers with employee information
      const transfers = await prisma.transfer.findMany({
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
          inventoryItem: true,
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

      return res.status(200).json(transfers);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return res.status(500).json({ error: 'Failed to fetch transfers' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        warehouseItemId,
        inventoryItemId,
        quantity,
        transferredById,
        transferDate = new Date(),
        notes,
        status = 'completed'
      } = req.body;

      // Validate required fields
      if (!warehouseItemId || !inventoryItemId || !quantity || !transferredById) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if warehouse item exists and has enough quantity
      const warehouseItem = await prisma.warehouseItem.findUnique({
        where: { id: warehouseItemId },
        include: { product: true }
      });

      if (!warehouseItem) {
        return res.status(404).json({ error: 'Warehouse item not found' });
      }

      if (warehouseItem.quantity < parseInt(quantity)) {
        return res.status(400).json({ error: 'Not enough quantity in warehouse' });
      }

      // Check if inventory item exists
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: inventoryItemId }
      });

      if (!inventoryItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      // Create transfer
      const transfer = await prisma.transfer.create({
        data: {
          warehouseItemId,
          inventoryItemId,
          quantity: parseInt(quantity),
          transferredById,
          transferDate: new Date(transferDate),
          notes,
          status
        },
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
          inventoryItem: true,
          transferredBy: true
        }
      });

      // Update warehouse item quantity
      await prisma.warehouseItem.update({
        where: { id: warehouseItemId },
        data: {
          quantity: {
            decrement: parseInt(quantity)
          }
        }
      });

      // Update inventory item quantity
      await prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          quantity: {
            increment: parseInt(quantity)
          },
          lastRestockDate: new Date()
        }
      });

      // Log employee action
      await logEmployeeAction(
        transferredById,
        'TRANSFER',
        'Transfer',
        transfer.id,
        generateAuditDetails(
          'TRANSFER',
          'Transfer',
          warehouseItem.product?.name || 'Unknown Product',
          parseInt(quantity),
          `From warehouse to inventory`
        )
      );

      return res.status(201).json(transfer);
    } catch (error) {
      console.error('Error creating transfer:', error);
      return res.status(500).json({ error: 'Failed to create transfer' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
