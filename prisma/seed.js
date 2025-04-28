const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');

    // Create users
    console.log('Creating users...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const warehouseManager = await prisma.user.upsert({
      where: { email: 'warehouse@example.com' },
      update: {},
      create: {
        name: 'Warehouse Manager',
        email: 'warehouse@example.com',
        password: await bcrypt.hash('warehouse123', 10),
        role: 'WAREHOUSE_MANAGER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const inventoryManager = await prisma.user.upsert({
      where: { email: 'inventory@example.com' },
      update: {},
      create: {
        name: 'Inventory Manager',
        email: 'inventory@example.com',
        password: await bcrypt.hash('inventory123', 10),
        role: 'INVENTORY_MANAGER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create locations
    console.log('Creating locations...');
    const mainWarehouse = await prisma.location.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'Main Warehouse',
        type: 'warehouse',
        address: '123 Warehouse St, Anytown, USA',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'USA',
        contactName: 'Warehouse Manager',
        contactPhone: '123-456-7890',
        contactEmail: 'warehouse@example.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const mainStore = await prisma.location.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Main Store',
        type: 'inventory',
        address: '456 Store St, Anytown, USA',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'USA',
        contactName: 'Store Manager',
        contactPhone: '234-567-8901',
        contactEmail: 'store@example.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create categories
    console.log('Creating categories...');
    const electronicsCategory = await prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: {
        name: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const clothingCategory = await prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: {
        name: 'Clothing',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const homeCategory = await prisma.category.upsert({
      where: { name: 'Home & Kitchen' },
      update: {},
      create: {
        name: 'Home & Kitchen',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create suppliers
    console.log('Creating suppliers...');
    const techSupplier = await prisma.supplier.upsert({
      where: { email: 'tech@supplier.com' },
      update: {},
      create: {
        name: 'Tech Supplies Inc.',
        email: 'tech@supplier.com',
        phone: '123-456-7890',
        address: '123 Tech St, San Francisco, CA',
        contactPerson: 'John Smith',
        status: 'ACTIVE',
        category: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const fashionSupplier = await prisma.supplier.upsert({
      where: { email: 'fashion@supplier.com' },
      update: {},
      create: {
        name: 'Fashion Wholesale',
        email: 'fashion@supplier.com',
        phone: '234-567-8901',
        address: '456 Fashion Ave, New York, NY',
        contactPerson: 'Jane Doe',
        status: 'ACTIVE',
        category: 'Clothing',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const homeSupplier = await prisma.supplier.upsert({
      where: { email: 'home@supplier.com' },
      update: {},
      create: {
        name: 'Home Goods Distributors',
        email: 'home@supplier.com',
        phone: '345-678-9012',
        address: '789 Home Blvd, Chicago, IL',
        contactPerson: 'Bob Johnson',
        status: 'ACTIVE',
        category: 'Home & Kitchen',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create products
    console.log('Creating products...');
    const smartphone = await prisma.product.upsert({
      where: { name: 'Smartphone Model X' },
      update: {},
      create: {
        name: 'Smartphone Model X',
        description: 'Latest smartphone with advanced features',
        price: 59999.00, // ₹59,999
        categoryId: electronicsCategory.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const laptop = await prisma.product.upsert({
      where: { name: 'Laptop Pro' },
      update: {},
      create: {
        name: 'Laptop Pro',
        description: 'High-performance laptop for professionals',
        price: 89999.00, // ₹89,999
        categoryId: electronicsCategory.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const tshirt = await prisma.product.upsert({
      where: { name: 'Premium T-Shirt' },
      update: {},
      create: {
        name: 'Premium T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 1499.00, // ₹1,499
        categoryId: clothingCategory.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const blender = await prisma.product.upsert({
      where: { name: 'High-Speed Blender' },
      update: {},
      create: {
        name: 'High-Speed Blender',
        description: 'Powerful blender for smoothies and more',
        price: 5999.00, // ₹5,999
        categoryId: homeCategory.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create warehouse items
    console.log('Creating warehouse items...');
    const smartphoneItem = await prisma.warehouseItem.upsert({
      where: { sku: 'TECH-001' },
      update: {},
      create: {
        sku: 'TECH-001',
        productName: 'Smartphone Model X',
        description: 'Latest smartphone with advanced features',
        category: 'Electronics',
        quantity: 100,
        unitCost: 45000, // ₹45,000
        totalValue: 4500000, // ₹45,00,000
        location: 'Aisle A, Shelf 1',
        reorderPoint: 20,
        maximumStock: 150,
        supplierId: techSupplier.id,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const laptopItem = await prisma.warehouseItem.upsert({
      where: { sku: 'TECH-002' },
      update: {},
      create: {
        sku: 'TECH-002',
        productName: 'Laptop Pro',
        description: 'High-performance laptop for professionals',
        category: 'Electronics',
        quantity: 50,
        unitCost: 70000, // ₹70,000
        totalValue: 3500000, // ₹35,00,000
        location: 'Aisle A, Shelf 2',
        reorderPoint: 10,
        maximumStock: 75,
        supplierId: techSupplier.id,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const tshirtItem = await prisma.warehouseItem.upsert({
      where: { sku: 'CLOTH-001' },
      update: {},
      create: {
        sku: 'CLOTH-001',
        productName: 'Premium T-Shirt',
        description: 'Comfortable cotton t-shirt',
        category: 'Clothing',
        quantity: 200,
        unitCost: 1000, // ₹1,000
        totalValue: 200000, // ₹2,00,000
        location: 'Aisle B, Shelf 1',
        reorderPoint: 50,
        maximumStock: 300,
        supplierId: fashionSupplier.id,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const blenderItem = await prisma.warehouseItem.upsert({
      where: { sku: 'HOME-001' },
      update: {},
      create: {
        sku: 'HOME-001',
        productName: 'High-Speed Blender',
        description: 'Powerful blender for smoothies and more',
        category: 'Home & Kitchen',
        quantity: 75,
        unitCost: 4000, // ₹4,000
        totalValue: 300000, // ₹3,00,000
        location: 'Aisle C, Shelf 1',
        reorderPoint: 15,
        maximumStock: 100,
        supplierId: homeSupplier.id,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create inventory items
    console.log('Creating inventory items...');
    const smartphoneInventory = await prisma.inventoryItem.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        productId: smartphone.id,
        locationId: '1', // Default location
        quantity: 50,
        unitPrice: 54999.00, // ₹54,999
        createdById: adminUser.id,
        updatedById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const laptopInventory = await prisma.inventoryItem.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        productId: laptop.id,
        locationId: '1', // Default location
        quantity: 25,
        unitPrice: 89999.00, // ₹89,999
        createdById: adminUser.id,
        updatedById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const tshirtInventory = await prisma.inventoryItem.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        productId: tshirt.id,
        locationId: '1', // Default location
        quantity: 100,
        unitPrice: 1299.00, // ₹1,299
        createdById: adminUser.id,
        updatedById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const blenderInventory = await prisma.inventoryItem.upsert({
      where: { id: '4' },
      update: {},
      create: {
        id: '4',
        productId: blender.id,
        locationId: '1', // Default location
        quantity: 30,
        unitPrice: 4999.00, // ₹4,999
        createdById: adminUser.id,
        updatedById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create transfers
    console.log('Creating transfers...');
    // Create transfers one by one instead of using createMany
    const transfersData = [
        {
          sourceLocationId: mainWarehouse.id,
          destinationLocationId: mainStore.id,
          warehouseItemId: smartphoneItem.id,
          inventoryItemId: smartphoneInventory.id,
          quantity: 10,
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          notes: 'Regular transfer to inventory',
          status: 'completed',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          sourceLocationId: mainWarehouse.id,
          destinationLocationId: mainStore.id,
          warehouseItemId: laptopItem.id,
          inventoryItemId: laptopInventory.id,
          quantity: 5,
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          notes: 'Urgent transfer for online orders',
          status: 'completed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          sourceLocationId: mainWarehouse.id,
          destinationLocationId: mainStore.id,
          warehouseItemId: tshirtItem.id,
          inventoryItemId: tshirtInventory.id,
          quantity: 20,
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          notes: 'Seasonal stock transfer',
          status: 'completed',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          sourceLocationId: mainWarehouse.id,
          destinationLocationId: mainStore.id,
          warehouseItemId: blenderItem.id,
          inventoryItemId: blenderInventory.id,
          quantity: 8,
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Promotional stock transfer',
          status: 'completed',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];

    // Create each transfer individually
    for (const transferData of transfersData) {
      await prisma.transfer.create({
        data: transferData
      });
    }

    // Create purchase orders
    console.log('Creating purchase orders...');
    // Check if purchase orders already exist
    const existingPO1 = await prisma.purchaseOrder.findUnique({
      where: { orderNumber: 'PO-2023-001' }
    });

    const po1 = existingPO1 || await prisma.purchaseOrder.create({
      data: {
        orderNumber: 'PO-2023-001',
        supplierId: techSupplier.id,
        status: 'COMPLETED',
        orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        expectedDelivery: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        deliveryDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
        totalAmount: 4500000, // ₹45,00,000
        createdById: adminUser.id,
        approvedById: adminUser.id,
        approvalDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productName: 'Smartphone Model X',
              description: 'Latest smartphone with advanced features',
              quantity: 50,
              unitPrice: 45000, // ₹45,000
              totalPrice: 2250000, // ₹22,50,000
              receivedQuantity: 50,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
            },
            {
              productName: 'Laptop Pro',
              description: 'High-performance laptop for professionals',
              quantity: 35,
              unitPrice: 70000, // ₹70,000
              totalPrice: 2450000, // ₹24,50,000
              receivedQuantity: 35,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      }
    });

    const existingPO2 = await prisma.purchaseOrder.findUnique({
      where: { orderNumber: 'PO-2023-002' }
    });

    const po2 = existingPO2 || await prisma.purchaseOrder.create({
      data: {
        orderNumber: 'PO-2023-002',
        supplierId: fashionSupplier.id,
        status: 'DELIVERED',
        orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        expectedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        totalAmount: 200000, // ₹2,00,000
        createdById: warehouseManager.id,
        approvedById: adminUser.id,
        approvalDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productName: 'Premium T-Shirt',
              description: 'Comfortable cotton t-shirt',
              quantity: 200,
              unitPrice: 1000, // ₹1,000
              totalPrice: 200000, // ₹2,00,000
              receivedQuantity: 200,
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      }
    });

    const existingPO3 = await prisma.purchaseOrder.findUnique({
      where: { orderNumber: 'PO-2023-003' }
    });

    const po3 = existingPO3 || await prisma.purchaseOrder.create({
      data: {
        orderNumber: 'PO-2023-003',
        supplierId: homeSupplier.id,
        status: 'PENDING',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        totalAmount: 300000, // ₹3,00,000
        createdById: warehouseManager.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productName: 'High-Speed Blender',
              description: 'Powerful blender for smoothies and more',
              quantity: 75,
              unitPrice: 4000, // ₹4,000
              totalPrice: 300000, // ₹3,00,000
              receivedQuantity: 0,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      }
    });

    // Create inward entries
    console.log('Creating inward entries...');
    // Create inward entries one by one instead of using createMany
    const inwardEntriesData = [
        {
          warehouseId: 'wh-1',
          itemId: smartphoneItem.id,
          supplierId: techSupplier.id,
          quantity: 50,
          unitCost: 45000, // ₹45,000
          totalCost: 2250000, // ₹22,50,000
          receivedById: warehouseManager.id,
          receivedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
          batchNumber: 'BATCH-001',
          invoiceNumber: 'INV-001',
          notes: 'Initial stock',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          status: 'received'
        },
        {
          warehouseId: 'wh-1',
          itemId: laptopItem.id,
          supplierId: techSupplier.id,
          quantity: 30,
          unitCost: 70000, // ₹70,000
          totalCost: 2100000, // ₹21,00,000
          receivedById: warehouseManager.id,
          receivedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
          batchNumber: 'BATCH-002',
          invoiceNumber: 'INV-002',
          notes: 'Regular order',
          createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          status: 'received'
        },
        {
          warehouseId: 'wh-1',
          itemId: tshirtItem.id,
          supplierId: fashionSupplier.id,
          quantity: 150,
          unitCost: 1000, // ₹1,000
          totalCost: 150000, // ₹1,50,000
          receivedById: warehouseManager.id,
          receivedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          batchNumber: 'BATCH-003',
          invoiceNumber: 'INV-003',
          notes: 'Seasonal stock',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          status: 'received'
        },
        {
          warehouseId: 'wh-1',
          itemId: blenderItem.id,
          supplierId: homeSupplier.id,
          quantity: 50,
          unitCost: 4000, // ₹4,000
          totalCost: 200000, // ₹2,00,000
          receivedById: warehouseManager.id,
          receivedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          batchNumber: 'BATCH-004',
          invoiceNumber: 'INV-004',
          notes: 'New model',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: 'received'
        },
        {
          warehouseId: 'wh-1',
          itemId: smartphoneItem.id,
          supplierId: techSupplier.id,
          quantity: 25,
          unitCost: 45000, // ₹45,000
          totalCost: 1125000, // ₹11,25,000
          receivedById: warehouseManager.id,
          receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          batchNumber: 'BATCH-005',
          invoiceNumber: 'INV-005',
          notes: 'Restock',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'received'
        }
      ];

    // Create each inward entry individually
    for (const inwardEntryData of inwardEntriesData) {
      await prisma.inwardEntry.create({
        data: inwardEntryData
      });
    }

    // Create outward entries
    console.log('Creating outward entries...');
    // Create outward entries one by one instead of using createMany
    const outwardEntriesData = [
        {
          warehouseId: 'wh-1',
          itemId: smartphoneItem.id,
          quantity: 15,
          destination: 'Main Store',
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          status: 'completed',
          notes: 'Regular transfer',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: laptopItem.id,
          quantity: 10,
          destination: 'Online Store',
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
          status: 'completed',
          notes: 'Online promotion',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: tshirtItem.id,
          quantity: 50,
          destination: 'Branch Store',
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
          status: 'completed',
          notes: 'Branch opening',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: blenderItem.id,
          quantity: 15,
          destination: 'Main Store',
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          status: 'completed',
          notes: 'Regular transfer',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: smartphoneItem.id,
          quantity: 10,
          destination: 'Online Store',
          transferredById: warehouseManager.id,
          transferDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          status: 'pending',
          notes: 'Pending shipment',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ];

    // Create each outward entry individually
    for (const outwardEntryData of outwardEntriesData) {
      await prisma.outwardEntry.create({
        data: outwardEntryData
      });
    }

    // Create damage entries
    console.log('Creating damage entries...');
    // Create damage entries one by one instead of using createMany
    const damageEntriesData = [
        {
          warehouseId: 'wh-1',
          itemId: smartphoneItem.id,
          quantity: 3,
          reason: 'Damaged during handling',
          reportedById: warehouseManager.id,
          reportedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          status: 'approved',
          approvedById: adminUser.id,
          approvedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
          notes: 'Dropped during inventory check',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: laptopItem.id,
          quantity: 2,
          reason: 'Manufacturing defect',
          reportedById: warehouseManager.id,
          reportedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          status: 'approved',
          approvedById: adminUser.id,
          approvedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          notes: 'Screen defect',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: tshirtItem.id,
          quantity: 5,
          reason: 'Water damage',
          reportedById: warehouseManager.id,
          reportedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          status: 'approved',
          approvedById: adminUser.id,
          approvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          notes: 'Roof leak',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: blenderItem.id,
          quantity: 1,
          reason: 'Broken during testing',
          reportedById: warehouseManager.id,
          reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          status: 'pending',
          notes: 'Motor failure during quality check',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: smartphoneItem.id,
          quantity: 2,
          reason: 'Packaging damage',
          reportedById: warehouseManager.id,
          reportedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          status: 'pending',
          notes: 'Crushed box',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];

    // Create each damage entry individually
    for (const damageEntryData of damageEntriesData) {
      await prisma.damageEntry.create({
        data: damageEntryData
      });
    }

    // Create closing stock entries
    console.log('Creating closing stock entries...');
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0, 23, 59, 59);
    // Create closing stock entries one by one instead of using createMany
    const closingStockEntriesData = [
        {
          warehouseId: 'wh-1',
          itemId: smartphoneItem.id,
          date: lastMonthEnd,
          openingQuantity: 80,
          inwardQuantity: 75,
          outwardQuantity: 25,
          damageQuantity: 5,
          adjustmentQuantity: 0,
          closingQuantity: 125,
          unitPrice: 45000, // ₹45,000
          totalValue: 5625000, // ₹56,25,000
          createdById: adminUser.id,
          createdAt: new Date(lastMonthEnd.getTime() + 1000), // Just after month end
          updatedAt: new Date(lastMonthEnd.getTime() + 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: laptopItem.id,
          date: lastMonthEnd,
          openingQuantity: 40,
          inwardQuantity: 30,
          outwardQuantity: 10,
          damageQuantity: 2,
          adjustmentQuantity: 0,
          closingQuantity: 58,
          unitPrice: 70000, // ₹70,000
          totalValue: 4060000, // ₹40,60,000
          createdById: adminUser.id,
          createdAt: new Date(lastMonthEnd.getTime() + 1000),
          updatedAt: new Date(lastMonthEnd.getTime() + 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: tshirtItem.id,
          date: lastMonthEnd,
          openingQuantity: 150,
          inwardQuantity: 150,
          outwardQuantity: 50,
          damageQuantity: 5,
          adjustmentQuantity: 0,
          closingQuantity: 245,
          unitPrice: 1000, // ₹1,000
          totalValue: 245000, // ₹2,45,000
          createdById: adminUser.id,
          createdAt: new Date(lastMonthEnd.getTime() + 1000),
          updatedAt: new Date(lastMonthEnd.getTime() + 1000)
        },
        {
          warehouseId: 'wh-1',
          itemId: blenderItem.id,
          date: lastMonthEnd,
          openingQuantity: 60,
          inwardQuantity: 50,
          outwardQuantity: 15,
          damageQuantity: 1,
          adjustmentQuantity: 0,
          closingQuantity: 94,
          unitPrice: 4000, // ₹4,000
          totalValue: 376000, // ₹3,76,000
          createdById: adminUser.id,
          createdAt: new Date(lastMonthEnd.getTime() + 1000),
          updatedAt: new Date(lastMonthEnd.getTime() + 1000)
        }
      ];

    // Create each closing stock entry individually
    for (const closingStockEntryData of closingStockEntriesData) {
      await prisma.closingStock.upsert({
        where: {
          itemId_date: {
            itemId: closingStockEntryData.itemId,
            date: closingStockEntryData.date
          }
        },
        update: closingStockEntryData,
        create: closingStockEntryData
      });
    }

    // Create audit logs
    console.log('Creating audit logs...');
    // Create audit logs one by one instead of using createMany
    const auditLogsData = [
        {
          userId: adminUser.id,
          action: 'CREATE',
          entity: 'PurchaseOrder',
          entityId: po1.id,
          details: 'Created purchase order PO-2023-001',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          userId: adminUser.id,
          action: 'APPROVE',
          entity: 'PurchaseOrder',
          entityId: po1.id,
          details: 'Approved purchase order PO-2023-001',
          createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
        },
        {
          userId: warehouseManager.id,
          action: 'RECEIVE',
          entity: 'PurchaseOrder',
          entityId: po1.id,
          details: 'Received items for purchase order PO-2023-001',
          createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
        },
        {
          userId: warehouseManager.id,
          action: 'CREATE',
          entity: 'PurchaseOrder',
          entityId: po2.id,
          details: 'Created purchase order PO-2023-002',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          userId: adminUser.id,
          action: 'APPROVE',
          entity: 'PurchaseOrder',
          entityId: po2.id,
          details: 'Approved purchase order PO-2023-002',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        },
        {
          userId: warehouseManager.id,
          action: 'RECEIVE',
          entity: 'PurchaseOrder',
          entityId: po2.id,
          details: 'Received items for purchase order PO-2023-002',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          userId: warehouseManager.id,
          action: 'CREATE',
          entity: 'PurchaseOrder',
          entityId: po3.id,
          details: 'Created purchase order PO-2023-003',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          userId: warehouseManager.id,
          action: 'TRANSFER',
          entity: 'Inventory',
          entityId: smartphoneInventory.id,
          details: 'Transferred 10 Smartphone Model X from warehouse to inventory',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          userId: warehouseManager.id,
          action: 'TRANSFER',
          entity: 'Inventory',
          entityId: laptopInventory.id,
          details: 'Transferred 5 Laptop Pro from warehouse to inventory',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          userId: inventoryManager.id,
          action: 'TRANSFER',
          entity: 'Inventory',
          entityId: tshirtInventory.id,
          details: 'Transferred 20 Premium T-Shirt from warehouse to inventory',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          userId: inventoryManager.id,
          action: 'TRANSFER',
          entity: 'Inventory',
          entityId: blenderInventory.id,
          details: 'Transferred 8 High-Speed Blender from warehouse to inventory',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];

    // Create each audit log individually
    for (const auditLogData of auditLogsData) {
      await prisma.auditLog.create({
        data: auditLogData
      });
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
