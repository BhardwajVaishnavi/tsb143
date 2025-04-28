import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, you would generate a JWT token here
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: 'mock-jwt-token',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Warehouse routes
app.get('/api/warehouse/items', async (req, res) => {
  try {
    const items = await prisma.warehouseItem.findMany({
      include: {
        supplier: true,
      },
    });

    res.json(items);
  } catch (error) {
    console.error('Error fetching warehouse items:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse items' });
  }
});

app.get('/api/warehouse/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.warehouseItem.findUnique({
      where: { id },
      include: {
        supplier: true,
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Warehouse item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching warehouse item:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse item' });
  }
});

app.post('/api/warehouse/items', async (req, res) => {
  try {
    const schema = z.object({
      productName: z.string().min(1),
      quantity: z.number().int().positive(),
      supplierId: z.string().uuid(),
    });

    const validatedData = schema.parse(req.body);

    const item = await prisma.warehouseItem.create({
      data: validatedData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: 'system', // In a real app, this would be the authenticated user's ID
        action: 'created',
        entity: 'WarehouseItem',
        entityId: item.id,
        details: `Created warehouse item: ${validatedData.productName}`,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating warehouse item:', error);
    res.status(500).json({ error: 'Failed to create warehouse item' });
  }
});

app.put('/api/warehouse/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const schema = z.object({
      productName: z.string().min(1).optional(),
      quantity: z.number().int().positive().optional(),
      supplierId: z.string().uuid().optional(),
    });

    const validatedData = schema.parse(req.body);

    const item = await prisma.warehouseItem.update({
      where: { id },
      data: validatedData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: 'system', // In a real app, this would be the authenticated user's ID
        action: 'updated',
        entity: 'WarehouseItem',
        entityId: item.id,
        details: `Updated warehouse item: ${item.productName}`,
      },
    });

    res.json(item);
  } catch (error) {
    console.error('Error updating warehouse item:', error);
    res.status(500).json({ error: 'Failed to update warehouse item' });
  }
});

app.delete('/api/warehouse/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.warehouseItem.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: 'system', // In a real app, this would be the authenticated user's ID
        action: 'deleted',
        entity: 'WarehouseItem',
        entityId: id,
        details: `Deleted warehouse item: ${item.productName}`,
      },
    });

    res.json({ message: 'Warehouse item deleted successfully' });
  } catch (error) {
    console.error('Error deleting warehouse item:', error);
    res.status(500).json({ error: 'Failed to delete warehouse item' });
  }
});

// Inventory routes
app.get('/api/inventory/items', async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

app.get('/api/inventory/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Transfer routes
app.post('/api/transfers', async (req, res) => {
  try {
    const schema = z.object({
      warehouseItemId: z.string().uuid(),
      inventoryItemId: z.string().uuid(),
      quantity: z.number().int().positive(),
    });

    const validatedData = schema.parse(req.body);

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the warehouse item
      const warehouseItem = await tx.warehouseItem.findUnique({
        where: { id: validatedData.warehouseItemId },
      });

      if (!warehouseItem) {
        throw new Error('Warehouse item not found');
      }

      if (warehouseItem.quantity < validatedData.quantity) {
        throw new Error('Not enough items in warehouse');
      }

      // Get the inventory item
      const inventoryItem = await tx.inventoryItem.findUnique({
        where: { id: validatedData.inventoryItemId },
      });

      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }

      // Update warehouse item quantity
      await tx.warehouseItem.update({
        where: { id: validatedData.warehouseItemId },
        data: {
          quantity: warehouseItem.quantity - validatedData.quantity,
        },
      });

      // Update inventory item quantity
      await tx.inventoryItem.update({
        where: { id: validatedData.inventoryItemId },
        data: {
          quantity: inventoryItem.quantity + validatedData.quantity,
        },
      });

      // Create transfer record
      const transfer = await tx.transfer.create({
        data: validatedData,
      });

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: 'system', // In a real app, this would be the authenticated user's ID
          action: 'transferred',
          entity: 'Transfer',
          entityId: transfer.id,
          details: `Transferred ${validatedData.quantity} items from warehouse to inventory`,
        },
      });

      return transfer;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
});

app.get('/api/transfers', async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        warehouseItem: true,
        inventoryItem: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// Supplier routes
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        warehouseItems: true,
      },
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.string().optional(),
    });

    const validatedData = schema.parse(req.body);

    const supplier = await prisma.supplier.create({
      data: validatedData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: 'system', // In a real app, this would be the authenticated user's ID
        action: 'created',
        entity: 'Supplier',
        entityId: supplier.id,
        details: `Created supplier: ${validatedData.name}`,
      },
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const schema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    });

    const validatedData = schema.parse(req.body);

    const supplier = await prisma.supplier.update({
      where: { id },
      data: validatedData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: 'system', // In a real app, this would be the authenticated user's ID
        action: 'updated',
        entity: 'Supplier',
        entityId: supplier.id,
        details: `Updated supplier: ${supplier.name}`,
      },
    });

    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: 'system', // In a real app, this would be the authenticated user's ID
        action: 'deleted',
        entity: 'Supplier',
        entityId: id,
        details: `Deleted supplier: ${supplier.name}`,
      },
    });

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// Audit routes
app.get('/api/audit/logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
