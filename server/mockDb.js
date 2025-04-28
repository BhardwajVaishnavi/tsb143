// Mock database service to simulate database functionality
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Mock data
const mockData = {
  users: [
    {
      id: 'user-1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // In a real app, this would be hashed
      role: 'ADMIN',
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-2',
      name: 'Warehouse Manager',
      email: 'warehouse@example.com',
      password: 'warehouse123', // In a real app, this would be hashed
      role: 'WAREHOUSE_MANAGER',
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-3',
      name: 'Inventory Manager',
      email: 'inventory@example.com',
      password: 'inventory123', // In a real app, this would be hashed
      role: 'INVENTORY_MANAGER',
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  warehouseItems: [
    {
      id: 'wh-item-1',
      productName: 'Laptop',
      sku: 'LAP-001',
      category: 'Electronics',
      quantity: 50,
      unitCost: 800,
      totalValue: 40000,
      supplierId: 'supplier-1',
      supplier: {
        id: 'supplier-1',
        name: 'Tech Supplies Inc.',
        contactName: 'John Doe',
        email: 'john@techsupplies.com',
        phone: '123-456-7890'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wh-item-2',
      productName: 'Smartphone',
      sku: 'PHN-001',
      category: 'Electronics',
      quantity: 100,
      unitCost: 500,
      totalValue: 50000,
      supplierId: 'supplier-1',
      supplier: {
        id: 'supplier-1',
        name: 'Tech Supplies Inc.',
        contactName: 'John Doe',
        email: 'john@techsupplies.com',
        phone: '123-456-7890'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wh-item-3',
      productName: 'Office Chair',
      sku: 'FRN-001',
      category: 'Furniture',
      quantity: 30,
      unitCost: 150,
      totalValue: 4500,
      supplierId: 'supplier-2',
      supplier: {
        id: 'supplier-2',
        name: 'Office Furnishings',
        contactName: 'Jane Smith',
        email: 'jane@officefurnishings.com',
        phone: '987-654-3210'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  inventoryItems: [
    {
      id: 'inv-item-1',
      productId: 'product-1',
      product: {
        id: 'product-1',
        name: 'Laptop',
        sku: 'LAP-001',
        category: {
          id: 'cat-1',
          name: 'Electronics'
        }
      },
      locationId: 'inv-1',
      quantity: 20,
      unitPrice: 900,
      totalValue: 18000,
      lowStockThreshold: 5,
      status: 'in_stock',
      zone: 'A',
      rack: 'R1',
      bin: 'B1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inv-item-2',
      productId: 'product-2',
      product: {
        id: 'product-2',
        name: 'Smartphone',
        sku: 'PHN-001',
        category: {
          id: 'cat-1',
          name: 'Electronics'
        }
      },
      locationId: 'inv-1',
      quantity: 30,
      unitPrice: 600,
      totalValue: 18000,
      lowStockThreshold: 10,
      status: 'in_stock',
      zone: 'A',
      rack: 'R2',
      bin: 'B1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inv-item-3',
      productId: 'product-3',
      product: {
        id: 'product-3',
        name: 'Office Chair',
        sku: 'FRN-001',
        category: {
          id: 'cat-2',
          name: 'Furniture'
        }
      },
      locationId: 'inv-2',
      quantity: 10,
      unitPrice: 180,
      totalValue: 1800,
      lowStockThreshold: 3,
      status: 'in_stock',
      zone: 'B',
      rack: 'R1',
      bin: 'B2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  products: [
    {
      id: 'product-1',
      name: 'Laptop',
      sku: 'LAP-001',
      categoryId: 'cat-1',
      category: {
        id: 'cat-1',
        name: 'Electronics'
      },
      description: 'High-performance laptop for business use',
      brand: 'TechBrand',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'product-2',
      name: 'Smartphone',
      sku: 'PHN-001',
      categoryId: 'cat-1',
      category: {
        id: 'cat-1',
        name: 'Electronics'
      },
      description: 'Latest smartphone model',
      brand: 'TechBrand',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'product-3',
      name: 'Office Chair',
      sku: 'FRN-001',
      categoryId: 'cat-2',
      category: {
        id: 'cat-2',
        name: 'Furniture'
      },
      description: 'Ergonomic office chair',
      brand: 'OfficePro',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: 'cat-1',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-2',
      name: 'Furniture',
      description: 'Office and home furniture',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-3',
      name: 'Stationery',
      description: 'Office supplies and stationery items',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  suppliers: [
    {
      id: 'supplier-1',
      name: 'Tech Supplies Inc.',
      contactName: 'John Doe',
      email: 'john@techsupplies.com',
      phone: '123-456-7890',
      address: '123 Tech St, San Francisco, CA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-2',
      name: 'Office Furnishings',
      contactName: 'Jane Smith',
      email: 'jane@officefurnishings.com',
      phone: '987-654-3210',
      address: '456 Office Ave, New York, NY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  inwardEntries: [
    {
      id: 'inward-1',
      itemId: 'wh-item-1',
      receivedDate: new Date().toISOString(),
      quantity: 20,
      unitCost: 800,
      totalCost: 16000,
      supplierId: 'supplier-1',
      supplier: {
        id: 'supplier-1',
        name: 'Tech Supplies Inc.'
      },
      batchNumber: 'BATCH-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inward-2',
      itemId: 'wh-item-2',
      receivedDate: new Date().toISOString(),
      quantity: 30,
      unitCost: 500,
      totalCost: 15000,
      supplierId: 'supplier-1',
      supplier: {
        id: 'supplier-1',
        name: 'Tech Supplies Inc.'
      },
      batchNumber: 'BATCH-002',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  outwardEntries: [
    {
      id: 'outward-1',
      itemId: 'wh-item-1',
      transferDate: new Date().toISOString(),
      quantity: 5,
      destination: 'Retail Store',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'outward-2',
      itemId: 'wh-item-2',
      transferDate: new Date().toISOString(),
      quantity: 10,
      destination: 'Online Store',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  damageEntries: [
    {
      id: 'damage-1',
      itemId: 'wh-item-1',
      reportedDate: new Date().toISOString(),
      quantity: 2,
      reason: 'Damaged during shipping',
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      userId: 'user-1',
      action: 'LOGIN',
      entity: 'User',
      entityId: 'user-1',
      details: 'User Admin User logged in',
      createdAt: new Date().toISOString()
    }
  ]
};

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: async ({ where }) => {
      const user = mockData.users.find(u => {
        if (where.id) return u.id === where.id;
        if (where.email) return u.email === where.email;
        return false;
      });
      return user ? { ...user } : null;
    },
    update: async ({ where, data }) => {
      const index = mockData.users.findIndex(u => u.id === where.id);
      if (index === -1) throw new Error('User not found');

      mockData.users[index] = { ...mockData.users[index], ...data, updatedAt: new Date().toISOString() };
      return mockData.users[index];
    }
  },
  warehouseItem: {
    findMany: async () => {
      return [...mockData.warehouseItems];
    },
    findUnique: async ({ where, include }) => {
      const item = mockData.warehouseItems.find(i => i.id === where.id);
      if (!item) return null;

      if (include?.supplier) {
        return { ...item };
      }

      return item;
    },
    create: async ({ data }) => {
      const newItem = {
        id: data.id || `wh-item-${mockData.warehouseItems.length + 1}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (data.supplierId) {
        const supplier = mockData.suppliers.find(s => s.id === data.supplierId);
        if (supplier) {
          newItem.supplier = supplier;
        }
      }

      mockData.warehouseItems.push(newItem);
      return newItem;
    },
    update: async ({ where, data }) => {
      const index = mockData.warehouseItems.findIndex(i => i.id === where.id);
      if (index === -1) throw new Error('Warehouse item not found');

      mockData.warehouseItems[index] = {
        ...mockData.warehouseItems[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      return mockData.warehouseItems[index];
    },
    delete: async ({ where }) => {
      const index = mockData.warehouseItems.findIndex(i => i.id === where.id);
      if (index === -1) throw new Error('Warehouse item not found');

      const deletedItem = mockData.warehouseItems[index];
      mockData.warehouseItems.splice(index, 1);

      return deletedItem;
    }
  },
  inventoryItem: {
    findMany: async ({ include } = {}) => {
      if (include?.product) {
        return [...mockData.inventoryItems];
      }
      return [...mockData.inventoryItems];
    },
    findUnique: async ({ where, include }) => {
      const item = mockData.inventoryItems.find(i => i.id === where.id);
      if (!item) return null;

      if (include?.product) {
        return { ...item };
      }

      return item;
    },
    findFirst: async ({ where }) => {
      const item = mockData.inventoryItems.find(i => {
        if (where.productId && where.locationId) {
          return i.productId === where.productId && i.locationId === where.locationId;
        }
        return false;
      });

      return item || null;
    },
    create: async ({ data }) => {
      const newItem = {
        id: data.id || `inv-item-${mockData.inventoryItems.length + 1}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (data.productId) {
        const product = mockData.products.find(p => p.id === data.productId);
        if (product) {
          newItem.product = product;
        }
      }

      mockData.inventoryItems.push(newItem);
      return newItem;
    },
    update: async ({ where, data }) => {
      const index = mockData.inventoryItems.findIndex(i => i.id === where.id);
      if (index === -1) throw new Error('Inventory item not found');

      mockData.inventoryItems[index] = {
        ...mockData.inventoryItems[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      return mockData.inventoryItems[index];
    },
    delete: async ({ where }) => {
      const index = mockData.inventoryItems.findIndex(i => i.id === where.id);
      if (index === -1) throw new Error('Inventory item not found');

      const deletedItem = mockData.inventoryItems[index];
      mockData.inventoryItems.splice(index, 1);

      return deletedItem;
    }
  },
  product: {
    findMany: async ({ include } = {}) => {
      if (include?.category) {
        return [...mockData.products];
      }
      return [...mockData.products];
    },
    findUnique: async ({ where, include }) => {
      const product = mockData.products.find(p => p.id === where.id);
      if (!product) return null;

      if (include?.category) {
        return { ...product };
      }

      return product;
    }
  },
  inwardEntry: {
    findMany: async ({ where } = {}) => {
      if (where?.itemId) {
        return mockData.inwardEntries.filter(e => e.itemId === where.itemId);
      }
      return [...mockData.inwardEntries];
    },
    create: async ({ data }) => {
      const newEntry = {
        id: data.id || `inward-${mockData.inwardEntries.length + 1}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockData.inwardEntries.push(newEntry);
      return newEntry;
    },
    deleteMany: async ({ where }) => {
      if (where?.itemId) {
        const count = mockData.inwardEntries.filter(e => e.itemId === where.itemId).length;
        mockData.inwardEntries = mockData.inwardEntries.filter(e => e.itemId !== where.itemId);
        return { count };
      }
      return { count: 0 };
    }
  },
  outwardEntry: {
    findMany: async ({ where } = {}) => {
      if (where?.itemId) {
        return mockData.outwardEntries.filter(e => e.itemId === where.itemId);
      }
      return [...mockData.outwardEntries];
    },
    create: async ({ data }) => {
      const newEntry = {
        id: data.id || `outward-${mockData.outwardEntries.length + 1}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockData.outwardEntries.push(newEntry);
      return newEntry;
    },
    deleteMany: async ({ where }) => {
      if (where?.itemId) {
        const count = mockData.outwardEntries.filter(e => e.itemId === where.itemId).length;
        mockData.outwardEntries = mockData.outwardEntries.filter(e => e.itemId !== where.itemId);
        return { count };
      }
      return { count: 0 };
    }
  },
  damageEntry: {
    findMany: async ({ where, include, orderBy } = {}) => {
      let entries = [...mockData.damageEntries];

      // Filter by itemId if specified
      if (where?.itemId) {
        entries = entries.filter(e => e.itemId === where.itemId);
      }

      // Sort by reportedDate if specified
      if (orderBy?.reportedDate === 'desc') {
        entries.sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate));
      }

      // Include warehouseItem if specified
      if (include?.warehouseItem) {
        return entries.map(entry => {
          const warehouseItem = mockData.warehouseItems.find(item => item.id === entry.itemId);
          return {
            ...entry,
            warehouseItem: warehouseItem || null
          };
        });
      }

      return entries;
    },
    findUnique: async ({ where, include }) => {
      const entry = mockData.damageEntries.find(e => e.id === where.id);
      if (!entry) return null;

      if (include?.warehouseItem) {
        const warehouseItem = mockData.warehouseItems.find(item => item.id === entry.itemId);
        return {
          ...entry,
          warehouseItem: warehouseItem || null
        };
      }

      return entry;
    },
    create: async ({ data, include }) => {
      const newEntry = {
        id: data.id || `damage-${mockData.damageEntries.length + 1}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockData.damageEntries.push(newEntry);

      if (include?.warehouseItem) {
        const warehouseItem = mockData.warehouseItems.find(item => item.id === data.itemId);
        return {
          ...newEntry,
          warehouseItem: warehouseItem || null
        };
      }

      return newEntry;
    },
    update: async ({ where, data, include }) => {
      const index = mockData.damageEntries.findIndex(e => e.id === where.id);
      if (index === -1) throw new Error('Damage entry not found');

      mockData.damageEntries[index] = {
        ...mockData.damageEntries[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      if (include?.warehouseItem) {
        const warehouseItem = mockData.warehouseItems.find(item => item.id === mockData.damageEntries[index].itemId);
        return {
          ...mockData.damageEntries[index],
          warehouseItem: warehouseItem || null
        };
      }

      return mockData.damageEntries[index];
    },
    deleteMany: async ({ where }) => {
      if (where?.itemId) {
        const count = mockData.damageEntries.filter(e => e.itemId === where.itemId).length;
        mockData.damageEntries = mockData.damageEntries.filter(e => e.itemId !== where.itemId);
        return { count };
      }
      return { count: 0 };
    }
  },
  closingStock: {
    findFirst: async ({ where, orderBy }) => {
      // This is a simplified implementation
      return null;
    },
    findMany: async () => {
      return [];
    },
    create: async ({ data, include }) => {
      const newStock = {
        id: data.id || `stock-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (include?.warehouseItem && data.itemId) {
        const item = mockData.warehouseItems.find(i => i.id === data.itemId);
        if (item) {
          newStock.warehouseItem = item;
        }
      }

      return newStock;
    },
    deleteMany: async ({ where }) => {
      return { count: 0 };
    }
  },
  inventoryTransfer: {
    create: async ({ data, include }) => {
      const newTransfer = {
        id: data.id || `transfer-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (include?.transferItems && data.transferItems?.create) {
        newTransfer.items = data.transferItems.create;
      }

      return newTransfer;
    }
  },
  transferItem: {
    deleteMany: async ({ where }) => {
      return { count: 0 };
    }
  },
  saleItem: {
    deleteMany: async ({ where }) => {
      return { count: 0 };
    }
  },
  auditLog: {
    findMany: async ({ include } = {}) => {
      if (include?.user) {
        return mockData.auditLogs.map(log => {
          const user = mockData.users.find(u => u.id === log.userId);
          return {
            ...log,
            user: user || null
          };
        });
      }
      return [...mockData.auditLogs];
    },
    create: async ({ data }) => {
      const newLog = {
        id: data.id || `log-${mockData.auditLogs.length + 1}`,
        ...data,
        createdAt: new Date().toISOString()
      };

      mockData.auditLogs.push(newLog);
      return newLog;
    }
  },
  purchaseOrder: {
    findMany: async ({ include } = {}) => {
      // This is a simplified implementation
      return [];
    },
    findUnique: async ({ where, include }) => {
      // This is a simplified implementation
      return null;
    },
    create: async ({ data, include }) => {
      // This is a simplified implementation
      return {
        id: `po-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },
    update: async ({ where, data, include }) => {
      // This is a simplified implementation
      return {
        id: where.id,
        ...data,
        updatedAt: new Date().toISOString()
      };
    },
    delete: async ({ where }) => {
      // This is a simplified implementation
      return { id: where.id };
    }
  },
  purchaseOrderItem: {
    deleteMany: async ({ where }) => {
      // This is a simplified implementation
      return { count: 0 };
    },
    create: async ({ data }) => {
      // This is a simplified implementation
      return {
        id: `poi-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },
  $transaction: async (callback) => {
    return await callback(mockPrisma);
  }
};

module.exports = mockPrisma;
