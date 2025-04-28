import { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaBoxes,
  FaShippingFast,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import ExportMenu from './ExportMenu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthError } from '../../utils/api';

type WarehouseItem = {
  id: string;
  sku?: string;
  productName: string;
  quantity: number;
  supplier: {
    id: string;
    name: string;
  };
  category?: string;
  status?: string;
  unitCost?: number;
  totalValue?: number;
  location?: string;
  createdAt: string;
  updatedAt?: string;
};

type InwardRecord = {
  id: string;
  date: string;
  itemId: string;
  productName: string;
  quantity: number;
  supplier: {
    id: string;
    name: string;
  };
  batchNumber?: string;
  unitCost: number;
  totalCost: number;
  receivedBy: string;
};

type OutwardRecord = {
  id: string;
  date: string;
  itemId: string;
  productName: string;
  quantity: number;
  destination: string;
  transferredBy: string;
  status: string;
};

type DamageRecord = {
  id: string;
  date: string;
  itemId: string;
  productName: string;
  quantity: number;
  reason: string;
  reportedBy: string;
  status: string;
};

type WarehouseSummary = {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  recentInward: number;
  recentOutward: number;
  pendingDamage: number;
};

const WarehouseOverview = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [inwardRecords, setInwardRecords] = useState<InwardRecord[]>([]);
  const [outwardRecords, setOutwardRecords] = useState<OutwardRecord[]>([]);
  const [damageRecords, setDamageRecords] = useState<DamageRecord[]>([]);
  const [summary, setSummary] = useState<WarehouseSummary>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    recentInward: 0,
    recentOutward: 0,
    pendingDamage: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('items'); // 'items', 'inward', 'outward', 'damage'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

  // Function to handle item deletion
  const handleDeleteItem = async (id: string, name: string) => {
    setItemToDelete({ id, name });
    setShowDeleteConfirm(true);
  };

  // Function to confirm and execute deletion
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);

      // Import API utility
      const { API } = await import('../../utils/api');

      try {
        // Delete the item
        await API.warehouse.deleteItem(itemToDelete.id);

        // Create audit log
        try {
          await API.auditLogs.create({
            action: 'DELETE_ITEM',
            entity: 'WarehouseItem',
            entityId: itemToDelete.id,
            details: `Deleted warehouse item: ${itemToDelete.name}`
          });
        } catch (logError) {
          console.error('Error creating audit log:', logError);
          // Continue even if audit log creation fails
        }

        // Remove the item from the state
        setItems(items.filter(item => item.id !== itemToDelete.id));

        // Close the confirmation dialog
        setShowDeleteConfirm(false);
        setItemToDelete(null);

        // Show success message
        alert(`Item "${itemToDelete.name}" has been deleted successfully.`);
      } catch (deleteError) {
        console.error(`Error deleting item ${itemToDelete.id}:`, deleteError);
        alert(`Failed to delete "${itemToDelete.name}". Please try again later.`);
      }
    } catch (error) {
      console.error('Error in confirmDelete:', error);
      alert('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  useEffect(() => {
    // Fetch all warehouse data
    const fetchWarehouseData = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated
        if (!isAuthenticated) {
          // Redirect to login page
          navigate('/login', { state: { from: '/warehouse' } });
          return;
        }

        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch warehouse items
        let warehouseItems = [];
        try {
          warehouseItems = await API.warehouse.getItems();
        } catch (error) {
          console.error('Error fetching warehouse items:', error);
          // Use empty array if there's an error
          warehouseItems = [];
        }

        // Transform the data to match our WarehouseItem type
        const transformedItems: WarehouseItem[] = Array.isArray(warehouseItems)
          ? warehouseItems.map((item: any) => ({
              id: item.id,
              sku: item.sku,
              productName: item.productName,
              quantity: item.quantity,
              supplier: {
                id: item.supplierId,
                name: item.supplier?.name || 'Unknown Supplier'
              },
              category: item.category,
              status: item.status,
              unitCost: item.unitCost,
              totalValue: item.totalValue || (item.quantity * item.unitCost),
              location: item.location,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }))
          : [];

        setItems(transformedItems);

        // Calculate summary data
        const totalValue = transformedItems.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        const lowStockItems = transformedItems.filter(item => {
          // Assuming reorderPoint is available or defaulting to 10
          const reorderPoint = (item as any).reorderPoint || 10;
          return item.quantity <= reorderPoint;
        }).length;

        // Fetch inward records
        let inwardData = [];
        try {
          inwardData = await API.warehouse.getInwardRecords();
        } catch (error) {
          console.error('Error fetching inward records:', error);
          // Use empty array if there's an error
          inwardData = [];
        }

        const transformedInward: InwardRecord[] = Array.isArray(inwardData)
          ? inwardData.map((entry: any) => ({
              id: entry.id,
              date: entry.receivedDate,
              itemId: entry.itemId,
              productName: entry.warehouseItem?.productName || 'Unknown Product',
              quantity: entry.quantity,
              supplier: {
                id: entry.supplierId,
                name: entry.supplier?.name || 'Unknown Supplier'
              },
              batchNumber: entry.batchNumber,
              unitCost: entry.unitCost,
              totalCost: entry.totalCost,
              receivedBy: entry.receivedBy
            }))
          : [];
        setInwardRecords(transformedInward);

        // Fetch outward records
        let outwardData = [];
        try {
          outwardData = await API.warehouse.getOutwardRecords();
        } catch (error) {
          console.error('Error fetching outward records:', error);
          // Use empty array if there's an error
          outwardData = [];
        }

        const transformedOutward: OutwardRecord[] = Array.isArray(outwardData)
          ? outwardData.map((entry: any) => ({
              id: entry.id,
              date: entry.transferDate,
              itemId: entry.itemId,
              productName: entry.warehouseItem?.productName || 'Unknown Product',
              quantity: entry.quantity,
              destination: entry.destination,
              transferredBy: entry.transferredBy,
              status: entry.status
            }))
          : [];
        setOutwardRecords(transformedOutward);

        // Fetch damage records
        let damageData = [];
        try {
          damageData = await API.warehouse.getDamageRecords();
        } catch (error) {
          console.error('Error fetching damage records:', error);
          // Use empty array if there's an error
          damageData = [];
        }

        const transformedDamage: DamageRecord[] = Array.isArray(damageData)
          ? damageData.map((entry: any) => ({
              id: entry.id,
              date: entry.reportedDate,
              itemId: entry.itemId,
              productName: entry.warehouseItem?.productName || 'Unknown Product',
              quantity: entry.quantity,
              reason: entry.reason,
              reportedBy: entry.reportedBy,
              status: entry.status
            }))
          : [];
        setDamageRecords(transformedDamage);

        // Update summary
        setSummary({
          totalItems: transformedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalValue,
          lowStockItems,
          recentInward: transformedInward.length,
          recentOutward: transformedOutward.length,
          pendingDamage: transformedDamage.filter(d => d.status === 'pending').length
        });

      } catch (error) {
        console.error('Error fetching warehouse data:', error);

        // Handle authentication errors
        if (error instanceof AuthError) {
          navigate('/login', { state: { from: '/warehouse' } });
        } else {
          // Show error message for other errors
          console.error('Failed to load warehouse data:', error);
          // Set empty data
          setItems([]);
          setInwardRecords([]);
          setOutwardRecords([]);
          setDamageRecords([]);
          setSummary({
            totalItems: 0,
            totalValue: 0,
            lowStockItems: 0,
            recentInward: 0,
            recentOutward: 0,
            pendingDamage: 0
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouseData();
  }, [isAuthenticated, navigate]);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter inward records based on search term
  const filteredInward = inwardRecords.filter(record =>
    record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.batchNumber && record.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter outward records based on search term
  const filteredOutward = outwardRecords.filter(record =>
    record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter damage records based on search term
  const filteredDamage = damageRecords.filter(record =>
    record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{itemToDelete.name}</span>?
              This action cannot be undone and will remove all associated data including inward, outward, and damage records.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage warehouse items, inward/outward movements, damage reports, and closing stock
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/warehouse/items/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add Item
          </Link>
          <ExportMenu />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Items */}
        <div
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveTab('items')}
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 ${activeTab === 'items' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center mr-3`}>
              <FaBoxes className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Total Items</h3>
              <p className="text-sm text-gray-500">{summary.totalItems} items (₹{summary.totalValue.toLocaleString()})</p>
            </div>
          </div>
        </div>

        {/* Inward */}
        <div
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveTab('inward')}
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 ${activeTab === 'inward' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center mr-3`}>
              <FaArrowUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Inward</h3>
              <p className="text-sm text-gray-500">{inwardRecords.length} recent records</p>
            </div>
          </div>
        </div>

        {/* Outward */}
        <div
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveTab('outward')}
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 ${activeTab === 'outward' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center mr-3`}>
              <FaArrowDown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Outward</h3>
              <p className="text-sm text-gray-500">{outwardRecords.length} recent transfers</p>
            </div>
          </div>
        </div>

        {/* Damage */}
        <div
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveTab('damage')}
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 ${activeTab === 'damage' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'} rounded-full flex items-center justify-center mr-3`}>
              <FaExclamationTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Damage</h3>
              <p className="text-sm text-gray-500">{summary.pendingDamage} pending reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Link to="/warehouse/inward" className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <FaBoxes className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Add Inward</h3>
            <p className="text-sm text-gray-500">Record items coming into warehouse</p>
          </div>
        </Link>

        <Link to="/warehouse/outward" className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <FaShippingFast className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Add Outward</h3>
            <p className="text-sm text-gray-500">Transfer items to inventory</p>
          </div>
        </Link>

        <Link to="/warehouse/damage" className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <FaExclamationTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Report Damage</h3>
            <p className="text-sm text-gray-500">Report damaged items</p>
          </div>
        </Link>

        <Link to="/warehouse/closing-stock" className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <FaClipboardCheck className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Closing Stock</h3>
            <p className="text-sm text-gray-500">View monthly closing stock</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'items' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FaBoxes className="inline-block mr-2" />
              Items
            </button>
            <button
              onClick={() => setActiveTab('inward')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'inward' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FaArrowUp className="inline-block mr-2" />
              Inward
            </button>
            <button
              onClick={() => setActiveTab('outward')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'outward' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FaArrowDown className="inline-block mr-2" />
              Outward
            </button>
            <button
              onClick={() => setActiveTab('damage')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'damage' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FaExclamationTriangle className="inline-block mr-2" />
              Damage
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Items Tab Content */}
        {activeTab === 'items' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-xs text-gray-500">{item.category || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.sku || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                      <div className="text-xs text-gray-500">{item.location || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.supplier.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{(item.totalValue || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">₹{(item.unitCost || 0).toLocaleString()} per unit</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/warehouse/items/${item.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                        <FaEye className="inline-block mr-1" /> View
                      </Link>
                      <Link to={`/warehouse/items/${item.id}/edit`} className="text-primary-600 hover:text-primary-900 mr-3">
                        <FaEdit className="inline-block mr-1" /> Edit
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteItem(item.id, item.productName);
                        }}
                        className="text-red-600 hover:text-red-900">
                        <FaTrash className="inline-block mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No items found. Try adjusting your search.
              </div>
            )}
          </div>
        )}

        {/* Inward Tab Content */}
        {activeTab === 'inward' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInward.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.productName}</div>
                      <div className="text-xs text-gray-500">{record.batchNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.supplier.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{record.totalCost.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">₹{record.unitCost.toLocaleString()} per unit</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/warehouse/inward/${record.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInward.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No inward records found. Try adjusting your search.
              </div>
            )}
          </div>
        )}

        {/* Outward Tab Content */}
        {activeTab === 'outward' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOutward.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'completed' ? 'bg-green-100 text-green-800' : record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/warehouse/outward/${record.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOutward.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No outward records found. Try adjusting your search.
              </div>
            )}
          </div>
        )}

        {/* Damage Tab Content */}
        {activeTab === 'damage' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDamage.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'approved' ? 'bg-green-100 text-green-800' : record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/warehouse/damage/${record.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDamage.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No damage records found. Try adjusting your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseOverview;
