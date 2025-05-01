/**
 * Utility functions for making API requests
 */
import { NeonDB } from './neondb';

// Flag to indicate if we're in offline mode
let isOfflineMode = false;

// Get the authentication token from localStorage
const getAuthToken = (): string | null => {
  const user = localStorage.getItem('user');
  if (!user) {
    console.log('No user found in localStorage');
    return null;
  }

  try {
    const userData = JSON.parse(user);
    if (!userData.token) {
      console.log('No token found in user data');
      return null;
    }
    console.log('Token found in localStorage:', userData.token.substring(0, 10) + '...');
    return userData.token;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Base fetch function with authentication
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  // Use the API server URL for API requests
  const apiBaseUrl = 'http://localhost:5001';
  const fullUrl = url.startsWith('/') ? `${apiBaseUrl}${url}` : `${apiBaseUrl}/${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include' // Include cookies for authentication
    });

    // If we successfully connected, reset offline mode flag
    if (isOfflineMode) {
      console.log('Connection restored, exiting offline mode');
      isOfflineMode = false;
    }

    return response;
  } catch (error) {
    // If we couldn't connect, set offline mode flag
    if (!isOfflineMode) {
      console.log('Connection failed, entering offline mode');
      isOfflineMode = true;
    }

    // Create a mock response
    const mockResponse = new Response(JSON.stringify({ message: 'Offline mode active' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

    // Make the mock response not ok so the caller knows to use mock data
    Object.defineProperty(mockResponse, 'ok', { value: false });

    return mockResponse;
  }
};

// Authentication error class
export class AuthError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

// GET request
export const get = async <T>(url: string): Promise<T> => {
  const token = getAuthToken();
  if (!token && !url.includes('/api/auth/login')) {
    throw new AuthError();
  }

  try {
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      // If we're in offline mode, use mock data
      if (isOfflineMode) {
        console.log(`Using mock data for GET ${url}`);
        return await getMockData(url);
      }

      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        throw new AuthError('Session expired. Please log in again.');
      }

      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // If there's any error, try to use mock data
    console.log(`Error in GET ${url}, using mock data:`, error);
    return await getMockData(url);
  }
};

// POST request
export const post = async <T>(url: string, data: any): Promise<T> => {
  const token = getAuthToken();
  if (!token && !url.includes('/api/auth/login')) {
    throw new AuthError();
  }

  try {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      // If we're in offline mode, use mock data
      if (isOfflineMode) {
        console.log(`Using mock data for POST ${url}`);
        return await getMockData(url, data);
      }

      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        throw new AuthError('Session expired. Please log in again.');
      }

      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // If there's any error, try to use mock data
    console.log(`Error in POST ${url}, using mock data:`, error);
    return await getMockData(url, data);
  }
};

// PUT request
export const put = async <T>(url: string, data: any): Promise<T> => {
  const token = getAuthToken();
  if (!token) {
    throw new AuthError();
  }

  try {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      // If we're in offline mode, use mock data
      if (isOfflineMode) {
        console.log(`Using mock data for PUT ${url}`);
        return await getMockData(url, data);
      }

      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        throw new AuthError('Session expired. Please log in again.');
      }

      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // If there's any error, try to use mock data
    console.log(`Error in PUT ${url}, using mock data:`, error);
    return await getMockData(url, data);
  }
};

// DELETE request
export const del = async <T>(url: string): Promise<T> => {
  const token = getAuthToken();
  if (!token) {
    throw new AuthError();
  }

  try {
    const response = await fetchWithAuth(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      // If we're in offline mode, use mock data
      if (isOfflineMode) {
        console.log(`Using mock data for DELETE ${url}`);
        return await getMockData(url);
      }

      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        throw new AuthError('Session expired. Please log in again.');
      }

      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // If there's any error, try to use mock data
    console.log(`Error in DELETE ${url}, using mock data:`, error);
    return await getMockData(url);
  }
};

// Upload file with authentication
export const uploadFile = async (file: File, type: string = 'product-image'): Promise<any> => {
  const token = getAuthToken();
  if (!token) {
    throw new AuthError('Authentication required');
  }

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`/api/upload/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      // If we're in offline mode, return a mock response
      if (isOfflineMode) {
        console.log(`Using mock data for file upload ${type}`);
        return { url: URL.createObjectURL(file), success: true };
      }

      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // If there's any error, return a mock response
    console.log(`Error in file upload ${type}, using mock data:`, error);
    return { url: URL.createObjectURL(file), success: true };
  }
};

