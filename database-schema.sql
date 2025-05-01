-- Database schema for Tawania Warehouse Management System

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  permissions JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Warehouse items table
CREATE TABLE IF NOT EXISTS warehouse_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  location VARCHAR(100),
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  location VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  items JSONB, -- Array of items supplied
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id),
  supplier_name VARCHAR(100) NOT NULL,
  items JSONB NOT NULL, -- Array of items with quantities and prices
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  order_date TIMESTAMP NOT NULL,
  delivery_date TIMESTAMP,
  expected_delivery_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Damage reports table
CREATE TABLE IF NOT EXISTS damage_reports (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES warehouse_items(id),
  item_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reported_by INTEGER REFERENCES users(id),
  reported_by_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50),
  entity_id VARCHAR(50),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inward records table
CREATE TABLE IF NOT EXISTS inward_records (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id),
  items JSONB NOT NULL, -- Array of items with quantities
  received_by INTEGER REFERENCES users(id),
  received_by_name VARCHAR(100) NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Outward records table
CREATE TABLE IF NOT EXISTS outward_records (
  id SERIAL PRIMARY KEY,
  destination VARCHAR(100) NOT NULL, -- Inventory location
  items JSONB NOT NULL, -- Array of items with quantities
  transferred_by INTEGER REFERENCES users(id),
  transferred_by_name VARCHAR(100) NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sample data for testing
INSERT INTO warehouse_items (name, sku, category, quantity, min_stock_level, location)
VALUES
  ('Laptop', 'LAP-001', 'Electronics', 25, 10, 'Rack A-1'),
  ('Office Chair', 'FUR-001', 'Furniture', 15, 5, 'Rack B-2'),
  ('Desk', 'FUR-002', 'Furniture', 8, 3, 'Rack B-3');

INSERT INTO inventory_items (name, sku, category, quantity, location, price, currency)
VALUES
  ('Laptop', 'LAP-001', 'Electronics', 10, 'Store 1', 75000, 'INR'),
  ('Office Chair', 'FUR-001', 'Furniture', 5, 'Store 1', 8500, 'INR'),
  ('Desk', 'FUR-002', 'Furniture', 3, 'Store 2', 12000, 'INR');

INSERT INTO suppliers (name, contact_person, email, phone, address, items, status)
VALUES
  ('Tech Solutions Inc.', 'John Smith', 'john@techsolutions.com', '+91 9876543210', '123 Tech Park, Bangalore', '["Laptop", "Monitor", "Keyboard"]', 'active'),
  ('Office Furniture Ltd.', 'Jane Doe', 'jane@officefurniture.com', '+91 9876543211', '456 Industrial Area, Delhi', '["Office Chair", "Desk", "Cabinet"]', 'active'),
  ('Stationery Supplies Co.', 'Mike Johnson', 'mike@stationery.com', '+91 9876543212', '789 Business Park, Mumbai', '["Notebooks", "Pens", "Paper"]', 'inactive');

-- Insert sample purchase orders
INSERT INTO purchase_orders (supplier_id, supplier_name, items, total_amount, currency, status, order_date, delivery_date, expected_delivery_date, created_at)
VALUES
  (1, 'Tech Solutions Inc.', '[{"id": "item-1", "name": "Laptop", "quantity": 10, "price": 65000}]', 650000, 'INR', 'delivered', NOW() - INTERVAL '7 days', NOW(), NULL, NOW()),
  (2, 'Office Furniture Ltd.', '[{"id": "item-2", "name": "Office Chair", "quantity": 5, "price": 7500}, {"id": "item-3", "name": "Desk", "quantity": 3, "price": 10000}]', 67500, 'INR', 'pending', NOW(), NULL, NOW() + INTERVAL '5 days', NOW());

-- Insert sample damage reports
INSERT INTO damage_reports (item_id, item_name, quantity, reason, reported_by, reported_by_name, status, timestamp)
VALUES
  (1, 'Laptop', 2, 'Water damage', 2, 'Warehouse Manager', 'pending', NOW()),
  (2, 'Office Chair', 1, 'Broken parts', 2, 'Warehouse Manager', 'pending', NOW() - INTERVAL '1 day');

-- Insert sample users
INSERT INTO users (username, email, password_hash, full_name, role, status, permissions, created_at, last_login)
VALUES
  ('admin', 'admin@example.com', '$2a$10$JwXdIRkVPyZrTK1.Zq1ZT.qJLZYhK.fHFZc5HGMd9q1gUsgzH2wPu', 'Admin User', 'ADMIN', 'active', '[{"module": "*", "action": "*", "resource": "*"}]', NOW(), NOW()),
  ('warehouse_manager', 'warehouse@example.com', '$2a$10$JwXdIRkVPyZrTK1.Zq1ZT.qJLZYhK.fHFZc5HGMd9q1gUsgzH2wPu', 'Warehouse Manager', 'WAREHOUSE_MANAGER', 'active', '[{"module": "warehouse", "action": "*", "resource": "*"}, {"module": "inventory", "action": "view", "resource": "*"}]', NOW(), NOW() - INTERVAL '1 day');

-- Insert sample audit logs
INSERT INTO audit_logs (user_id, action, description, entity_type, entity_id, timestamp)
VALUES
  (1, 'login', 'User logged in', 'user', '1', NOW() - INTERVAL '2 hours'),
  (1, 'warehouse_inward', 'Added 5 item(s) to warehouse from Supplier 1', 'warehouse', 'inward-123', NOW() - INTERVAL '1 hour'),
  (1, 'warehouse_outward', 'Transferred 3 item(s) from warehouse to Retail Inventory', 'warehouse', 'outward-456', NOW() - INTERVAL '30 minutes');
