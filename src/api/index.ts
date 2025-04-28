import api from '../lib/utils/api';

// User API
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Warehouse API
export const getWarehouseItems = async () => {
  const response = await api.get('/warehouse/items');
  return response.data;
};

export const getWarehouseItem = async (id: string) => {
  const response = await api.get(`/warehouse/items/${id}`);
  return response.data;
};

export const createWarehouseItem = async (data: any) => {
  const response = await api.post('/warehouse/items', data);
  return response.data;
};

export const updateWarehouseItem = async (id: string, data: any) => {
  const response = await api.put(`/warehouse/items/${id}`, data);
  return response.data;
};

export const deleteWarehouseItem = async (id: string) => {
  const response = await api.delete(`/warehouse/items/${id}`);
  return response.data;
};

// Inventory API
export const getInventoryItems = async () => {
  const response = await api.get('/inventory/items');
  return response.data;
};

export const getInventoryItem = async (id: string) => {
  const response = await api.get(`/inventory/items/${id}`);
  return response.data;
};

export const createInventoryItem = async (data: any) => {
  const response = await api.post('/inventory/items', data);
  return response.data;
};

export const updateInventoryItem = async (id: string, data: any) => {
  const response = await api.put(`/inventory/items/${id}`, data);
  return response.data;
};

// Transfer API
export const createTransfer = async (data: any) => {
  const response = await api.post('/transfers', data);
  return response.data;
};

export const getTransfers = async () => {
  const response = await api.get('/transfers');
  return response.data;
};

// Supplier API
export const getSuppliers = async () => {
  const response = await api.get('/suppliers');
  return response.data;
};

export const getSupplier = async (id: string) => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (data: any) => {
  const response = await api.post('/suppliers', data);
  return response.data;
};

export const updateSupplier = async (id: string, data: any) => {
  const response = await api.put(`/suppliers/${id}`, data);
  return response.data;
};

export const deleteSupplier = async (id: string) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};

// Audit API
export const getAuditLogs = async () => {
  const response = await api.get('/audit/logs');
  return response.data;
};

export const exportAuditLogs = async (filters: any) => {
  const response = await api.post('/audit/export', filters, {
    responseType: 'blob',
  });
  return response.data;
};
