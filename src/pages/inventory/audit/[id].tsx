import React, { useState, useEffect } from 'react';
// Rename this file to AuditDetail.tsx to match React Router conventions
// Using React component instead of Next.js page
import { useParams, useNavigate } from 'react-router-dom';
import { FaClipboardCheck, FaArrowLeft, FaExclamationTriangle, FaCheck, FaTimes, FaDownload } from 'react-icons/fa';
import Layout from '../../../components/layout/Layout';
import { format } from 'date-fns';

interface AuditItem {
  id: string;
  auditId: string;
  inventoryItemId: string;
  inventoryItem: {
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
  };
  expectedQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  notes?: string;
}

interface AuditDetail {
  id: string;
  locationId: string;
  location: {
    id: string;
    name: string;
  };
  auditDate: string;
  conductedById: string;
  conductedBy: {
    id: string;
    name: string;
    email: string;
  };
  itemsAudited: number;
  discrepanciesFound: number;
  status: string;
  notes?: string;
  auditItems: AuditItem[];
}

const AuditDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auditDetail, setAuditDetail] = useState<AuditDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'discrepancies'>('all');

  useEffect(() => {
    if (id) {
      fetchAuditDetail(id as string);
    }
  }, [id]);

  const fetchAuditDetail = async (auditId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Import API utility
      const { API } = await import('../../../utils/api');

      // Fetch audit detail
      const detail = await API.inventory.getAuditById(auditId);
      setAuditDetail(detail);
    } catch (error) {
      console.error('Error fetching audit detail:', error);
      setError('Failed to load audit detail');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter audit items based on search term and filter
  const filteredItems = auditDetail?.auditItems.filter(item => {
    const matchesSearch =
      item.inventoryItem.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inventoryItem.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.inventoryItem.product.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'discrepancies') {
      return matchesSearch && item.discrepancy !== 0;
    }

    return matchesSearch;
  }) || [];

  // Export audit as CSV
  const exportAuditCSV = () => {
    if (!auditDetail) return;

    // Headers
    let csvContent = 'Product Name,SKU,Category,Expected Quantity,Actual Quantity,Discrepancy,Notes\n';

    // Data rows
    auditDetail.auditItems.forEach(item => {
      csvContent += `"${item.inventoryItem.product.name}","${item.inventoryItem.product.sku}","${item.inventoryItem.product.category?.name || 'Uncategorized'}",${item.expectedQuantity},${item.actualQuantity},${item.discrepancy},"${item.notes || ''}"\n`;
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-audit-${auditDetail.id}-${format(new Date(auditDetail.auditDate), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Audit Detail | Warehouse Management System">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/inventory/audit')}
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Detail</h1>
            <p className="mt-1 text-sm text-gray-500">
              View detailed information about this inventory audit
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : auditDetail ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center mb-6">
                  <FaClipboardCheck className="text-primary-600 mr-2 text-xl" />
                  <h2 className="text-xl font-semibold text-gray-800">Audit Information</h2>
                </div>
                <button
                  onClick={exportAuditCSV}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <FaDownload className="mr-2" />
                  Export CSV
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1 text-lg text-gray-900">{auditDetail.location?.name || 'Unknown Location'}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Audit Date</h3>
                    <p className="mt-1 text-lg text-gray-900">{format(new Date(auditDetail.auditDate), 'PPP')}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-sm font-semibold rounded-full ${
                        auditDetail.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {auditDetail.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Conducted By</h3>
                    <p className="mt-1 text-lg text-gray-900">{auditDetail.conductedBy?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-500">{auditDetail.conductedBy?.email}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Items Audited</h3>
                    <p className="mt-1 text-lg text-gray-900">{auditDetail.itemsAudited}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Discrepancies Found</h3>
                    <p className="mt-1 text-lg text-gray-900">{auditDetail.discrepanciesFound}</p>
                  </div>
                </div>
              </div>

              {auditDetail.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{auditDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Audit Items</h2>
                <div className="flex space-x-4">
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
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'discrepancies')}
                  >
                    <option value="all">All Items</option>
                    <option value="discrepancies">Discrepancies Only</option>
                  </select>
                </div>
              </div>

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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No items found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className={item.discrepancy !== 0 ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.inventoryItem.product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.inventoryItem.product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.inventoryItem.product.category?.name || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.expectedQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.actualQuantity}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            item.discrepancy > 0 ? 'text-green-600' : item.discrepancy < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.notes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Audit not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The audit you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuditDetailPage;
