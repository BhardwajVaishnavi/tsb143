/**
 * Direct API calls for categories in browser environment
 */

import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = '/api';

// Categories API
export const CategoriesAPI = {
  // Get all categories
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get category by ID
  getById: async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  },

  // Create a new category
  create: async (category: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/categories`, category);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update a category
  update: async (id: string, category: any) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/categories/${id}`, category);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  // Delete a category
  delete: async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      return { success: false, error: error.message };
    }
  },

  // Get product count for a category
  getProductCount: async (categoryId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}/products/count`);
      return response.data.count;
    } catch (error) {
      console.error(`Error getting product count for category ${categoryId}:`, error);
      return 0;
    }
  }
};

export default CategoriesAPI;
