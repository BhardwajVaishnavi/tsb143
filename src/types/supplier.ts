export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  taxId?: string;
  registrationNumber?: string;
  paymentTerms?: string;
  preferredCurrency?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankSwiftCode?: string;
  rating?: number;
  notes?: string;
  status: SupplierStatus;
  category?: string;
  subCategory?: string;
  industryType?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  yearEstablished?: number;
  companySize?: string;
  annualRevenue?: number;
  certifications?: string[];
  leadTime?: number;
  minimumOrderValue?: number;
  discountRate?: number;
  creditLimit?: number;
  creditTerms?: string;
  returnPolicy?: string;
  qualityRating?: number;
  deliveryRating?: number;
  pricingRating?: number;
  communicationRating?: number;
  onTimeDeliveryRate?: number;
  defectRate?: number;
  lastPerformanceReview?: string;
  preferredShippingMethod?: string;
  shippingTerms?: string;
  customsInfo?: string;
  importRestrictions?: string;
  sustainabilityScore?: number;
  environmentalCertifications?: string[];
  logoUrl?: string;
  attachments?: Record<string, string>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    warehouseItems: number;
    purchaseOrders: number;
    contracts: number;
    contacts: number;
    documents: number;
  };
}

export interface SupplierWithRelations extends Supplier {
  contacts?: SupplierContact[];
  documents?: SupplierDocument[];
  performanceHistory?: SupplierPerformance[];
  contracts?: SupplierContract[];
  purchaseOrders?: PurchaseOrder[];
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
  notes?: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierDocument {
  id: string;
  supplierId: string;
  documentType: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  expiryDate?: string;
  issuedDate?: string;
  issuedBy?: string;
  documentNumber?: string;
  status: string;
  tags?: string[];
  uploadedById?: string;
  uploadedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPerformance {
  id: string;
  supplierId: string;
  reviewDate: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  qualityScore: number;
  deliveryScore: number;
  pricingScore: number;
  communicationScore: number;
  overallScore: number;
  onTimeDeliveryRate?: number;
  defectRate?: number;
  responseTime?: number;
  orderAccuracyRate?: number;
  strengths?: string;
  weaknesses?: string;
  improvementPlan?: string;
  reviewedById?: string;
  reviewedByName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierContract {
  id: string;
  contractNumber: string;
  supplierId: string;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  terms?: string;
  attachmentUrl?: string;
  autoRenew: boolean;
  renewalReminder: boolean;
  reminderDays: number;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDelivery?: string;
  deliveryDate?: string;
  totalAmount: number;
  currency: string;
  paymentTerms?: string;
  shippingMethod?: string;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  createdById: string;
  approvedById?: string;
  approvalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLACKLISTED';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING_RENEWAL';
export type PurchaseOrderStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'APPROVED' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'PARTIALLY_RECEIVED' 
  | 'COMPLETED';
