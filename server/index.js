const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
// Use real Prisma client with SQLite database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Warehouse Management API Server' });
});

// ===== USER ROUTES =====
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Import utilities
const { generateToken } = require('./utils/jwt');
const { comparePassword, hashPassword } = require('./utils/password');
const { authenticate, authorize } = require('./middleware/auth');
const { createAuditLog } = require('./utils/audit');
const { handleProductImageUpload, getFileUrl } = require('./utils/upload');

// ===== AUTH ROUTES =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is inactive:', email);
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Check if password matches
    // For the seed data, we're using plain text passwords
    // In a real app, all passwords would be hashed
    let passwordMatches;
    if (user.password.startsWith('$2')) {
      // If the password is already hashed (starts with $2), use bcrypt to compare
      passwordMatches = await comparePassword(password, user.password);
    } else {
      // For seed data, compare directly
      passwordMatches = user.password === password;
    }

    if (!passwordMatches) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.name);

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = generateToken(user);
    console.log('Generated token for user:', user.id);

    // Create audit log for login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        details: `User ${user.name} logged in`
      }
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // This is the enum value from the database (uppercase)
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'ADMIN' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    console.log('Authenticated user requesting profile:', req.user.name);

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      console.log('User not found in database:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Returning user profile for:', user.name);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get current user' });
  }
});

// ===== SUPPLIER ROUTES =====
app.get('/api/suppliers', authenticate, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            warehouseItems: true,
            purchaseOrders: true,
            contracts: true,
            contacts: true,
            documents: true
          }
        }
      }
    });
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

app.get('/api/suppliers/:id', authenticate, async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: true,
        documents: true,
        performanceHistory: {
          orderBy: {
            reviewDate: 'desc'
          },
          take: 5
        },
        contracts: {
          orderBy: {
            endDate: 'desc'
          },
          take: 5
        },
        purchaseOrders: {
          orderBy: {
            orderDate: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            warehouseItems: true,
            purchaseOrders: true,
            contracts: true,
            contacts: true,
            documents: true
          }
        }
      }
    });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

