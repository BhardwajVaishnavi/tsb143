import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch suppliers from the API
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);

        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch suppliers
        let response = [];
        try {
          response = await API.suppliers.getAll();
        } catch (error) {
          console.error('Error fetching suppliers:', error);
          // Use empty array if there's an error
          response = [];
        }

        // Transform the data to match our Supplier type
        const transformedSuppliers: Supplier[] = Array.isArray(response)
          ? response.map((supplier: any) => ({
              id: supplier.id,
              name: supplier.name,
              email: supplier.email || 'N/A',
              phone: supplier.phone || 'N/A',
              address: supplier.address || 'N/A',
              createdAt: supplier.createdAt || new Date().toISOString(),
            }))
          : [];

        setSuppliers(transformedSuppliers);
      } catch (error) {
        console.error('Error in fetchSuppliers:', error);
        setSuppliers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm)
  );

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        setIsLoading(true);

        // Import API utility
        const { API } = await import('../../utils/api');

        // Delete the supplier
        await API.suppliers.delete(id);

        // Create audit log
        try {
          const supplierName = suppliers.find(s => s.id === id)?.name || 'Unknown';
          await API.auditLogs.create({
            action: 'DELETE_SUPPLIER',
            entity: 'Supplier',
            entityId: id,
            details: `Deleted supplier: ${supplierName}`
          });
        } catch (logError) {
          console.error('Error creating audit log:', logError);
          // Continue even if audit log creation fails
        }

        // Remove the supplier from the state
        setSuppliers(suppliers.filter(supplier => supplier.id !== id));

        // Show success message
        alert('Supplier deleted successfully');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Failed to delete supplier. Please try again later.');
      } finally {
        setIsLoading(false);
      }
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
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Link
          to="/suppliers/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Add Supplier
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search suppliers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{supplier.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{supplier.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{supplier.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/suppliers/${supplier.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                      View
                    </Link>
                    <Link to={`/suppliers/${supplier.id}/edit`} className="text-primary-600 hover:text-primary-900 mr-3">
                      <FaEdit className="inline mr-1" /> Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No suppliers found. Try adjusting your search or add a new supplier.
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersList;
