export type WarehouseStatus = 'active' | 'inactive';
export type InventoryStatus = 'active' | 'inactive';

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  status: WarehouseStatus;
  createdAt: string;
  updatedAt: string;
};

export type Inventory = {
  id: string;
  name: string;
  location: string;
  warehouseId: string; // The warehouse this inventory belongs to
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
};

export type WarehouseItem = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  supplierId: string;
  warehouseId: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  location?: {
    zone: string;
    rack: string;
    shelf: string;
    bin: string;
  };
  lastUpdated: string;
  createdAt: string;
  createdBy: string;
};

export type InventoryItem = {
  id: string;
  warehouseItemId: string; // Reference to the original warehouse item
  inventoryId: string;
  quantity: number;
  unitPrice: number; // Can be different from warehouse price
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  createdAt: string;
  createdBy: string;
};

export type InwardEntry = {
  id: string;
  warehouseId: string;
  itemId: string; // Reference to warehouse item
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId: string;
  referenceNumber?: string;
  invoiceNumber?: string;
  receivedDate: string;
  receivedBy: string;
  notes?: string;
  createdAt: string;
};

export type OutwardEntry = {
  id: string;
  warehouseId: string;
  inventoryId: string; // The inventory receiving the items
  itemId: string; // Reference to warehouse item
  quantity: number;
  unitPrice: number; // Price at which it's transferred to inventory
  totalPrice: number;
  referenceNumber?: string;
  transferDate: string;
  transferredBy: string;
  notes?: string;
  createdAt: string;
};

export type DamageEntry = {
  id: string;
  warehouseId: string;
  itemId: string; // Reference to warehouse item
  quantity: number;
  reason: string;
  reportedBy: string;
  reportedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  createdAt: string;
};

export type ClosingStock = {
  id: string;
  warehouseId: string;
  itemId: string; // Reference to warehouse item
  date: string; // Usually month end date
  openingQuantity: number;
  inwardQuantity: number;
  outwardQuantity: number;
  damageQuantity: number;
  adjustmentQuantity: number;
  closingQuantity: number;
  unitPrice: number;
  totalValue: number;
  createdAt: string;
  createdBy: string;
};

export type AuditEntry = {
  id: string;
  warehouseId: string;
  itemId: string; // Reference to warehouse item
  systemQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  auditedBy: string;
  auditDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
};