app.post('/api/suppliers', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({
      data: req.body
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'CREATE',
      'Supplier',
      supplier.id,
      `Created supplier ${supplier.name}`
    );

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

app.put('/api/suppliers/:id', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: req.body
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'UPDATE',
      'Supplier',
      supplier.id,
      `Updated supplier ${supplier.name}`
    );

    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

app.delete('/api/suppliers/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    // Get supplier details before deletion for audit log
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await prisma.supplier.delete({
      where: { id: req.params.id }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE',
      'Supplier',
      req.params.id,
      `Deleted supplier ${supplier.name}`
    );

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// ===== SUPPLIER CONTACTS ROUTES =====
app.get('/api/suppliers/:supplierId/contacts', authenticate, async (req, res) => {
  try {
    const contacts = await prisma.supplierContact.findMany({
      where: { supplierId: req.params.supplierId },
      orderBy: { isPrimary: 'desc' }
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching supplier contacts:', error);
    res.status(500).json({ error: 'Failed to fetch supplier contacts' });
  }
});

app.post('/api/suppliers/:supplierId/contacts', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const contact = await prisma.supplierContact.create({
      data: {
        ...req.body,
        supplierId: req.params.supplierId
      }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'CREATE',
      'SupplierContact',
      contact.id,
      `Added contact ${contact.name} for supplier ID ${req.params.supplierId}`
    );

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating supplier contact:', error);
    res.status(500).json({ error: 'Failed to create supplier contact' });
  }
});

app.put('/api/suppliers/:supplierId/contacts/:id', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const contact = await prisma.supplierContact.update({
      where: { id: req.params.id },
      data: req.body
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'UPDATE',
      'SupplierContact',
      contact.id,
      `Updated contact ${contact.name} for supplier ID ${req.params.supplierId}`
    );

    res.json(contact);
  } catch (error) {
    console.error('Error updating supplier contact:', error);
    res.status(500).json({ error: 'Failed to update supplier contact' });
  }
});

app.delete('/api/suppliers/:supplierId/contacts/:id', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const contact = await prisma.supplierContact.findUnique({
      where: { id: req.params.id }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await prisma.supplierContact.delete({
      where: { id: req.params.id }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE',
      'SupplierContact',
      req.params.id,
      `Deleted contact ${contact.name} for supplier ID ${req.params.supplierId}`
    );

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier contact:', error);
    res.status(500).json({ error: 'Failed to delete supplier contact' });
  }
});

// ===== SUPPLIER DOCUMENTS ROUTES =====
app.get('/api/suppliers/:supplierId/documents', authenticate, async (req, res) => {
  try {
    const documents = await prisma.supplierDocument.findMany({
      where: { supplierId: req.params.supplierId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching supplier documents:', error);
    res.status(500).json({ error: 'Failed to fetch supplier documents' });
  }
});

app.post('/api/suppliers/:supplierId/documents', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const document = await prisma.supplierDocument.create({
      data: {
        ...req.body,
        supplierId: req.params.supplierId,
        uploadedById: req.user.id,
        uploadedByName: req.user.name
      }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'CREATE',
      'SupplierDocument',
      document.id,
      `Added document ${document.name} for supplier ID ${req.params.supplierId}`
    );

    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating supplier document:', error);
    res.status(500).json({ error: 'Failed to create supplier document' });
  }
});

app.put('/api/suppliers/:supplierId/documents/:id', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const document = await prisma.supplierDocument.update({
      where: { id: req.params.id },
      data: req.body
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'UPDATE',
      'SupplierDocument',
      document.id,
      `Updated document ${document.name} for supplier ID ${req.params.supplierId}`
    );

    res.json(document);
  } catch (error) {
    console.error('Error updating supplier document:', error);
    res.status(500).json({ error: 'Failed to update supplier document' });
  }
});

app.delete('/api/suppliers/:supplierId/documents/:id', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const document = await prisma.supplierDocument.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await prisma.supplierDocument.delete({
      where: { id: req.params.id }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE',
      'SupplierDocument',
      req.params.id,
      `Deleted document ${document.name} for supplier ID ${req.params.supplierId}`
    );

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier document:', error);
    res.status(500).json({ error: 'Failed to delete supplier document' });
  }
});

// ===== SUPPLIER PERFORMANCE ROUTES =====
app.get('/api/suppliers/:supplierId/performance', authenticate, async (req, res) => {
  try {
    const performance = await prisma.supplierPerformance.findMany({
      where: { supplierId: req.params.supplierId },
      orderBy: { reviewDate: 'desc' }
    });
    res.json(performance);
  } catch (error) {
    console.error('Error fetching supplier performance:', error);
    res.status(500).json({ error: 'Failed to fetch supplier performance' });
  }
});

app.post('/api/suppliers/:supplierId/performance', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const performance = await prisma.supplierPerformance.create({
      data: {
        ...req.body,
        supplierId: req.params.supplierId,
        reviewedById: req.user.id,
        reviewedByName: req.user.name
      }
    });

    // Update supplier ratings based on latest performance review
    await prisma.supplier.update({
      where: { id: req.params.supplierId },
      data: {
        qualityRating: performance.qualityScore,
        deliveryRating: performance.deliveryScore,
        pricingRating: performance.pricingScore,
        communicationRating: performance.communicationScore,
        rating: performance.overallScore,
        onTimeDeliveryRate: performance.onTimeDeliveryRate,
        defectRate: performance.defectRate,
        lastPerformanceReview: performance.reviewDate
      }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'CREATE',
      'SupplierPerformance',
      performance.id,
      `Added performance review for supplier ID ${req.params.supplierId}`
    );

    res.status(201).json(performance);
  } catch (error) {
    console.error('Error creating supplier performance:', error);
    res.status(500).json({ error: 'Failed to create supplier performance' });
  }
});

app.put('/api/suppliers/:supplierId/performance/:id', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER']), async (req, res) => {
  try {
    const performance = await prisma.supplierPerformance.update({
      where: { id: req.params.id },
      data: req.body
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'UPDATE',
      'SupplierPerformance',
      performance.id,
      `Updated performance review for supplier ID ${req.params.supplierId}`
    );

    res.json(performance);
  } catch (error) {
    console.error('Error updating supplier performance:', error);
    res.status(500).json({ error: 'Failed to update supplier performance' });
  }
});

app.delete('/api/suppliers/:supplierId/performance/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const performance = await prisma.supplierPerformance.findUnique({
      where: { id: req.params.id }
    });

    if (!performance) {
      return res.status(404).json({ error: 'Performance review not found' });
    }

    await prisma.supplierPerformance.delete({
      where: { id: req.params.id }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE',
      'SupplierPerformance',
      req.params.id,
      `Deleted performance review for supplier ID ${req.params.supplierId}`
    );

    res.json({ message: 'Performance review deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier performance:', error);
    res.status(500).json({ error: 'Failed to delete supplier performance' });
  }
});

// ===== CATEGORY ROUTES =====
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id }
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: req.body
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ===== PRODUCT ROUTES =====
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true
      }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
      include: {
        category: true
      }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        category: true
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ===== WAREHOUSE EXPORT ROUTES =====
app.get('/api/warehouse/export', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    const { type } = req.query;
    let data = [];

    switch (type) {
      case 'items':
        data = await prisma.warehouseItem.findMany({
          include: {
            supplier: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        break;
      case 'inward':
        data = await prisma.inwardEntry.findMany({
          include: {
            warehouseItem: true,
            supplier: true
          },
          orderBy: {
            receivedDate: 'desc'
          }
        });
        break;
      case 'outward':
        data = await prisma.outwardEntry.findMany({
          include: {
            warehouseItem: true
          },
          orderBy: {
            transferDate: 'desc'
          }
        });
        break;
      case 'damage':
        data = await prisma.damageEntry.findMany({
          include: {
            warehouseItem: true
          },
          orderBy: {
            reportedDate: 'desc'
          }
        });
        break;
      case 'closing':
        data = await prisma.closingStock.findMany({
          include: {
            warehouseItem: true
          },
          orderBy: {
            date: 'desc'
          }
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.json(data);
  } catch (error) {
    console.error(`Error exporting warehouse ${req.query.type || 'data'}:`, error);
    res.status(500).json({ error: `Failed to export warehouse ${req.query.type || 'data'}` });
  }
});

// ===== WAREHOUSE ITEM ROUTES =====
app.get('/api/warehouse/items', authenticate, async (req, res) => {
  try {
    const items = await prisma.warehouseItem.findMany({
      include: {
        supplier: true
      }
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching warehouse items:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse items' });
  }
});

app.get('/api/warehouse/items/:id', authenticate, async (req, res) => {
  try {
    const item = await prisma.warehouseItem.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true
      }
    });
    if (!item) {
      return res.status(404).json({ error: 'Warehouse item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching warehouse item:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse item' });
  }
});

app.post('/api/warehouse/items', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    const item = await prisma.warehouseItem.create({
      data: req.body,
      include: {
        supplier: true
      }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating warehouse item:', error);
    res.status(500).json({ error: 'Failed to create warehouse item' });
  }
});

app.put('/api/warehouse/items/:id', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    const item = await prisma.warehouseItem.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        supplier: true
      }
    });
    res.json(item);
  } catch (error) {
    console.error('Error updating warehouse item:', error);
    res.status(500).json({ error: 'Failed to update warehouse item' });
  }
});

