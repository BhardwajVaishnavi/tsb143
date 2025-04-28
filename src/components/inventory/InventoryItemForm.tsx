import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import FormField from '../ui/FormField';
import FormSection from '../ui/FormSection';
import FormActions from '../ui/FormActions';
import { useAuth } from '../../contexts/AuthContext';

interface InventoryItem {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  unitPrice: number;
  lowStockThreshold: number;
  status: string;
  zone?: string;
  rack?: string;
  bin?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: {
    id: string;
    name: string;
  };
}

interface Location {
  id: string;
  name: string;
  type: string;
}

const InventoryItemForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<InventoryItem>({
    id: '',
    productId: '',
    locationId: '',
    quantity: 0,
    unitPrice: 0,
    lowStockThreshold: 10,
    status: 'in_stock',
    zone: 'A',
    rack: 'R1',
    bin: 'B1'
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: isEditMode ? `/inventory/items/${id}/edit` : '/inventory/items/new' } });
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch products
        const productsData = await API.products.getAll();
        setProducts(productsData);

        // Fetch locations
        const locationsData = await API.locations.getAll();
        setLocations(locationsData);

        // If in edit mode, fetch the inventory item
        if (isEditMode && id) {
          const itemData = await API.inventory.getItemById(id);
          setFormData({
            id: itemData.id,
            productId: itemData.productId || itemData.product?.id || '',
            locationId: itemData.locationId || '',
            quantity: itemData.quantity || 0,
            unitPrice: itemData.unitPrice || 0,
            lowStockThreshold: itemData.lowStockThreshold || 10,
            status: itemData.status || 'in_stock',
            zone: itemData.zone || itemData.location?.zone || 'A',
            rack: itemData.rack || itemData.location?.rack || 'R1',
            bin: itemData.bin || itemData.location?.bin || 'B1'
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, isAuthenticated, navigate]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    if (name === 'quantity' || name === 'unitPrice' || name === 'lowStockThreshold') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Validate form
      if (!formData.productId || !formData.locationId) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Import API utility
      const { API } = await import('../../utils/api');
      
      // Calculate total value
      const totalValue = formData.quantity * formData.unitPrice;
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        totalValue,
        updatedBy: user?.id
      };
      
      let result;
      
      if (isEditMode) {
        // Update existing item
        result = await API.inventory.updateItem(id!, submitData);
        
        // Create audit log
        await API.auditLogs.create({
          action: 'UPDATE_INVENTORY_ITEM',
          entity: 'InventoryItem',
          entityId: id!,
          details: `Updated inventory item: ${products.find(p => p.id === formData.productId)?.name}`
        });
        
        setSuccess('Inventory item updated successfully');
      } else {
        // Create new item
        submitData.createdBy = user?.id;
        result = await API.inventory.createItem(submitData);
        
        // Create audit log
        await API.auditLogs.create({
          action: 'CREATE_INVENTORY_ITEM',
          entity: 'InventoryItem',
          entityId: result.id,
          details: `Created inventory item: ${products.find(p => p.id === formData.productId)?.name}`
        });
        
        setSuccess('Inventory item created successfully');
      }
      
      // Navigate to the item detail page after a short delay
      setTimeout(() => {
        navigate(`/inventory/items/${result.id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save inventory item. Please try again later.');
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/inventory" className="mr-4 text-gray-500 hover:text-gray-700">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaSave className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormSection
          title="Basic Information"
          description="Enter the basic details for this inventory item"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Quantity and Pricing"
          description="Specify the quantity and pricing information"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              min={0}
              required
            />

            <FormField
              label="Unit Price"
              name="unitPrice"
              type="number"
              value={formData.unitPrice}
              onChange={handleChange}
              min={0}
              step={0.01}
              required
            />

            <FormField
              label="Low Stock Threshold"
              name="lowStockThreshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              min={0}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </FormSection>

        <FormSection
          title="Location Details"
          description="Specify the exact location within the inventory"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              placeholder="e.g., A, B, C"
            />

            <FormField
              label="Rack"
              name="rack"
              value={formData.rack}
              onChange={handleChange}
              placeholder="e.g., R1, R2, R3"
            />

            <FormField
              label="Bin"
              name="bin"
              value={formData.bin}
              onChange={handleChange}
              placeholder="e.g., B1, B2, B3"
            />
          </div>
        </FormSection>

        <FormActions
          submitText={isEditMode ? 'Update Item' : 'Create Item'}
          cancelHref="/inventory"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default InventoryItemForm;
