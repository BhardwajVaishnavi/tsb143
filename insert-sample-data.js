/**
 * Script to insert sample data into the database
 */

require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool to NeonDB
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL connection
  }
});

async function insertSampleData() {
  try {
    console.log('Connecting to NeonDB...');

    // Test the connection
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('Connected to NeonDB at:', connectionTest.rows[0].now);

    // Insert sample users first (to satisfy foreign key constraints)
    console.log('Inserting sample users...');
    await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, status, permissions, created_at, last_login)
      VALUES
        ('admin', 'admin@example.com', '$2a$10$JwXdIRkVPyZrTK1.Zq1ZT.qJLZYhK.fHFZc5HGMd9q1gUsgzH2wPu', 'Admin User', 'ADMIN', 'active', '[{"module": "*", "action": "*", "resource": "*"}]', NOW(), NOW()),
        ('warehouse_manager', 'warehouse@example.com', '$2a$10$JwXdIRkVPyZrTK1.Zq1ZT.qJLZYhK.fHFZc5HGMd9q1gUsgzH2wPu', 'Warehouse Manager', 'WAREHOUSE_MANAGER', 'active', '[{"module": "warehouse", "action": "*", "resource": "*"}, {"module": "inventory", "action": "view", "resource": "*"}]', NOW(), NOW() - INTERVAL '1 day')
      ON CONFLICT DO NOTHING
    `);

    // Get the user IDs for foreign key references
    const userResult = await pool.query('SELECT id FROM users LIMIT 2');
    const adminId = userResult.rows[0]?.id || 1;
    const managerId = userResult.rows[1]?.id || 2;

    console.log(`Using admin ID: ${adminId}, manager ID: ${managerId}`);

    // Insert sample purchase orders
    console.log('Inserting sample purchase orders...');
    await pool.query(`
      INSERT INTO purchase_orders (supplier_id, supplier_name, items, total_amount, currency, status, order_date, delivery_date, expected_delivery_date, created_at)
      VALUES
        (1, 'Tech Solutions Inc.', '[{"id": "item-1", "name": "Laptop", "quantity": 10, "price": 65000}]', 650000, 'INR', 'delivered', NOW() - INTERVAL '7 days', NOW(), NULL, NOW()),
        (2, 'Office Furniture Ltd.', '[{"id": "item-2", "name": "Office Chair", "quantity": 5, "price": 7500}, {"id": "item-3", "name": "Desk", "quantity": 3, "price": 10000}]', 67500, 'INR', 'pending', NOW(), NULL, NOW() + INTERVAL '5 days', NOW())
      ON CONFLICT DO NOTHING
    `);

    // Insert sample damage reports
    console.log('Inserting sample damage reports...');
    await pool.query(`
      INSERT INTO damage_reports (item_id, item_name, quantity, reason, reported_by, reported_by_name, status, timestamp)
      VALUES
        (1, 'Laptop', 2, 'Water damage', ${managerId}, 'Warehouse Manager', 'pending', NOW()),
        (2, 'Office Chair', 1, 'Broken parts', ${managerId}, 'Warehouse Manager', 'pending', NOW() - INTERVAL '1 day')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample audit logs
    console.log('Inserting sample audit logs...');
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, description, entity_type, entity_id, timestamp)
      VALUES
        (${adminId}, 'login', 'User logged in', 'user', '${adminId}', NOW() - INTERVAL '2 hours'),
        (${adminId}, 'warehouse_inward', 'Added 5 item(s) to warehouse from Supplier 1', 'warehouse', 'inward-123', NOW() - INTERVAL '1 hour'),
        (${managerId}, 'warehouse_outward', 'Transferred 3 item(s) from warehouse to Retail Inventory', 'warehouse', 'outward-456', NOW() - INTERVAL '30 minutes')
      ON CONFLICT DO NOTHING
    `);

    console.log('Sample data inserted successfully!');

    // Check row counts
    const tables = ['warehouse_items', 'inventory_items', 'suppliers', 'purchase_orders', 'damage_reports', 'audit_logs', 'users'];
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table}: ${result.rows[0].count} rows`);
    }

  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the function
insertSampleData();
