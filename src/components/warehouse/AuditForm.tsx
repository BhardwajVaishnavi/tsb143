import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBoxOpen, 
  FaPlus, 
  FaTrash, 
  FaClipboardCheck, 
  FaCalendarAlt,
  FaSearch,
  FaWarehouse,
  FaArrowUp,
  FaArrowDown,
  FaEquals
} from 'react-icons/fa';
import { FormField, FormSection, FormActions, SearchableSelect } from '../ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { WarehouseItem, AuditEntry } from '../../types/warehouse';

type AuditItem = {
  id: string;
  itemId: string;
  systemQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  notes: string;
};

const AuditForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, logActivity } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WarehouseItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [warehouseId, setWarehouseId] = useState('wh-1'); // Default to main warehouse
  const [auditDate, setAuditDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<AuditItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Mock data loading
  useEffect(() => {
    // Simulate API call to fetch warehouse items
    setTimeout(() => {
      // Mock warehouse items
      const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Office Supplies', 'Spices'];
      const mockItems: WarehouseItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i + 1}`,
        sku: `SKU-${100000 + i}`,
        name: `Product ${i + 1}`,
        description: `Description for Product ${i + 1}`,
        categoryId: `cat-${(i % 5) + 1}`,
        supplierId: `supplier-${(i % 5) + 1}`,
        warehouseId: 'wh-1',
        quantity: Math.floor(Math.random() * 100) + 10, // Ensure some quantity
        unitPrice: Math.floor(Math.random() * 100) + 10,
        costPrice: Math.floor(Math.random() * 80) + 5,
        minStockLevel: 10,
        maxStockLevel: 100,
        reorderPoint: 20,
        status: 'in_stock',
        location: {
          zone: String.fromCharCode(65 + (i % 4)), // A, B, C, D
          rack: `R${Math.floor(i / 5) + 1}`,
          shelf: `S${(i % 3) + 1}`,
          bin: `B${(i % 10) + 1}`
        },
        lastUpdated: new Date().toISOString(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-1'
      }));
      
      setWarehouseItems(mockItems);
      setFilteredItems(mockItems);
      setIsLoading(false);
    }, 1000);
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
  
  // Add a new item to the audit
  const addItem = () => {
    setItems([
      ...items,
      {
        id: `audit-item-${Date.now()}`,
        itemId: '',
        systemQuantity: 0,
        actualQuantity: 0,
        discrepancy: 0,
        notes: ''
      }
    ]);
  };
  
  // Remove an item from the audit
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Update an item in the audit
  const updateItem = (index: number, field: keyof AuditItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // If item changes, update the system quantity
    if (field === 'itemId') {
      const warehouseItem = warehouseItems.find(i => i.id === value);
      if (warehouseItem) {
        item.systemQuantity = warehouseItem.quantity;
        item.discrepancy = item.actualQuantity - warehouseItem.quantity;
      }
    } 
    // If actual quantity changes, update the discrepancy
    else if (field === 'actualQuantity') {
      item.discrepancy = value - item.systemQuantity;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };
  
  // Get discrepancy icon and color
  const getDiscrepancyDisplay = (discrepancy: number) => {
    if (discrepancy > 0) {
      return {
        icon: <FaArrowUp className="text-green-500" />,
        color: 'text-green-500'
      };
    } else if (discrepancy < 0) {
      return {
        icon: <FaArrowDown className="text-red-500" />,
        color: 'text-red-500'
      };
    } else {
      return {
        icon: <FaEquals className="text-gray-500" />,
        color: 'text-gray-500'
      };
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!auditDate) {
      newErrors.auditDate = 'Audit date is required';
    }
    
    if (items.length === 0) {
      newErrors.items = 'At least one item must be added';
    }
    
    items.forEach((item, index) => {
      if (!item.itemId) {
        newErrors[`items[${index}].itemId`] = 'Item is required';
      }
      
      if (item.actualQuantity < 0) {
        newErrors[`items[${index}].actualQuantity`] = 'Actual quantity cannot be negative';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Create audit entries
    const auditEntries: AuditEntry[] = items.map(item => ({
      id: `audit-${Date.now()}-${item.id}`,
      warehouseId,
      itemId: item.itemId,
      systemQuantity: item.systemQuantity,
      actualQuantity: item.actualQuantity,
      discrepancy: item.discrepancy,
      auditedBy: user?.id || 'unknown',
      auditDate,
      status: 'pending',
      notes: item.notes || undefined,
      createdAt: new Date().toISOString()
    }));
    
    // Simulate API call to submit audit entries
    setTimeout(() => {
      console.log('Audit entries submitted:', auditEntries);
      
      // Log activity
      if (user) {
        logActivity(
          'inventory_audit',
          `Conducted audit of ${items.length} item(s) in warehouse`,
          'warehouse',
          auditEntries[0].id
        );
      }
      
      setIsSubmitting(false);
      navigate('/warehouse');
    }, 1500);
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
  
  // Calculate total discrepancy
  const totalDiscrepancy = items.reduce((total, item) => total + item.discrepancy, 0);
  const discrepancyDisplay = getDiscrepancyDisplay(totalDiscrepancy);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Audit</h1>
          <p className="mt-1 text-sm text-gray-500">
            Verify actual inventory quantities against system records
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <FormSection
          title="Audit Details"
          description="Provide information about when and why the audit is being conducted"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Audit Date"
              name="auditDate"
              type="date"
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
              error={errors.auditDate}
              required
            />
            
            <FormField
              label="Notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this audit"
              helpText="Any special circumstances or details about the audit"
            />
          </div>
        </FormSection>
        
        <FormSection
          title="Search Items"
          description="Search for items to include in the audit"
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
                            id: `audit-item-${Date.now()}`,
                            itemId: item.id,
                            systemQuantity: item.quantity,
                            actualQuantity: item.quantity, // Default to system quantity
                            discrepancy: 0,
                            notes: ''
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
                        <div className="text-xs text-gray-500">SKU: {item.sku} | System Qty: {item.quantity}</div>
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
              <p className="text-gray-500">Search for items to include in the audit.</p>
            </div>
          )}
        </FormSection>
        
        <FormSection
          title="Audit Items"
          description="Enter the actual quantities found during physical count"
        >
          {items.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FaClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
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
                        System Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discrepancy
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => {
                      const warehouseItem = warehouseItems.find(i => i.id === item.itemId);
                      const discrepancyDisplay = getDiscrepancyDisplay(item.discrepancy);
                      
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
                                description: `SKU: ${i.sku} | System Qty: ${i.quantity}`,
                                icon: <FaBoxOpen className="text-gray-500" />
                              }))}
                              error={errors[`items[${index}].itemId`]}
                              required
                              placeholder="Select an item"
                              className="mb-0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.systemQuantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <FormField
                              label=""
                              name={`items[${index}].actualQuantity`}
                              type="number"
                              value={item.actualQuantity}
                              onChange={(e) => updateItem(index, 'actualQuantity', parseInt(e.target.value))}
                              min={0}
                              error={errors[`items[${index}].actualQuantity`]}
                              required
                              className="mb-0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium flex items-center ${discrepancyDisplay.color}`}>
                              {discrepancyDisplay.icon}
                              <span className="ml-1">{item.discrepancy}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <FormField
                              label=""
                              name={`items[${index}].notes`}
                              value={item.notes}
                              onChange={(e) => updateItem(index, 'notes', e.target.value)}
                              placeholder="Optional notes"
                              className="mb-0"
                            />
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
                        Total Discrepancy:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium flex items-center ${discrepancyDisplay.color}`}>
                          {discrepancyDisplay.icon}
                          <span className="ml-1">{totalDiscrepancy}</span>
                        </div>
                      </td>
                      <td colSpan={2}></td>
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
          submitText="Submit Audit"
          cancelHref="/warehouse"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default AuditForm;
