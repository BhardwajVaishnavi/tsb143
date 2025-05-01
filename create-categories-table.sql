-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Create index on parent_id for faster hierarchical queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Insert some default categories if the table is empty
INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Electronics', 'Electronic devices and components', NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Electronics');

INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Clothing', 'Apparel and accessories', NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Clothing');

INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Home & Kitchen', 'Home and kitchen supplies', NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Home & Kitchen');

INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Office Supplies', 'Office equipment and supplies', NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Office Supplies');

INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Spices', 'Spices and seasonings', NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Spices');

-- Insert some subcategories
INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Smartphones', 'Mobile phones and accessories', (SELECT id FROM categories WHERE name = 'Electronics'), TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Smartphones');

INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Laptops', 'Laptop computers and accessories', (SELECT id FROM categories WHERE name = 'Electronics'), TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Laptops');

INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Men''s Clothing', 'Clothing for men', (SELECT id FROM categories WHERE name = 'Clothing'), TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Men''s Clothing');

INSERT INTO categories (name, description, parent_id, is_active)
SELECT 'Women''s Clothing', 'Clothing for women', (SELECT id FROM categories WHERE name = 'Clothing'), TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Women''s Clothing');

-- Add category column to warehouse_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'warehouse_items' AND column_name = 'category') THEN
        ALTER TABLE warehouse_items ADD COLUMN category VARCHAR(100);
    END IF;
END$$;

-- Add category column to inventory_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inventory_items' AND column_name = 'category') THEN
        ALTER TABLE inventory_items ADD COLUMN category VARCHAR(100);
    END IF;
END$$;