app.delete('/api/warehouse/items/:id', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the item before deletion for audit log
    const item = await prisma.warehouseItem.findUnique({
      where: { id },
      include: { supplier: true }
    });

    if (!item) {
      return res.status(404).json({ error: 'Warehouse item not found' });
    }

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete related inward entries
      await tx.inwardEntry.deleteMany({
        where: { itemId: id }
      });

      // Delete related outward entries
      await tx.outwardEntry.deleteMany({
        where: { itemId: id }
      });

      // Delete related damage entries
      await tx.damageEntry.deleteMany({
        where: { itemId: id }
      });

      // Delete related closing stock entries
      await tx.closingStock.deleteMany({
        where: { itemId: id }
      });

      // Delete the warehouse item
      await tx.warehouseItem.delete({
        where: { id }
      });
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE_WAREHOUSE_ITEM',
      'WarehouseItem',
      id,
      `Deleted warehouse item: ${item.productName} (${item.supplier?.name || 'Unknown supplier'})`
    );

    res.json({
      message: 'Warehouse item deleted successfully',
      deletedItem: item
    });
  } catch (error) {
    console.error('Error deleting warehouse item:', error);
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Cannot delete this item because it is referenced by other records. Please remove those references first.'
      });
    }
    res.status(500).json({ error: 'Failed to delete warehouse item' });
  }
});

// ===== INVENTORY ITEM ROUTES =====
app.get('/api/inventory/items', async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        product: true
      }
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

app.get('/api/inventory/items/:id', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
      include: {
        product: true
      }
    });
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

app.post('/api/inventory/items', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.create({
      data: req.body,
      include: {
        product: true
      }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

app.put('/api/inventory/items/:id', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        product: true
      }
    });
    res.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

app.delete('/api/inventory/items/:id', authenticate, authorize(['ADMIN', 'INVENTORY_MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the item before deletion for audit log
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete related transfer items
      await tx.transferItem.deleteMany({
        where: { inventoryItemId: id }
      });

      // Delete related sales items
      await tx.saleItem.deleteMany({
        where: { inventoryItemId: id }
      });

      // Delete the inventory item
      await tx.inventoryItem.delete({
        where: { id }
      });
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE_INVENTORY_ITEM',
      'InventoryItem',
      id,
      `Deleted inventory item: ${item.product?.name || 'Unknown product'}`
    );

    res.json({
      message: 'Inventory item deleted successfully',
      deletedItem: item
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Cannot delete this item because it is referenced by other records. Please remove those references first.'
      });
    }
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// ===== INWARD ROUTES =====
app.get('/api/warehouse/inward', authenticate, async (req, res) => {
  try {
    const inwardEntries = await prisma.inwardEntry.findMany({
      include: {
        warehouseItem: true,
        supplier: true
      },
      orderBy: {
        receivedDate: 'desc'
      }
    });
    res.json(inwardEntries);
  } catch (error) {
    console.error('Error fetching inward entries:', error);
    res.status(500).json({ error: 'Failed to fetch inward entries' });
  }
});

app.get('/api/warehouse/inward/:id', authenticate, async (req, res) => {
  try {
    const inwardEntry = await prisma.inwardEntry.findUnique({
      where: { id: req.params.id },
      include: {
        warehouseItem: true,
        supplier: true
      }
    });
    if (!inwardEntry) {
      return res.status(404).json({ error: 'Inward entry not found' });
    }
    res.json(inwardEntry);
  } catch (error) {
    console.error('Error fetching inward entry:', error);
    res.status(500).json({ error: 'Failed to fetch inward entry' });
  }
});

app.post('/api/warehouse/inward', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get warehouse item details
      const warehouseItem = await tx.warehouseItem.findUnique({
        where: { id: req.body.itemId }
      });

      if (!warehouseItem) {
        throw new Error('Warehouse item not found');
      }

      // Create the inward entry
      const inwardEntry = await tx.inwardEntry.create({
        data: {
          warehouseId: req.body.warehouseId,
          itemId: req.body.itemId,
          supplierId: req.body.supplierId,
          quantity: req.body.quantity,
          unitCost: req.body.unitCost,
          totalCost: req.body.quantity * req.body.unitCost,
          receivedBy: req.user.id,
          receivedDate: new Date(),
          batchNumber: req.body.batchNumber,
          invoiceNumber: req.body.invoiceNumber,
          notes: req.body.notes,
          createdAt: new Date()
        },
        include: {
          warehouseItem: true,
          supplier: true
        }
      });

      // Update warehouse item quantity (increase)
      const updatedWarehouseItem = await tx.warehouseItem.update({
        where: { id: req.body.itemId },
        data: {
          quantity: {
            increment: req.body.quantity
          },
          updatedAt: new Date()
        }
      });

      return {
        inwardEntry,
        warehouseItem: updatedWarehouseItem
      };
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'INWARD_ENTRY',
      'WarehouseItem',
      result.inwardEntry.id,
      `Added ${req.body.quantity} items to warehouse: ${result.warehouseItem.productName}`
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating inward entry:', error);
    if (error.message === 'Warehouse item not found') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create inward entry' });
  }
});

