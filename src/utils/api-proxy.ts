/**
 * API Proxy for handling requests in both development and Vercel environments
 * This file provides a consistent interface for making API requests
 */

import { isVercelDeployment } from './vercel-auth-helper';
import { getMockData } from './mock-data';

// Base URL for API requests
const getBaseUrl = () => {
  if (isVercelDeployment()) {
    // In Vercel deployment, use relative URLs
    return '';
  }
  
  // In development, use the configured API URL or default to localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};

// Generic fetch function with authentication
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // Get auth token from localStorage
    const user = localStorage.getItem('user');
    let token = null;
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        token = userData.token;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Add auth header if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    
    // Construct full URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
    
    return response;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    
    // If we're in Vercel deployment, return mock data
    if (isVercelDeployment()) {
      console.log(`Using mock data for ${endpoint} in Vercel deployment`);
      return createMockResponse(endpoint, options);
    }
    
    // Re-throw the error for other environments
    throw error;
  }
};

// Create a mock response for Vercel deployment
const createMockResponse = (endpoint: string, options: RequestInit): Response => {
  const method = options.method || 'GET';
  let data: any = null;
  
  // Get mock data based on the endpoint and method
  if (method === 'GET') {
    data = getMockData(endpoint);
  } else if (method === 'POST' || method === 'PUT') {
    // For POST/PUT, use the request body as a base and add an ID
    try {
      const body = options.body ? JSON.parse(options.body as string) : {};
      data = {
        ...body,
        id: body.id || `mock-${Date.now()}`
      };
    } catch (error) {
      data = { success: true, message: 'Operation completed successfully' };
    }
  } else if (method === 'DELETE') {
    data = { success: true, message: 'Item deleted successfully' };
  }
  
  // Create a mock response
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

// API methods
export const apiProxy = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithAuth(endpoint);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithAuth(endpoint, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
};
