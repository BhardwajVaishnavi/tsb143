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
      // Get all transfers with related data
      const transfers = await prisma.transfer.findMany({
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
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
        sourceLocationId,
        destinationLocationId,
        transferDate,
        referenceNumber,
        notes,
        items,
        createdBy
      } = req.body;

      // Validate required fields
      if (!sourceLocationId || !destinationLocationId || !items || !items.length) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Start a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Create the transfer record
        const transfer = await tx.transfer.create({
          data: {
            sourceLocationId,
            destinationLocationId,
            transferDate: new Date(transferDate),
            referenceNumber,
            notes,
            status: 'completed',
            transferredById: createdBy || session.user.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        // Process each item in the transfer
        const transferItems = [];
        for (const item of items) {
          // Get the source item
          const sourceItem = await tx.warehouseItem.findUnique({
            where: { id: item.productId },
            include: { product: true }
          });

          if (!sourceItem) {
            throw new Error(`Source item not found: ${item.productId}`);
          }

          // Check if there's enough quantity
          if (sourceItem.quantity < item.quantity) {
            throw new Error(`Not enough quantity for ${sourceItem.product.name}. Available: ${sourceItem.quantity}, Requested: ${item.quantity}`);
          }

          // Find or create the destination item
          let destinationItem = await tx.inventoryItem.findFirst({
            where: {
              productId: sourceItem.productId,
              locationId: destinationLocationId
            }
          });

          if (!destinationItem) {
            // Create a new inventory item if it doesn't exist
            destinationItem = await tx.inventoryItem.create({
              data: {
                productId: sourceItem.productId,
                locationId: destinationLocationId,
                quantity: 0,
                unitPrice: item.newPrice || sourceItem.unitPrice,
                lowStockThreshold: sourceItem.reorderPoint || 10,
                status: 'in_stock',
                createdById: createdBy || session.user.id,
                updatedById: createdBy || session.user.id
              }
            });
          }

          // Create the transfer item record
          const transferItem = await tx.transferItem.create({
            data: {
              transferId: transfer.id,
              productId: sourceItem.productId,
              quantity: item.quantity,
              sourceItemId: sourceItem.id,
              destinationItemId: destinationItem.id,
              oldPrice: sourceItem.unitPrice,
              newPrice: item.newPrice || sourceItem.unitPrice,
              priceAdjustmentType: item.priceAdjustmentType || 'none',
              priceAdjustmentValue: item.priceAdjustmentValue || 0
            }
          });

          transferItems.push(transferItem);

          // Update source item quantity
          await tx.warehouseItem.update({
            where: { id: sourceItem.id },
            data: {
              quantity: {
                decrement: item.quantity
              },
              updatedAt: new Date()
            }
          });

          // Update destination item quantity
          await tx.inventoryItem.update({
            where: { id: destinationItem.id },
            data: {
              quantity: {
                increment: item.quantity
              },
              unitPrice: item.newPrice || destinationItem.unitPrice,
              lastRestockDate: new Date(),
              updatedAt: new Date(),
              updatedById: createdBy || session.user.id
            }
          });
        }

        return { transfer, transferItems };
      });

      // Log the transfer action
      await logEmployeeAction(
        createdBy || session.user.id,
        'TRANSFER',
        'Transfer',
        result.transfer.id,
        generateAuditDetails(
          'TRANSFER',
          'Transfer',
          `${items.length} items`,
          items.reduce((total, item) => total + item.quantity, 0),
          `From ${sourceLocationId} to ${destinationLocationId}`
        )
      );

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating transfer:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to create transfer' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
