/**
 * Test script to check if the database is working
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

async function testDatabase() {
  try {
    console.log('Connecting to NeonDB...');
    
    // Test the connection
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('Connected to NeonDB at:', connectionTest.rows[0].now);
    
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Get warehouse items
    console.log('\nWarehouse items:');
    const warehouseItems = await pool.query('SELECT * FROM warehouse_items');
    warehouseItems.rows.forEach(item => {
      console.log(`- ${item.name} (${item.sku}): ${item.quantity} in ${item.location}`);
    });
    
    // Get inventory items
    console.log('\nInventory items:');
    const inventoryItems = await pool.query('SELECT * FROM inventory_items');
    inventoryItems.rows.forEach(item => {
      console.log(`- ${item.name} (${item.sku}): ${item.quantity} in ${item.location}, ${item.price} ${item.currency}`);
    });
    
    // Get suppliers
    console.log('\nSuppliers:');
    const suppliers = await pool.query('SELECT * FROM suppliers');
    suppliers.rows.forEach(supplier => {
      console.log(`- ${supplier.name} (${supplier.contact_person}): ${supplier.email}, ${supplier.phone}`);
    });
    
    // Get purchase orders
    console.log('\nPurchase orders:');
    const purchaseOrders = await pool.query('SELECT * FROM purchase_orders');
    purchaseOrders.rows.forEach(order => {
      console.log(`- Order for ${order.supplier_name}: ${order.total_amount} ${order.currency}, status: ${order.status}`);
    });
    
    // Get damage reports
    console.log('\nDamage reports:');
    const damageReports = await pool.query('SELECT * FROM damage_reports');
    damageReports.rows.forEach(report => {
      console.log(`- ${report.item_name}: ${report.quantity} damaged, reason: ${report.reason}, status: ${report.status}`);
    });
    
    // Get audit logs
    console.log('\nAudit logs:');
    const auditLogs = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 5');
    auditLogs.rows.forEach(log => {
      console.log(`- ${log.action}: ${log.description}, by user ${log.user_id} at ${log.timestamp}`);
    });
    
    // Get users
    console.log('\nUsers:');
    const users = await pool.query('SELECT * FROM users');
    users.rows.forEach(user => {
      console.log(`- ${user.username} (${user.email}): ${user.role}, status: ${user.status}`);
    });
    
  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    // Close the pool
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the test
testDatabase();