// ===== DAMAGE ROUTES =====
app.get('/api/warehouse/damage', authenticate, async (req, res) => {
  try {
    const damageEntries = await prisma.damageEntry.findMany({
      include: {
        warehouseItem: true
      },
      orderBy: {
        reportedDate: 'desc'
      }
    });
    res.json(damageEntries);
  } catch (error) {
    console.error('Error fetching damage entries:', error);
    res.status(500).json({ error: 'Failed to fetch damage entries' });
  }
});

app.get('/api/warehouse/damage/:id', authenticate, async (req, res) => {
  try {
    const damageEntry = await prisma.damageEntry.findUnique({
      where: { id: req.params.id },
      include: {
        warehouseItem: true
      }
    });
    if (!damageEntry) {
      return res.status(404).json({ error: 'Damage entry not found' });
    }
    res.json(damageEntry);
  } catch (error) {
    console.error('Error fetching damage entry:', error);
    res.status(500).json({ error: 'Failed to fetch damage entry' });
  }
});

app.post('/api/warehouse/damage', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get warehouse item details
      const warehouseItem = await tx.warehouseItem.findUnique({
        where: { id: req.body.itemId }
      });

      if (!warehouseItem) {
        throw new Error('Warehouse item not found');
      }

      // Check if there's enough quantity in the warehouse
      if (warehouseItem.quantity < req.body.quantity) {
        throw new Error('Not enough quantity in warehouse');
      }

      // Create the damage entry
      const damageReport = await tx.damageEntry.create({
        data: {
          itemId: req.body.itemId,
          quantity: req.body.quantity,
          reason: req.body.reason,
          reportedBy: req.user.id,
          reportedDate: new Date(),
          status: 'pending',
          notes: req.body.notes,
          createdAt: new Date()
        },
        include: {
          warehouseItem: true
        }
      });

      // Update warehouse item quantity (decrease)
      const updatedWarehouseItem = await tx.warehouseItem.update({
        where: { id: req.body.itemId },
        data: {
          quantity: {
            decrement: req.body.quantity
          },
          updatedAt: new Date()
        }
      });

      return {
        damageReport,
        warehouseItem: updatedWarehouseItem
      };
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DAMAGE_REPORT',
      'WarehouseItem',
      result.damageReport.id,
      `Reported ${req.body.quantity} damaged items: ${result.warehouseItem.productName}`
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating damage report:', error);
    if (error.message === 'Warehouse item not found' ||
        error.message === 'Not enough quantity in warehouse') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create damage report' });
  }
});

// ===== OUTWARD ROUTES =====
app.get('/api/warehouse/outward', authenticate, async (req, res) => {
  try {
    const outwardEntries = await prisma.outwardEntry.findMany({
      include: {
        warehouseItem: true
      },
      orderBy: {
        transferDate: 'desc'
      }
    });
    res.json(outwardEntries);
  } catch (error) {
    console.error('Error fetching outward entries:', error);
    res.status(500).json({ error: 'Failed to fetch outward entries' });
  }
});

app.get('/api/warehouse/outward/:id', authenticate, async (req, res) => {
  try {
    const outwardEntry = await prisma.outwardEntry.findUnique({
      where: { id: req.params.id },
      include: {
        warehouseItem: true
      }
    });
    if (!outwardEntry) {
      return res.status(404).json({ error: 'Outward entry not found' });
    }
    res.json(outwardEntry);
  } catch (error) {
    console.error('Error fetching outward entry:', error);
    res.status(500).json({ error: 'Failed to fetch outward entry' });
  }
});