// Helper function to get data from NeonDB or fallback to mock data
const getMockData = async (url: string, _data?: any): Promise<any> => {
  // Extract the endpoint from the URL
  const endpoint = url.split('/').slice(2).join('/');

  try {
    // Try to get data from NeonDB first
    if (endpoint.includes('inventory/items')) {
      return await NeonDB.inventory.getItems();
    }

    if (endpoint.includes('warehouse/items')) {
      return await NeonDB.warehouse.getItems();
    }

    if (endpoint === 'suppliers') {
      return await NeonDB.suppliers.getAll();
    }

    if (endpoint === 'purchase-orders') {
      return await NeonDB.purchaseOrders.getAll();
    }

    if (endpoint.includes('audit/logs')) {
      return await NeonDB.auditLogs.getAll();
    }

    if (endpoint.includes('warehouse/damage')) {
      return await NeonDB.warehouse.getDamageRecords();
    }

    if (endpoint.includes('products/categories')) {
      return await NeonDB.categories.getAll();
    }

    // Auth endpoints
    if (endpoint === 'auth/me') {
      return {
        id: 'user-1',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'ADMIN', // Ensure role is uppercase for consistency
        status: 'active',
        permissions: [{ module: '*', action: '*', resource: '*' }],
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: '2023-06-14T09:15:00Z'
      };
    }

    // Default: return empty data
    return { data: [] };
  } catch (error) {
    console.error('Error fetching data from NeonDB:', error);
    console.log('Falling back to mock data for:', endpoint);

    // Fallback to mock data from mock-data.ts
    const { getMockData: getMockDataFallback } = await import('./mock-data');
    return getMockDataFallback(url);
  }
};

