import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Created admin user:', admin.email);

    // Create categories
    const categories = [
      { name: 'Electronics' },
      { name: 'Clothing' },
      { name: 'Home & Kitchen' },
      { name: 'Books' },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      });
    }

    console.log('Created categories');

    // Create suppliers
    const suppliers = [
      {
        name: 'Tech Supplies Inc.',
        email: 'info@techsupplies.com',
        phone: '+1 (555) 123-4567',
        address: '123 Tech St, San Francisco, CA',
        contactPerson: 'John Smith',
        taxId: 'TAX-12345678',
        paymentTerms: 'Net 30',
        preferredCurrency: 'USD',
        rating: 5,
        notes: 'Reliable supplier for electronic components',
        status: 'ACTIVE' as const,
        category: 'Electronics',
        website: 'https://techsupplies.example.com',
        leadTime: 7,
        minimumOrderValue: 1000,
        discountRate: 5.5,
        creditLimit: 50000,
      },
      {
        name: 'Fashion Wholesale',
        email: 'orders@fashionwholesale.com',
        phone: '+1 (555) 987-6543',
        address: '456 Fashion Ave, New York, NY',
        contactPerson: 'Emily Johnson',
        taxId: 'TAX-87654321',
        paymentTerms: 'Net 45',
        preferredCurrency: 'USD',
        rating: 4,
        notes: 'Good quality clothing supplier',
        status: 'ACTIVE' as const,
        category: 'Clothing',
        website: 'https://fashionwholesale.example.com',
        leadTime: 14,
        minimumOrderValue: 2000,
        discountRate: 3.0,
        creditLimit: 30000,
      },
      {
        name: 'Home Goods Distributors',
        email: 'sales@homegoods.com',
        phone: '+1 (555) 456-7890',
        address: '789 Home Blvd, Chicago, IL',
        contactPerson: 'Michael Brown',
        taxId: 'TAX-24681357',
        paymentTerms: 'Net 15',
        preferredCurrency: 'USD',
        rating: 3,
        notes: 'Wide range of home products',
        status: 'ACTIVE' as const,
        category: 'Home & Kitchen',
        website: 'https://homegoods.example.com',
        leadTime: 10,
        minimumOrderValue: 500,
        discountRate: 2.5,
        creditLimit: 25000,
      },
    ];

    for (const supplier of suppliers) {
      await prisma.supplier.upsert({
        where: { email: supplier.email },
        update: {},
        create: supplier,
      });
    }

    console.log('Created suppliers');

    // Get created suppliers
    const createdSuppliers = await prisma.supplier.findMany();

    // Create products
    const products = [
      {
        name: 'Smartphone',
        description: 'Latest model smartphone with advanced features',
        price: 699.99,
        categoryId: (await prisma.category.findUnique({ where: { name: 'Electronics' } }))!.id,
      },
      {
        name: 'Laptop',
        description: 'High-performance laptop for work and gaming',
        price: 1299.99,
        categoryId: (await prisma.category.findUnique({ where: { name: 'Electronics' } }))!.id,
      },
      {
        name: 'T-Shirt',
        description: 'Cotton t-shirt, available in multiple colors',
        price: 19.99,
        categoryId: (await prisma.category.findUnique({ where: { name: 'Clothing' } }))!.id,
      },
      {
        name: 'Jeans',
        description: 'Denim jeans, slim fit',
        price: 49.99,
        categoryId: (await prisma.category.findUnique({ where: { name: 'Clothing' } }))!.id,
      },
      {
        name: 'Coffee Maker',
        description: 'Automatic coffee maker with timer',
        price: 89.99,
        categoryId: (await prisma.category.findUnique({ where: { name: 'Home & Kitchen' } }))!.id,
      },
      {
        name: 'Novel',
        description: 'Bestselling fiction novel',
        price: 14.99,
        categoryId: (await prisma.category.findUnique({ where: { name: 'Books' } }))!.id,
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { name: product.name },
        update: {},
        create: product,
      });
    }

    console.log('Created products');

    // Get created products
    const createdProducts = await prisma.product.findMany();

    // Create warehouse items
    for (const product of createdProducts) {
      const supplierId = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)].id;
      const quantity = Math.floor(Math.random() * 100) + 50;
      const unitCost = parseFloat((Math.random() * 100 + 10).toFixed(2));

      await prisma.warehouseItem.create({
        data: {
          productName: product.name,
          sku: `SKU-${product.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
          description: `Warehouse stock of ${product.name}`,
          category: product.categoryId,
          quantity,
          unitCost,
          totalValue: quantity * unitCost,
          location: `Aisle ${Math.floor(Math.random() * 20) + 1}, Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
          batchNumber: `BATCH-${Math.floor(Math.random() * 1000)}`,
          reorderPoint: Math.floor(Math.random() * 20) + 5,
          maximumStock: Math.floor(Math.random() * 200) + 100,
          supplierId,
          lastReceivedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          barcode: `BAR-${Math.floor(Math.random() * 1000000)}`,
          weight: parseFloat((Math.random() * 10).toFixed(2)),
          dimensions: `${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10} cm`,
        },
      });
    }

    console.log('Created warehouse items');

    // Create inventory items
    for (const product of createdProducts) {
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          quantity: Math.floor(Math.random() * 50) + 10,
        },
      });
    }

    console.log('Created inventory items');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