app.post('/api/warehouse/outward', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get warehouse item details
      const warehouseItem = await tx.warehouseItem.findUnique({
        where: { id: req.body.itemId }
      });

      if (!warehouseItem) {
        throw new Error('Warehouse item not found');
      }

      // Check if there's enough quantity in the warehouse
      if (warehouseItem.quantity < req.body.quantity) {
        throw new Error('Not enough quantity in warehouse');
      }

      // Create the outward entry
      const outwardEntry = await tx.outwardEntry.create({
        data: {
          warehouseId: req.body.warehouseId,
          itemId: req.body.itemId,
          quantity: req.body.quantity,
          destination: req.body.destination,
          transferredBy: req.user.id,
          transferDate: new Date(),
          status: req.body.status || 'completed',
          notes: req.body.notes,
          createdAt: new Date()
        },
        include: {
          warehouseItem: true
        }
      });

      // Update warehouse item quantity (decrease)
      const updatedWarehouseItem = await tx.warehouseItem.update({
        where: { id: req.body.itemId },
        data: {
          quantity: {
            decrement: req.body.quantity
          },
          updatedAt: new Date()
        }
      });

      return {
        outwardEntry,
        warehouseItem: updatedWarehouseItem
      };
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'OUTWARD_ENTRY',
      'WarehouseItem',
      result.outwardEntry.id,
      `Transferred ${req.body.quantity} items from warehouse to ${req.body.destination}: ${result.warehouseItem.productName}`
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating outward entry:', error);
    if (error.message === 'Warehouse item not found' ||
        error.message === 'Not enough quantity in warehouse') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create outward entry' });
  }
});

// ===== TRANSFER ROUTES =====
app.get('/api/transfers', async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        warehouseItem: true,
        inventoryItem: true
      }
    });
    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

app.get('/api/transfers/:id', async (req, res) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: req.params.id },
      include: {
        warehouseItem: true,
        inventoryItem: true
      }
    });
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({ error: 'Failed to fetch transfer' });
  }
});

app.post('/api/transfers', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get warehouse item and inventory item details
      const warehouseItem = await tx.warehouseItem.findUnique({
        where: { id: req.body.warehouseItemId }
      });

      const inventoryItem = await tx.inventoryItem.findUnique({
        where: { id: req.body.inventoryItemId }
      });

      if (!warehouseItem) {
        throw new Error('Warehouse item not found');
      }

      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }

      // Check if there's enough quantity in the warehouse
      if (warehouseItem.quantity < req.body.quantity) {
        throw new Error('Not enough quantity in warehouse');
      }

      // 1. Create the transfer record
      const transfer = await tx.transfer.create({
        data: {
          ...req.body,
          createdBy: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          warehouseItem: true,
          inventoryItem: true
        }
      });

      // 2. Update warehouse item quantity (decrease)
      const updatedWarehouseItem = await tx.warehouseItem.update({
        where: { id: req.body.warehouseItemId },
        data: {
          quantity: {
            decrement: req.body.quantity
          },
          updatedAt: new Date()
        }
      });

      // 3. Update inventory item quantity (increase)
      const updatedInventoryItem = await tx.inventoryItem.update({
        where: { id: req.body.inventoryItemId },
        data: {
          quantity: {
            increment: req.body.quantity
          },
          updatedAt: new Date()
        }
      });

      return {
        transfer,
        warehouseItem: updatedWarehouseItem,
        inventoryItem: updatedInventoryItem
      };
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'TRANSFER',
      'Inventory',
      result.transfer.id,
      `Transferred ${req.body.quantity} items from warehouse to inventory`
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating transfer:', error);
    if (error.message === 'Warehouse item not found' ||
        error.message === 'Inventory item not found' ||
        error.message === 'Not enough quantity in warehouse') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create transfer' });
  }
});

// ===== DAMAGE REPORT ROUTES =====
app.get('/api/warehouse/damage', authenticate, async (req, res) => {
  try {
    const damageReports = await prisma.damageEntry.findMany({
      include: {
        warehouseItem: true
      },
      orderBy: {
        reportedDate: 'desc'
      }
    });
    res.json(damageReports);
  } catch (error) {
    console.error('Error fetching damage reports:', error);
    res.status(500).json({ error: 'Failed to fetch damage reports' });
  }
});

app.get('/api/warehouse/damage/:id', authenticate, async (req, res) => {
  try {
    const damageReport = await prisma.damageEntry.findUnique({
      where: { id: req.params.id },
      include: {
        warehouseItem: true
      }
    });
    if (!damageReport) {
      return res.status(404).json({ error: 'Damage report not found' });
    }
    res.json(damageReport);
  } catch (error) {
    console.error('Error fetching damage report:', error);
    res.status(500).json({ error: 'Failed to fetch damage report' });
  }
});

app.post('/api/warehouse/damage', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get warehouse item details
      const warehouseItem = await tx.warehouseItem.findUnique({
        where: { id: req.body.itemId }
      });

      if (!warehouseItem) {
        throw new Error('Warehouse item not found');
      }

      // Check if there's enough quantity in the warehouse
      if (warehouseItem.quantity < req.body.quantity) {
        throw new Error('Not enough quantity in warehouse');
      }

      // Create the damage report
      const damageReport = await tx.damageEntry.create({
        data: {
          warehouseId: req.body.warehouseId,
          itemId: req.body.itemId,
          quantity: req.body.quantity,
          reason: req.body.reason,
          reportedBy: req.user.id,
          reportedDate: new Date(),
          status: 'pending',
          notes: req.body.notes,
          createdAt: new Date()
        },
        include: {
          warehouseItem: true
        }
      });

      // Update warehouse item quantity (decrease)
      const updatedWarehouseItem = await tx.warehouseItem.update({
        where: { id: req.body.itemId },
        data: {
          quantity: {
            decrement: req.body.quantity
          },
          updatedAt: new Date()
        }
      });

      return {
        damageReport,
        warehouseItem: updatedWarehouseItem
      };
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DAMAGE_REPORT',
      'WarehouseItem',
      result.damageReport.id,
      `Reported ${req.body.quantity} damaged items: ${result.warehouseItem.productName}`
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating damage report:', error);
    if (error.message === 'Warehouse item not found' ||
        error.message === 'Not enough quantity in warehouse') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create damage report' });
  }
});

