/**
 * Simple database client for browser environments
 * This file provides a client-side interface to the database via API calls
 */

import { get, post, put, del } from './api';

// Database client for browser
export const DBClient = {
  // Warehouse Items
  warehouse: {
    getItems: async () => {
      return await get('/api/warehouse/items');
    },
    getItemById: async (id: string | number) => {
      return await get(`/api/warehouse/items/${id}`);
    },
    createItem: async (item: any) => {
      return await post('/api/warehouse/items', item);
    },
    updateItem: async (id: string | number, item: any) => {
      return await put(`/api/warehouse/items/${id}`, item);
    },
    deleteItem: async (id: string | number) => {
      return await del(`/api/warehouse/items/${id}`);
    },
    getDamageRecords: async () => {
      return await get('/api/warehouse/damage');
    }
  },
  
  // Inventory Items
  inventory: {
    getItems: async () => {
      return await get('/api/inventory/items');
    },
    getItemById: async (id: string | number) => {
      return await get(`/api/inventory/items/${id}`);
    },
    createItem: async (item: any) => {
      return await post('/api/inventory/items', item);
    },
    updateItem: async (id: string | number, item: any) => {
      return await put(`/api/inventory/items/${id}`, item);
    },
    deleteItem: async (id: string | number) => {
      return await del(`/api/inventory/items/${id}`);
    }
  },
  
  // Suppliers
  suppliers: {
    getAll: async () => {
      return await get('/api/suppliers');
    },
    getById: async (id: string | number) => {
      return await get(`/api/suppliers/${id}`);
    },
    create: async (supplier: any) => {
      return await post('/api/suppliers', supplier);
    },
    update: async (id: string | number, supplier: any) => {
      return await put(`/api/suppliers/${id}`, supplier);
    },
    delete: async (id: string | number) => {
      return await del(`/api/suppliers/${id}`);
    }
  },
  
  // Purchase Orders
  purchaseOrders: {
    getAll: async () => {
      return await get('/api/purchase-orders');
    },
    getById: async (id: string | number) => {
      return await get(`/api/purchase-orders/${id}`);
    },
    create: async (order: any) => {
      return await post('/api/purchase-orders', order);
    },
    update: async (id: string | number, order: any) => {
      return await put(`/api/purchase-orders/${id}`, order);
    },
    delete: async (id: string | number) => {
      return await del(`/api/purchase-orders/${id}`);
    }
  },
  
  // Audit Logs
  auditLogs: {
    getAll: async () => {
      return await get('/api/audit/logs');
    },
    create: async (log: any) => {
      return await post('/api/audit/logs', log);
    },
    getByUser: async (userId: string | number) => {
      return await get(`/api/audit/logs?userId=${userId}`);
    }
  }
};

export default DBClient;
