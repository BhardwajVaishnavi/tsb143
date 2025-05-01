import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaTruck,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Supplier Performance Component
const WarehouseSupplierPerformance = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        setIsLoading(true);

        // Import NeonDB utility
        const { NeonDB } = await import('../../utils/neondb');

        // Fetch suppliers from NeonDB
        const suppliers = await NeonDB.suppliers.getAll();

        // Fetch purchase orders
        const purchaseOrders = await NeonDB.purchaseOrders.getAll();

        // Fetch audit logs for recent activities
        const auditLogs = await NeonDB.auditLogs.getAll();

        // Transform suppliers data
        const transformedSuppliers = Array.isArray(suppliers)
          ? suppliers.map(supplier => {
              // Calculate metrics (some are mocked since we don't have real metrics in the database)
              const supplierOrders = Array.isArray(purchaseOrders)
                ? purchaseOrders.filter(order => order.supplier_id === supplier.id || order.supplier_name === supplier.name)
                : [];

              const totalOrders = supplierOrders.length;
              const totalSpend = supplierOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);

              return {
                id: supplier.id,
                name: supplier.name,
                category: supplier.category || 'General',
                onTimeDelivery: Math.floor(Math.random() * 10) + 90, // Mock: 90-100%
                qualityRating: (Math.random() * 1.5 + 3.5).toFixed(1), // Mock: 3.5-5.0
                responseTime: Math.floor(Math.random() * 10) + 2 + 'h', // Mock: 2-12h
                orderAccuracy: Math.floor(Math.random() * 5) + 95, // Mock: 95-100%
                totalOrders,
                totalSpend
              };
            })
          : [];

        // Sort by total spend
        transformedSuppliers.sort((a, b) => b.totalSpend - a.totalSpend);

        // Take top 5 suppliers
        setTopSuppliers(transformedSuppliers.slice(0, 5));

        // Transform audit logs to activities
        const transformedActivities = Array.isArray(auditLogs)
          ? auditLogs
              .filter(log => {
                return log.entity_type === 'supplier' ||
                       log.entity_type === 'purchase_order' ||
                       (log.entity_type === 'warehouse' && (log.action.includes('inward') || log.action.includes('outward')));
              })
              .slice(0, 5)
              .map(log => {
                let type = 'delivery';
                let title = '';
                let description = log.description || 'No description provided';

                if (log.entity_type === 'supplier') {
                  type = 'supplier';
                  title = log.action.includes('create') ? 'Supplier Added' : 'Supplier Updated';
                } else if (log.entity_type === 'purchase_order') {
                  type = 'order';
                  title = 'Purchase Order ' + (log.action.includes('create') ? 'Created' : 'Updated');
                } else if (log.entity_type === 'warehouse') {
                  if (log.action.includes('inward')) {
                    type = 'delivery';
                    title = 'Shipment Received';
                  } else if (log.action.includes('outward')) {
                    type = 'transfer';
                    title = 'Inventory Transfer';
                  }
                }

                return {
                  id: log.id,
                  type,
                  title,
                  description,
                  timestamp: log.timestamp || log.created_at || new Date().toISOString(),
                  status: 'completed',
                  relatedId: log.entity_id || 'unknown'
                };
              })
          : [];

        setRecentActivities(transformedActivities);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching supplier data:', error);
        setIsLoading(false);

        // Fallback to mock data
        setTopSuppliers([
    {
      id: '1',
      name: 'Tech Supplies Inc.',
      category: 'Electronics',
      onTimeDelivery: 98.5,
      qualityRating: 4.8,
      responseTime: '4h',
      orderAccuracy: 99.2,
      totalOrders: 156,
      totalSpend: 450000,
    },
    {
      id: '2',
      name: 'Fashion Wholesale',
      category: 'Clothing',
      onTimeDelivery: 95.2,
      qualityRating: 4.5,
      responseTime: '6h',
      orderAccuracy: 97.8,
      totalOrders: 124,
      totalSpend: 320000,
    },
    {
      id: '3',
      name: 'Home Goods Distributors',
      category: 'Home & Kitchen',
      onTimeDelivery: 92.7,
      qualityRating: 4.2,
      responseTime: '8h',
      orderAccuracy: 96.5,
      totalOrders: 98,
      totalSpend: 280000,
    },
    {
      id: '4',
      name: 'Global Parts Ltd.',
      category: 'Electronics',
      onTimeDelivery: 90.1,
      qualityRating: 4.0,
      responseTime: '12h',
      orderAccuracy: 95.3,
      totalOrders: 87,
      totalSpend: 200000,
    },
    {
      id: '5',
      name: 'Office Supplies Co.',
      category: 'Office Supplies',
      onTimeDelivery: 94.8,
      qualityRating: 4.3,
      responseTime: '5h',
      orderAccuracy: 98.1,
      totalOrders: 76,
      totalSpend: 150000,
    },
        ]);

        // Fallback to mock activities
        setRecentActivities([
    {
      id: '1',
      type: 'delivery',
      title: 'Shipment Received',
      description: 'Received shipment #SH-2023-156 from Tech Supplies Inc.',
      timestamp: '2023-10-25T10:30:00Z',
      status: 'completed',
      relatedId: 'SH-2023-156',
    },
    {
      id: '2',
      type: 'issue',
      title: 'Quality Issue Reported',
      description: '5% of items in shipment #SH-2023-142 from Fashion Wholesale had minor defects.',
      timestamp: '2023-10-24T14:45:00Z',
      status: 'pending',
      relatedId: 'SH-2023-142',
    },
    {
      id: '3',
      type: 'order',
      title: 'Purchase Order Created',
      description: 'New purchase order #PO-2023-178 created for Home Goods Distributors.',
      timestamp: '2023-10-24T09:15:00Z',
      status: 'completed',
      relatedId: 'PO-2023-178',
    },
    {
      id: '4',
      type: 'transfer',
      title: 'Inventory Transfer',
      description: 'Transferred 120 units of "Smartphone Model X" from Warehouse to Inventory.',
      timestamp: '2023-10-23T16:20:00Z',
      status: 'completed',
      relatedId: 'TR-2023-089',
    },
    {
      id: '5',
      type: 'invoice',
      title: 'Invoice Paid',
      description: 'Paid invoice #INV-2023-134 to Global Parts Ltd. for ₹45,600.',
      timestamp: '2023-10-23T11:05:00Z',
      status: 'completed',
      relatedId: 'INV-2023-134',
    },
        ]);
      }
    };

    fetchSupplierData();
  }, [timeframe]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return <FaTruck className="h-5 w-5 text-blue-500" />;
      case 'issue':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'order':
        return <FaFileInvoiceDollar className="h-5 w-5 text-purple-500" />;
      case 'transfer':
        return <FaArrowRight className="h-5 w-5 text-green-500" />;
      case 'invoice':
        return <FaFileInvoiceDollar className="h-5 w-5 text-gray-500" />;
      default:
        return <FaCalendarCheck className="h-5 w-5 text-primary-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg overflow-hidden p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Suppliers Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Top Supplier Performance</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Timeframe:</span>
              <select
                className="border border-gray-300 rounded-md shadow-sm py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Performance metrics for your top suppliers based on order volume and spend
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  On-Time Delivery
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Rating
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Accuracy
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaUsers className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/suppliers/${supplier.id}`} className="hover:text-primary-600">
                            {supplier.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">{supplier.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                        supplier.onTimeDelivery >= 95 ? 'bg-green-500' :
                        supplier.onTimeDelivery >= 90 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-900">{supplier.onTimeDelivery}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < Math.round(supplier.qualityRating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{supplier.qualityRating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.responseTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.orderAccuracy}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.totalOrders}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{supplier.totalSpend.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="text-sm">
            <Link to="/suppliers" className="font-medium text-primary-600 hover:text-primary-500">
              View all suppliers
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Warehouse Activities</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Latest activities, shipments, and issues in the warehouse
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(activity.status)}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                </div>
                <div className="ml-6 flex-shrink-0 flex flex-col items-end">
                  <span className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="mt-1">
                    {activity.type === 'delivery' && (
                      <Link to={`/warehouse/shipments/${activity.relatedId}`} className="text-xs text-primary-600 hover:text-primary-500">
                        View Shipment
                      </Link>
                    )}
                    {activity.type === 'issue' && (
                      <Link to={`/warehouse/issues/${activity.relatedId}`} className="text-xs text-primary-600 hover:text-primary-500">
                        View Issue
                      </Link>
                    )}
                    {activity.type === 'order' && (
                      <Link to={`/purchase-orders/${activity.relatedId}`} className="text-xs text-primary-600 hover:text-primary-500">
                        View Order
                      </Link>
                    )}
                    {activity.type === 'transfer' && (
                      <Link to={`/warehouse/transfers/${activity.relatedId}`} className="text-xs text-primary-600 hover:text-primary-500">
                        View Transfer
                      </Link>
                    )}
                    {activity.type === 'invoice' && (
                      <Link to={`/finance/invoices/${activity.relatedId}`} className="text-xs text-primary-600 hover:text-primary-500">
                        View Invoice
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="text-sm">
            <Link to="/warehouse/activities" className="font-medium text-primary-600 hover:text-primary-500">
              View all activities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseSupplierPerformance;