app.put('/api/warehouse/damage/:id/approve', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const damageReport = await prisma.damageEntry.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        approvedBy: req.user.id,
        approvedDate: new Date()
      },
      include: {
        warehouseItem: true
      }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'APPROVE_DAMAGE',
      'DamageEntry',
      damageReport.id,
      `Approved damage report for ${damageReport.quantity} items: ${damageReport.warehouseItem.productName}`
    );

    res.json(damageReport);
  } catch (error) {
    console.error('Error approving damage report:', error);
    res.status(500).json({ error: 'Failed to approve damage report' });
  }
});

app.put('/api/warehouse/damage/:id/reject', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get damage report details
      const damageReport = await tx.damageEntry.findUnique({
        where: { id: req.params.id },
        include: {
          warehouseItem: true
        }
      });

      if (!damageReport) {
        throw new Error('Damage report not found');
      }

      if (damageReport.status !== 'pending') {
        throw new Error('Damage report is not in pending status');
      }

      // Update damage report status
      const updatedDamageReport = await tx.damageEntry.update({
        where: { id: req.params.id },
        data: {
          status: 'rejected',
          approvedBy: req.user.id,
          approvedDate: new Date(),
          notes: req.body.notes || damageReport.notes
        },
        include: {
          warehouseItem: true
        }
      });

      // Return the quantity to the warehouse item
      const updatedWarehouseItem = await tx.warehouseItem.update({
        where: { id: damageReport.itemId },
        data: {
          quantity: {
            increment: damageReport.quantity
          },
          updatedAt: new Date()
        }
      });

      return {
        damageReport: updatedDamageReport,
        warehouseItem: updatedWarehouseItem
      };
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'REJECT_DAMAGE',
      'DamageEntry',
      result.damageReport.id,
      `Rejected damage report for ${result.damageReport.quantity} items: ${result.damageReport.warehouseItem.productName}`
    );

    res.json(result);
  } catch (error) {
    console.error('Error rejecting damage report:', error);
    if (error.message === 'Damage report not found' ||
        error.message === 'Damage report is not in pending status') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to reject damage report' });
  }
});

