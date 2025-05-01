/**
 * API server for development and production
 * This server provides API endpoints for the admin panel
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

// Create a connection pool to NeonDB
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL connection
  }
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to NeonDB:', err);
  } else {
    console.log('Connected to NeonDB at:', res.rows[0].now);
  }
});

const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5002 for the proxy setup

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://tsb143.vercel.app'],
  credentials: true
}));

// Log all requests with timestamp and query parameters
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  if (Object.keys(req.query).length > 0) {
    console.log('Query parameters:', req.query);
  }

  // Log response when it's sent
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`[${timestamp}] Response sent for ${req.method} ${req.url} - Status: ${res.statusCode}`);
    return originalSend.call(this, body);
  };

  next();
});
app.use(bodyParser.json());
app.use(cookieParser());

// No in-memory data stores - using database instead

// Health check route
app.get('/api/health', (req, res) => {
  // Check database connection
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('Database connection error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Database connection error',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }

    // Return success response with database timestamp
    res.status(200).json({
      status: 'ok',
      message: 'Server is running',
      database: {
        connected: true,
        timestamp: result.rows[0].now
      },
      server: {
        timestamp: new Date().toISOString(),
        port: PORT
      }
    });
  });
});

// API Routes

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('GET /api/categories - Fetching categories from database');
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    console.log('Categories query result:', result);
    console.log('Number of categories found:', result.rows.length);

    // Transform column names to camelCase for frontend compatibility
    const categories = result.rows.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
      created_by: category.created_by,
      updated_by: category.updated_by
    }));

    console.log('Sending categories to client:', categories);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories from database' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
      created_by: category.created_by,
      updated_by: category.updated_by
    };

    res.json(transformedCategory);
  } catch (error) {
    console.error(`Error fetching category ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch category from database' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, parentId, isActive } = req.body;

    const result = await pool.query(
      'INSERT INTO categories (name, description, parent_id, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, description, parentId, isActive !== false]
    );

    const category = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
      created_by: category.created_by,
      updated_by: category.updated_by
    };

    res.status(201).json(transformedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category in database' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, description, parentId, isActive } = req.body;

    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, parent_id = $3, is_active = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, description, parentId, isActive !== false, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
      created_by: category.created_by,
      updated_by: category.updated_by
    };

    res.json(transformedCategory);
  } catch (error) {
    console.error(`Error updating category ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update category in database' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    // First check if there are any child categories
    const childrenResult = await pool.query('SELECT COUNT(*) FROM categories WHERE parent_id = $1', [req.params.id]);
    if (parseInt(childrenResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete category with child categories' });
    }

    // Then check if there are any products using this category
    const productsResult = await pool.query('SELECT COUNT(*) FROM warehouse_items WHERE category = $1', [req.params.id]);
    if (parseInt(productsResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete category with associated products' });
    }

    // If no children or products, delete the category
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error(`Error deleting category ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete category from database' });
  }
});

app.get('/api/categories/:id/products/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM warehouse_items WHERE category = $1', [req.params.id]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error(`Error getting product count for category ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get product count from database' });
  }
});

// Activity Logs
app.get('/api/audit/logs', async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { userId, action, entityType, entityId, startDate, endDate, search, limit } = req.query;

    // Start building the query
    let query = 'SELECT * FROM audit_logs';
    const queryParams = [];
    const conditions = [];

    // Add filter conditions if provided
    if (userId) {
      queryParams.push(userId);
      conditions.push(`user_id = $${queryParams.length}`);
    }

    if (action) {
      queryParams.push(action);
      conditions.push(`action = $${queryParams.length}`);
    }

    if (entityType) {
      queryParams.push(entityType);
      conditions.push(`entity_type = $${queryParams.length}`);
    }

    if (entityId) {
      queryParams.push(entityId);
      conditions.push(`entity_id = $${queryParams.length}`);
    }

    if (startDate) {
      queryParams.push(startDate);
      conditions.push(`timestamp::date >= $${queryParams.length}::date`);
    }

    if (endDate) {
      queryParams.push(endDate);
      conditions.push(`timestamp::date <= $${queryParams.length}::date`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`description ILIKE $${queryParams.length}`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort by timestamp (newest first)
    query += ' ORDER BY timestamp DESC';

    // Add limit if provided
    if (limit) {
      queryParams.push(parseInt(limit));
      query += ` LIMIT $${queryParams.length}`;
    }

    console.log('Executing query:', query, queryParams);
    const result = await pool.query(query, queryParams);

    // Transform column names to camelCase for frontend compatibility
    const logs = result.rows.map(log => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      description: log.description,
      entityType: log.entity_type,
      entityId: log.entity_id,
      timestamp: log.timestamp
    }));

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs from database' });
  }
});

app.post('/api/audit/logs', async (req, res) => {
  try {
    const { userId, action, description, entityType, entityId } = req.body;
    const query = 'INSERT INTO audit_logs (user_id, action, description, entity_type, entity_id, timestamp) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *';
    const values = [userId, action, description, entityType, entityId];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log in database' });
  }
});

// Warehouse Items
app.get('/api/warehouse/items', async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { category, location, search, minQuantity, maxQuantity, lowStock } = req.query;

    // Start building the query
    let query = 'SELECT * FROM warehouse_items';
    const queryParams = [];
    const conditions = [];

    // Add filter conditions if provided
    if (category) {
      queryParams.push(category);
      conditions.push(`category = $${queryParams.length}`);
    }

    if (location) {
      queryParams.push(location);
      conditions.push(`location = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(name ILIKE $${queryParams.length} OR sku ILIKE $${queryParams.length})`);
    }

    if (minQuantity !== undefined) {
      queryParams.push(parseInt(minQuantity));
      conditions.push(`quantity >= $${queryParams.length}`);
    }

    if (maxQuantity !== undefined) {
      queryParams.push(parseInt(maxQuantity));
      conditions.push(`quantity <= $${queryParams.length}`);
    }

    if (lowStock === 'true') {
      conditions.push('quantity <= min_stock_level');
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    query += ' ORDER BY name ASC';

    console.log('Executing query:', query, queryParams);
    const result = await pool.query(query, queryParams);

    // Transform column names to camelCase for frontend compatibility
    const items = result.rows.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      minStockLevel: item.min_stock_level,
      location: item.location,
      lastUpdated: item.last_updated
    }));

    res.json(items);
  } catch (error) {
    console.error('Error fetching warehouse items:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse items from database' });
  }
});

// Get warehouse item by ID
app.get('/api/warehouse/items/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warehouse_items WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warehouse item not found' });
    }

    const item = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedItem = {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      minStockLevel: item.min_stock_level,
      location: item.location,
      lastUpdated: item.last_updated
    };

    res.json(transformedItem);
  } catch (error) {
    console.error(`Error fetching warehouse item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch warehouse item from database' });
  }
});

// Create warehouse item
app.post('/api/warehouse/items', async (req, res) => {
  try {
    const { name, sku, category, quantity, minStockLevel, location } = req.body;

    const result = await pool.query(
      'INSERT INTO warehouse_items (name, sku, category, quantity, min_stock_level, location, last_updated) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [name, sku, category, quantity, minStockLevel, location]
    );

    const item = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedItem = {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      minStockLevel: item.min_stock_level,
      location: item.location,
      lastUpdated: item.last_updated
    };

    res.status(201).json(transformedItem);
  } catch (error) {
    console.error('Error creating warehouse item:', error);
    res.status(500).json({ error: 'Failed to create warehouse item in database' });
  }
});

// Update warehouse item
app.put('/api/warehouse/items/:id', async (req, res) => {
  try {
    const { name, sku, category, quantity, minStockLevel, location } = req.body;

    const result = await pool.query(
      'UPDATE warehouse_items SET name = $1, sku = $2, category = $3, quantity = $4, min_stock_level = $5, location = $6, last_updated = NOW() WHERE id = $7 RETURNING *',
      [name, sku, category, quantity, minStockLevel, location, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warehouse item not found' });
    }

    const item = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedItem = {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      minStockLevel: item.min_stock_level,
      location: item.location,
      lastUpdated: item.last_updated
    };

    res.json(transformedItem);
  } catch (error) {
    console.error(`Error updating warehouse item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update warehouse item in database' });
  }
});

// Delete warehouse item
app.delete('/api/warehouse/items/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM warehouse_items WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warehouse item not found' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error(`Error deleting warehouse item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete warehouse item from database' });
  }
});

// Export warehouse items
app.get('/api/warehouse/export', async (req, res) => {
  try {
    const Excel = require('exceljs');
    const { type } = req.query;

    let query = '';
    let filename = '';
    let columns = [];
    let title = '';

    // Determine which data to export based on the type parameter
    switch (type) {
      case 'items':
        query = 'SELECT * FROM warehouse_items ORDER BY name ASC';
        filename = 'warehouse_items.xlsx';
        title = 'Warehouse Items';
        columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'SKU', key: 'sku', width: 15 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'Min Stock Level', key: 'min_stock_level', width: 20 },
          { header: 'Location', key: 'location', width: 20 },
          { header: 'Last Updated', key: 'last_updated', width: 25 }
        ];
        break;
      case 'damage':
        query = 'SELECT * FROM damage_reports ORDER BY timestamp DESC';
        filename = 'damage_reports.xlsx';
        title = 'Damage Reports';
        columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Item ID', key: 'item_id', width: 15 },
          { header: 'Item Name', key: 'item_name', width: 30 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'Reason', key: 'reason', width: 40 },
          { header: 'Reported By', key: 'reported_by_name', width: 25 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];
        break;
      case 'inward':
        query = 'SELECT * FROM inward_records ORDER BY timestamp DESC';
        filename = 'inward_records.xlsx';
        title = 'Inward Records';
        columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Item ID', key: 'item_id', width: 15 },
          { header: 'Item Name', key: 'item_name', width: 30 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'Supplier', key: 'supplier_name', width: 30 },
          { header: 'Received By', key: 'received_by_name', width: 25 },
          { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];
        break;
      case 'outward':
        query = 'SELECT * FROM outward_records ORDER BY timestamp DESC';
        filename = 'outward_records.xlsx';
        title = 'Outward Records';
        columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Item ID', key: 'item_id', width: 15 },
          { header: 'Item Name', key: 'item_name', width: 30 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'Destination', key: 'destination', width: 30 },
          { header: 'Issued By', key: 'issued_by_name', width: 25 },
          { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    console.log('Executing export query:', query);
    const result = await pool.query(query);

    // Create a new Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Add columns to the worksheet
    worksheet.columns = columns;

    // Add a title row with merged cells
    const lastColumn = String.fromCharCode(65 + columns.length - 1); // Convert column count to letter (A, B, C, etc.)
    worksheet.mergeCells(`A1:${lastColumn}1`);
    const titleRow = worksheet.getCell('A1');
    titleRow.value = title;
    titleRow.font = {
      size: 16,
      bold: true
    };
    titleRow.alignment = { horizontal: 'center' };

    // Add a timestamp row
    worksheet.mergeCells(`A2:${lastColumn}2`);
    const timestampRow = worksheet.getCell('A2');
    timestampRow.value = `Generated on: ${new Date().toLocaleString()}`;
    timestampRow.font = {
      italic: true
    };
    timestampRow.alignment = { horizontal: 'center' };

    // Add a blank row
    worksheet.addRow([]);

    // Add the header row
    const headerRow = worksheet.addRow(columns.map(col => col.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Light gray background
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    result.rows.forEach(row => {
      const dataRow = {};
      columns.forEach(col => {
        // Format dates if needed
        if (col.key === 'timestamp' || col.key === 'last_updated') {
          dataRow[col.key] = row[col.key] ? new Date(row[col.key]).toLocaleString() : '';
        } else if (typeof row[col.key] === 'object' && row[col.key] !== null) {
          // Handle JSON objects
          dataRow[col.key] = JSON.stringify(row[col.key]);
        } else {
          dataRow[col.key] = row[col.key];
        }
      });
      worksheet.addRow(dataRow);
    });

    // Apply borders to all data cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 4) { // Skip title, timestamp, and header rows
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    // Set response headers for Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();

    console.log(`Excel export completed: ${filename}`);
  } catch (error) {
    console.error('Error exporting warehouse data:', error);
    res.status(500).json({ error: 'Failed to export warehouse data from database' });
  }
});

// Warehouse Damage Reports
app.get('/api/warehouse/damage', async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { status, itemId, reportedBy, startDate, endDate, search } = req.query;

    // Start building the query
    let query = 'SELECT * FROM damage_reports';
    const queryParams = [];
    const conditions = [];

    // Add filter conditions if provided
    if (status) {
      queryParams.push(status);
      conditions.push(`status = $${queryParams.length}`);
    }

    if (itemId) {
      queryParams.push(itemId);
      conditions.push(`item_id = $${queryParams.length}`);
    }

    if (reportedBy) {
      queryParams.push(reportedBy);
      conditions.push(`reported_by = $${queryParams.length}`);
    }

    if (startDate) {
      queryParams.push(startDate);
      conditions.push(`timestamp::date >= $${queryParams.length}::date`);
    }

    if (endDate) {
      queryParams.push(endDate);
      conditions.push(`timestamp::date <= $${queryParams.length}::date`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(item_name ILIKE $${queryParams.length} OR reason ILIKE $${queryParams.length})`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    query += ' ORDER BY timestamp DESC';

    console.log('Executing query:', query, queryParams);
    const result = await pool.query(query, queryParams);

    // Transform column names to camelCase for frontend compatibility
    const reports = result.rows.map(report => ({
      id: report.id,
      itemId: report.item_id,
      itemName: report.item_name,
      quantity: report.quantity,
      reason: report.reason,
      reportedBy: report.reported_by,
      reportedByName: report.reported_by_name,
      status: report.status,
      timestamp: report.timestamp
    }));

    res.json(reports);
  } catch (error) {
    console.error('Error fetching damage reports:', error);
    res.status(500).json({ error: 'Failed to fetch damage reports from database' });
  }
});

// Create damage report
app.post('/api/warehouse/damage', async (req, res) => {
  try {
    const { itemId, itemName, quantity, reason, reportedBy, reportedByName } = req.body;

    const result = await pool.query(
      'INSERT INTO damage_reports (item_id, item_name, quantity, reason, reported_by, reported_by_name, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [itemId, itemName, quantity, reason, reportedBy, reportedByName, 'pending']
    );

    const report = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedReport = {
      id: report.id,
      itemId: report.item_id,
      itemName: report.item_name,
      quantity: report.quantity,
      reason: report.reason,
      reportedBy: report.reported_by,
      reportedByName: report.reported_by_name,
      status: report.status,
      timestamp: report.timestamp
    };

    res.status(201).json(transformedReport);
  } catch (error) {
    console.error('Error creating damage report:', error);
    res.status(500).json({ error: 'Failed to create damage report in database' });
  }
});

// Update damage report status
app.put('/api/warehouse/damage/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE damage_reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Damage report not found' });
    }

    const report = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedReport = {
      id: report.id,
      itemId: report.item_id,
      itemName: report.item_name,
      quantity: report.quantity,
      reason: report.reason,
      reportedBy: report.reported_by,
      reportedByName: report.reported_by_name,
      status: report.status,
      timestamp: report.timestamp
    };

    res.json(transformedReport);
  } catch (error) {
    console.error(`Error updating damage report ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update damage report in database' });
  }
});

// Inventory Items
app.get('/api/inventory/items', async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { category, location, search, minPrice, maxPrice, minQuantity, maxQuantity } = req.query;

    // Start building the query
    let query = 'SELECT * FROM inventory_items';
    const queryParams = [];
    const conditions = [];

    // Add filter conditions if provided
    if (category) {
      queryParams.push(category);
      conditions.push(`category = $${queryParams.length}`);
    }

    if (location) {
      queryParams.push(location);
      conditions.push(`location = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(name ILIKE $${queryParams.length} OR sku ILIKE $${queryParams.length})`);
    }

    if (minPrice !== undefined) {
      queryParams.push(parseFloat(minPrice));
      conditions.push(`price >= $${queryParams.length}`);
    }

    if (maxPrice !== undefined) {
      queryParams.push(parseFloat(maxPrice));
      conditions.push(`price <= $${queryParams.length}`);
    }

    if (minQuantity !== undefined) {
      queryParams.push(parseInt(minQuantity));
      conditions.push(`quantity >= $${queryParams.length}`);
    }

    if (maxQuantity !== undefined) {
      queryParams.push(parseInt(maxQuantity));
      conditions.push(`quantity <= $${queryParams.length}`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    query += ' ORDER BY name ASC';

    console.log('Executing query:', query, queryParams);
    const result = await pool.query(query, queryParams);

    // Transform column names to camelCase for frontend compatibility
    const items = result.rows.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      price: item.price,
      currency: item.currency,
      lastUpdated: item.last_updated
    }));

    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items from database' });
  }
});

// Get inventory item by ID
app.get('/api/inventory/items/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory_items WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const item = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedItem = {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      price: item.price,
      currency: item.currency,
      lastUpdated: item.last_updated
    };

    res.json(transformedItem);
  } catch (error) {
    console.error(`Error fetching inventory item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch inventory item from database' });
  }
});

// Create inventory item
app.post('/api/inventory/items', async (req, res) => {
  try {
    const { name, sku, category, quantity, location, price, currency } = req.body;

    const result = await pool.query(
      'INSERT INTO inventory_items (name, sku, category, quantity, location, price, currency, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [name, sku, category, quantity, location, price, currency]
    );

    const item = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedItem = {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      price: item.price,
      currency: item.currency,
      lastUpdated: item.last_updated
    };

    res.status(201).json(transformedItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item in database' });
  }
});

// Update inventory item
app.put('/api/inventory/items/:id', async (req, res) => {
  try {
    const { name, sku, category, quantity, location, price, currency } = req.body;

    const result = await pool.query(
      'UPDATE inventory_items SET name = $1, sku = $2, category = $3, quantity = $4, location = $5, price = $6, currency = $7, last_updated = NOW() WHERE id = $8 RETURNING *',
      [name, sku, category, quantity, location, price, currency, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const item = result.rows[0];

    // Transform column names to camelCase for frontend compatibility
    const transformedItem = {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      price: item.price,
      currency: item.currency,
      lastUpdated: item.last_updated
    };

    res.json(transformedItem);
  } catch (error) {
    console.error(`Error updating inventory item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update inventory item in database' });
  }
});

// Delete inventory item
app.delete('/api/inventory/items/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error(`Error deleting inventory item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete inventory item from database' });
  }
});

// Export inventory items
app.get('/api/inventory/export', async (req, res) => {
  try {
    const Excel = require('exceljs');
    const { type } = req.query;

    let query = '';
    let filename = '';
    let columns = [];
    let title = '';

    // Determine which data to export based on the type parameter
    switch (type) {
      case 'items':
        query = 'SELECT * FROM inventory_items ORDER BY name ASC';
        filename = 'inventory_items.xlsx';
        title = 'Inventory Items';
        columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'SKU', key: 'sku', width: 15 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'Location', key: 'location', width: 20 },
          { header: 'Price', key: 'price', width: 15 },
          { header: 'Currency', key: 'currency', width: 10 },
          { header: 'Last Updated', key: 'last_updated', width: 25 }
        ];
        break;
      case 'inward':
        query = 'SELECT * FROM inventory_inward ORDER BY timestamp DESC';
        filename = 'inventory_inward.xlsx';
        title = 'Inventory Inward Records';
        columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Item ID', key: 'item_id', width: 15 },
          { header: 'Item Name', key: 'item_name', width: 30 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'Source', key: 'source', width: 30 },
          { header: 'Received By', key: 'received_by_name', width: 25 },
          { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];
        break;
      case 'outward':
        query = 'SELECT * FROM inventory_outward ORDER BY timestamp DESC';
        filename = 'inventory_outward.xlsx';
        title = 'Inventory Outward Records';
        columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Item ID', key: 'item_id', width: 15 },
          { header: 'Item Name', key: 'item_name', width: 30 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'Destination', key: 'destination', width: 30 },
          { header: 'Issued By', key: 'issued_by_name', width: 25 },
          { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];
        break;
      case 'transfers':
        query = 'SELECT * FROM inventory_transfers ORDER BY timestamp DESC';
        filename = 'inventory_transfers.xlsx';
        title = 'Inventory Transfers';
        columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Item ID', key: 'item_id', width: 15 },
          { header: 'Item Name', key: 'item_name', width: 30 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'From Location', key: 'from_location', width: 25 },
          { header: 'To Location', key: 'to_location', width: 25 },
          { header: 'Transferred By', key: 'transferred_by_name', width: 25 },
          { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    console.log('Executing export query:', query);

    // Create a new Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Add columns to the worksheet
    worksheet.columns = columns;

    // Add a title row with merged cells
    const lastColumn = String.fromCharCode(65 + columns.length - 1); // Convert column count to letter (A, B, C, etc.)
    worksheet.mergeCells(`A1:${lastColumn}1`);
    const titleRow = worksheet.getCell('A1');
    titleRow.value = title;
    titleRow.font = {
      size: 16,
      bold: true
    };
    titleRow.alignment = { horizontal: 'center' };

    // Add a timestamp row
    worksheet.mergeCells(`A2:${lastColumn}2`);
    const timestampRow = worksheet.getCell('A2');
    timestampRow.value = `Generated on: ${new Date().toLocaleString()}`;
    timestampRow.font = {
      italic: true
    };
    timestampRow.alignment = { horizontal: 'center' };

    // Add a blank row
    worksheet.addRow([]);

    // Add the header row
    const headerRow = worksheet.addRow(columns.map(col => col.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Light gray background
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // For tables that might not exist yet, handle the error gracefully
    try {
      const result = await pool.query(query);

      // Add data rows
      result.rows.forEach(row => {
        const dataRow = {};
        columns.forEach(col => {
          // Format dates if needed
          if (col.key === 'timestamp' || col.key === 'last_updated') {
            dataRow[col.key] = row[col.key] ? new Date(row[col.key]).toLocaleString() : '';
          } else if (typeof row[col.key] === 'object' && row[col.key] !== null) {
            // Handle JSON objects
            dataRow[col.key] = JSON.stringify(row[col.key]);
          } else {
            dataRow[col.key] = row[col.key];
          }
        });
        worksheet.addRow(dataRow);
      });

      // Apply borders to all data cells
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 4) { // Skip title, timestamp, and header rows
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });
    } catch (queryError) {
      console.error('Error executing export query:', queryError);

      // If the table doesn't exist, add a message row
      if (queryError.code === '42P01') { // undefined_table
        const messageRow = worksheet.addRow(['No data available']);
        worksheet.mergeCells(`A5:${lastColumn}5`);
        const messageCell = worksheet.getCell('A5');
        messageCell.alignment = { horizontal: 'center' };
        messageCell.font = { italic: true };
      } else {
        throw queryError; // Re-throw for the outer catch block
      }
    }

    // Set response headers for Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();

    console.log(`Excel export completed: ${filename}`);
  } catch (error) {
    console.error('Error exporting inventory data:', error);
    res.status(500).json({ error: 'Failed to export inventory data from database' });
  }
});

// Suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { status, search, item } = req.query;

    // Start building the query
    let query = 'SELECT * FROM suppliers';
    const queryParams = [];
    const conditions = [];

    // Add filter conditions if provided
    if (status) {
      queryParams.push(status);
      conditions.push(`status = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(name ILIKE $${queryParams.length} OR contact_person ILIKE $${queryParams.length} OR email ILIKE $${queryParams.length})`);
    }

    if (item) {
      queryParams.push(`%"${item}"%`);
      conditions.push(`items::text ILIKE $${queryParams.length}`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    query += ' ORDER BY name ASC';

    console.log('Executing query:', query, queryParams);
    const result = await pool.query(query, queryParams);

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const suppliers = result.rows.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      items: typeof supplier.items === 'string' ? JSON.parse(supplier.items) : supplier.items,
      status: supplier.status
    }));

    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers from database' });
  }
});

// Get supplier by ID
app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplier = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedSupplier = {
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      items: typeof supplier.items === 'string' ? JSON.parse(supplier.items) : supplier.items,
      status: supplier.status
    };

    res.json(transformedSupplier);
  } catch (error) {
    console.error(`Error fetching supplier ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch supplier from database' });
  }
});

// Create supplier
app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, items, status } = req.body;

    const result = await pool.query(
      'INSERT INTO suppliers (name, contact_person, email, phone, address, items, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, contactPerson, email, phone, address, JSON.stringify(items), status]
    );

    const supplier = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedSupplier = {
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      items: typeof supplier.items === 'string' ? JSON.parse(supplier.items) : supplier.items,
      status: supplier.status
    };

    res.status(201).json(transformedSupplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier in database' });
  }
});

// Update supplier
app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, items, status } = req.body;

    const result = await pool.query(
      'UPDATE suppliers SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, items = $6, status = $7 WHERE id = $8 RETURNING *',
      [name, contactPerson, email, phone, address, JSON.stringify(items), status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplier = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedSupplier = {
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      items: typeof supplier.items === 'string' ? JSON.parse(supplier.items) : supplier.items,
      status: supplier.status
    };

    res.json(transformedSupplier);
  } catch (error) {
    console.error(`Error updating supplier ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update supplier in database' });
  }
});

// Delete supplier
app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error(`Error deleting supplier ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete supplier from database' });
  }
});

// Purchase Orders
app.get('/api/purchase-orders', async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { status, supplierId, startDate, endDate, search, minAmount, maxAmount } = req.query;

    // Start building the query
    let query = 'SELECT * FROM purchase_orders';
    const queryParams = [];
    const conditions = [];

    // Add filter conditions if provided
    if (status) {
      queryParams.push(status);
      conditions.push(`status = $${queryParams.length}`);
    }

    if (supplierId) {
      queryParams.push(supplierId);
      conditions.push(`supplier_id = $${queryParams.length}`);
    }

    if (startDate) {
      queryParams.push(startDate);
      conditions.push(`order_date >= $${queryParams.length}`);
    }

    if (endDate) {
      queryParams.push(endDate);
      conditions.push(`order_date <= $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`supplier_name ILIKE $${queryParams.length}`);
    }

    if (minAmount !== undefined) {
      queryParams.push(parseFloat(minAmount));
      conditions.push(`total_amount >= $${queryParams.length}`);
    }

    if (maxAmount !== undefined) {
      queryParams.push(parseFloat(maxAmount));
      conditions.push(`total_amount <= $${queryParams.length}`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    query += ' ORDER BY order_date DESC';

    console.log('Executing query:', query, queryParams);
    const result = await pool.query(query, queryParams);

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const purchaseOrders = result.rows.map(order => ({
      id: order.id,
      supplierId: order.supplier_id,
      supplierName: order.supplier_name,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      totalAmount: order.total_amount,
      currency: order.currency,
      status: order.status,
      orderDate: order.order_date,
      deliveryDate: order.delivery_date,
      expectedDeliveryDate: order.expected_delivery_date,
      createdAt: order.created_at
    }));

    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders from database' });
  }
});

// Get purchase order by ID
app.get('/api/purchase-orders/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const order = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedOrder = {
      id: order.id,
      supplierId: order.supplier_id,
      supplierName: order.supplier_name,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      totalAmount: order.total_amount,
      currency: order.currency,
      status: order.status,
      orderDate: order.order_date,
      deliveryDate: order.delivery_date,
      expectedDeliveryDate: order.expected_delivery_date,
      createdAt: order.created_at
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error(`Error fetching purchase order ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch purchase order from database' });
  }
});

// Create purchase order
app.post('/api/purchase-orders', async (req, res) => {
  try {
    const { supplierId, supplierName, items, totalAmount, currency, status, orderDate, deliveryDate, expectedDeliveryDate } = req.body;

    const result = await pool.query(
      'INSERT INTO purchase_orders (supplier_id, supplier_name, items, total_amount, currency, status, order_date, delivery_date, expected_delivery_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *',
      [supplierId, supplierName, JSON.stringify(items), totalAmount, currency, status, orderDate, deliveryDate, expectedDeliveryDate]
    );

    const order = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedOrder = {
      id: order.id,
      supplierId: order.supplier_id,
      supplierName: order.supplier_name,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      totalAmount: order.total_amount,
      currency: order.currency,
      status: order.status,
      orderDate: order.order_date,
      deliveryDate: order.delivery_date,
      expectedDeliveryDate: order.expected_delivery_date,
      createdAt: order.created_at
    };

    res.status(201).json(transformedOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order in database' });
  }
});

// Update purchase order
app.put('/api/purchase-orders/:id', async (req, res) => {
  try {
    const { supplierId, supplierName, items, totalAmount, currency, status, orderDate, deliveryDate, expectedDeliveryDate } = req.body;

    const result = await pool.query(
      'UPDATE purchase_orders SET supplier_id = $1, supplier_name = $2, items = $3, total_amount = $4, currency = $5, status = $6, order_date = $7, delivery_date = $8, expected_delivery_date = $9 WHERE id = $10 RETURNING *',
      [supplierId, supplierName, JSON.stringify(items), totalAmount, currency, status, orderDate, deliveryDate, expectedDeliveryDate, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const order = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedOrder = {
      id: order.id,
      supplierId: order.supplier_id,
      supplierName: order.supplier_name,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      totalAmount: order.total_amount,
      currency: order.currency,
      status: order.status,
      orderDate: order.order_date,
      deliveryDate: order.delivery_date,
      expectedDeliveryDate: order.expected_delivery_date,
      createdAt: order.created_at
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error(`Error updating purchase order ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update purchase order in database' });
  }
});

// Delete purchase order
app.delete('/api/purchase-orders/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM purchase_orders WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error(`Error deleting purchase order ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete purchase order from database' });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // In a real app, you'd verify the password hash
    // For now, we'll accept 'admin123' or 'password123' for any user
    if (password === 'admin123' || password === 'password123') {
      // Update last login time
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

      // Create a simple token
      const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // Transform column names to camelCase and parse JSON for frontend compatibility
      const transformedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
        permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
        createdAt: user.created_at,
        lastLogin: user.last_login
      };

      // Return user data and token
      res.json({
        user: transformedUser,
        token
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to process login request' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    // In a real app, you'd verify the token from Authorization header
    // For this demo, we'll just return the first admin user
    const result = await pool.query("SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1");

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };

    res.json(transformedUser);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // In a real app, you'd invalidate the token
  // For this demo, we'll just return success
  res.json({ success: true });
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const users = result.rows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
      createdAt: user.created_at,
      lastLogin: user.last_login
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };

    res.json(transformedUser);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch user from database' });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, fullName, role, status, permissions } = req.body;

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name, role, status, permissions, created_at, last_login) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
      [username, email, '$2a$10$JwXdIRkVPyZrTK1.Zq1ZT.qJLZYhK.fHFZc5HGMd9q1gUsgzH2wPu', fullName, role, status, JSON.stringify(permissions)]
    );

    const user = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };

    res.status(201).json(transformedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user in database' });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { username, email, fullName, role, status, permissions } = req.body;

    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, full_name = $3, role = $4, status = $5, permissions = $6 WHERE id = $7 RETURNING *',
      [username, email, fullName, role, status, JSON.stringify(permissions), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Transform column names to camelCase and parse JSON for frontend compatibility
    const transformedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };

    res.json(transformedUser);
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update user in database' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete user from database' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
