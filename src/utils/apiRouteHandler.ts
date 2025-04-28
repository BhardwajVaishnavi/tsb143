import { Request, Response } from 'express';
import { mockActivityLogs, mockWarehouseItems, mockInventoryItems } from './mockData';

/**
 * This utility file provides mock implementations for all API routes
 * It replaces the Next.js API routes with Express route handlers
 */

// Generic handler for all audit log routes
export const handleAuditLogRoutes = (req: Request, res: Response) => {
  // Check authentication (simplified for mock implementation)
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract parameters from the request
  const { action, entityType, entityId, userId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    let logs = [...mockActivityLogs];

    // Filter by action if provided
    if (action) {
      logs = logs.filter(log => log.action === action);
    }

    // Filter by entity if provided
    if (entityType && entityId) {
      logs = logs.filter(log => log.entity === entityType && log.entityId === entityId);
    }

    // Filter by user if provided
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      logs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error handling audit log request:', error);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// Generic handler for all warehouse routes
export const handleWarehouseRoutes = (req: Request, res: Response) => {
  // Check authentication (simplified for mock implementation)
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { method } = req;

  try {
    // Handle GET requests
    if (method === 'GET') {
      if (id) {
        // Get a specific item
        const item = mockWarehouseItems.find(item => item.id === id);
        if (!item) {
          return res.status(404).json({ error: 'Item not found' });
        }
        return res.status(200).json(item);
      } else {
        // Get all items
        return res.status(200).json(mockWarehouseItems);
      }
    }

    // Handle POST requests
    if (method === 'POST') {
      // Create a new item
      const newItem = req.body;
      newItem.id = `wh-item-${Date.now()}`;
      newItem.createdAt = new Date().toISOString();
      newItem.updatedAt = new Date().toISOString();
      
      // In a real implementation, this would save to the database
      // For now, we'll just return the new item
      return res.status(201).json(newItem);
    }

    // Handle PUT requests
    if (method === 'PUT' && id) {
      // Update an existing item
      const updatedItem = {
        ...mockWarehouseItems.find(item => item.id === id),
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, this would update the database
      // For now, we'll just return the updated item
      return res.status(200).json(updatedItem);
    }

    // Handle DELETE requests
    if (method === 'DELETE' && id) {
      // Delete an item
      // In a real implementation, this would delete from the database
      return res.status(200).json({ success: true, message: 'Item deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling warehouse request:', error);
    return res.status(500).json({ error: 'Failed to process warehouse request' });
  }
};

// Generic handler for all inventory routes
export const handleInventoryRoutes = (req: Request, res: Response) => {
  // Check authentication (simplified for mock implementation)
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { method } = req;

  try {
    // Handle GET requests
    if (method === 'GET') {
      if (id) {
        // Get a specific item
        const item = mockInventoryItems.find(item => item.id === id);
        if (!item) {
          return res.status(404).json({ error: 'Item not found' });
        }
        return res.status(200).json(item);
      } else {
        // Get all items
        return res.status(200).json(mockInventoryItems);
      }
    }

    // Handle POST requests
    if (method === 'POST') {
      // Create a new item
      const newItem = req.body;
      newItem.id = `inv-item-${Date.now()}`;
      newItem.createdAt = new Date().toISOString();
      newItem.updatedAt = new Date().toISOString();
      
      // In a real implementation, this would save to the database
      // For now, we'll just return the new item
      return res.status(201).json(newItem);
    }

    // Handle PUT requests
    if (method === 'PUT' && id) {
      // Update an existing item
      const updatedItem = {
        ...mockInventoryItems.find(item => item.id === id),
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, this would update the database
      // For now, we'll just return the updated item
      return res.status(200).json(updatedItem);
    }

    // Handle DELETE requests
    if (method === 'DELETE' && id) {
      // Delete an item
      // In a real implementation, this would delete from the database
      return res.status(200).json({ success: true, message: 'Item deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling inventory request:', error);
    return res.status(500).json({ error: 'Failed to process inventory request' });
  }
};

// Generic handler for all location routes
export const handleLocationRoutes = (req: Request, res: Response) => {
  // Similar implementation as above, customized for locations
  // For brevity, returning a simple mock response
  return res.status(200).json([
    { id: 'loc-1', name: 'Main Warehouse', type: 'warehouse', address: 'Main Street 123' },
    { id: 'loc-2', name: 'Store Inventory', type: 'inventory', address: 'Market Street 456' }
  ]);
};

// Generic handler for all transfer routes
export const handleTransferRoutes = (req: Request, res: Response) => {
  // Similar implementation as above, customized for transfers
  // For brevity, returning a simple mock response
  return res.status(200).json([
    { 
      id: 'transfer-1', 
      sourceId: 'wh-1', 
      destinationId: 'inv-1',
      items: [{ itemId: 'item-1', quantity: 10 }],
      status: 'completed',
      createdAt: new Date().toISOString()
    }
  ]);
};
