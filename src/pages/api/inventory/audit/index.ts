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
      // Get all inventory audits with related data
      const audits = await prisma.inventoryAudit.findMany({
        include: {
          location: true,
          conductedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          auditItems: {
            include: {
              inventoryItem: {
                include: {
                  product: true
                }
              }
            }
          }
        },
        orderBy: {
          auditDate: 'desc'
        }
      });

      return res.status(200).json(audits);
    } catch (error) {
      console.error('Error fetching inventory audits:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory audits' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        locationId,
        auditDate = new Date(),
        conductedById,
        notes,
        items
      } = req.body;

      // Validate required fields
      if (!locationId || !conductedById || !items || !items.length) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Start a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Create the audit record
        const audit = await tx.inventoryAudit.create({
          data: {
            locationId,
            auditDate: new Date(auditDate),
            conductedById,
            notes,
            status: 'completed'
          }
        });

        // Process each audit item
        const auditItems = [];
        let totalDiscrepancies = 0;

        for (const item of items) {
          // Get the inventory item
          const inventoryItem = await tx.inventoryItem.findUnique({
            where: { id: item.inventoryItemId },
            include: { product: true }
          });

          if (!inventoryItem) {
            throw new Error(`Inventory item not found: ${item.inventoryItemId}`);
          }

          // Calculate discrepancy
          const expectedQuantity = inventoryItem.quantity;
          const actualQuantity = item.actualQuantity;
          const discrepancy = actualQuantity - expectedQuantity;
          
          // Create the audit item
          const auditItem = await tx.inventoryAuditItem.create({
            data: {
              auditId: audit.id,
              inventoryItemId: item.inventoryItemId,
              expectedQuantity,
              actualQuantity,
              discrepancy,
              notes: item.notes
            }
          });

          auditItems.push(auditItem);
          
          if (discrepancy !== 0) {
            totalDiscrepancies++;
            
            // Update inventory item quantity if needed
            if (item.updateInventory) {
              await tx.inventoryItem.update({
                where: { id: item.inventoryItemId },
                data: {
                  quantity: actualQuantity,
                  updatedById: conductedById,
                  updatedAt: new Date()
                }
              });
              
              // Create an adjustment record
              await tx.inventoryAdjustment.create({
                data: {
                  inventoryItemId: item.inventoryItemId,
                  previousQuantity: expectedQuantity,
                  newQuantity: actualQuantity,
                  adjustmentQuantity: discrepancy,
                  reason: 'Audit adjustment',
                  adjustedById: conductedById,
                  adjustmentDate: new Date(),
                  notes: `Adjustment from audit ${audit.id}`
                }
              });
            }
          }
        }

        // Update audit with summary
        await tx.inventoryAudit.update({
          where: { id: audit.id },
          data: {
            itemsAudited: items.length,
            discrepanciesFound: totalDiscrepancies
          }
        });

        return { audit, auditItems };
      });

      // Log employee action
      await logEmployeeAction(
        conductedById,
        'CREATE',
        'InventoryAudit',
        result.audit.id,
        generateAuditDetails(
          'CREATE',
          'InventoryAudit',
          `Audit for ${locationId}`,
          result.audit.itemsAudited,
          `Found ${result.audit.discrepanciesFound} discrepancies`
        )
      );

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating inventory audit:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to create inventory audit' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
