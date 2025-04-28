/**
 * Mock data for offline mode
 * This file provides mock data for the application when the API server is not available
 */

import { format, subDays, subHours, subMinutes } from 'date-fns';

// Mock inventory items
export const mockInventoryItems = [
  {
    id: 'inv-1',
    name: 'Laptop - ThinkPad X1',
    sku: 'LP-TP-X1',
    category: 'Electronics',
    quantity: 25,
    minStockLevel: 10,
    location: 'Shelf A1',
    lastUpdated: subDays(new Date(), 2).toISOString()
  },
  {
    id: 'inv-2',
    name: 'Desk Chair - Ergonomic',
    sku: 'DC-ERG-01',
    category: 'Furniture',
    quantity: 15,
    minStockLevel: 5,
    location: 'Shelf B3',
    lastUpdated: subDays(new Date(), 5).toISOString()
  },
  {
    id: 'inv-3',
    name: 'Wireless Mouse',
    sku: 'ACC-WM-01',
    category: 'Accessories',
    quantity: 50,
    minStockLevel: 20,
    location: 'Shelf C2',
    lastUpdated: subDays(new Date(), 1).toISOString()
  },
  {
    id: 'inv-4',
    name: 'Monitor - 27" 4K',
    sku: 'MON-4K-27',
    category: 'Electronics',
    quantity: 8,
    minStockLevel: 10,
    location: 'Shelf A2',
    lastUpdated: subDays(new Date(), 3).toISOString()
  }
];

// Mock warehouse items
export const mockWarehouseItems = [
  {
    id: 'wh-1',
    name: 'Laptop - ThinkPad X1',
    sku: 'LP-TP-X1',
    category: 'Electronics',
    quantity: 50,
    minStockLevel: 20,
    location: 'Zone A, Rack 1',
    lastUpdated: subDays(new Date(), 1).toISOString()
  },
  {
    id: 'wh-2',
    name: 'Desk Chair - Ergonomic',
    sku: 'DC-ERG-01',
    category: 'Furniture',
    quantity: 30,
    minStockLevel: 10,
    location: 'Zone B, Rack 3',
    lastUpdated: subDays(new Date(), 3).toISOString()
  },
  {
    id: 'wh-3',
    name: 'Wireless Mouse',
    sku: 'ACC-WM-01',
    category: 'Accessories',
    quantity: 100,
    minStockLevel: 40,
    location: 'Zone C, Rack 2',
    lastUpdated: subDays(new Date(), 2).toISOString()
  },
  {
    id: 'wh-4',
    name: 'Monitor - 27" 4K',
    sku: 'MON-4K-27',
    category: 'Electronics',
    quantity: 20,
    minStockLevel: 15,
    location: 'Zone A, Rack 2',
    lastUpdated: subDays(new Date(), 4).toISOString()
  },
  {
    id: 'wh-5',
    name: 'Keyboard - Mechanical',
    sku: 'ACC-KB-01',
    category: 'Accessories',
    quantity: 45,
    minStockLevel: 20,
    location: 'Zone C, Rack 1',
    lastUpdated: subDays(new Date(), 1).toISOString()
  }
];

// Mock suppliers
export const mockSuppliers = [
  {
    id: 'sup-1',
    name: 'TechSource Inc.',
    email: 'orders@techsource.com',
    phone: '555-123-4567',
    address: '123 Tech Blvd, San Jose, CA 95123',
    contactPerson: 'John Smith',
    category: 'Electronics',
    status: 'active',
    createdAt: subDays(new Date(), 120).toISOString()
  },
  {
    id: 'sup-2',
    name: 'Office Furnish Pro',
    email: 'sales@officefurnish.com',
    phone: '555-987-6543',
    address: '456 Office Way, Chicago, IL 60601',
    contactPerson: 'Sarah Johnson',
    category: 'Furniture',
    status: 'active',
    createdAt: subDays(new Date(), 90).toISOString()
  },
  {
    id: 'sup-3',
    name: 'Accessory World',
    email: 'info@accessoryworld.com',
    phone: '555-456-7890',
    address: '789 Accessory Ave, New York, NY 10001',
    contactPerson: 'Michael Brown',
    category: 'Accessories',
    status: 'active',
    createdAt: subDays(new Date(), 60).toISOString()
  }
];

// Mock purchase orders
export const mockPurchaseOrders = [
  {
    id: 'po-1',
    supplierName: 'TechSource Inc.',
    supplierId: 'sup-1',
    status: 'delivered',
    totalAmount: 12500.00,
    items: [
      { name: 'Laptop - ThinkPad X1', quantity: 10, price: 1250.00 }
    ],
    createdAt: subDays(new Date(), 15).toISOString(),
    deliveryDate: subDays(new Date(), 5).toISOString()
  },
  {
    id: 'po-2',
    supplierName: 'Office Furnish Pro',
    supplierId: 'sup-2',
    status: 'pending',
    totalAmount: 3000.00,
    items: [
      { name: 'Desk Chair - Ergonomic', quantity: 20, price: 150.00 }
    ],
    createdAt: subDays(new Date(), 5).toISOString(),
    deliveryDate: subDays(new Date(), -5).toISOString() // Future date
  },
  {
    id: 'po-3',
    supplierName: 'Accessory World',
    supplierId: 'sup-3',
    status: 'processing',
    totalAmount: 1500.00,
    items: [
      { name: 'Wireless Mouse', quantity: 50, price: 30.00 }
    ],
    createdAt: subDays(new Date(), 3).toISOString(),
    deliveryDate: subDays(new Date(), -2).toISOString() // Future date
  }
];