// API endpoints
export const API = {
  auth: {
    login: (data: { email: string; password: string }) => post('/api/auth/login', data),
    me: () => get('/api/auth/me')
  },
  users: {
    getAll: () => get('/api/users'),
    getById: (id: string) => get(`/api/users/${id}`),
    create: (data: any) => post('/api/users', data),
    update: (id: string, data: any) => put(`/api/users/${id}`, data),
    delete: (id: string) => del(`/api/users/${id}`)
  },
  suppliers: {
    getAll: () => get('/api/suppliers'),
    getById: (id: string) => get(`/api/suppliers/${id}`),
    create: (data: any) => post('/api/suppliers', data),
    update: (id: string, data: any) => put(`/api/suppliers/${id}`, data),
    delete: (id: string) => del(`/api/suppliers/${id}`),
    // Contacts
    getContacts: (supplierId: string) => get(`/api/suppliers/${supplierId}/contacts`),
    createContact: (supplierId: string, data: any) => post(`/api/suppliers/${supplierId}/contacts`, data),
    updateContact: (supplierId: string, contactId: string, data: any) => put(`/api/suppliers/${supplierId}/contacts/${contactId}`, data),
    deleteContact: (supplierId: string, contactId: string) => del(`/api/suppliers/${supplierId}/contacts/${contactId}`),
    // Documents
    getDocuments: (supplierId: string) => get(`/api/suppliers/${supplierId}/documents`),
    createDocument: (supplierId: string, data: any) => post(`/api/suppliers/${supplierId}/documents`, data),
    updateDocument: (supplierId: string, documentId: string, data: any) => put(`/api/suppliers/${supplierId}/documents/${documentId}`, data),
    deleteDocument: (supplierId: string, documentId: string) => del(`/api/suppliers/${supplierId}/documents/${documentId}`),
    // Performance
    getPerformance: (supplierId: string) => get(`/api/suppliers/${supplierId}/performance`),
    createPerformance: (supplierId: string, data: any) => post(`/api/suppliers/${supplierId}/performance`, data),
    updatePerformance: (supplierId: string, performanceId: string, data: any) => put(`/api/suppliers/${supplierId}/performance/${performanceId}`, data),
    deletePerformance: (supplierId: string, performanceId: string) => del(`/api/suppliers/${supplierId}/performance/${performanceId}`)
  },
  warehouse: {
    // Items
    getItems: () => get('/api/warehouse/items'),
    getItemById: (id: string) => get(`/api/warehouse/items/${id}`),
    createItem: (data: any) => post('/api/warehouse/items', data),
    updateItem: (id: string, data: any) => put(`/api/warehouse/items/${id}`, data),
    deleteItem: (id: string) => del(`/api/warehouse/items/${id}`),

    // Inward
    getInwardRecords: () => get('/api/warehouse/inward'),
    getInwardRecordById: (id: string) => get(`/api/warehouse/inward/${id}`),
    createInwardRecord: (data: any) => post('/api/warehouse/inward', data),
    updateInwardRecord: (id: string, data: any) => put(`/api/warehouse/inward/${id}`, data),
    deleteInwardRecord: (id: string) => del(`/api/warehouse/inward/${id}`),

    // Outward
    getOutwardRecords: () => get('/api/warehouse/outward'),
    getOutwardRecordById: (id: string) => get(`/api/warehouse/outward/${id}`),
    createOutwardRecord: (data: any) => post('/api/warehouse/outward', data),
    updateOutwardRecord: (id: string, data: any) => put(`/api/warehouse/outward/${id}`, data),
    deleteOutwardRecord: (id: string) => del(`/api/warehouse/outward/${id}`),

    // Damage reports
    getDamageRecords: () => get('/api/warehouse/damage'),
    getDamageReportById: (id: string) => get(`/api/warehouse/damage/${id}`),
    createDamageReport: (data: any) => post('/api/warehouse/damage', data),
    approveDamageReport: (id: string) => put(`/api/warehouse/damage/${id}/approve`, {}),
    rejectDamageReport: (id: string, notes?: string) => put(`/api/warehouse/damage/${id}/reject`, { notes }),

    // Closing stock
    getClosingStocks: () => get('/api/warehouse/closing-stock'),
    getClosingStockById: (id: string) => get(`/api/warehouse/closing-stock/${id}`),
    generateClosingStock: (data: { warehouseId: string, date?: string }) => post('/api/warehouse/closing-stock/generate', data),

    // Export data
    exportData: (type: string) => get(`/api/warehouse/export?type=${type}`)
  },
  inventory: {
    getItems: () => get('/api/inventory/items'),
    getItemById: (id: string) => get(`/api/inventory/items/${id}`),
    createItem: (data: any) => post('/api/inventory/items', data),
    updateItem: (id: string, data: any) => put(`/api/inventory/items/${id}`, data),
    deleteItem: (id: string) => del(`/api/inventory/items/${id}`),
    createTransfer: (data: any) => post('/api/inventory/transfers', data),
    getTransfers: () => get('/api/inventory/transfers'),
    getTransferById: (id: string) => get(`/api/inventory/transfers/${id}`),
    getInwardRecords: () => get('/api/inventory/inward'),
    getInwardRecordById: (id: string) => get(`/api/inventory/inward/${id}`),
    createInwardRecord: (data: any) => post('/api/inventory/inward', data),
    getOutwardRecords: () => get('/api/inventory/outward'),
    getOutwardRecordById: (id: string) => get(`/api/inventory/outward/${id}`),
    createOutwardRecord: (data: any) => post('/api/inventory/outward', data),
    getReport: (type: string, params: any = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value as string);
        }
      });
      queryParams.append('type', type);
      return get(`/api/inventory/reports?${queryParams.toString()}`);
    },
    getAudits: () => get('/api/inventory/audit'),
    getAuditById: (id: string) => get(`/api/inventory/audit/${id}`),
    createAudit: (data: any) => post('/api/inventory/audit', data)
  },
  transfers: {
    getAll: () => get('/api/transfers'),
    getById: (id: string) => get(`/api/transfers/${id}`),
    create: (data: any) => post('/api/transfers', data)
  },
  purchaseOrders: {
    getAll: () => get('/api/purchase-orders'),
    getById: (id: string) => get(`/api/purchase-orders/${id}`),
    create: (data: any) => post('/api/purchase-orders', data),
    update: (id: string, data: any) => put(`/api/purchase-orders/${id}`, data),
    delete: (id: string) => del(`/api/purchase-orders/${id}`)
  },
  auditLogs: {
    getAll: () => get('/api/audit/logs'),
    create: (data: any) => post('/api/audit/logs', data),
    getByUser: (userId: string) => get(`/api/audit/logs/user/${userId}`),
    getByEntity: (entityType: string, entityId: string) => get(`/api/audit/logs/entity/${entityType}/${entityId}`),
    getByAction: (action: string) => get(`/api/audit/logs/action/${action}`),
    getByDateRange: (startDate: string, endDate: string) => get(`/api/audit/logs/date-range?start=${startDate}&end=${endDate}`)
  },
  products: {
    getAll: () => get('/api/products'),
    getById: (id: string) => get(`/api/products/${id}`),
    create: (data: any) => post('/api/products', data),
    update: (id: string, data: any) => put(`/api/products/${id}`, data),
    delete: (id: string) => del(`/api/products/${id}`),
    // Category methods
    getCategories: () => get('/api/products/categories'),
    getCategoryById: (id: string) => get(`/api/products/categories/${id}`),
    createCategory: (data: any) => post('/api/products/categories', data),
    updateCategory: (id: string, data: any) => put(`/api/products/categories/${id}`, data),
    deleteCategory: (id: string) => del(`/api/products/categories/${id}`)
  },
  locations: {
    getAll: () => get('/api/locations'),
    getById: (id: string) => get(`/api/locations/${id}`),
    create: (data: any) => post('/api/locations', data),
    update: (id: string, data: any) => put(`/api/locations/${id}`, data),
    delete: (id: string) => del(`/api/locations/${id}`)
  },
  uploads: {
    productImage: (file: File) => uploadFile(file, 'product-image')
  }
};