// ===== CLOSING STOCK ROUTES =====
app.get('/api/warehouse/closing-stock', authenticate, async (req, res) => {
  try {
    const closingStocks = await prisma.closingStock.findMany({
      include: {
        warehouseItem: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(closingStocks);
  } catch (error) {
    console.error('Error fetching closing stocks:', error);
    res.status(500).json({ error: 'Failed to fetch closing stocks' });
  }
});

app.get('/api/warehouse/closing-stock/:id', authenticate, async (req, res) => {
  try {
    const closingStock = await prisma.closingStock.findUnique({
      where: { id: req.params.id },
      include: {
        warehouseItem: true
      }
    });
    if (!closingStock) {
      return res.status(404).json({ error: 'Closing stock not found' });
    }
    res.json(closingStock);
  } catch (error) {
    console.error('Error fetching closing stock:', error);
    res.status(500).json({ error: 'Failed to fetch closing stock' });
  }
});

app.post('/api/warehouse/closing-stock/generate', authenticate, authorize(['ADMIN', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    const { warehouseId, date } = req.body;

    // Validate inputs
    if (!warehouseId) {
      return res.status(400).json({ error: 'Warehouse ID is required' });
    }

    const closingDate = date ? new Date(date) : new Date();
    const month = closingDate.getMonth();
    const year = closingDate.getFullYear();

    // Start of the month
    const startDate = new Date(year, month, 1);
    // End of the month
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Get all warehouse items
    const warehouseItems = await prisma.warehouseItem.findMany();

    // For each item, calculate the closing stock
    const closingStocks = await Promise.all(warehouseItems.map(async (item) => {
      // Get inward entries for the month
      const inwardEntries = await prisma.inwardEntry.findMany({
        where: {
          itemId: item.id,
          receivedDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      // Get outward entries for the month
      const outwardEntries = await prisma.outwardEntry.findMany({
        where: {
          itemId: item.id,
          transferDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      // Get damage entries for the month
      const damageEntries = await prisma.damageEntry.findMany({
        where: {
          itemId: item.id,
          reportedDate: {
            gte: startDate,
            lte: endDate
          },
          status: 'approved'
        }
      });

      // Calculate quantities
      const inwardQuantity = inwardEntries.reduce((sum, entry) => sum + entry.quantity, 0);
      const outwardQuantity = outwardEntries.reduce((sum, entry) => sum + entry.quantity, 0);
      const damageQuantity = damageEntries.reduce((sum, entry) => sum + entry.quantity, 0);

      // Get previous month's closing stock or use 0 if not found
      const previousMonth = new Date(year, month - 1, 1);
      const previousMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);

      const previousClosingStock = await prisma.closingStock.findFirst({
        where: {
          itemId: item.id,
          date: {
            gte: previousMonth,
            lte: previousMonthEnd
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      const openingQuantity = previousClosingStock ? previousClosingStock.closingQuantity : 0;
      const adjustmentQuantity = 0; // No adjustments for now
      const closingQuantity = openingQuantity + inwardQuantity - outwardQuantity - damageQuantity + adjustmentQuantity;

      // Check if a closing stock entry already exists for this item and date
      const existingClosingStock = await prisma.closingStock.findFirst({
        where: {
          itemId: item.id,
          date: {
            gte: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
            lt: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1)
          }
        }
      });

      // Create or update closing stock entry
      if (existingClosingStock) {
        return await prisma.closingStock.update({
          where: {
            id: existingClosingStock.id
          },
          data: {
            openingQuantity,
            inwardQuantity,
            outwardQuantity,
            damageQuantity,
            adjustmentQuantity,
            closingQuantity,
            unitPrice: item.unitCost || 0,
            totalValue: closingQuantity * (item.unitCost || 0),
            createdBy: req.user.id,
            createdAt: new Date()
          }
        });
      } else {
        return await prisma.closingStock.create({
          data: {
            warehouseId: 'wh-1', // Default warehouse ID
            itemId: item.id,
            date: endDate,
            openingQuantity,
            inwardQuantity,
            outwardQuantity,
            damageQuantity,
            adjustmentQuantity,
            closingQuantity,
            unitPrice: item.unitCost || 0,
            totalValue: closingQuantity * (item.unitCost || 0),
            createdBy: req.user.id,
            createdAt: new Date()
          },
          include: {
            warehouseItem: true
          }
        });
      }
    }));

    // Create audit log
    await createAuditLog(
      req.user.id,
      'GENERATE_CLOSING_STOCK',
      'ClosingStock',
      null,
      `Generated closing stock for ${closingStocks.length} items for ${closingDate.toLocaleDateString()}`
    );

    res.status(201).json(closingStocks);
  } catch (error) {
    console.error('Error generating closing stock:', error);
    res.status(500).json({ error: 'Failed to generate closing stock' });
  }
});

// ===== FILE UPLOAD ROUTES =====
app.post('/api/upload/product-image', authenticate, handleProductImageUpload, async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the file URL
    const fileUrl = getFileUrl(req.file.filename);

    // Create audit log
    await createAuditLog(
      req.user.id,
      'UPLOAD_IMAGE',
      'File',
      req.file.filename,
      `Uploaded product image: ${req.file.originalname}`
    );

    // Return the file URL
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// ===== PURCHASE ORDER ROUTES =====
app.get('/api/purchase-orders', async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        createdBy: true,
        approvedBy: true,
        items: true
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

app.get('/api/purchase-orders/:id', async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        createdBy: true,
        approvedBy: true,
        items: true
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

app.post('/api/purchase-orders', async (req, res) => {
  try {
    const { items, ...orderData } = req.body;

    const order = await prisma.purchaseOrder.create({
      data: {
        ...orderData,
        items: {
          create: items
        }
      },
      include: {
        supplier: true,
        createdBy: true,
        approvedBy: true,
        items: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

app.put('/api/purchase-orders/:id', async (req, res) => {
  try {
    const { items, ...orderData } = req.body;

    // Update the purchase order
    const order = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: orderData,
      include: {
        supplier: true,
        createdBy: true,
        approvedBy: true,
        items: true
      }
    });

    // If items are provided, update them separately
    if (items && items.length > 0) {
      // Delete existing items
      await prisma.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: req.params.id }
      });

      // Create new items
      await Promise.all(items.map(item =>
        prisma.purchaseOrderItem.create({
          data: {
            ...item,
            purchaseOrderId: req.params.id
          }
        })
      ));

      // Fetch updated order with items
      const updatedOrder = await prisma.purchaseOrder.findUnique({
        where: { id: req.params.id },
        include: {
          supplier: true,
          createdBy: true,
          approvedBy: true,
          items: true
        }
      });

      return res.json(updatedOrder);
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
});

app.delete('/api/purchase-orders/:id', async (req, res) => {
  try {
    // Delete associated items first
    await prisma.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId: req.params.id }
    });

    // Then delete the purchase order
    await prisma.purchaseOrder.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
});

// ===== AUDIT LOG ROUTES =====
app.get('/api/audit/logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.post('/api/audit/logs', async (req, res) => {
  try {
    const log = await prisma.auditLog.create({
      data: req.body,
      include: {
        user: true
      }
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// ===== INVENTORY ROUTES =====

// Get all inventory items
app.get('/api/inventory/items', authenticate, async (req, res) => {
  try {
    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    res.json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

// Get a single inventory item
app.get('/api/inventory/items/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(inventoryItem);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Create a new inventory item
app.post('/api/inventory/items', authenticate, authorize(['ADMIN', 'INVENTORY_MANAGER']), async (req, res) => {
  try {
    const { productId, locationId, quantity, unitPrice, ...itemData } = req.body;

    // Validate required fields
    if (!productId || !locationId || quantity === undefined || unitPrice === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the inventory item
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        productId,
        locationId,
        quantity,
        unitPrice,
        ...itemData,
        createdBy: req.user.id,
        updatedBy: req.user.id
      },
      include: {
        product: true
      }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'CREATE_INVENTORY_ITEM',
      'InventoryItem',
      inventoryItem.id,
      `Created inventory item for product ${inventoryItem.product.name}`
    );

    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// Update an inventory item
app.put('/api/inventory/items/:id', authenticate, authorize(['ADMIN', 'INVENTORY_MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, unitPrice, ...itemData } = req.body;

    // Get the existing item
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Update the inventory item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        quantity,
        unitPrice,
        ...itemData,
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      include: {
        product: true
      }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'UPDATE_INVENTORY_ITEM',
      'InventoryItem',
      id,
      `Updated inventory item for product ${updatedItem.product.name}`
    );

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Delete an inventory item
app.delete('/api/inventory/items/:id', authenticate, authorize(['ADMIN', 'INVENTORY_MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the item before deletion for audit log
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Delete the inventory item
    await prisma.inventoryItem.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE_INVENTORY_ITEM',
      'InventoryItem',
      id,
      `Deleted inventory item for product ${item.product.name}`
    );

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// Create inventory transfer
app.post('/api/inventory/transfers', authenticate, authorize(['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_MANAGER']), async (req, res) => {
  try {
    const { sourceLocationId, destinationLocationId, items, transferDate, referenceNumber, notes } = req.body;

    // Validate required fields
    if (!sourceLocationId || !destinationLocationId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the transfer record
      const transfer = await prisma.inventoryTransfer.create({
        data: {
          sourceLocationId,
          destinationLocationId,
          transferDate: transferDate ? new Date(transferDate) : new Date(),
          referenceNumber,
          notes,
          status: 'completed',
          createdBy: req.user.id,
          updatedBy: req.user.id,
          // Create transfer items
          transferItems: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              currentPrice: item.currentPrice || 0,
              newPrice: item.newPrice || null,
              priceAdjustmentType: item.priceAdjustmentType || 'none',
              priceAdjustmentValue: item.priceAdjustmentValue || 0,
              createdBy: req.user.id
            }))
          }
        },
        include: {
          transferItems: true
        }
      });

      // Process each item in the transfer
      for (const item of items) {
        // Deduct from source location
        const sourceItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            locationId: sourceLocationId
          }
        });

        if (sourceItem) {
          // Update source inventory
          await prisma.inventoryItem.update({
            where: { id: sourceItem.id },
            data: {
              quantity: sourceItem.quantity - item.quantity,
              updatedBy: req.user.id,
              updatedAt: new Date()
            }
          });
        }

        // Add to destination location
        const destItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            locationId: destinationLocationId
          }
        });

        if (destItem) {
          // Update destination inventory
          await prisma.inventoryItem.update({
            where: { id: destItem.id },
            data: {
              quantity: destItem.quantity + item.quantity,
              // Update price if specified
              unitPrice: item.newPrice !== null ? item.newPrice : destItem.unitPrice,
              updatedBy: req.user.id,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new inventory item at destination
          await prisma.inventoryItem.create({
            data: {
              productId: item.productId,
              locationId: destinationLocationId,
              quantity: item.quantity,
              unitPrice: item.newPrice !== null ? item.newPrice : (item.currentPrice || 0),
              createdBy: req.user.id,
              updatedBy: req.user.id
            }
          });
        }
      }

      return transfer;
    });

    // Create audit log
    await createAuditLog(
      req.user.id,
      'INVENTORY_TRANSFER',
      'InventoryTransfer',
      result.id,
      `Transferred ${items.length} items from ${sourceLocationId} to ${destinationLocationId}`
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating inventory transfer:', error);
    res.status(500).json({ error: 'Failed to create inventory transfer' });
  }
});

// ===== PRODUCT ROUTES =====

// Get all products
app.get('/api/products', authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product
app.get('/api/products/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ===== LOCATION ROUTES =====

// Get all locations
app.get('/api/locations', authenticate, async (req, res) => {
  try {
    // Define standard locations (in a real app, these would come from the database)
    const standardLocations = [
      { id: 'wh-1', name: 'Main Warehouse', type: 'warehouse', description: 'Primary storage facility' },
      { id: 'wh-2', name: 'Secondary Warehouse', type: 'warehouse', description: 'Overflow storage' },
      { id: 'inv-1', name: 'Retail Inventory', type: 'inventory', description: 'Main store inventory' },
      { id: 'inv-2', name: 'Online Inventory', type: 'inventory', description: 'E-commerce inventory' },
      { id: 'inv-3', name: 'Wholesale Inventory', type: 'inventory', description: 'Wholesale customer inventory' },
    ];

    res.json(standardLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get a single location
app.get('/api/locations/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Define standard locations (in a real app, these would come from the database)
    const standardLocations = [
      { id: 'wh-1', name: 'Main Warehouse', type: 'warehouse', description: 'Primary storage facility' },
      { id: 'wh-2', name: 'Secondary Warehouse', type: 'warehouse', description: 'Overflow storage' },
      { id: 'inv-1', name: 'Retail Inventory', type: 'inventory', description: 'Main store inventory' },
      { id: 'inv-2', name: 'Online Inventory', type: 'inventory', description: 'E-commerce inventory' },
      { id: 'inv-3', name: 'Wholesale Inventory', type: 'inventory', description: 'Wholesale customer inventory' },
    ];

    const location = standardLocations.find(loc => loc.id === id);

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
