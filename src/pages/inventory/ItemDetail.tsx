import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaBoxes, 
  FaExchangeAlt, 
  FaShoppingCart, 
  FaHistory,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface InventoryItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: {
      id: string;
      name: string;
    };
    brand?: string;
    image?: string;
  };
  quantity: number;
  unitPrice: number;
  totalValue: number;
  location: {
    warehouse: string;
    zone: string;
    rack: string;
    bin: string;
  };
  lowStockThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  lastReceived?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransferRecord {
  id: string;
  date: string;
  sourceLocation: string;
  destinationLocation: string;
  quantity: number;
  unitPrice: number;
  newPrice?: number;
}

interface SaleRecord {
  id: string;
  date: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customer: string;
  status: string;
}

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [transferRecords, setTransferRecords] = useState<TransferRecord[]>([]);
  const [saleRecords, setSaleRecords] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch item data
  const fetchItemData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Import API utility
      const { API } = await import('../../utils/api');
      
      // Fetch inventory item
      const itemData = await API.inventory.getItemById(id);
      setItem(itemData);
      
      // Fetch transfer records for this item
      const transferData = await API.inventory.getTransfers();
      setTransferRecords(
        transferData
          .filter((record: any) => 
            record.items.some((item: any) => item.productId === itemData.product.id)
          )
          .map((record: any) => {
            const itemTransfer = record.items.find((item: any) => item.productId === itemData.product.id);
            return {
              id: record.id,
              date: record.transferDate,
              sourceLocation: record.sourceLocationName,
              destinationLocation: record.destinationLocationName,
              quantity: itemTransfer?.quantity || 0,
              unitPrice: itemTransfer?.currentPrice || 0,
              newPrice: itemTransfer?.newPrice
            };
          })
      );
      
      // Fetch sale records for this item (if available)
      try {
        const saleData = await API.sales.getSales();
        setSaleRecords(
          saleData
            .filter((record: any) => 
              record.items.some((item: any) => item.productId === itemData.product.id)
            )
            .map((record: any) => {
              const saleItem = record.items.find((item: any) => item.productId === itemData.product.id);
              return {
                id: record.id,
                date: record.saleDate,
                quantity: saleItem?.quantity || 0,
                unitPrice: saleItem?.unitPrice || 0,
                totalPrice: saleItem?.totalPrice || 0,
                customer: record.customerName || 'Walk-in Customer',
                status: record.status
              };
            })
        );
      } catch (err) {
        console.log('Sales data not available or error fetching sales:', err);
        setSaleRecords([]);
      }
      
    } catch (err) {
      console.error('Error fetching item data:', err);
      setError('Failed to load item data. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/inventory/items/${id}` } });
      return;
    }
    
    fetchItemData();
  }, [id, isAuthenticated, navigate]);

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchItemData();
  };

  // Function to handle delete
  const handleDelete = async () => {
    if (!id || !item) return;
    
    try {
      setIsLoading(true);
      
      // Import API utility
      const { API } = await import('../../utils/api');
      
      // Delete the item
      await API.inventory.deleteItem(id);
      
      // Create audit log
      await API.auditLogs.create({
        action: 'DELETE_ITEM',
        entity: 'InventoryItem',
        entityId: id,
        details: `Deleted inventory item: ${item.product.name}`
      });
      
      // Navigate back to inventory items list
      navigate('/inventory');
      
      // Show success message
      alert(`Item "${item.product.name}" has been deleted successfully.`);
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      setError('Failed to delete the item. Please try again later.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Item not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{item.product.name}</span>?
              This action cannot be undone and will remove all associated data including transfer and sales records.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/inventory" className="mr-4 text-gray-500 hover:text-gray-700">
            <FaArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.product.name}</h1>
            <p className="text-sm text-gray-500">
              SKU: {item.product.sku || 'N/A'} | Category: {item.product.category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className={`bg-gray-100 text-gray-700 px-3 py-2 rounded-md flex items-center ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            disabled={isRefreshing}
          >
            <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link
            to={`/inventory/items/${id}/edit`}
            className="bg-blue-600 text-white px-3 py-2 rounded-md flex items-center hover:bg-blue-700"
          >
            <FaEdit className="mr-2" /> Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-3 py-2 rounded-md flex items-center hover:bg-red-700"
          >
            <FaTrash className="mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* Item Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Item Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
            <p className="mt-1 text-lg text-gray-900">{item.quantity}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Unit Price</h3>
            <p className="mt-1 text-lg text-gray-900">${item.unitPrice.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
            <p className="mt-1 text-lg text-gray-900">${item.totalValue.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1 text-lg text-gray-900">
              {item.location.warehouse}, Zone {item.location.zone}, 
              Rack {item.location.rack}, Bin {item.location.bin}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${item.status === 'in_stock' ? 'bg-green-100 text-green-800' : 
                  item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' : 
                  item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'}`}
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </span>
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p className="mt-1 text-lg text-gray-900">{new Date(item.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs for Transfers and Sales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => document.getElementById('transfers-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="py-4 px-6 text-sm font-medium text-primary-600 border-b-2 border-primary-500"
            >
              <FaExchangeAlt className="inline-block mr-2" />
              Transfer Records ({transferRecords.length})
            </button>
            <button
              onClick={() => document.getElementById('sales-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <FaShoppingCart className="inline-block mr-2" />
              Sales Records ({saleRecords.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Transfer Records */}
      <div id="transfers-section" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            <FaExchangeAlt className="inline-block mr-2 text-blue-500" />
            Transfer Records
          </h2>
          <Link
            to="/inventory/transfer"
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-blue-700"
          >
            New Transfer
          </Link>
        </div>
        <div className="overflow-x-auto">
          {transferRecords.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Change
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transferRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.sourceLocation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.destinationLocation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.newPrice ? (
                        <div className="text-sm">
                          <span className="text-gray-500">${record.unitPrice.toLocaleString()}</span>
                          <span className="mx-1">→</span>
                          <span className="text-green-600 font-medium">${record.newPrice.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No change</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/inventory/transfers/${record.id}`} className="text-primary-600 hover:text-primary-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No transfer records found for this item.
            </div>
          )}
        </div>
      </div>

      {/* Sales Records */}
      <div id="sales-section" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            <FaShoppingCart className="inline-block mr-2 text-green-500" />
            Sales Records
          </h2>
          <Link
            to="/sales/new"
            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-green-700"
          >
            New Sale
          </Link>
        </div>
        <div className="overflow-x-auto">
          {saleRecords.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
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
                {saleRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${record.unitPrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${record.totalPrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'completed' ? 'bg-green-100 text-green-800' : record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/sales/${record.id}`} className="text-primary-600 hover:text-primary-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No sales records found for this item.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
