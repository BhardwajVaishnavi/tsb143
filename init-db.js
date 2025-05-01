/**
 * Database initialization script
 * This script creates the necessary tables and inserts sample data
 */

require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

// Create a connection pool to NeonDB
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL connection
  }
});

async function initializeDatabase() {
  try {
    console.log('Connecting to NeonDB...');

    // Test the connection
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('Connected to NeonDB at:', connectionTest.rows[0].now);

    // Check if tables already exist
    const tablesExist = await pool.query(`
      SELECT COUNT(*) FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'warehouse_items'
    `);

    if (parseInt(tablesExist.rows[0].count) > 0) {
      console.log('Tables already exist. Checking data...');

      // Check if there's data in the warehouse_items table
      const hasData = await pool.query('SELECT COUNT(*) FROM warehouse_items');

      if (parseInt(hasData.rows[0].count) > 0) {
        console.log('Database already contains some data. Checking for missing data...');

        // Check each table for data
        const tables = ['purchase_orders', 'damage_reports', 'audit_logs', 'users'];
        for (const table of tables) {
          try {
            const tableData = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            if (parseInt(tableData.rows[0].count) === 0) {
              console.log(`Table ${table} is empty. Inserting sample data...`);

              // Extract and run only the INSERT statements for this table
              const schemaSQL = fs.readFileSync('./database-schema.sql', 'utf8');
              const statements = schemaSQL.split(';');

              // Find INSERT statements for this table
              for (const statement of statements) {
                const trimmed = statement.trim();
                if (trimmed.startsWith('INSERT') && trimmed.includes(`INTO ${table}`)) {
                  console.log(`Executing: ${trimmed.substring(0, 50)}...`);
                  try {
                    await pool.query(trimmed);
                    console.log(`Successfully inserted data into ${table}`);
                  } catch (insertError) {
                    console.error(`Error inserting data into ${table}:`, insertError.message);
                  }
                }
              }
            } else {
              console.log(`Table ${table} already has ${tableData.rows[0].count} rows.`);
            }
          } catch (error) {
            console.error(`Error checking or inserting data for ${table}:`, error.message);
          }
        }
      } else {
        console.log('Tables exist but no data found. Inserting all sample data...');
        // Extract and run only the INSERT statements
        const schemaSQL = fs.readFileSync('./database-schema.sql', 'utf8');
        const insertStatements = schemaSQL.split(';')
          .filter(statement => statement.trim().startsWith('INSERT'))
          .join(';');

        if (insertStatements) {
          await pool.query(insertStatements);
          console.log('Sample data inserted successfully.');
        }
      }
    } else {
      console.log('Tables do not exist. Creating schema...');
      const schemaSQL = fs.readFileSync('./database-schema.sql', 'utf8');

      console.log('Executing schema...');
      await pool.query(schemaSQL);
      console.log('Schema created successfully.');
    }

    console.log('Database initialized successfully!');

    // Define the tables we expect to have created
    const expectedTables = [
      'warehouse_items',
      'inventory_items',
      'suppliers',
      'purchase_orders',
      'damage_reports',
      'audit_logs',
      'users',
      'inward_records',
      'outward_records'
    ];

    console.log('Checking created tables:');

    // Count rows in each of our expected tables
    for (const tableName of expectedTables) {
      try {
        const count = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log(`${tableName}: ${count.rows[0].count} rows`);
      } catch (error) {
        console.log(`${tableName}: Table not found or error counting rows`);
      }
    }

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the pool
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the initialization
initializeDatabase();
