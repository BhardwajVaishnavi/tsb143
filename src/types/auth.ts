export type UserRole = 'admin' | 'warehouse_manager' | 'inventory_manager' | 'supplier_manager' | 'viewer' | 'custom';

export interface Permission {
  module: string;
  action: string;
  resource: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[] | string[];
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthAction {
  type: string;
  payload?: any;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  entityType: 'product' | 'category' | 'transfer' | 'inventory' | 'warehouse' | 'user' | 'system' | 'permission_template';
  entityId?: string;
}
