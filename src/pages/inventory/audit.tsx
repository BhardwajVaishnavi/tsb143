import React, { useState, useEffect } from 'react';
// Using React component instead of Next.js page
import { FaClipboardCheck, FaHistory, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import InventoryAudit from '../../components/inventory/InventoryAudit';
import { format } from 'date-fns';

interface AuditRecord {
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
  };
  itemsAudited: number;
  discrepanciesFound: number;
  status: string;
  notes?: string;
}

const InventoryAuditPage = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch audit history
  useEffect(() => {
    if (showHistory) {
      fetchAuditHistory();
    }
  }, [showHistory]);

  const fetchAuditHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Import API utility
      const { API } = await import('../../utils/api');

      // Fetch audit history
      const audits = await API.inventory.getAudits();
      setAuditHistory(audits);
    } catch (error) {
      console.error('Error fetching audit history:', error);
      setError('Failed to load audit history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuditComplete = (auditData: any) => {
    // Refresh audit history
    fetchAuditHistory();
    // Show history tab
    setShowHistory(true);
  };

  return (
    <Layout title="Inventory Audit | Warehouse Management System">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Audit</h1>
            <p className="mt-1 text-sm text-gray-500">
              Conduct inventory audits and view audit history
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                !showHistory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setShowHistory(false)}
            >
              <FaPlus className="mr-2" />
              New Audit
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                showHistory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setShowHistory(true)}
            >
              <FaHistory className="mr-2" />
              Audit History
            </button>
          </div>
        </div>

        {showHistory ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <FaHistory className="text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Audit History</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            ) : auditHistory.length === 0 ? (
              <div className="text-center py-12">
                <FaClipboardCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No audit records found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Start by conducting your first inventory audit.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conducted By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Audited</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discrepancies</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditHistory.map((audit) => (
                      <tr key={audit.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(() => {
                            try {
                              return format(new Date(audit.auditDate), 'PPP');
                            } catch (error) {
                              console.error('Error formatting date:', error, audit.auditDate);
                              return 'Invalid date';
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {audit.location?.name || 'Unknown Location'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {audit.conductedBy?.name || 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {audit.itemsAudited}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {audit.discrepanciesFound}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            audit.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {audit.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link
                            to={`/inventory/audit/${audit.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <InventoryAudit onComplete={handleAuditComplete} />
        )}
      </div>
    </Layout>
  );
};

export default InventoryAuditPage;
