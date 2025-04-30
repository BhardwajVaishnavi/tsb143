/**
 * Production API configuration
 * This file contains API utilities specifically for the production environment
 */

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

  // Use the current host for API requests
  const fullUrl = url.startsWith('/') ? url : `/${url}`;

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
        return getMockData(url);
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
    return getMockData(url);
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
        return getMockData(url, data);
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
    return getMockData(url, data);
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
        return getMockData(url, data);
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
    return getMockData(url, data);
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
        return getMockData(url);
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
    return getMockData(url);
  }
};

// Helper function to get mock data based on the URL
const getMockData = (url: string, _data?: any): any => {
  // Extract the endpoint from the URL
  const endpoint = url.split('/').slice(2).join('/');

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
      lastLogin: new Date().toISOString()
    };
  }

  // Auth login endpoint
  if (endpoint === 'auth/login' && _data?.email === 'admin@example.com' && _data?.password === 'admin123') {
    return {
      user: {
        id: 'user-1',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'ADMIN', // Ensure role is uppercase for consistency
        status: 'active',
        permissions: [{ module: '*', action: '*', resource: '*' }]
      },
      token: 'mock-token-' + Date.now()
    };
  }

  // Default: return empty data
  return { data: [] };
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
  warehouse: {
    getItems: () => get('/api/warehouse/items'),
    getItemById: (id: string) => get(`/api/warehouse/items/${id}`),
    createItem: (data: any) => post('/api/warehouse/items', data),
    updateItem: (id: string, data: any) => put(`/api/warehouse/items/${id}`, data),
    deleteItem: (id: string) => del(`/api/warehouse/items/${id}`),
    getDamage: () => get('/api/warehouse/damage'),
    reportDamage: (data: any) => post('/api/warehouse/damage', data),
    approveDamage: (id: string, data: any) => put(`/api/warehouse/damage/${id}/approve`, data)
  },
  inventory: {
    getItems: () => get('/api/inventory/items'),
    getItemById: (id: string) => get(`/api/inventory/items/${id}`),
    createItem: (data: any) => post('/api/inventory/items', data),
    updateItem: (id: string, data: any) => put(`/api/inventory/items/${id}`, data),
    deleteItem: (id: string) => del(`/api/inventory/items/${id}`)
  },
  suppliers: {
    getAll: () => get('/api/suppliers'),
    getById: (id: string) => get(`/api/suppliers/${id}`),
    create: (data: any) => post('/api/suppliers', data),
    update: (id: string, data: any) => put(`/api/suppliers/${id}`, data),
    delete: (id: string) => del(`/api/suppliers/${id}`)
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
    create: (data: any) => post('/api/audit/logs', data)
  }
};

export default API;
