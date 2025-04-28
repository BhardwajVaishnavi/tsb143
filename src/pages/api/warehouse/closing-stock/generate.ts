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

  if (req.method === 'POST') {
    try {
      const { warehouseId, date = new Date(), createdById } = req.body;

      if (!warehouseId || !createdById) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const closingDate = new Date(date);
      const startOfDay = new Date(closingDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(closingDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all warehouse items
      const warehouseItems = await prisma.warehouseItem.findMany({
        where: { warehouseId },
        include: { product: true }
      });

      // For each warehouse item, calculate closing stock
      const closingStocks = [];
      
      for (const item of warehouseItems) {
        // Get previous closing stock for opening quantity
        const previousClosingStock = await prisma.closingStock.findFirst({
          where: {
            warehouseId,
            itemId: item.id,
            date: {
              lt: startOfDay
            }
          },
          orderBy: {
            date: 'desc'
          }
        });

        // Get inward entries for the day
        const inwardEntries = await prisma.inwardEntry.findMany({
          where: {
            warehouseId,
            itemId: item.id,
            receivedDate: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        // Get outward entries for the day
        const outwardEntries = await prisma.outwardEntry.findMany({
          where: {
            warehouseId,
            itemId: item.id,
            transferDate: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        // Get damage entries for the day
        const damageEntries = await prisma.damageEntry.findMany({
          where: {
            warehouseId,
            itemId: item.id,
            status: 'approved',
            approvedDate: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        // Calculate quantities
        const openingQuantity = previousClosingStock?.closingQuantity || 0;
        const inwardQuantity = inwardEntries.reduce((sum, entry) => sum + entry.quantity, 0);
        const outwardQuantity = outwardEntries.reduce((sum, entry) => sum + entry.quantity, 0);
        const damageQuantity = damageEntries.reduce((sum, entry) => sum + entry.quantity, 0);
        const adjustmentQuantity = 0; // No adjustments in this implementation
        const closingQuantity = openingQuantity + inwardQuantity - outwardQuantity - damageQuantity + adjustmentQuantity;

        // Check if closing stock already exists for this item and date
        const existingClosingStock = await prisma.closingStock.findFirst({
          where: {
            warehouseId,
            itemId: item.id,
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        let closingStock;

        if (existingClosingStock) {
          // Update existing closing stock
          closingStock = await prisma.closingStock.update({
            where: { id: existingClosingStock.id },
            data: {
              openingQuantity,
              inwardQuantity,
              outwardQuantity,
              damageQuantity,
              adjustmentQuantity,
              closingQuantity,
              unitPrice: item.unitPrice,
              totalValue: closingQuantity * item.unitPrice,
              createdById,
              updatedAt: new Date()
            },
            include: {
              warehouseItem: {
                include: {
                  product: true
                }
              },
              createdBy: true
            }
          });
        } else {
          // Create new closing stock
          closingStock = await prisma.closingStock.create({
            data: {
              warehouseId,
              itemId: item.id,
              date: closingDate,
              openingQuantity,
              inwardQuantity,
              outwardQuantity,
              damageQuantity,
              adjustmentQuantity,
              closingQuantity,
              unitPrice: item.unitPrice,
              totalValue: closingQuantity * item.unitPrice,
              createdById
            },
            include: {
              warehouseItem: {
                include: {
                  product: true
                }
              },
              createdBy: true
            }
          });
        }

        closingStocks.push(closingStock);

        // Log employee action
        await logEmployeeAction(
          createdById,
          'CREATE',
          'ClosingStock',
          closingStock.id,
          generateAuditDetails(
            'CREATE',
            'ClosingStock',
            item.product?.name || 'Unknown Product',
            closingQuantity,
            `Generated closing stock for ${closingDate.toLocaleDateString()}`
          )
        );
      }

      return res.status(200).json(closingStocks);
    } catch (error) {
      console.error('Error generating closing stock:', error);
      return res.status(500).json({ error: 'Failed to generate closing stock' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
