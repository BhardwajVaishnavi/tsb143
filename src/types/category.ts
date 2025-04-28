export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  productCount?: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;
}
