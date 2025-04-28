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
      // Get all inward entries with related data
      const inwardEntries = await prisma.inwardEntry.findMany({
        where: {
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(inwardEntries);
    } catch (error) {
      console.error('Error fetching inventory inward entries:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory inward entries' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        inventoryId,
        items,
        supplierId,
        receivedById,
        receivedDate = new Date(),
        referenceNumber,
        invoiceNumber,
        notes,
        status = 'received'
      } = req.body;

      // Validate required fields
      if (!inventoryId || !items || !items.length || !supplierId || !receivedById) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Start a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        const inwardEntries = [];

        // Process each item
        for (const item of items) {
          // Get the product
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          // Find or create the inventory item
          let inventoryItem = await tx.inventoryItem.findFirst({
            where: {
              productId: item.productId,
              locationId: inventoryId
            }
          });

          if (!inventoryItem) {
            // Create a new inventory item if it doesn't exist
            inventoryItem = await tx.inventoryItem.create({
              data: {
                productId: item.productId,
                locationId: inventoryId,
                quantity: 0,
                unitPrice: item.unitPrice,
                lowStockThreshold: 10,
                status: 'in_stock',
                createdById: receivedById,
                updatedById: receivedById
              }
            });
          }

          // Create the inward entry
          const inwardEntry = await tx.inwardEntry.create({
            data: {
              itemId: inventoryItem.id,
              supplierId,
              quantity: item.quantity,
              unitCost: item.unitPrice,
              totalCost: item.quantity * item.unitPrice,
              receivedById,
              receivedDate: new Date(receivedDate),
              batchNumber: referenceNumber,
              invoiceNumber,
              notes,
              status,
              destination: 'inventory'
            },
            include: {
              warehouseItem: true,
              supplier: true,
              receivedBy: true
            }
          });

          inwardEntries.push(inwardEntry);

          // Update inventory item quantity
          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: {
                increment: item.quantity
              },
              lastRestockDate: new Date(),
              updatedAt: new Date(),
              updatedById: receivedById
            }
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
              product.name,
              item.quantity,
              `From supplier: ${supplierId}`
            )
          );
        }

        return inwardEntries;
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating inventory inward entry:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to create inventory inward entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
