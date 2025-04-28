import React, { useState, useEffect } from 'react';
import {
  FaClipboardCheck,
  FaBoxes,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaPlus,
  FaTrash,
  FaSave,
  FaUser,
  FaCalendarAlt,
  FaWarehouse
} from 'react-icons/fa';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface InventoryItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: {
      id: string;
      name: string;
    };
  };
  quantity: number;
  location: {
    id: string;
    name: string;
  };
}

interface AuditItem {
  inventoryItemId: string;
  productName: string;
  sku: string;
  category: string;
  expectedQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  notes: string;
  updateInventory: boolean;
}

interface InventoryAuditProps {
  onComplete?: (auditData: any) => void;
  locationId?: string;
}

type Props = InventoryAuditProps;

const InventoryAudit = ({ onComplete, locationId: propLocationId }: Props) => {
  const { user, logActivity } = useAuth();
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [locationId, setLocationId] = useState<string>(propLocationId || '');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [auditDate, setAuditDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch locations
        const locationsData = await API.locations.getAll();
        setLocations(locationsData);

        // Set default location if provided
        if (propLocationId && locationsData.some(loc => loc.id === propLocationId)) {
          setLocationId(propLocationId);
          fetchInventoryItems(propLocationId);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to load locations');
      }
    };

    fetchLocations();
  }, [propLocationId]);

  // Fetch inventory items when location changes
  const fetchInventoryItems = async (locId: string) => {
    if (!locId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Import API utility
      const { API } = await import('../../utils/api');

      // Fetch inventory items for the selected location
      const items = await API.inventory.getItems();
      const locationItems = items.filter(item => item.locationId === locId);
      setInventoryItems(locationItems);

      // Initialize audit items
      const initialAuditItems = locationItems.map(item => ({
        inventoryItemId: item.id,
        productName: item.product.name,
        sku: item.product.sku,
        category: item.product.category?.name || 'Uncategorized',
        expectedQuantity: item.quantity,
        actualQuantity: item.quantity, // Default to expected quantity
        discrepancy: 0,
        notes: '',
        updateInventory: true
      }));

      setAuditItems(initialAuditItems);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setError('Failed to load inventory items');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locId = e.target.value;
    setLocationId(locId);
    fetchInventoryItems(locId);
  };

  // Handle actual quantity change
  const handleQuantityChange = (index: number, value: number) => {
    const updatedItems = [...auditItems];
    updatedItems[index].actualQuantity = value;
    updatedItems[index].discrepancy = value - updatedItems[index].expectedQuantity;
    setAuditItems(updatedItems);
  };

  // Handle notes change
  const handleNotesChange = (index: number, value: string) => {
    const updatedItems = [...auditItems];
    updatedItems[index].notes = value;
    setAuditItems(updatedItems);
  };

  // Handle update inventory toggle
  const handleUpdateInventoryToggle = (index: number) => {
    const updatedItems = [...auditItems];
    updatedItems[index].updateInventory = !updatedItems[index].updateInventory;
    setAuditItems(updatedItems);
  };

  // Submit audit
  const handleSubmitAudit = async () => {
    if (!locationId) {
      setError('Please select a location');
      return;
    }

    if (auditItems.length === 0) {
      setError('No items to audit');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Import API utility
      const { API } = await import('../../utils/api');

      // Prepare audit data
      const auditData = {
        locationId,
        auditDate: new Date(auditDate),
        conductedById: user?.id,
        notes,
        items: auditItems
      };

      // Submit audit
      const result = await API.inventory.createAudit(auditData);

      setSuccess('Audit completed successfully');

      // Log the activity
      logActivity(
        'CREATE',
        `Conducted inventory audit for ${locations.find(loc => loc.id === locationId)?.name || locationId}`,
        'InventoryAudit',
        result.audit?.id
      );

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error submitting audit:', error);
      setError('Failed to submit audit');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter audit items based on search term
  const filteredAuditItems = auditItems.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalItems = auditItems.length;
  const itemsWithDiscrepancies = auditItems.filter(item => item.discrepancy !== 0).length;
  const totalDiscrepancy = auditItems.reduce((sum, item) => sum + Math.abs(item.discrepancy), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Inventory Audit</h2>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-100">
                <FaCalendarAlt className="text-gray-500" />
              </div>
              <input
                type="date"
                className="px-3 py-2 border-0 focus:ring-0"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
              />
            </div>
          </div>

          <button
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmitAudit}
            disabled={isLoading || !locationId || auditItems.length === 0}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Submit Audit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheck className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaWarehouse className="text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={locationId}
            onChange={handleLocationChange}
            disabled={isLoading || !!propLocationId}
          >
            <option value="">Select Location</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Audit Notes
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          rows={3}
          placeholder="Enter any general notes about this audit..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {locationId && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <FaBoxes className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-500">Total Items</p>
                  <p className="text-2xl font-bold text-blue-700">{totalItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 mr-4">
                  <FaExclamationTriangle className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">Items with Discrepancies</p>
                  <p className="text-2xl font-bold text-yellow-700">{itemsWithDiscrepancies}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <FaExclamationTriangle className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-500">Total Discrepancy</p>
                  <p className="text-2xl font-bold text-red-700">{totalDiscrepancy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Audit Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discrepancy</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Inventory</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : filteredAuditItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No items found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAuditItems.map((item, index) => {
                    const originalIndex = auditItems.findIndex(i => i.inventoryItemId === item.inventoryItemId);
                    return (
                      <tr key={item.inventoryItemId} className={item.discrepancy !== 0 ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expectedQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            className={`w-20 px-2 py-1 border rounded-md ${
                              item.discrepancy !== 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            value={item.actualQuantity}
                            onChange={(e) => handleQuantityChange(originalIndex, parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          item.discrepancy > 0 ? 'text-green-600' : item.discrepancy < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            className={`p-2 rounded-md ${
                              item.updateInventory ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                            }`}
                            onClick={() => handleUpdateInventoryToggle(originalIndex)}
                            disabled={item.discrepancy === 0}
                          >
                            {item.updateInventory ? <FaCheck /> : <FaTimes />}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            placeholder="Notes..."
                            value={item.notes}
                            onChange={(e) => handleNotesChange(originalIndex, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryAudit;