// Mock activity logs
export const mockActivityLogs = [
  {
    id: 'act-1',
    userId: 'user-1',
    userName: 'Admin User',
    action: 'login',
    details: 'User logged in',
    entity: 'system',
    timestamp: subHours(new Date(), 1).toISOString()
  },
  {
    id: 'act-2',
    userId: 'user-1',
    userName: 'Admin User',
    action: 'create',
    details: 'Created purchase order PO-2023-001',
    entity: 'purchase_order',
    entityId: 'po-1',
    timestamp: subHours(new Date(), 5).toISOString()
  },
  {
    id: 'act-3',
    userId: 'user-2',
    userName: 'Warehouse Manager',
    action: 'update',
    details: 'Updated inventory item LP-TP-X1',
    entity: 'inventory',
    entityId: 'inv-1',
    timestamp: subHours(new Date(), 3).toISOString()
  },
  {
    id: 'act-4',
    userId: 'user-3',
    userName: 'Inventory Manager',
    action: 'transfer',
    details: 'Transferred 5 units of MON-4K-27 from warehouse to inventory',
    entity: 'transfer',
    timestamp: subHours(new Date(), 2).toISOString()
  },
  {
    id: 'act-5',
    userId: 'user-1',
    userName: 'Admin User',
    action: 'approve',
    details: 'Approved damage report DR-2023-002',
    entity: 'damage_report',
    entityId: 'dr-2',
    timestamp: subMinutes(new Date(), 30).toISOString()
  }
];

// Mock alerts
export const mockAlerts = [
  {
    id: 'alert-1',
    type: 'low_stock',
    severity: 'high',
    message: 'Monitor - 27" 4K is below minimum stock level',
    itemId: 'inv-4',
    createdAt: subHours(new Date(), 6).toISOString()
  },
  {
    id: 'alert-2',
    type: 'pending_delivery',
    severity: 'medium',
    message: 'Purchase order PO-2023-002 delivery due in 5 days',
    poId: 'po-2',
    createdAt: subHours(new Date(), 12).toISOString()
  },
  {
    id: 'alert-3',
    type: 'damage_report',
    severity: 'medium',
    message: 'New damage report DR-2023-003 requires approval',
    reportId: 'dr-3',
    createdAt: subDays(new Date(), 1).toISOString()
  }
];

// Mock employee activities
export const mockEmployeeActivities = [
  {
    id: 'emp-act-1',
    employeeId: 'user-2',
    employeeName: 'Warehouse Manager',
    action: 'inward',
    details: 'Received 20 units of Laptop - ThinkPad X1 from supplier TechSource Inc.',
    timestamp: subDays(new Date(), 2).toISOString()
  },
  {
    id: 'emp-act-2',
    employeeId: 'user-3',
    employeeName: 'Inventory Manager',
    action: 'outward',
    details: 'Transferred 5 units of Wireless Mouse to Inventory A',
    timestamp: subDays(new Date(), 1).toISOString()
  },
  {
    id: 'emp-act-3',
    employeeId: 'user-2',
    employeeName: 'Warehouse Manager',
    action: 'damage',
    details: 'Reported 2 units of Monitor - 27" 4K as damaged',
    timestamp: subHours(new Date(), 10).toISOString()
  }
];

// Mock dashboard stats
export const mockDashboardStats = {
  totalInventory: mockInventoryItems.reduce((sum, item) => sum + item.quantity, 0),
  warehouseItems: mockWarehouseItems.length,
  activeSuppliers: mockSuppliers.filter(s => s.status === 'active').length,
  pendingOrders: mockPurchaseOrders.filter(po => po.status === 'pending').length
};

// Mock function to simulate API response delay
export const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const mockApiService = {
  // Inventory
  getInventoryItems: async () => {
    await mockDelay();
    return { data: mockInventoryItems };
  },
  
  // Warehouse
  getWarehouseItems: async () => {
    await mockDelay();
    return { data: mockWarehouseItems };
  },
  
  // Suppliers
  getSuppliers: async () => {
    await mockDelay();
    return { data: mockSuppliers };
  },
  
  // Purchase Orders
  getPurchaseOrders: async () => {
    await mockDelay();
    return { data: mockPurchaseOrders };
  },
  
  // Activity Logs
  getActivityLogs: async () => {
    await mockDelay();
    return { data: mockActivityLogs };
  },
  
  // Alerts
  getAlerts: async () => {
    await mockDelay();
    return { data: mockAlerts };
  },
  
  // Employee Activities
  getEmployeeActivities: async () => {
    await mockDelay();
    return { data: mockEmployeeActivities };
  },
  
  // Dashboard Stats
  getDashboardStats: async () => {
    await mockDelay();
    return { data: mockDashboardStats };
  }
};
