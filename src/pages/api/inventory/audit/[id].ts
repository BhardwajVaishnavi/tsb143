import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Get the audit with related data
      const audit = await prisma.inventoryAudit.findUnique({
        where: { id: id as string },
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
        }
      });

      if (!audit) {
        return res.status(404).json({ error: 'Audit not found' });
      }

      return res.status(200).json(audit);
    } catch (error) {
      console.error('Error fetching audit:', error);
      return res.status(500).json({ error: 'Failed to fetch audit' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
