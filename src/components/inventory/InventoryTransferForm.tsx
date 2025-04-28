import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaExchangeAlt,
  FaWarehouse,
  FaBoxes,
  FaPlus,
  FaTrash,
  FaInfoCircle,
  FaMoneyBillWave,
  FaPercentage,
  FaHistory,
  FaUser
} from 'react-icons/fa';
import { FormField, FormSection, FormActions, SearchableSelect } from '../ui/forms';

// Types
type InventoryLocation = {
  id: string;
  name: string;
  type: 'warehouse' | 'inventory';
  description?: string;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  currentPrice: number;
  quantity: number;
  location: string;
};

type TransferItem = {
  id: string;
  productId: string;
  quantity: number;
  currentPrice: number;
  newPrice: number | null;
  priceAdjustmentType: 'none' | 'fixed' | 'percentage';
  priceAdjustmentValue: number;
};

const InventoryTransferForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, logActivity } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transferHistory, setTransferHistory] = useState<{userId: string, userName: string, timestamp: string}[]>([]);

  // Form state
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TransferItem[]>([]);

  // Load real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch locations
        let locationsData = [];
        try {
          locationsData = await API.locations.getAll();
        } catch (error) {
          console.error('Error fetching locations:', error);
          // Use sample data if API fails
          locationsData = [
            { id: 'wh-1', name: 'Main Warehouse', type: 'warehouse', description: 'Primary storage facility' },
            { id: 'inv-1', name: 'Main Inventory', type: 'inventory', description: 'Primary sales inventory' },
            { id: 'wh-2', name: 'Secondary Warehouse', type: 'warehouse', description: 'Overflow storage' },
            { id: 'inv-2', name: 'Online Store Inventory', type: 'inventory', description: 'E-commerce inventory' }
          ];
        }
        setLocations(locationsData);

        // Fetch products
        let productsData = [];
        try {
          productsData = await API.products.getAll();
        } catch (error) {
          console.error('Error fetching products:', error);
          // Use sample data if API fails
          productsData = Array.from({ length: 10 }, (_, i) => ({
            id: `product-${i + 1}`,
            sku: `SKU-${1000 + i}`,
            name: `Sample Product ${i + 1}`,
            category: {
              id: `cat-${(i % 3) + 1}`,
              name: `Category ${(i % 3) + 1}`
            },
            currentPrice: 50 + (i * 10),
            quantity: 100 - (i * 5),
            location: 'Main Warehouse'
          }));
        }
        setProducts(productsData);

        // Define standard locations (in a real app, these would come from the API)
        const standardLocations: InventoryLocation[] = [
          { id: 'wh-1', name: 'Main Warehouse', type: 'warehouse', description: 'Primary storage facility' },
          { id: 'wh-2', name: 'Secondary Warehouse', type: 'warehouse', description: 'Overflow storage' },
          { id: 'inv-1', name: 'Retail Inventory', type: 'inventory', description: 'Main store inventory' },
          { id: 'inv-2', name: 'Online Inventory', type: 'inventory', description: 'E-commerce inventory' },
          { id: 'inv-3', name: 'Wholesale Inventory', type: 'inventory', description: 'Wholesale customer inventory' },
        ];

        // Fetch warehouse items
        const warehouseItems = await API.warehouse.getItems();

        // Fetch inventory items
        const inventoryItems = await API.inventory.getItems();

        // Transform warehouse items to products
        const warehouseProducts: Product[] = Array.isArray(warehouseItems)
          ? warehouseItems.map((item: any) => ({
              id: item.id,
              sku: item.sku || `SKU-${item.id}`,
              name: item.productName || 'Unknown Product',
              category: {
                id: item.categoryId || 'unknown',
                name: item.category || 'Uncategorized',
              },
              currentPrice: item.unitCost || 0,
              quantity: item.quantity || 0,
              location: 'wh-1', // Default to main warehouse
            }))
          : [];

        // Transform inventory items to products
        const inventoryProducts: Product[] = Array.isArray(inventoryItems)
          ? inventoryItems.map((item: any) => ({
              id: item.id,
              sku: item.sku || `SKU-${item.id}`,
              name: item.product?.name || 'Unknown Product',
              category: {
                id: item.product?.categoryId || 'unknown',
                name: item.product?.category?.name || 'Uncategorized',
              },
              currentPrice: item.unitPrice || 0,
              quantity: item.quantity || 0,
              location: 'inv-1', // Default to retail inventory
            }))
          : [];

        // Combine products
        const allProducts = [...warehouseProducts, ...inventoryProducts];

        setLocations(standardLocations);
        setProducts(allProducts.length > 0 ? allProducts : generateSampleProducts(standardLocations));
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to sample data if API fails
        setLocations([
          { id: 'wh-1', name: 'Main Warehouse', type: 'warehouse', description: 'Primary storage facility' },
          { id: 'inv-1', name: 'Retail Inventory', type: 'inventory', description: 'Main store inventory' },
        ]);
        setProducts(generateSampleProducts());
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to generate sample products if API fails
    const generateSampleProducts = (locs?: InventoryLocation[]) => {
      const locations = locs || [
        { id: 'wh-1', name: 'Main Warehouse', type: 'warehouse' },
        { id: 'inv-1', name: 'Retail Inventory', type: 'inventory' },
      ];

      return Array.from({ length: 5 }, (_, i) => ({
        id: `sample-${i + 1}`,
        sku: `SAMPLE-${1000 + i}`,
        name: `Sample Product ${i + 1}`,
        category: {
          id: 'sample-cat',
          name: 'Sample Category',
        },
        currentPrice: 25 + i * 5,
        quantity: 10 + i * 2,
        location: locations[i % locations.length].id,
      }));
    };

    fetchData();
  }, []);

  // Filter products based on selected source location
  useEffect(() => {
    if (sourceLocationId) {
      const filtered = products.filter(product => product.location === sourceLocationId);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [sourceLocationId, products]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!sourceLocationId) {
      newErrors.sourceLocationId = 'Source location is required';
    }

    if (!destinationLocationId) {
      newErrors.destinationLocationId = 'Destination location is required';
    }

    if (sourceLocationId === destinationLocationId) {
      newErrors.destinationLocationId = 'Source and destination cannot be the same';
    }

    if (!transferDate) {
      newErrors.transferDate = 'Transfer date is required';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one item must be added to the transfer';
    }

    items.forEach((item, index) => {
      if (item.quantity <= 0) {
        newErrors[`items[${index}].quantity`] = 'Quantity must be greater than 0';
      }

      const product = products.find(p => p.id === item.productId);
      if (product && item.quantity > product.quantity) {
        newErrors[`items[${index}].quantity`] = `Quantity cannot exceed available stock (${product.quantity})`;
      }

      if (item.priceAdjustmentType !== 'none') {
        if (item.priceAdjustmentValue <= 0) {
          newErrors[`items[${index}].priceAdjustmentValue`] = 'Adjustment value must be greater than 0';
        }

        if (item.priceAdjustmentType === 'percentage' && item.priceAdjustmentValue > 100) {
          newErrors[`items[${index}].priceAdjustmentValue`] = 'Percentage cannot exceed 100%';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Import API utility
      const { API } = await import('../../utils/api');

      // Record who is making the transfer
      const transferRecord = {
        userId: user?.id || 'unknown',
        userName: user?.fullName || 'Unknown User',
        timestamp: new Date().toISOString()
      };

      // Update transfer history
      setTransferHistory([...transferHistory, transferRecord]);

      // Get source and destination location names for the audit log
      const sourceName = locations.find(loc => loc.id === sourceLocationId)?.name || sourceLocationId;
      const destName = locations.find(loc => loc.id === destinationLocationId)?.name || destinationLocationId;

      // Create a detailed transfer object
      const transferData = {
        sourceLocationId,
        sourceLocationName: sourceName,
        destinationLocationId,
        destinationLocationName: destName,
        transferDate,
        referenceNumber: referenceNumber || `TR-${Date.now().toString().substring(6)}`,
        notes,
        items: items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            currentPrice: item.currentPrice,
            newPrice: item.newPrice,
            priceAdjustmentType: item.priceAdjustmentType,
            priceAdjustmentValue: item.priceAdjustmentValue,
            productName: product?.name,
            productSku: product?.sku,
            categoryName: product?.category.name
          };
        }),
        createdBy: user?.id || 'unknown'
      };

      // Submit the transfer to the API
      let response;
      try {
        response = await API.inventory.createTransfer(transferData);
        console.log('Transfer submitted:', response);
      } catch (error) {
        console.error('Error submitting transfer to API:', error);
        throw error;
      }

      // Create audit log
      await API.auditLogs.create({
        action: 'INVENTORY_TRANSFER',
        entity: 'InventoryTransfer',
        entityId: response.id || 'unknown',
        details: `Transferred ${items.length} product(s) from ${sourceName} to ${destName}`
      });

      // Log the activity
      if (user) {
        logActivity(
          'inventory_transfer',
          `Transferred ${items.length} product(s) from ${sourceName} to ${destName}`,
          'inventory',
          response.id || 'unknown'
        );
      }

      // Navigate back to inventory page
      navigate('/inventory');
    } catch (error) {
      console.error('Error submitting transfer:', error);
      setError('Failed to submit transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new item to the transfer
  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        productId: '',
        quantity: 1,
        currentPrice: 0,
        newPrice: null,
        priceAdjustmentType: 'none',
        priceAdjustmentValue: 0,
      },
    ]);
  };

  // Remove an item from the transfer
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Update an item in the transfer
  const updateItem = (index: number, field: keyof TransferItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // If product is changed, update the current price
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.currentPrice = product.currentPrice;

        // Reset price adjustment when product changes
        item.priceAdjustmentType = 'none';
        item.priceAdjustmentValue = 0;
        item.newPrice = null;
      }
    }

    // Calculate new price based on adjustment type and value
    if (field === 'priceAdjustmentType' || field === 'priceAdjustmentValue') {
      if (item.priceAdjustmentType === 'none') {
        item.newPrice = null;
      } else if (item.priceAdjustmentType === 'fixed') {
        item.newPrice = item.priceAdjustmentValue;
      } else if (item.priceAdjustmentType === 'percentage') {
        item.newPrice = item.currentPrice * (1 + item.priceAdjustmentValue / 100);
      }
    }

    newItems[index] = item;
    setItems(newItems);
  };

  // Check if source location is a warehouse
  const isSourceWarehouse = () => {
    const sourceLocation = locations.find(loc => loc.id === sourceLocationId);
    return sourceLocation?.type === 'warehouse';
  };

  // Check if destination location is an inventory
  const isDestinationInventory = () => {
    const destLocation = locations.find(loc => loc.id === destinationLocationId);
    return destLocation?.type === 'inventory';
  };

  // Check if price adjustment is required
  const isPriceAdjustmentRequired = () => {
    return isSourceWarehouse() && isDestinationInventory();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Inventory Transfer</h1>
          <p className="mt-1 text-sm text-gray-500">
            Transfer items between warehouses and inventory locations
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection
          title="Transfer Details"
          description="Specify the source and destination locations for this transfer"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchableSelect
              label="Source Location"
              name="sourceLocationId"
              value={sourceLocationId}
              onChange={setSourceLocationId}
              options={locations.map(loc => ({
                value: loc.id,
                label: loc.name,
                description: loc.description,
                icon: loc.type === 'warehouse' ? <FaWarehouse /> : <FaBoxes />,
              }))}
              error={errors.sourceLocationId}
              required
              placeholder="Select source location"
            />

            <SearchableSelect
              label="Destination Location"
              name="destinationLocationId"
              value={destinationLocationId}
              onChange={setDestinationLocationId}
              options={locations
                .filter(loc => loc.id !== sourceLocationId)
                .map(loc => ({
                  value: loc.id,
                  label: loc.name,
                  description: loc.description,
                  icon: loc.type === 'warehouse' ? <FaWarehouse /> : <FaBoxes />,
                }))}
              error={errors.destinationLocationId}
              required
              placeholder="Select destination location"
              disabled={!sourceLocationId}
            />

            <FormField
              label="Transfer Date"
              name="transferDate"
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              error={errors.transferDate}
              required
            />

            <FormField
              label="Reference Number"
              name="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Optional reference number"
              helpText="Internal reference number for this transfer"
            />
          </div>

          <FormField
            label="Notes"
            name="notes"
            as="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this transfer"
            rows={3}
          />
        </FormSection>

        <FormSection
          title="Transfer Items"
          description="Select items to transfer and specify quantities"
        >
          {isPriceAdjustmentRequired() && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Price Adjustment Required</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      You are transferring items from a warehouse to an inventory location.
                      You may adjust the pricing for these items as they move to the new location.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FaBoxes className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items added</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding an item to this transfer</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!sourceLocationId}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                  Add Item
                </button>
              </div>
            </div>
          ) : (
            <div>
              {errors.items && (
                <div className="mb-4 text-sm text-red-600">{errors.items}</div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      {isPriceAdjustmentRequired() && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price Adjustment
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            New Price
                          </th>
                        </>
                      )}
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);

                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <SearchableSelect
                              label=""
                              name={`items[${index}].productId`}
                              value={item.productId}
                              onChange={(value) => updateItem(index, 'productId', value)}
                              options={filteredProducts.map(p => ({
                                value: p.id,
                                label: p.name,
                                description: `SKU: ${p.sku} | Available: ${p.quantity}`,
                              }))}
                              error={errors[`items[${index}].productId`]}
                              required
                              placeholder="Select a product"
                              className="mb-0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <FormField
                              label=""
                              name={`items[${index}].quantity`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                              min={1}
                              max={product?.quantity || 9999}
                              error={errors[`items[${index}].quantity`]}
                              required
                              className="mb-0"
                            />
                          </td>
                          {isPriceAdjustmentRequired() && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  ${item.currentPrice.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={item.priceAdjustmentType}
                                    onChange={(e) => updateItem(index, 'priceAdjustmentType', e.target.value)}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                  >
                                    <option value="none">No adjustment</option>
                                    <option value="fixed">Fixed price</option>
                                    <option value="percentage">Percentage</option>
                                  </select>

                                  {item.priceAdjustmentType !== 'none' && (
                                    <div className="relative flex-1">
                                      <FormField
                                        label=""
                                        name={`items[${index}].priceAdjustmentValue`}
                                        type="number"
                                        value={item.priceAdjustmentValue}
                                        onChange={(e) => updateItem(index, 'priceAdjustmentValue', parseFloat(e.target.value))}
                                        min={0}
                                        step={item.priceAdjustmentType === 'percentage' ? 0.1 : 0.01}
                                        error={errors[`items[${index}].priceAdjustmentValue`]}
                                        required
                                        className="mb-0"
                                      />
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        {item.priceAdjustmentType === 'fixed' ? (
                                          <FaMoneyBillWave className="h-4 w-4 text-gray-400" />
                                        ) : (
                                          <FaPercentage className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.newPrice !== null ? (
                                  <div className="text-sm font-medium text-green-600">
                                    ${item.newPrice.toFixed(2)}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    No change
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FaPlus className="-ml-0.5 mr-2 h-4 w-4" />
                  Add Another Item
                </button>
              </div>
            </div>
          )}
        </FormSection>

        {user?.role === 'admin' && (
          <FormSection
            title="Transfer History"
            description="View the history of this transfer"
            collapsible
            defaultExpanded={false}
          >
            <div className="bg-gray-50 p-4 rounded-lg">
              {transferHistory.length === 0 ? (
                <div className="text-center py-4">
                  <FaHistory className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No transfer history yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {transferHistory.map((record, index) => (
                    <li key={index} className="py-3 flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <FaUser className="text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FormSection>
        )}

        <FormActions
          submitText="Create Transfer"
          cancelHref="/inventory"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default InventoryTransferForm;
