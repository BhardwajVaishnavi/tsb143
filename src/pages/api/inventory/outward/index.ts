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
      // Get all outward entries with related data
      const outwardEntries = await prisma.outwardEntry.findMany({
        where: {
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(outwardEntries);
    } catch (error) {
      console.error('Error fetching inventory outward entries:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory outward entries' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        inventoryId,
        items,
        destination,
        transferredById,
        transferDate = new Date(),
        referenceNumber,
        notes,
        status = 'completed'
      } = req.body;

      // Validate required fields
      if (!inventoryId || !items || !items.length || !destination || !transferredById) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Start a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        const outwardEntries = [];

        // Process each item
        for (const item of items) {
          // Get the inventory item
          const inventoryItem = await tx.inventoryItem.findUnique({
            where: { id: item.itemId },
            include: { product: true }
          });

          if (!inventoryItem) {
            throw new Error(`Inventory item not found: ${item.itemId}`);
          }

          // Check if there's enough quantity
          if (inventoryItem.quantity < item.quantity) {
            throw new Error(`Not enough quantity for ${inventoryItem.product.name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`);
          }

          // Create the outward entry
          const outwardEntry = await tx.outwardEntry.create({
            data: {
              itemId: inventoryItem.id,
              quantity: item.quantity,
              destination,
              transferredById,
              transferDate: new Date(transferDate),
              referenceNumber,
              notes,
              status,
              source: 'inventory'
            },
            include: {
              inventoryItem: {
                include: {
                  product: true
                }
              },
              transferredBy: true
            }
          });

          outwardEntries.push(outwardEntry);

          // Update inventory item quantity
          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: {
                decrement: item.quantity
              },
              lastOutwardDate: new Date(),
              updatedAt: new Date(),
              updatedById: transferredById
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
              inventoryItem.product.name,
              item.quantity,
              `To destination: ${destination}`
            )
          );
        }

        return outwardEntries;
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating inventory outward entry:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to create inventory outward entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
