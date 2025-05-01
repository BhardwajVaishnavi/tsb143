/**
 * Browser-compatible database client
 * This file provides a client-side interface to the database via API calls
 */

import { get, post, put, del } from './api';

// Define types for database entities
export interface WarehouseItem {
  id: string | number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStockLevel: number;
  location: string;
  lastUpdated: string;
}

export interface InventoryItem {
  id: string | number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string;
  price: number;
  currency: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string | number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  items: string[];
  status: string;
}

export interface PurchaseOrder {
  id: string | number;
  supplierId: string | number;
  supplierName: string;
  items: Array<{
    id: string | number;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
  status: string;
  orderDate: string;
  deliveryDate?: string;
  expectedDeliveryDate?: string;
}

export interface DamageReport {
  id: string | number;
  itemId: string | number;
  itemName: string;
  quantity: number;
  reason: string;
  reportedBy: string | number;
  reportedByName: string;
  status: string;
  timestamp: string;
}

export interface AuditLog {
  id: string | number;
  userId: string | number;
  action: string;
  description: string;
  entityType: string;
  entityId: string | number;
  timestamp: string;
}

export interface User {
  id: string | number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  permissions: Array<{
    module: string;
    action: string;
    resource: string;
  }>;
  createdAt: string;
  lastLogin: string;
}

// Database client for browser
export const DBClient = {
  // Warehouse Items
  warehouse: {
    getItems: async (): Promise<WarehouseItem[]> => {
      return await get('/api/warehouse/items');
    },
    getItemById: async (id: string | number): Promise<WarehouseItem> => {
      return await get(`/api/warehouse/items/${id}`);
    },
    createItem: async (item: Partial<WarehouseItem>): Promise<WarehouseItem> => {
      return await post('/api/warehouse/items', item);
    },
    updateItem: async (id: string | number, item: Partial<WarehouseItem>): Promise<WarehouseItem> => {
      return await put(`/api/warehouse/items/${id}`, item);
    },
    deleteItem: async (id: string | number): Promise<{ success: boolean }> => {
      return await del(`/api/warehouse/items/${id}`);
    },
    getDamageRecords: async (): Promise<DamageReport[]> => {
      return await get('/api/warehouse/damage');
    }
  },
  
  // Inventory Items
  inventory: {
    getItems: async (): Promise<InventoryItem[]> => {
      return await get('/api/inventory/items');
    },
    getItemById: async (id: string | number): Promise<InventoryItem> => {
      return await get(`/api/inventory/items/${id}`);
    },
    createItem: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
      return await post('/api/inventory/items', item);
    },
    updateItem: async (id: string | number, item: Partial<InventoryItem>): Promise<InventoryItem> => {
      return await put(`/api/inventory/items/${id}`, item);
    },
    deleteItem: async (id: string | number): Promise<{ success: boolean }> => {
      return await del(`/api/inventory/items/${id}`);
    }
  },
  
  // Suppliers
  suppliers: {
    getAll: async (): Promise<Supplier[]> => {
      return await get('/api/suppliers');
    },
    getById: async (id: string | number): Promise<Supplier> => {
      return await get(`/api/suppliers/${id}`);
    },
    create: async (supplier: Partial<Supplier>): Promise<Supplier> => {
      return await post('/api/suppliers', supplier);
    },
    update: async (id: string | number, supplier: Partial<Supplier>): Promise<Supplier> => {
      return await put(`/api/suppliers/${id}`, supplier);
    },
    delete: async (id: string | number): Promise<{ success: boolean }> => {
      return await del(`/api/suppliers/${id}`);
    }
  },
  
  // Purchase Orders
  purchaseOrders: {
    getAll: async (): Promise<PurchaseOrder[]> => {
      return await get('/api/purchase-orders');
    },
    getById: async (id: string | number): Promise<PurchaseOrder> => {
      return await get(`/api/purchase-orders/${id}`);
    },
    create: async (order: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
      return await post('/api/purchase-orders', order);
    },
    update: async (id: string | number, order: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
      return await put(`/api/purchase-orders/${id}`, order);
    },
    delete: async (id: string | number): Promise<{ success: boolean }> => {
      return await del(`/api/purchase-orders/${id}`);
    }
  },
  
  // Audit Logs
  auditLogs: {
    getAll: async (): Promise<AuditLog[]> => {
      return await get('/api/audit/logs');
    },
    create: async (log: Partial<AuditLog>): Promise<AuditLog> => {
      return await post('/api/audit/logs', log);
    },
    getByUser: async (userId: string | number): Promise<AuditLog[]> => {
      return await get(`/api/audit/logs?userId=${userId}`);
    }
  },
  
  // Users
  users: {
    getAll: async (): Promise<User[]> => {
      return await get('/api/users');
    },
    getById: async (id: string | number): Promise<User> => {
      return await get(`/api/users/${id}`);
    },
    create: async (user: Partial<User>): Promise<User> => {
      return await post('/api/users', user);
    },
    update: async (id: string | number, user: Partial<User>): Promise<User> => {
      return await put(`/api/users/${id}`, user);
    },
    delete: async (id: string | number): Promise<{ success: boolean }> => {
      return await del(`/api/users/${id}`);
    }
  }
};

export default DBClient;
