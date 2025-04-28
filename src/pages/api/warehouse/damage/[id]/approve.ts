import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import { logEmployeeAction, generateAuditDetails } from '../../../../../utils/auditLogger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      // Get the damage entry
      const damageEntry = await prisma.damageEntry.findUnique({
        where: { id: id as string },
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          }
        }
      });

      if (!damageEntry) {
        return res.status(404).json({ error: 'Damage entry not found' });
      }

      if (damageEntry.status !== 'pending') {
        return res.status(400).json({ error: 'Damage entry is not pending' });
      }

      const { approvedById } = req.body;

      if (!approvedById) {
        return res.status(400).json({ error: 'Missing approvedById field' });
      }

      // Update damage entry
      const updatedDamageEntry = await prisma.damageEntry.update({
        where: { id: id as string },
        data: {
          status: 'approved',
          approvedById,
          approvedDate: new Date()
        },
        include: {
          warehouseItem: {
            include: {
              product: true
            }
          },
          reportedBy: true,
          approvedBy: true
        }
      });

      // Update warehouse item quantity
      await prisma.warehouseItem.update({
        where: { id: damageEntry.itemId },
        data: {
          quantity: {
            decrement: damageEntry.quantity
          }
        }
      });

      // Log employee action
      await logEmployeeAction(
        approvedById,
        'APPROVE',
        'DamageEntry',
        updatedDamageEntry.id,
        generateAuditDetails(
          'APPROVE',
          'DamageEntry',
          damageEntry.warehouseItem.product?.name || 'Unknown Product',
          damageEntry.quantity,
          `Approved damage report for ${damageEntry.quantity} items`
        )
      );

      return res.status(200).json(updatedDamageEntry);
    } catch (error) {
      console.error('Error approving damage entry:', error);
      return res.status(500).json({ error: 'Failed to approve damage entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
