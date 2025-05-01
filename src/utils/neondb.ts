/**
 * NeonDB connection utility
 * This file provides functions to connect to NeonDB PostgreSQL database
 */

// Import pg-mock directly for browser environments
import * as pgMock from './pg-mock';

// Create a connection pool factory
const createPool = async () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // We're in a browser, use the mock
    return new pgMock.Pool({
      connectionString: 'mock-connection-string',
      ssl: { rejectUnauthorized: false }
    });
  } else {
    // We're in Node.js, use the real pg module
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: process.env.NEON_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

      // Test the connection
      const res = await pool.query('SELECT NOW()');
      console.log('Connected to NeonDB at:', res.rows[0].now);

      return pool;
    } catch (error) {
      console.error('Error importing pg or connecting to NeonDB:', error);
      // Fallback to mock in case of error
      return new pgMock.Pool({
        connectionString: 'fallback-mock-connection-string',
        ssl: { rejectUnauthorized: false }
      });
    }
  }
};

// Lazy-loaded pool instance
let poolPromise: Promise<any> | null = null;

// Get or create the pool
const getPool = () => {
  if (!poolPromise) {
    poolPromise = createPool();
  }
  return poolPromise;
};

// Generic query function
export const query = async (text: string, params?: any[]): Promise<any> => {
  try {
    const pool = await getPool();
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Database API functions
export const NeonDB = {
  // Warehouse Items
  warehouse: {
    getItems: async () => {
      try {
        const result = await query('SELECT * FROM warehouse_items');
        return result.rows;
      } catch (error) {
        console.error('Error fetching warehouse items:', error);
        return [];
      }
    },
    getItemById: async (id: string) => {
      try {
        const result = await query('SELECT * FROM warehouse_items WHERE id = $1', [id]);
        return result.rows[0];
      } catch (error) {
        console.error(`Error fetching warehouse item ${id}:`, error);
        return null;
      }
    },
    createItem: async (item: any) => {
      try {
        const { name, sku, category, quantity, minStockLevel, location } = item;
        const result = await query(
          'INSERT INTO warehouse_items (name, sku, category, quantity, min_stock_level, location, last_updated) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
          [name, sku, category, quantity, minStockLevel, location]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error creating warehouse item:', error);
        throw error;
      }
    },
    updateItem: async (id: string, item: any) => {
      try {
        const { name, sku, category, quantity, minStockLevel, location } = item;
        const result = await query(
          'UPDATE warehouse_items SET name = $1, sku = $2, category = $3, quantity = $4, min_stock_level = $5, location = $6, last_updated = NOW() WHERE id = $7 RETURNING *',
          [name, sku, category, quantity, minStockLevel, location, id]
        );
        return result.rows[0];
      } catch (error) {
        console.error(`Error updating warehouse item ${id}:`, error);
        throw error;
      }
    },
    deleteItem: async (id: string) => {
      try {
        await query('DELETE FROM warehouse_items WHERE id = $1', [id]);
        return { success: true };
      } catch (error) {
        console.error(`Error deleting warehouse item ${id}:`, error);
        return { success: false, error: error.message };
      }
    },
    getDamageRecords: async () => {
      try {
        const result = await query('SELECT * FROM damage_reports ORDER BY timestamp DESC');
        return result.rows;
      } catch (error) {
        console.error('Error fetching damage reports:', error);
        return [];
      }
    }
  },

  // Inventory Items
  inventory: {
    getItems: async () => {
      try {
        const result = await query('SELECT * FROM inventory_items');
        return result.rows;
      } catch (error) {
        console.error('Error fetching inventory items:', error);
        return [];
      }
    },
    getItemById: async (id: string) => {
      try {
        const result = await query('SELECT * FROM inventory_items WHERE id = $1', [id]);
        return result.rows[0];
      } catch (error) {
        console.error(`Error fetching inventory item ${id}:`, error);
        return null;
      }
    },
    createItem: async (item: any) => {
      try {
        const { name, sku, category, quantity, location, price, currency } = item;
        const result = await query(
          'INSERT INTO inventory_items (name, sku, category, quantity, location, price, currency, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
          [name, sku, category, quantity, location, price, currency]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error creating inventory item:', error);
        throw error;
      }
    },
    updateItem: async (id: string, item: any) => {
      try {
        const { name, sku, category, quantity, location, price, currency } = item;
        const result = await query(
          'UPDATE inventory_items SET name = $1, sku = $2, category = $3, quantity = $4, location = $5, price = $6, currency = $7, last_updated = NOW() WHERE id = $8 RETURNING *',
          [name, sku, category, quantity, location, price, currency, id]
        );
        return result.rows[0];
      } catch (error) {
        console.error(`Error updating inventory item ${id}:`, error);
        throw error;
      }
    },
    deleteItem: async (id: string) => {
      try {
        await query('DELETE FROM inventory_items WHERE id = $1', [id]);
        return { success: true };
      } catch (error) {
        console.error(`Error deleting inventory item ${id}:`, error);
        return { success: false, error: error.message };
      }
    }
  },

  // Suppliers
  suppliers: {
    getAll: async () => {
      try {
        const result = await query('SELECT * FROM suppliers');
        return result.rows;
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        return [];
      }
    },
    getById: async (id: string) => {
      try {
        const result = await query('SELECT * FROM suppliers WHERE id = $1', [id]);
        return result.rows[0];
      } catch (error) {
        console.error(`Error fetching supplier ${id}:`, error);
        return null;
      }
    },
    create: async (supplier: any) => {
      try {
        const { name, contactPerson, email, phone, address, items, status } = supplier;
        const result = await query(
          'INSERT INTO suppliers (name, contact_person, email, phone, address, items, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [name, contactPerson, email, phone, address, JSON.stringify(items), status]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error creating supplier:', error);
        throw error;
      }
    },
    update: async (id: string, supplier: any) => {
      try {
        const { name, contactPerson, email, phone, address, items, status } = supplier;
        const result = await query(
          'UPDATE suppliers SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, items = $6, status = $7 WHERE id = $8 RETURNING *',
          [name, contactPerson, email, phone, address, JSON.stringify(items), status, id]
        );
        return result.rows[0];
      } catch (error) {
        console.error(`Error updating supplier ${id}:`, error);
        throw error;
      }
    },
    delete: async (id: string) => {
      try {
        await query('DELETE FROM suppliers WHERE id = $1', [id]);
        return { success: true };
      } catch (error) {
        console.error(`Error deleting supplier ${id}:`, error);
        return { success: false, error: error.message };
      }
    }
  },

  // Purchase Orders
  purchaseOrders: {
    getAll: async () => {
      try {
        const result = await query('SELECT * FROM purchase_orders');
        return result.rows;
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
        return [];
      }
    },
    getById: async (id: string) => {
      try {
        const result = await query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
        return result.rows[0];
      } catch (error) {
        console.error(`Error fetching purchase order ${id}:`, error);
        return null;
      }
    },
    create: async (order: any) => {
      try {
        const { supplierId, supplierName, items, totalAmount, currency, status, orderDate } = order;
        const result = await query(
          'INSERT INTO purchase_orders (supplier_id, supplier_name, items, total_amount, currency, status, order_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [supplierId, supplierName, JSON.stringify(items), totalAmount, currency, status, orderDate]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error creating purchase order:', error);
        throw error;
      }
    },
    update: async (id: string, order: any) => {
      try {
        const { supplierId, supplierName, items, totalAmount, currency, status, orderDate, deliveryDate, expectedDeliveryDate } = order;
        const result = await query(
          'UPDATE purchase_orders SET supplier_id = $1, supplier_name = $2, items = $3, total_amount = $4, currency = $5, status = $6, order_date = $7, delivery_date = $8, expected_delivery_date = $9 WHERE id = $10 RETURNING *',
          [supplierId, supplierName, JSON.stringify(items), totalAmount, currency, status, orderDate, deliveryDate, expectedDeliveryDate, id]
        );
        return result.rows[0];
      } catch (error) {
        console.error(`Error updating purchase order ${id}:`, error);
        throw error;
      }
    },
    delete: async (id: string) => {
      try {
        await query('DELETE FROM purchase_orders WHERE id = $1', [id]);
        return { success: true };
      } catch (error) {
        console.error(`Error deleting purchase order ${id}:`, error);
        return { success: false, error: error.message };
      }
    }
  },

  // Categories
  categories: {
    getAll: async () => {
      try {
        const result = await query('SELECT * FROM categories ORDER BY name ASC');
        return result.rows;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    getById: async (id: string) => {
      try {
        const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
        return result.rows[0];
      } catch (error) {
        console.error(`Error fetching category ${id}:`, error);
        return null;
      }
    },
    create: async (category: any) => {
      try {
        const { name, description, parentId, isActive } = category;
        const result = await query(
          'INSERT INTO categories (name, description, parent_id, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
          [name, description, parentId, isActive !== false]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    },
    update: async (id: string, category: any) => {
      try {
        const { name, description, parentId, isActive } = category;
        const result = await query(
          'UPDATE categories SET name = $1, description = $2, parent_id = $3, is_active = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
          [name, description, parentId, isActive !== false, id]
        );
        return result.rows[0];
      } catch (error) {
        console.error(`Error updating category ${id}:`, error);
        throw error;
      }
    },
    delete: async (id: string) => {
      try {
        // First check if there are any child categories
        const childrenResult = await query('SELECT COUNT(*) FROM categories WHERE parent_id = $1', [id]);
        if (parseInt(childrenResult.rows[0].count) > 0) {
          return { success: false, error: 'Cannot delete category with child categories' };
        }

        // Then check if there are any products using this category
        const productsResult = await query('SELECT COUNT(*) FROM warehouse_items WHERE category = $1', [id]);
        if (parseInt(productsResult.rows[0].count) > 0) {
          return { success: false, error: 'Cannot delete category with associated products' };
        }

        // If no children or products, delete the category
        await query('DELETE FROM categories WHERE id = $1', [id]);
        return { success: true };
      } catch (error) {
        console.error(`Error deleting category ${id}:`, error);
        return { success: false, error: error.message };
      }
    },
    getProductCount: async (categoryId: string) => {
      try {
        const result = await query('SELECT COUNT(*) FROM warehouse_items WHERE category = $1', [categoryId]);
        return parseInt(result.rows[0].count);
      } catch (error) {
        console.error(`Error getting product count for category ${categoryId}:`, error);
        return 0;
      }
    }
  },

  // Audit Logs
  auditLogs: {
    getAll: async () => {
      try {
        const result = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
        return result.rows;
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }
    },
    create: async (log: any) => {
      try {
        const { userId, action, description, entityType, entityId } = log;
        const result = await query(
          'INSERT INTO audit_logs (user_id, action, description, entity_type, entity_id, timestamp) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
          [userId, action, description, entityType, entityId]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error creating audit log:', error);
        throw error;
      }
    },
    getByUser: async (userId: string) => {
      try {
        const result = await query('SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY timestamp DESC', [userId]);
        return result.rows;
      } catch (error) {
        console.error(`Error fetching audit logs for user ${userId}:`, error);
        return [];
      }
    }
  }
};

// Export the getPool function for direct use if needed
export default { getPool, query, NeonDB };
