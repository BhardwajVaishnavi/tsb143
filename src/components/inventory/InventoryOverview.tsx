import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaExclamationTriangle,
  FaFilter,
  FaDownload,
  FaSync,
  FaBoxOpen,
  FaEdit,
  FaEye,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExchangeAlt,
  FaBarcode,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaClipboardCheck,
  FaChartBar
} from 'react-icons/fa';
import ExportMenu from './ExportMenu';
import { Link } from 'react-router-dom';

type InventoryItem = {
  id: string;
  sku: string;
  product: {
    name: string;
    category: {
      id: string;
      name: string;
    };
    brand?: string;
    image?: string;
  };
  location: {
    warehouse: string;
    zone: string;
    rack: string;
    bin: string;
  };
  quantity: number;
  unitPrice: number;
  totalValue: number;
  lowStockThreshold?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  lastReceived?: string;
  updatedAt: string;
  createdAt: string;
};

// Filter Panel Component
const FilterPanel = ({ onFilterChange }: { onFilterChange: (filters: any) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    warehouse: '',
    minQuantity: '',
    maxQuantity: ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      status: '',
      warehouse: '',
      minQuantity: '',
      maxQuantity: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
      <div
        className="px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <FaFilter className="text-gray-500 mr-2" />
          <h3 className="text-base font-medium text-gray-700">Filters</h3>
        </div>
        <div className="text-gray-500">
          {expanded ? <FaSortUp /> : <FaSortDown />}
        </div>
      </div>

      {expanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
              <select
                name="warehouse"
                value={filters.warehouse}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Warehouses</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Secondary Warehouse">Secondary Warehouse</option>
                <option value="Distribution Center">Distribution Center</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
              <input
                type="number"
                name="minQuantity"
                value={filters.minQuantity}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Quantity</label>
              <input
                type="number"
                name="maxQuantity"
                value={filters.maxQuantity}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryOverview = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('product.name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDelete, setBulkDelete] = useState(false);

  useEffect(() => {
    // Fetch inventory items from the API
    const fetchItems = async () => {
      try {
        setIsLoading(true);

        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch inventory items
        let response = [];
        try {
          response = await API.inventory.getItems();
        } catch (error) {
          console.error('Error fetching inventory items:', error);
          // Use empty array if there's an error
          response = [];
        }

        // Transform the data to match our InventoryItem type
        const transformedItems: InventoryItem[] = Array.isArray(response)
          ? response.map((item: any) => ({
              id: item.id,
              sku: item.sku || `SKU-${item.id}`,
              product: {
                name: item.product?.name || 'Unknown Product',
                category: {
                  id: item.product?.categoryId || 'unknown',
                  name: item.product?.category?.name || 'Uncategorized',
                },
                brand: item.product?.brand,
                image: item.product?.image,
              },
              location: {
                warehouse: item.warehouse || 'Main Warehouse',
                zone: item.zone || 'A',
                rack: item.rack || 'R1',
                bin: item.bin || 'B1',
              },
              quantity: item.quantity || 0,
              unitPrice: item.unitPrice || 0,
              totalValue: (item.quantity || 0) * (item.unitPrice || 0),
              lowStockThreshold: item.lowStockThreshold || 10,
              status: item.status || 'in_stock',
              lastReceived: item.lastReceived,
              updatedAt: item.updatedAt || new Date().toISOString(),
              createdAt: item.createdAt || new Date().toISOString(),
            }))
          : [];

        // If no items are returned from the API, create some sample items for demonstration
        if (transformedItems.length === 0) {
          const sampleItems: InventoryItem[] = Array.from({ length: 5 }, (_, i) => ({
            id: `sample-${i + 1}`,
            sku: `SAMPLE-${1000 + i}`,
            product: {
              name: `Sample Product ${i + 1}`,
              category: {
                id: 'sample-cat',
                name: 'Sample Category',
              },
              brand: 'Sample Brand',
              image: undefined,
            },
            location: {
              warehouse: 'Main Warehouse',
              zone: 'A',
              rack: 'R1',
              bin: `B${i + 1}`,
            },
            quantity: 10 * (i + 1),
            unitPrice: 25,
            totalValue: 10 * (i + 1) * 25,
            lowStockThreshold: 5,
            status: 'in_stock',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }));

          setItems(sampleItems);
        } else {
          setItems(transformedItems);
        }
      } catch (error) {
        console.error('Error in fetchItems:', error);

        // Create sample items as a fallback
        const sampleItems: InventoryItem[] = Array.from({ length: 5 }, (_, i) => ({
          id: `sample-${i + 1}`,
          sku: `SAMPLE-${1000 + i}`,
          product: {
            name: `Sample Product ${i + 1}`,
            category: {
              id: 'sample-cat',
              name: 'Sample Category',
            },
            brand: 'Sample Brand',
            image: undefined,
          },
          location: {
            warehouse: 'Main Warehouse',
            zone: 'A',
            rack: 'R1',
            bin: `B${i + 1}`,
          },
          quantity: 10 * (i + 1),
          unitPrice: 25,
          totalValue: 10 * (i + 1) * 25,
          lowStockThreshold: 5,
          status: 'in_stock',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }));

        setItems(sampleItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Function to handle item deletion
  const handleDeleteItem = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setBulkDelete(false);
    setShowDeleteConfirm(true);
  };

  // Function to handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;

    setBulkDelete(true);
    setShowDeleteConfirm(true);
  };

  // Function to confirm and execute deletion
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      // Import API utility
      const { API } = await import('../../utils/api');

      if (bulkDelete) {
        // Delete multiple items
        const deletePromises = selectedItems.map(async (id) => {
          try {
            // Delete the item
            await API.inventory.deleteItem(id);

            // Create audit log for each deleted item
            const itemName = items.find(item => item.id === id)?.product.name || 'Unknown';
            try {
              await API.auditLogs.create({
                action: 'DELETE_ITEM',
                entity: 'InventoryItem',
                entityId: id,
                details: `Deleted inventory item: ${itemName}`
              });
            } catch (logError) {
              console.error('Error creating audit log:', logError);
              // Continue even if audit log creation fails
            }

            return { id, success: true };
          } catch (itemError) {
            console.error(`Error deleting item ${id}:`, itemError);
            return { id, success: false };
          }
        });

        // Wait for all delete operations to complete
        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter(result => result.success).map(result => result.id);

        // Remove the successfully deleted items from the state
        if (successfulDeletes.length > 0) {
          setItems(items.filter(item => !successfulDeletes.includes(item.id)));
          setSelectedItems(selectedItems.filter(id => !successfulDeletes.includes(id)));
          setSelectAll(false);

          // Show success message
          alert(`${successfulDeletes.length} of ${selectedItems.length} items have been deleted successfully.`);
        } else {
          alert('Failed to delete any items. Please try again later.');
        }
      } else if (itemToDelete) {
        // Delete single item
        try {
          await API.inventory.deleteItem(itemToDelete.id);

          // Create audit log
          try {
            await API.auditLogs.create({
              action: 'DELETE_ITEM',
              entity: 'InventoryItem',
              entityId: itemToDelete.id,
              details: `Deleted inventory item: ${itemToDelete.name}`
            });
          } catch (logError) {
            console.error('Error creating audit log:', logError);
            // Continue even if audit log creation fails
          }

          // Remove the item from the state
          setItems(items.filter(item => item.id !== itemToDelete.id));

          // Show success message
          alert(`Item "${itemToDelete.name}" has been deleted successfully.`);
        } catch (deleteError) {
          console.error(`Error deleting item ${itemToDelete.id}:`, deleteError);
          alert(`Failed to delete "${itemToDelete.name}". Please try again later.`);
        }
      }
    } catch (error) {
      console.error('Error in confirmDelete:', error);
      alert('An unexpected error occurred. Please try again later.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setBulkDelete(false);
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    setBulkDelete(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ?
      <FaSortUp className="ml-1 text-primary-500" /> :
      <FaSortDown className="ml-1 text-primary-500" />;
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      setSelectAll(false);
    } else {
      setSelectedItems([...selectedItems, id]);
      if (selectedItems.length + 1 === filteredItems.length) {
        setSelectAll(true);
      }
    }
  };

  // Apply filters
  let filteredItems = items.filter(item => {
    // Search term filter
    const matchesSearch =
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.product.brand && item.product.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Category filter
    if (filters.category && item.product.category.name !== filters.category) return false;

    // Status filter
    if (filters.status && item.status !== filters.status) return false;

    // Warehouse filter
    if (filters.warehouse && item.location.warehouse !== filters.warehouse) return false;

    // Quantity range filters
    if (filters.minQuantity && item.quantity < parseInt(filters.minQuantity)) return false;
    if (filters.maxQuantity && item.quantity > parseInt(filters.maxQuantity)) return false;

    return true;
  });

  // Apply sorting
  filteredItems = [...filteredItems].sort((a, b) => {
    let aValue, bValue;

    // Handle nested fields
    if (sortField.includes('.')) {
      const [parent, child] = sortField.split('.');
      aValue = a[parent][child];
      bValue = b[parent][child];
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ?
        aValue.localeCompare(bValue) :
        bValue.localeCompare(aValue);
    }

    // Handle number comparison
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {bulkDelete ? 'Confirm Bulk Deletion' : 'Confirm Deletion'}
            </h3>
            <p className="text-gray-700 mb-6">
              {bulkDelete
                ? `Are you sure you want to delete ${selectedItems.length} selected items? This action cannot be undone.`
                : itemToDelete
                  ? `Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`
                  : 'Are you sure you want to delete this item? This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeleting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your inventory items, track stock levels, and perform inventory operations
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Link
            to="/inventory/items/new"
            className="btn-primary inline-flex items-center px-4 py-2 rounded-lg shadow-sm"
          >
            <FaPlus className="mr-2 -ml-1 h-4 w-4" /> Add Item
          </Link>
          <Link
            to="/inventory/transfer"
            className="btn-outline inline-flex items-center px-4 py-2 rounded-lg shadow-sm"
          >
            <FaExchangeAlt className="mr-2 -ml-1 h-4 w-4" /> Transfer
          </Link>
          <Link
            to="/inventory/audit"
            className="btn-outline inline-flex items-center px-4 py-2 rounded-lg shadow-sm"
          >
            <FaClipboardCheck className="mr-2 -ml-1 h-4 w-4" /> Audit
          </Link>
          <Link
            to="/inventory/reports"
            className="btn-outline inline-flex items-center px-4 py-2 rounded-lg shadow-sm"
          >
            <FaChartBar className="mr-2 -ml-1 h-4 w-4" /> Reports
          </Link>
          <ExportMenu />
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel onFilterChange={handleFilterChange} />

      {/* Search and Bulk Actions */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product name, SKU, category, or brand..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">{selectedItems.length} items selected</span>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <FaEdit className="mr-1.5 h-4 w-4 text-gray-500" />
                Edit
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaTrash className="mr-1.5 h-4 w-4 text-red-500" />
                Delete ({selectedItems.length})
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center">
                    SKU {getSortIcon('sku')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('product.name')}
                >
                  <div className="flex items-center">
                    Product {getSortIcon('product.name')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('product.category.name')}
                >
                  <div className="flex items-center">
                    Category {getSortIcon('product.category.name')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('location.warehouse')}
                >
                  <div className="flex items-center">
                    Location {getSortIcon('location.warehouse')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Quantity {getSortIcon('quantity')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('totalValue')}
                >
                  <div className="flex items-center">
                    Value {getSortIcon('totalValue')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);

                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-primary-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <FaBoxOpen className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                          {item.product.brand && (
                            <div className="text-xs text-gray-500">{item.product.brand}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.product.category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.location.warehouse}
                        <div className="text-xs">
                          Zone: {item.location.zone}, Rack: {item.location.rack}, Bin: {item.location.bin}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.quantity}</div>
                      {item.lowStockThreshold && (
                        <div className="text-xs text-gray-500">Min: {item.lowStockThreshold}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{item.totalValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">₹{item.unitPrice} per unit</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'in_stock' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                      {item.status === 'low_stock' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <FaExclamationTriangle className="mr-1 h-3 w-3" />
                          Low Stock
                        </span>
                      )}
                      {item.status === 'out_of_stock' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                      {item.status === 'discontinued' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Discontinued
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/inventory/items/${item.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/inventory/items/${item.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Item"
                        >
                          <FaEdit />
                        </Link>
                        <Link
                          to={`/inventory/items/${item.id}/history`}
                          className="text-gray-600 hover:text-gray-900"
                          title="View History"
                        >
                          <FaHistory />
                        </Link>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.product.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <FaSearch className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredItems.length}</span> of{' '}
                <span className="font-medium">{filteredItems.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-current="page"
                  className="z-10 bg-primary-50 border-primary-500 text-primary-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </a>
                <a
                  href="#"
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  2
                </a>
                <a
                  href="#"
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  3
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;
