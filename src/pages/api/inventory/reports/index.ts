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

  if (req.method === 'GET') {
    try {
      const { type, startDate, endDate, locationId, categoryId } = req.query;

      // Parse dates
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate as string) : new Date();

      // Set end date to end of day
      end.setHours(23, 59, 59, 999);

      // Default location filter
      const locationFilter = locationId ? { locationId: locationId as string } : {};

      // Generate report based on type
      switch (type) {
        case 'inventory-status': {
          // Get current inventory status
          const inventoryItems = await prisma.inventoryItem.findMany({
            where: {
              ...locationFilter
            },
            include: {
              product: {
                include: {
                  category: true
                }
              },
              location: true
            },
            orderBy: {
              product: {
                name: 'asc'
              }
            }
          });

          // Calculate summary statistics
          const totalItems = inventoryItems.length;
          const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const lowStockItems = inventoryItems.filter(item => item.quantity <= item.lowStockThreshold).length;
          const outOfStockItems = inventoryItems.filter(item => item.quantity === 0).length;

          // Group by category
          const categoryGroups = inventoryItems.reduce((groups, item) => {
            const categoryId = item.product.categoryId;
            const categoryName = item.product.category?.name || 'Uncategorized';
            
            if (!groups[categoryId]) {
              groups[categoryId] = {
                categoryId,
                categoryName,
                itemCount: 0,
                totalQuantity: 0,
                totalValue: 0
              };
            }
            
            groups[categoryId].itemCount++;
            groups[categoryId].totalQuantity += item.quantity;
            groups[categoryId].totalValue += (item.quantity * item.unitPrice);
            
            return groups;
          }, {});

          return res.status(200).json({
            reportType: 'inventory-status',
            generatedAt: new Date(),
            summary: {
              totalItems,
              totalQuantity,
              totalValue,
              lowStockItems,
              outOfStockItems
            },
            categoryBreakdown: Object.values(categoryGroups),
            items: inventoryItems
          });
        }

        case 'movement-analysis': {
          // Get inward entries
          const inwardEntries = await prisma.inwardEntry.findMany({
            where: {
              receivedDate: {
                gte: start,
                lte: end
              },
              destination: 'inventory',
              ...(locationId ? { inventoryItem: { locationId: locationId as string } } : {})
            },
            include: {
              inventoryItem: {
                include: {
                  product: {
                    include: {
                      category: true
                    }
                  }
                }
              }
            }
          });

          // Get outward entries
          const outwardEntries = await prisma.outwardEntry.findMany({
            where: {
              transferDate: {
                gte: start,
                lte: end
              },
              source: 'inventory',
              ...(locationId ? { inventoryItem: { locationId: locationId as string } } : {})
            },
            include: {
              inventoryItem: {
                include: {
                  product: {
                    include: {
                      category: true
                    }
                  }
                }
              }
            }
          });

          // Calculate total inward and outward quantities
          const totalInward = inwardEntries.reduce((sum, entry) => sum + entry.quantity, 0);
          const totalOutward = outwardEntries.reduce((sum, entry) => sum + entry.quantity, 0);
          const netChange = totalInward - totalOutward;

          // Group by product
          const productMovement = {};
          
          // Process inward entries
          inwardEntries.forEach(entry => {
            const productId = entry.inventoryItem.productId;
            const productName = entry.inventoryItem.product.name;
            
            if (!productMovement[productId]) {
              productMovement[productId] = {
                productId,
                productName,
                category: entry.inventoryItem.product.category?.name || 'Uncategorized',
                inwardQuantity: 0,
                outwardQuantity: 0,
                netChange: 0
              };
            }
            
            productMovement[productId].inwardQuantity += entry.quantity;
            productMovement[productId].netChange += entry.quantity;
          });
          
          // Process outward entries
          outwardEntries.forEach(entry => {
            const productId = entry.inventoryItem.productId;
            const productName = entry.inventoryItem.product.name;
            
            if (!productMovement[productId]) {
              productMovement[productId] = {
                productId,
                productName,
                category: entry.inventoryItem.product.category?.name || 'Uncategorized',
                inwardQuantity: 0,
                outwardQuantity: 0,
                netChange: 0
              };
            }
            
            productMovement[productId].outwardQuantity += entry.quantity;
            productMovement[productId].netChange -= entry.quantity;
          });

          return res.status(200).json({
            reportType: 'movement-analysis',
            generatedAt: new Date(),
            period: {
              startDate: start,
              endDate: end
            },
            summary: {
              totalInward,
              totalOutward,
              netChange
            },
            productMovement: Object.values(productMovement)
          });
        }

        case 'value-report': {
          // Get inventory items with their current value
          const inventoryItems = await prisma.inventoryItem.findMany({
            where: {
              ...locationFilter
            },
            include: {
              product: {
                include: {
                  category: true
                }
              },
              location: true
            }
          });

          // Calculate total value
          const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

          // Group by category
          const categoryValues = inventoryItems.reduce((groups, item) => {
            const categoryId = item.product.categoryId;
            const categoryName = item.product.category?.name || 'Uncategorized';
            
            if (!groups[categoryId]) {
              groups[categoryId] = {
                categoryId,
                categoryName,
                itemCount: 0,
                totalValue: 0
              };
            }
            
            groups[categoryId].itemCount++;
            groups[categoryId].totalValue += (item.quantity * item.unitPrice);
            
            return groups;
          }, {});

          return res.status(200).json({
            reportType: 'value-report',
            generatedAt: new Date(),
            summary: {
              totalItems: inventoryItems.length,
              totalValue
            },
            categoryValues: Object.values(categoryValues),
            items: inventoryItems.map(item => ({
              id: item.id,
              productId: item.productId,
              productName: item.product.name,
              category: item.product.category?.name || 'Uncategorized',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalValue: item.quantity * item.unitPrice,
              location: item.location?.name || 'Unknown'
            }))
          });
        }

        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }
    } catch (error) {
      console.error('Error generating inventory report:', error);
      return res.status(500).json({ error: 'Failed to generate inventory report' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
