import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaBoxOpen,
  FaBarcode,
  FaWarehouse,
  FaUsers,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaInfoCircle,
  FaImage,
  FaTag,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import { FormField, FormSection, FormActions, SearchableSelect } from '../ui/forms';
import ImageUpload from '../common/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';

type Category = {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
};

type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
};

type Warehouse = {
  id: string;
  name: string;
  location?: string;
};

type WarehouseItemFormData = {
  sku: string;
  productName: string;
  description: string;
  categoryId: string;
  supplierId: string;
  warehouseId: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  expiryDate?: string;
  batchNumber?: string;
  barcode?: string;
  location?: {
    zone: string;
    rack: string;
    shelf: string;
    bin: string;
  };
  tags: string[];
  notes: string;
  image?: File | null;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'discontinued';
};

const WarehouseItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logActivity } = useAuth();
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WarehouseItemFormData>({
    sku: '',
    productName: '',
    description: '',
    categoryId: '',
    supplierId: '',
    warehouseId: '',
    quantity: 0,
    unitPrice: 0,
    costPrice: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderPoint: 0,
    location: {
      zone: '',
      rack: '',
      shelf: '',
      bin: ''
    },
    tags: [],
    notes: '',
    image: null,
    imageUrl: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [tagInput, setTagInput] = useState('');

  // New category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', parentId: '' });

  useEffect(() => {
    // Fetch reference data
    const fetchReferenceData = async () => {
      try {
        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch categories
        try {
          const categoriesData = await API.products.getCategories();
          if (Array.isArray(categoriesData)) {
            setCategories(categoriesData.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              description: cat.description,
              parentId: cat.parentId
            })));
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          setCategories([]);
        }

        // Fetch suppliers
        try {
          const suppliersData = await API.suppliers.getAll();
          if (Array.isArray(suppliersData)) {
            setSuppliers(suppliersData.map((supplier: any) => ({
              id: supplier.id,
              name: supplier.name,
              contactPerson: supplier.contactPerson,
              email: supplier.email
            })));
          }
        } catch (error) {
          console.error('Error fetching suppliers:', error);
          setSuppliers([]);
        }

        // Fetch warehouses
        try {
          const warehousesData = await API.locations.getAll();
          if (Array.isArray(warehousesData)) {
            setWarehouses(warehousesData.filter((loc: any) => loc.type === 'warehouse').map((warehouse: any) => ({
              id: warehouse.id,
              name: warehouse.name,
              location: warehouse.address
            })));
          }
        } catch (error) {
          console.error('Error fetching warehouses:', error);
          setWarehouses([]);
        }
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();

    // If in edit mode, fetch the warehouse item data
    if (isEditMode) {
      const fetchItemData = async () => {
        try {
          // Import API utility
          const { API } = await import('../../utils/api');

          // Fetch the warehouse item
          const itemData = await API.warehouse.getItemById(id!);

          if (itemData) {
            // Transform the data to match our form structure
            const transformedItem: WarehouseItemFormData = {
              sku: itemData.sku || '',
              productName: itemData.productName || '',
              description: itemData.description || '',
              categoryId: itemData.categoryId || '',
              supplierId: itemData.supplierId || '',
              warehouseId: itemData.warehouseId || '',
              quantity: itemData.quantity || 0,
              unitPrice: itemData.unitPrice || 0,
              costPrice: itemData.unitCost || 0,
              minStockLevel: itemData.minStockLevel || 0,
              maxStockLevel: itemData.maxStockLevel || 0,
              reorderPoint: itemData.reorderPoint || 0,
              expiryDate: itemData.expiryDate || '',
              batchNumber: itemData.batchNumber || '',
              barcode: itemData.barcode || '',
              location: {
                zone: itemData.location?.zone || '',
                rack: itemData.location?.rack || '',
                shelf: itemData.location?.shelf || '',
                bin: itemData.location?.bin || ''
              },
              tags: itemData.tags || [],
              notes: itemData.notes || '',
              image: null,
              imageUrl: itemData.imageUrl || '',
              status: itemData.status || 'active'
            };

            setFormData(transformedItem);
          }
        } catch (error) {
          console.error('Error fetching warehouse item:', error);
          alert('Failed to load item data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchItemData();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location!,
        [name.split('.')[1]]: value
      }
    }));
  };

  const handleImageChange = (files: File[]) => {
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        image: null
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.productName) newErrors.productName = 'Product name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
    if (!formData.warehouseId) newErrors.warehouseId = 'Warehouse is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (formData.unitPrice < 0) newErrors.unitPrice = 'Unit price cannot be negative';
    if (formData.costPrice < 0) newErrors.costPrice = 'Cost price cannot be negative';
    if (formData.minStockLevel < 0) newErrors.minStockLevel = 'Minimum stock level cannot be negative';
    if (formData.maxStockLevel < formData.minStockLevel) {
      newErrors.maxStockLevel = 'Maximum stock level must be greater than minimum stock level';
    }
    if (formData.reorderPoint < 0) newErrors.reorderPoint = 'Reorder point cannot be negative';
    if (formData.reorderPoint > formData.minStockLevel) {
      newErrors.reorderPoint = 'Reorder point should not be greater than minimum stock level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Category name is required');
      return;
    }

    // Generate a unique ID for the new category
    const newCategoryId = `cat-${Date.now()}`;

    // Create the new category object
    const categoryToAdd: Category = {
      id: newCategoryId,
      name: newCategory.name.trim(),
      description: newCategory.description.trim() || undefined,
      parentId: newCategory.parentId || null
    };

    // Add the new category to the categories list
    setCategories([...categories, categoryToAdd]);

    // Set the new category as the selected category
    setFormData({
      ...formData,
      categoryId: newCategoryId
    });

    // Log the activity
    if (user) {
      logActivity(
        'create_category',
        `Created new category: ${categoryToAdd.name}`,
        'category',
        newCategoryId
      );
    }

    // Reset the new category form and close the modal
    setNewCategory({ name: '', description: '', parentId: '' });
    setShowCategoryModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Import API utility
      const { API } = await import('../../utils/api');

      // Prepare the data for submission
      const submitData = {
        ...formData,
        // Remove the image file from the data as it's already uploaded
        image: undefined
      };

      // Create or update the warehouse item
      let result;
      if (isEditMode) {
        // Update existing item
        result = await API.warehouse.updateItem(id!, submitData);
        console.log('Item updated successfully:', result);
      } else {
        // Create new item
        result = await API.warehouse.createItem(submitData);
        console.log('Item created successfully:', result);
      }

      // Log the activity
      if (user) {
        logActivity(
          isEditMode ? 'update_warehouse_item' : 'create_warehouse_item',
          isEditMode
            ? `Updated warehouse item: ${formData.productName} (${formData.sku})`
            : `Created new warehouse item: ${formData.productName} (${formData.sku})`,
          'warehouse_item',
          isEditMode ? id : undefined
        );
      }

      // Navigate back to the items list
      navigate('/warehouse/items');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while saving the item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && isEditMode) {
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Warehouse Item' : 'Add New Warehouse Item'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode ? 'Update the details of this warehouse item' : 'Add a new item to your warehouse inventory'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection
          title="Basic Information"
          description="Enter the basic details of the warehouse item"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              error={errors.sku}
              required
              placeholder="Enter a unique SKU"
              helpText="Stock Keeping Unit - A unique identifier for this item"
            />

            <FormField
              label="Product Name"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              error={errors.productName}
              required
              placeholder="Enter product name"
            />

            <div className="md:col-span-2">
              <FormField
                label="Description"
                name="description"
                as="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FaPlus className="mr-1 h-3 w-3" />
                  Add New Category
                </button>
              </div>

              <SearchableSelect
                label=""
                name="categoryId"
                value={formData.categoryId}
                onChange={(value) => setFormData({...formData, categoryId: value})}
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.name,
                  icon: <FaTag className="text-primary-500" />
                }))}
                error={errors.categoryId}
                required
                placeholder="Select a category"
                className="mb-0"
              />
            </div>

            <SearchableSelect
              label="Supplier"
              name="supplierId"
              value={formData.supplierId}
              onChange={(value) => setFormData({...formData, supplierId: value})}
              options={suppliers.map(supplier => ({
                value: supplier.id,
                label: supplier.name,
                description: supplier.contactPerson,
                icon: <FaUsers className="text-primary-500" />
              }))}
              error={errors.supplierId}
              required
              placeholder="Select a supplier"
            />

            <SearchableSelect
              label="Warehouse"
              name="warehouseId"
              value={formData.warehouseId}
              onChange={(value) => setFormData({...formData, warehouseId: value})}
              options={warehouses.map(warehouse => ({
                value: warehouse.id,
                label: warehouse.name,
                description: warehouse.location,
                icon: <FaWarehouse className="text-primary-500" />
              }))}
              error={errors.warehouseId}
              required
              placeholder="Select a warehouse"
            />

            <FormField
              label="Status"
              name="status"
              as="select"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Inventory Details"
          description="Specify inventory quantities and pricing information"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleNumberChange}
              error={errors.quantity}
              required
              min={0}
              step={1}
              helpText="Current stock quantity"
            />

            <FormField
              label="Unit Price"
              name="unitPrice"
              type="number"
              value={formData.unitPrice}
              onChange={handleNumberChange}
              error={errors.unitPrice}
              required
              min={0}
              step={0.01}
              helpText="Selling price per unit"
            />

            <FormField
              label="Cost Price"
              name="costPrice"
              type="number"
              value={formData.costPrice}
              onChange={handleNumberChange}
              error={errors.costPrice}
              required
              min={0}
              step={0.01}
              helpText="Purchase price per unit"
            />

            <FormField
              label="Minimum Stock Level"
              name="minStockLevel"
              type="number"
              value={formData.minStockLevel}
              onChange={handleNumberChange}
              error={errors.minStockLevel}
              required
              min={0}
              step={1}
              helpText="Minimum quantity to maintain"
            />

            <FormField
              label="Maximum Stock Level"
              name="maxStockLevel"
              type="number"
              value={formData.maxStockLevel}
              onChange={handleNumberChange}
              error={errors.maxStockLevel}
              required
              min={0}
              step={1}
              helpText="Maximum quantity to maintain"
            />

            <FormField
              label="Reorder Point"
              name="reorderPoint"
              type="number"
              value={formData.reorderPoint}
              onChange={handleNumberChange}
              error={errors.reorderPoint}
              required
              min={0}
              step={1}
              helpText="Quantity at which to reorder"
            />
          </div>
        </FormSection>

        <FormSection
          title="Additional Details"
          description="Provide additional information about the item"
          collapsible
          defaultExpanded={isEditMode}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FormField
                label="Barcode"
                name="barcode"
                value={formData.barcode || ''}
                onChange={handleChange}
                placeholder="Enter barcode number"
                helpText="Product barcode or UPC"
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{top: '30px'}}>
                <FaBarcode className="text-gray-400" />
              </div>
            </div>

            <FormField
              label="Batch Number"
              name="batchNumber"
              value={formData.batchNumber || ''}
              onChange={handleChange}
              placeholder="Enter batch number"
              helpText="Manufacturing batch or lot number"
            />

            <FormField
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate || ''}
              onChange={handleChange}
              helpText="Product expiration date (if applicable)"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Details
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  label="Zone"
                  name="location.zone"
                  value={formData.location?.zone || ''}
                  onChange={handleLocationChange}
                  placeholder="Zone"
                  className="mb-0"
                />

                <FormField
                  label="Rack"
                  name="location.rack"
                  value={formData.location?.rack || ''}
                  onChange={handleLocationChange}
                  placeholder="Rack"
                  className="mb-0"
                />

                <FormField
                  label="Shelf"
                  name="location.shelf"
                  value={formData.location?.shelf || ''}
                  onChange={handleLocationChange}
                  placeholder="Shelf"
                  className="mb-0"
                />

                <FormField
                  label="Bin"
                  name="location.bin"
                  value={formData.location?.bin || ''}
                  onChange={handleLocationChange}
                  placeholder="Bin"
                  className="mb-0"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                <FaInfoCircle className="inline mr-1" />
                Specify the exact location of this item in the warehouse
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none"
                    >
                      <span className="sr-only">Remove tag {tag}</span>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <FormField
                  label=""
                  name="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  className="mb-0 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 self-end"
                >
                  Add
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                <FaInfoCircle className="inline mr-1" />
                Tags help categorize and find items quickly
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <ImageUpload
                onImageUploaded={(imageUrl) => {
                  // Update the form data with the image URL
                  setFormData(prev => ({
                    ...prev,
                    imageUrl: imageUrl
                  }));
                }}
                initialImage={formData.imageUrl || ''}
                className="mt-1"
              />
              <p className="mt-2 text-sm text-gray-500">
                <FaInfoCircle className="inline mr-1" />
                Upload a product image (max 5MB)
              </p>
            </div>

            <div className="md:col-span-2">
              <FormField
                label="Notes"
                name="notes"
                as="textarea"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes about this item"
                rows={4}
                helpText="Internal notes about handling, storage requirements, etc."
              />
            </div>
          </div>
        </FormSection>

        <FormActions
          submitText={isEditMode ? 'Update Item' : 'Create Item'}
          cancelHref="/warehouse/items"
          isSubmitting={isSubmitting}
        />
      </form>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Category</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="categoryDescription"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter category description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  id="parentCategory"
                  value={newCategory.parentId}
                  onChange={(e) => setNewCategory({...newCategory, parentId: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseItemForm;
