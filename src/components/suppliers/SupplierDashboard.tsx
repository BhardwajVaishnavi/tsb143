import { useState, useEffect } from 'react';
import { FaChartLine, FaFileContract, FaShoppingCart, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type SupplierMetrics = {
  totalSuppliers: number;
  activeSuppliers: number;
  pendingSuppliers: number;
  blacklistedSuppliers: number;
  averageLeadTime: number;
  averageRating: number;
  totalSpend: number;
  pendingOrders: number;
  expiringContracts: number;
};

type TopSupplier = {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalSpend: number;
  onTimeDelivery: number;
};

const SupplierDashboard = () => {
  const [metrics, setMetrics] = useState<SupplierMetrics | null>(null);
  const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      try {
        setTimeout(() => {
          // Mock data
          setMetrics({
            totalSuppliers: 42,
            activeSuppliers: 35,
            pendingSuppliers: 5,
            blacklistedSuppliers: 2,
            averageLeadTime: 8.5,
            averageRating: 4.2,
            totalSpend: 1250000,
            pendingOrders: 12,
            expiringContracts: 3,
          });

          setTopSuppliers([
            {
              id: '1',
              name: 'Tech Supplies Inc.',
              category: 'Electronics',
              rating: 4.8,
              totalSpend: 450000,
              onTimeDelivery: 98,
            },
            {
              id: '2',
              name: 'Fashion Wholesale',
              category: 'Clothing',
              rating: 4.5,
              totalSpend: 320000,
              onTimeDelivery: 95,
            },
            {
              id: '3',
              name: 'Home Goods Distributors',
              category: 'Home & Kitchen',
              rating: 4.2,
              totalSpend: 280000,
              onTimeDelivery: 92,
            },
            {
              id: '4',
              name: 'Global Parts Ltd.',
              category: 'Electronics',
              rating: 4.0,
              totalSpend: 200000,
              onTimeDelivery: 90,
            },
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching supplier dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Supplier Management Dashboard</h1>
        <Link 
          to="/suppliers/new" 
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Add New Supplier
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Suppliers</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.totalSuppliers}</h3>
              <div className="flex items-center mt-2">
                <span className="text-green-500 text-sm font-medium">{metrics?.activeSuppliers} Active</span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-yellow-500 text-sm font-medium">{metrics?.pendingSuppliers} Pending</span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-red-500 text-sm font-medium">{metrics?.blacklistedSuppliers} Blacklisted</span>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-500">
              <FaInfoCircle size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Supplier Performance</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.averageRating.toFixed(1)}/5.0</h3>
              <p className="text-gray-500 text-sm mt-2">
                Avg. Lead Time: {metrics?.averageLeadTime.toFixed(1)} days
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-500">
              <FaChartLine size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Purchase Orders</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.pendingOrders}</h3>
              <p className="text-gray-500 text-sm mt-2">
                Pending Orders
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-full text-purple-500">
              <FaShoppingCart size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Contracts</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.expiringContracts}</h3>
              <p className="text-yellow-500 text-sm mt-2">
                Expiring within 30 days
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-full text-yellow-500">
              <FaFileContract size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Top Suppliers by Spend</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  On-Time Delivery
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{supplier.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{supplier.rating.toFixed(1)}</div>
                      <div className="ml-2 flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < Math.round(supplier.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${supplier.totalSpend.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      supplier.onTimeDelivery >= 95 ? 'bg-green-100 text-green-800' : 
                      supplier.onTimeDelivery >= 90 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {supplier.onTimeDelivery}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/suppliers/${supplier.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                      View
                    </Link>
                    <Link to={`/suppliers/${supplier.id}/orders`} className="text-primary-600 hover:text-primary-900">
                      Orders
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Link to="/suppliers" className="text-primary-600 hover:text-primary-900 text-sm font-medium">
            View All Suppliers →
          </Link>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Supplier Alerts</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800">Contract Expiring Soon</h3>
                <p className="text-sm text-yellow-700 mt-1">Contract with Tech Supplies Inc. expires in 15 days. Consider renewal.</p>
                <div className="mt-2">
                  <Link to="/suppliers/1/contracts" className="text-sm text-yellow-800 font-medium hover:text-yellow-900">
                    View Contract →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-red-50 rounded-lg border border-red-100">
              <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Late Delivery</h3>
                <p className="text-sm text-red-700 mt-1">Order #PO-2023-089 from Global Parts Ltd. is 5 days past the expected delivery date.</p>
                <div className="mt-2">
                  <Link to="/purchase-orders/PO-2023-089" className="text-sm text-red-800 font-medium hover:text-red-900">
                    View Order →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
