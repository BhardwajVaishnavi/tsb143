export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

export type InventoryLocation = {
  id: string;
  name: string;
  type: 'warehouse' | 'inventory';
  description?: string;
};

export type InventoryItem = {
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
  status: InventoryStatus;
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

export type InwardEntry = {
  id: string;
  itemId: string;
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
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  destinationId?: string;
  destinationType?: 'customer' | 'inventory' | 'other';
  referenceNumber?: string;
  issuedDate: string;
  issuedBy: string;
  notes?: string;
  createdAt: string;
};

export type DamageEntry = {
  id: string;
  itemId: string;
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

export type StockAdjustment = {
  id: string;
  itemId: string;
  previousQuantity: number;
  newQuantity: number;
  adjustmentQuantity: number; // Can be positive (addition) or negative (reduction)
  reason: string;
  adjustmentType: 'audit' | 'damage' | 'correction' | 'other';
  adjustedBy: string;
  adjustedDate: string;
  notes?: string;
  createdAt: string;
};

export type ClosingStock = {
  id: string;
  itemId: string;
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
  itemId: string;
  systemQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  auditedBy: string;
  auditDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
};
