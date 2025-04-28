import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBoxOpen,
  FaPlus,
  FaTrash,
  FaFileInvoice,
  FaCalendarAlt,
  FaSearch,
  FaWarehouse,
  FaUsers
} from 'react-icons/fa';
import { FormField, FormSection, FormActions, SearchableSelect } from '../ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { WarehouseItem, InwardEntry } from '../../types/warehouse';

type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
};

type InwardItem = {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

const InwardForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, logActivity } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WarehouseItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [warehouseId, setWarehouseId] = useState('wh-1'); // Default to main warehouse
  const [supplierId, setSupplierId] = useState('');
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InwardItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch suppliers and warehouse items in parallel
        const [suppliersData, warehouseItemsData] = await Promise.all([
          API.suppliers.getAll(),
          API.warehouse.getItems()
        ]);

        // Transform suppliers data
        const transformedSuppliers: Supplier[] = suppliersData.map((supplier: any) => ({
          id: supplier.id,
          name: supplier.name,
          contactPerson: supplier.contactName,
          email: supplier.email
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

        setSuppliers(transformedSuppliers);
        setWarehouseItems(transformedItems);
        setFilteredItems(transformedItems);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load suppliers and warehouse items. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter items based on search term and category
  useEffect(() => {
    let filtered = [...warehouseItems];

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

  // Add a new item to the inward entry
  const addItem = () => {
    setItems([
      ...items,
      {
        id: `inward-item-${Date.now()}`,
        itemId: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0
      }
    ]);
  };

  // Remove an item from the inward entry
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Update an item in the inward entry
  const updateItem = (index: number, field: keyof InwardItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // If item or quantity or unit price changes, update the total price
    if (field === 'itemId') {
      const warehouseItem = warehouseItems.find(i => i.id === value);
      if (warehouseItem) {
        item.unitPrice = warehouseItem.costPrice;
        item.totalPrice = item.quantity * item.unitPrice;
      }
    } else if (field === 'quantity' || field === 'unitPrice') {
      item.totalPrice = item.quantity * item.unitPrice;
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

    if (!supplierId) {
      newErrors.supplierId = 'Supplier is required';
    }

    if (!receivedDate) {
      newErrors.receivedDate = 'Received date is required';
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

      if (item.unitPrice <= 0) {
        newErrors[`items[${index}].unitPrice`] = 'Unit price must be greater than 0';
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

      // Submit each inward entry to the API
      const inwardPromises = items.map(item => {
        return API.warehouse.createInwardRecord({
          warehouseId,
          itemId: item.itemId,
          supplierId,
          quantity: item.quantity,
          unitCost: item.unitPrice,
          batchNumber: referenceNumber || undefined,
          invoiceNumber: invoiceNumber || undefined,
          notes: notes || undefined
        });
      });

      // Wait for all inward entries to be submitted
      const results = await Promise.all(inwardPromises);

      console.log('Inward entries submitted:', results);

      // Log activity
      if (user) {
        const supplierName = suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
        logActivity(
          'warehouse_inward',
          `Added ${items.length} item(s) to warehouse from ${supplierName}`,
          'warehouse',
          results[0].inwardEntry.id
        );
      }

      // Navigate back to warehouse page
      navigate('/warehouse');
    } catch (error) {
      console.error('Error submitting inward entries:', error);
      alert('Failed to submit inward entries. Please try again.');
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
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Inward</h1>
          <p className="mt-1 text-sm text-gray-500">
            Record new items received into the warehouse from suppliers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection
          title="Inward Details"
          description="Specify the supplier and receipt information"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchableSelect
              label="Supplier"
              name="supplierId"
              value={supplierId}
              onChange={setSupplierId}
              options={suppliers.map(supplier => ({
                value: supplier.id,
                label: supplier.name,
                description: supplier.contactPerson,
                icon: <FaUsers className="text-primary-500" />
              }))}
              error={errors.supplierId}
              required
              placeholder="Select supplier"
            />

            <FormField
              label="Received Date"
              name="receivedDate"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              error={errors.receivedDate}
              required
            />

            <FormField
              label="Reference Number"
              name="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Optional reference number"
              helpText="Internal reference number for this receipt"
            />

            <FormField
              label="Invoice Number"
              name="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Supplier invoice number"
              helpText="Invoice number from the supplier"
            />
          </div>

          <FormField
            label="Notes"
            name="notes"
            as="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this receipt"
            rows={3}
          />
        </FormSection>

        <FormSection
          title="Search Items"
          description="Search for items to add to this inward entry"
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
                            id: `inward-item-${Date.now()}`,
                            itemId: item.id,
                            quantity: 1,
                            unitPrice: item.costPrice,
                            totalPrice: item.costPrice
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
                        <div className="text-xs text-gray-500">SKU: {item.sku} | Current Stock: {item.quantity}</div>
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
              <p className="text-gray-500">Search for items to add to this inward entry.</p>
            </div>
          )}
        </FormSection>

        <FormSection
          title="Inward Items"
          description="Items to be added to warehouse"
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
                        Unit Price
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
                              options={warehouseItems.map(i => ({
                                value: i.id,
                                label: i.name,
                                description: `SKU: ${i.sku} | Current Stock: ${i.quantity}`,
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
                              error={errors[`items[${index}].quantity`]}
                              required
                              className="mb-0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <FormField
                              label=""
                              name={`items[${index}].unitPrice`}
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                              min={0.01}
                              step={0.01}
                              error={errors[`items[${index}].unitPrice`]}
                              required
                              className="mb-0"
                            />
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
                      <td colSpan={3} className="px-6 py-4 text-right font-medium">
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
          submitText="Record Inward"
          cancelHref="/warehouse"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default InwardForm;
