import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaArrowRight } from 'react-icons/fa';

type WarehouseItem = {
  id: string;
  productName: string;
  quantity: number;
};

type InventoryItem = {
  id: string;
  product: {
    id: string;
    name: string;
  };
  quantity: number;
};

type TransferFormData = {
  warehouseItemId: string;
  inventoryItemId: string;
  quantity: number;
};

const TransferForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedWarehouseItem, setSelectedWarehouseItem] = useState<WarehouseItem | null>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TransferFormData>({
    defaultValues: {
      quantity: 1
    }
  });

  const selectedWarehouseItemId = watch('warehouseItemId');
  const selectedQuantity = watch('quantity');

  useEffect(() => {
    // Fetch warehouse items
    const fetchWarehouseItems = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          const mockItems: WarehouseItem[] = Array.from({ length: 5 }, (_, i) => ({
            id: `warehouse-item-${i + 1}`,
            productName: `Product ${i + 1}`,
            quantity: Math.floor(Math.random() * 100) + 20,
          }));
          
          setWarehouseItems(mockItems);
        }, 500);
      } catch (error) {
        console.error('Error fetching warehouse items:', error);
      }
    };

    // Fetch inventory items
    const fetchInventoryItems = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          const mockItems: InventoryItem[] = Array.from({ length: 5 }, (_, i) => ({
            id: `inventory-item-${i + 1}`,
            product: {
              id: `product-${i + 1}`,
              name: `Product ${i + 1}`,
            },
            quantity: Math.floor(Math.random() * 50),
          }));
          
          setInventoryItems(mockItems);
        }, 500);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchWarehouseItems();
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    if (selectedWarehouseItemId) {
      const item = warehouseItems.find(item => item.id === selectedWarehouseItemId) || null;
      setSelectedWarehouseItem(item);
      
      // Reset quantity if it's more than available
      if (item && selectedQuantity > item.quantity) {
        setValue('quantity', item.quantity);
      }
    } else {
      setSelectedWarehouseItem(null);
    }
  }, [selectedWarehouseItemId, warehouseItems, selectedQuantity, setValue]);

  const onSubmit = async (data: TransferFormData) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to create the transfer
      console.log('Transfer data submitted:', data);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        navigate('/inventory');
      }, 1000);
    } catch (error) {
      console.error('Error creating transfer:', error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transfer Items from Warehouse to Inventory</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="warehouseItemId" className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse Item
              </label>
              <select
                id="warehouseItemId"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.warehouseItemId ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('warehouseItemId', { required: 'Warehouse item is required' })}
              >
                <option value="">Select a warehouse item</option>
                {warehouseItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.productName} (Available: {item.quantity})
                  </option>
                ))}
              </select>
              {errors.warehouseItemId && (
                <p className="mt-1 text-sm text-red-500">{errors.warehouseItemId.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="inventoryItemId" className="block text-sm font-medium text-gray-700 mb-1">
                Inventory Item
              </label>
              <select
                id="inventoryItemId"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.inventoryItemId ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('inventoryItemId', { required: 'Inventory item is required' })}
              >
                <option value="">Select an inventory item</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product.name} (Current: {item.quantity})
                  </option>
                ))}
              </select>
              {errors.inventoryItemId && (
                <p className="mt-1 text-sm text-red-500">{errors.inventoryItemId.message}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Transfer
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={selectedWarehouseItem?.quantity || 1}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' },
                max: { 
                  value: selectedWarehouseItem?.quantity || 1, 
                  message: `Quantity cannot exceed available amount (${selectedWarehouseItem?.quantity || 0})` 
                },
                valueAsNumber: true
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>
          
          {selectedWarehouseItem && (
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Transfer Summary</h3>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">From Warehouse:</p>
                  <p className="font-medium">{selectedWarehouseItem.productName}</p>
                  <p className="text-sm text-gray-500">Current: {selectedWarehouseItem.quantity}</p>
                  <p className="text-sm text-gray-500">After: {selectedWarehouseItem.quantity - (selectedQuantity || 0)}</p>
                </div>
                <FaArrowRight className="text-gray-400 mx-4" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">To Inventory:</p>
                  {watch('inventoryItemId') && (
                    <>
                      {(() => {
                        const inventoryItem = inventoryItems.find(item => item.id === watch('inventoryItemId'));
                        if (!inventoryItem) return null;
                        
                        return (
                          <>
                            <p className="font-medium">{inventoryItem.product.name}</p>
                            <p className="text-sm text-gray-500">Current: {inventoryItem.quantity}</p>
                            <p className="text-sm text-gray-500">After: {inventoryItem.quantity + (selectedQuantity || 0)}</p>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              onClick={() => navigate('/inventory')}
            >
              <FaTimes className="mr-2" /> Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Complete Transfer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
