import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBoxOpen,
  FaPlus,
  FaTrash,
  FaExchangeAlt,
  FaCalendarAlt,
  FaSearch,
  FaWarehouse,
  FaStore,
  FaMoneyBillWave,
  FaPercentage
} from 'react-icons/fa';
import { FormField, FormSection, FormActions, SearchableSelect } from '../ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { WarehouseItem, Inventory, OutwardEntry } from '../../types/warehouse';

type OutwardItem = {
  id: string;
  itemId: string;
  quantity: number;
  warehouseUnitPrice: number;
  newUnitPrice: number;
  totalPrice: number;
  priceAdjustmentType: 'none' | 'fixed' | 'percentage';
  priceAdjustmentValue: number;
};

const OutwardForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, logActivity } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WarehouseItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [warehouseId, setWarehouseId] = useState('wh-1'); // Default to main warehouse
  const [inventoryId, setInventoryId] = useState('');
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OutwardItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch inventories and warehouse items in parallel
        const [warehouseItemsData] = await Promise.all([
          API.warehouse.getItems()
        ]);

        // Fetch inventories
        let inventoriesData = [];
        try {
          inventoriesData = await API.inventory.getLocations();
        } catch (error) {
          console.error('Error fetching inventories:', error);
          // Fallback to mock data if API fails
          inventoriesData = [
            {
              id: 'inv-1',
              name: 'Main Store Inventory',
              location: 'Main Store',
              warehouseId: 'wh-1',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'inv-2',
              name: 'Branch Store Inventory',
              location: 'Branch Store',
              warehouseId: 'wh-1',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
        }

        // Transform inventory data
        const transformedInventories: Inventory[] = inventoriesData.map((inv: any) => ({
          id: inv.id,
          name: inv.name,
          location: inv.location || inv.address || 'Unknown',
          warehouseId: inv.warehouseId || 'wh-1',
          status: inv.status || 'active',
          createdAt: inv.createdAt || new Date().toISOString(),
          updatedAt: inv.updatedAt || new Date().toISOString()
        }));

        // Transform warehouse items data
        const transformedItems: WarehouseItem[] = warehouseItemsData.map((item: any) => ({
          id: item.id,
          sku: item.sku || `SKU-${item.id}`,
          name: item.productName,
          description: item.description || '',
          categoryId: item.categoryId || 'cat-1',
          supplierId: item.supplierId,
          warehouseId: item.warehouseId || 'wh-1',
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.unitCost,
          costPrice: item.costPrice || item.unitCost,
          minStockLevel: item.minStockLevel || 10,
          maxStockLevel: item.maxStockLevel || 100,
          reorderPoint: item.reorderPoint || 20,
          status: item.status || 'in_stock',
          location: {
            zone: item.locationZone || 'A',
            rack: item.locationRack || 'R1',
            shelf: item.locationShelf || 'S1',
            bin: item.locationBin || 'B1'
          },
          lastUpdated: item.updatedAt || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
          createdBy: item.createdBy || 'user-1'
        }));

        setInventories(transformedInventories);
        setWarehouseItems(transformedItems);
        setFilteredItems(transformedItems);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load warehouse items. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter items based on search term and category
  useEffect(() => {
    let filtered = [...warehouseItems];

    // Only show items with quantity > 0
    filtered = filtered.filter(item => item.quantity > 0);

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, warehouseItems]);

  // Add a new item to the outward entry
  const addItem = () => {
    setItems([
      ...items,
      {
        id: `outward-item-${Date.now()}`,
        itemId: '',
        quantity: 1,
        warehouseUnitPrice: 0,
        newUnitPrice: 0,
        totalPrice: 0,
        priceAdjustmentType: 'none',
        priceAdjustmentValue: 0
      }
    ]);
  };

  // Remove an item from the outward entry
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Update an item in the outward entry
  const updateItem = (index: number, field: keyof OutwardItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // If item changes, update the warehouse unit price
    if (field === 'itemId') {
      const warehouseItem = warehouseItems.find(i => i.id === value);
      if (warehouseItem) {
        item.warehouseUnitPrice = warehouseItem.unitPrice;
        item.newUnitPrice = warehouseItem.unitPrice; // Default to same price
        item.totalPrice = item.quantity * item.newUnitPrice;
      }
    }
    // If quantity changes, update the total price
    else if (field === 'quantity') {
      item.totalPrice = item.quantity * item.newUnitPrice;
    }
    // If price adjustment type or value changes, recalculate the new price
    else if (field === 'priceAdjustmentType' || field === 'priceAdjustmentValue') {
      if (field === 'priceAdjustmentType' && value === 'none') {
        item.priceAdjustmentValue = 0;
        item.newUnitPrice = item.warehouseUnitPrice;
      } else if (field === 'priceAdjustmentType' && value === 'fixed') {
        item.newUnitPrice = item.priceAdjustmentValue;
      } else if (field === 'priceAdjustmentType' && value === 'percentage') {
        item.newUnitPrice = item.warehouseUnitPrice * (1 + item.priceAdjustmentValue / 100);
      } else if (field === 'priceAdjustmentValue') {
        if (item.priceAdjustmentType === 'fixed') {
          item.newUnitPrice = value;
        } else if (item.priceAdjustmentType === 'percentage') {
          item.newUnitPrice = item.warehouseUnitPrice * (1 + value / 100);
        }
      }

      item.totalPrice = item.quantity * item.newUnitPrice;
    }
    // If new unit price changes directly, update the total price
    else if (field === 'newUnitPrice') {
      item.totalPrice = item.quantity * value;

      // Update the price adjustment type and value
      if (value === item.warehouseUnitPrice) {
        item.priceAdjustmentType = 'none';
        item.priceAdjustmentValue = 0;
      } else {
        item.priceAdjustmentType = 'fixed';
        item.priceAdjustmentValue = value;
      }
    }

    newItems[index] = item;
    setItems(newItems);
  };

  // Calculate total amount
  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!inventoryId) {
      newErrors.inventoryId = 'Inventory is required';
    }

    if (!transferDate) {
      newErrors.transferDate = 'Transfer date is required';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one item must be added';
    }

    items.forEach((item, index) => {
      if (!item.itemId) {
        newErrors[`items[${index}].itemId`] = 'Item is required';
      }

      if (item.quantity <= 0) {
        newErrors[`items[${index}].quantity`] = 'Quantity must be greater than 0';
      }

      const warehouseItem = warehouseItems.find(i => i.id === item.itemId);
      if (warehouseItem && item.quantity > warehouseItem.quantity) {
        newErrors[`items[${index}].quantity`] = `Quantity cannot exceed available stock (${warehouseItem.quantity})`;
      }

      if (item.newUnitPrice <= 0) {
        newErrors[`items[${index}].newUnitPrice`] = 'Unit price must be greater than 0';
      }

      if (item.priceAdjustmentType === 'percentage' && item.priceAdjustmentValue > 100) {
        newErrors[`items[${index}].priceAdjustmentValue`] = 'Percentage cannot exceed 100%';
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

      // Submit each outward entry to the API
      const outwardPromises = items.map(item => {
        return API.warehouse.createOutwardRecord({
          warehouseId,
          itemId: item.itemId,
          quantity: item.quantity,
          destination: inventories.find(i => i.id === inventoryId)?.name || 'Unknown Inventory',
          status: 'completed',
          notes: notes || undefined
        });
      });

      // Wait for all outward entries to be submitted
      const results = await Promise.all(outwardPromises);

      console.log('Outward entries submitted:', results);

      // Log activity
      if (user) {
        const inventoryName = inventories.find(i => i.id === inventoryId)?.name || 'Unknown Inventory';
        logActivity(
          'warehouse_outward',
          `Transferred ${items.length} item(s) from warehouse to ${inventoryName}`,
          'warehouse',
          results[0].outwardEntry.id
        );
      }

      // Navigate back to warehouse page
      navigate('/warehouse');
    } catch (error) {
      console.error('Error submitting outward entries:', error);
      alert('Failed to submit outward entries. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Get unique categories for filtering
  const categories = Array.from(new Set(warehouseItems.map(item => item.categoryId)))
    .map(categoryId => {
      const categoryNames = ['Electronics', 'Clothing', 'Home & Kitchen', 'Office Supplies', 'Spices'];
      return {
        id: categoryId,
        name: categoryNames[parseInt(categoryId.split('-')[1]) - 1]
      };
    });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Outward</h1>
          <p className="mt-1 text-sm text-gray-500">
            Transfer items from warehouse to inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection
          title="Outward Details"
          description="Specify the destination inventory and transfer information"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchableSelect
              label="Destination Inventory"
              name="inventoryId"
              value={inventoryId}
              onChange={setInventoryId}
              options={inventories.map(inventory => ({
                value: inventory.id,
                label: inventory.name,
                description: inventory.location,
                icon: <FaStore className="text-primary-500" />
              }))}
              error={errors.inventoryId}
              required
              placeholder="Select destination inventory"
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

            <FormField
              label="Notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this transfer"
              helpText="Any special instructions or details"
            />
          </div>
        </FormSection>

        <FormSection
          title="Search Items"
          description="Search for items to transfer from warehouse to inventory"
          collapsible
          defaultExpanded={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.slice(0, 9).map(item => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-lg border border-gray-200 hover:border-primary-500 cursor-pointer"
                    onClick={() => {
                      // Check if item is already added
                      if (!items.some(i => i.itemId === item.id)) {
                        setItems([
                          ...items,
                          {
                            id: `outward-item-${Date.now()}`,
                            itemId: item.id,
                            quantity: 1,
                            warehouseUnitPrice: item.unitPrice,
                            newUnitPrice: item.unitPrice,
                            totalPrice: item.unitPrice,
                            priceAdjustmentType: 'none',
                            priceAdjustmentValue: 0
                          }
                        ]);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <FaBoxOpen className="text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">SKU: {item.sku} | Available: {item.quantity}</div>
                        <div className="text-xs text-gray-500">Price: ₹{item.unitPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length > 9 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing 9 of {filteredItems.length} items. Refine your search to see more specific results.
                </div>
              )}
            </div>
          ) : searchTerm || selectedCategory ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">No items found matching your search criteria.</p>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">Search for items to transfer from warehouse to inventory.</p>
            </div>
          )}
        </FormSection>

        <FormSection
          title="Outward Items"
          description="Items to be transferred from warehouse to inventory"
        >
          {items.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FaBoxOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items added</h3>
              <p className="mt-1 text-sm text-gray-500">Search for items above or add an item manually</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                  Add Item Manually
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
                        Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warehouse Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price Adjustment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        New Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => {
                      const warehouseItem = warehouseItems.find(i => i.id === item.itemId);

                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <SearchableSelect
                              label=""
                              name={`items[${index}].itemId`}
                              value={item.itemId}
                              onChange={(value) => updateItem(index, 'itemId', value)}
                              options={warehouseItems
                                .filter(i => i.quantity > 0)
                                .map(i => ({
                                  value: i.id,
                                  label: i.name,
                                  description: `SKU: ${i.sku} | Available: ${i.quantity}`,
                                  icon: <FaBoxOpen className="text-gray-500" />
                                }))}
                              error={errors[`items[${index}].itemId`]}
                              required
                              placeholder="Select an item"
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
                              max={warehouseItem?.quantity || 9999}
                              error={errors[`items[${index}].quantity`]}
                              required
                              className="mb-0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ₹{item.warehouseUnitPrice.toFixed(2)}
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
                            <div className="text-sm font-medium text-green-600">
                              ₹{item.newUnitPrice.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{item.totalPrice.toFixed(2)}
                            </div>
                          </td>
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
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4 text-right font-medium">
                        Total:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        ₹{calculateTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
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

        <FormActions
          submitText="Record Outward Transfer"
          cancelHref="/warehouse"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default OutwardForm;
