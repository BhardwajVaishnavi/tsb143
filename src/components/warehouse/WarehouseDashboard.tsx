import React, { useState, useEffect } from 'react';
import {
  FaWarehouse,
  FaBoxes,
  FaExclamationTriangle,
  FaChartLine,
  FaClipboardCheck,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaDownload,
  FaSync,
  FaTruck,
  FaUsers,
  FaShippingFast,
  FaFileInvoiceDollar,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisH,
  FaCog,
  FaInfoCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Import components
import WarehouseInventoryStatus from './WarehouseInventoryStatus';
import WarehouseSupplierPerformance from './WarehouseSupplierPerformance';
import WarehouseAlertsAndActions from './WarehouseAlertsAndActions';

// Alerts Summary Component
const AlertsSummary = ({ dashboardStats }: { dashboardStats: any }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Alerts Summary</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <FaExclamationTriangle className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-sm font-medium">Critical Alerts</span>
          </div>
          <span className="text-sm font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">{dashboardStats.lowStockItems}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <FaExclamationTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-sm font-medium">Warnings</span>
          </div>
          <span className="text-sm font-bold bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full">{dashboardStats.pendingDamage}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <FaInfoCircle className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Pending Shipments</span>
          </div>
          <span className="text-sm font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">{dashboardStats.pendingShipments}</span>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Link to="/warehouse/alerts" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center">
            View All Alerts
          </Link>
        </div>
      </div>
    </div>
  );
};

// Dashboard Header Component
const DashboardHeader = ({ onRefresh }: { onRefresh: () => void }) => {
  const [dateRange, setDateRange] = useState('month');
  const [warehouse, setWarehouse] = useState('all');

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive overview of warehouse operations, inventory, and supplier metrics
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
          <div className="relative">
            <select
              className="appearance-none pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
            >
              <option value="all">All Warehouses</option>
              <option value="main">Main Warehouse</option>
              <option value="secondary">Secondary Warehouse</option>
              <option value="distribution">Distribution Center</option>
            </select>
            <FaWarehouse className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <FaCalendarAlt className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="btn-primary inline-flex items-center px-4 py-2 rounded-lg shadow-sm">
            <FaDownload className="mr-2 -ml-1 h-4 w-4" />
            Export
          </button>
          <button
            className="btn-outline inline-flex items-center px-4 py-2 rounded-lg shadow-sm"
            onClick={onRefresh}
          >
            <FaSync className="mr-2 -ml-1 h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// Stats Cards Component
const StatsCards = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Card 1 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
              <FaBoxes className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Inventory
                </dt>
                <dd>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.totalItems.toLocaleString()}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-green-600">
              <FaArrowUp className="mr-1 h-3 w-3" />
              <span className="font-medium">5.2%</span>
              <span className="ml-1 text-gray-500">vs last month</span>
            </div>
            <Link to="/warehouse/inventory" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Low Stock Items
                </dt>
                <dd>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.lowStockItems}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-red-600">
              <FaArrowUp className="mr-1 h-3 w-3" />
              <span className="font-medium">12.3%</span>
              <span className="ml-1 text-gray-500">vs last week</span>
            </div>
            <Link to="/warehouse/low-stock" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View Items
            </Link>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <FaShippingFast className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Shipments
                </dt>
                <dd>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.pendingShipments}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-green-600">
              <FaArrowDown className="mr-1 h-3 w-3" />
              <span className="font-medium">3.5%</span>
              <span className="ml-1 text-gray-500">vs yesterday</span>
            </div>
            <Link to="/warehouse/shipments" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* Card 4 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <FaFileInvoiceDollar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Inventory Value
                </dt>
                <dd>
                  <div className="text-lg font-bold text-gray-900">
                    ₹{(stats.totalValue / 1000000).toFixed(1)}M
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-green-600">
              <FaArrowUp className="mr-1 h-3 w-3" />
              <span className="font-medium">8.1%</span>
              <span className="ml-1 text-gray-500">vs last quarter</span>
            </div>
            <Link to="/warehouse/valuation" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/warehouse/inward" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <FaBoxes className="h-6 w-6 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Inward</span>
        </Link>

        <Link to="/warehouse/outward" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <FaShippingFast className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Outward</span>
        </Link>

        <Link to="/warehouse/damage" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Damage</span>
        </Link>

        <Link to="/warehouse/closing-stock" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
            <FaClipboardCheck className="h-6 w-6 text-yellow-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Closing Stock</span>
        </Link>
        <Link to="/warehouse/items/new" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
            <FaBoxes className="h-6 w-6 text-primary-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Add Item</span>
        </Link>

        <Link to="/warehouse/shipments/new" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <FaTruck className="h-6 w-6 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">New Shipment</span>
        </Link>

        <Link to="/purchase-orders/new" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <FaFileInvoiceDollar className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Create PO</span>
        </Link>

        <Link to="/suppliers/new" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <FaUsers className="h-6 w-6 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Add Supplier</span>
        </Link>
      </div>
    </div>
  );
};



// Recent Activity Component
const RecentActivity = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);

        // Import NeonDB utility
        const { NeonDB } = await import('../../utils/neondb');

        // Fetch audit logs from NeonDB
        const auditLogs = await NeonDB.auditLogs.getAll();

        // Transform audit logs to activities
        const transformedActivities = Array.isArray(auditLogs)
          ? auditLogs
              .filter(log => log.entity_type === 'warehouse' || log.entity_type === 'inventory' || log.entity_type === 'supplier')
              .slice(0, 5)
              .map(log => {
                let type = 'inventory';
                let title = log.action;

                if (log.entity_type === 'warehouse') {
                  if (log.action.includes('inward')) {
                    type = 'shipment';
                    title = 'Inward Shipment';
                  } else if (log.action.includes('outward')) {
                    type = 'shipment';
                    title = 'Outward Shipment';
                  } else if (log.action.includes('damage')) {
                    type = 'inventory';
                    title = 'Damage Report';
                  }
                } else if (log.entity_type === 'supplier') {
                  type = 'supplier';
                  title = log.action.includes('create') ? 'New Supplier Added' : 'Supplier Updated';
                } else if (log.entity_type === 'purchase_order') {
                  type = 'order';
                  title = 'Purchase Order ' + (log.action.includes('create') ? 'Created' : 'Updated');
                }

                return {
                  id: log.id,
                  type,
                  title,
                  description: log.description || 'No description provided',
                  timestamp: log.timestamp || log.created_at || new Date().toISOString(),
                  user: log.user_id || 'System'
                };
              })
          : [];

        setActivities(transformedActivities);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setIsLoading(false);

        // Fallback to empty activities
        setActivities([]);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipment':
        return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><FaTruck className="h-4 w-4 text-green-600" /></div>;
      case 'inventory':
        return <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><FaBoxes className="h-4 w-4 text-yellow-600" /></div>;
      case 'order':
        return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><FaFileInvoiceDollar className="h-4 w-4 text-blue-600" /></div>;
      case 'supplier':
        return <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"><FaUsers className="h-4 w-4 text-purple-600" /></div>;
      default:
        return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><FaClipboardCheck className="h-4 w-4 text-gray-600" /></div>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <Link to="/warehouse/activities" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View All
        </Link>
      </div>
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-2"></div>
            <p className="text-gray-500">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No recent activities found.</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900">{activity.title}</h4>
                    <div className="text-sm text-gray-500">{formatDate(activity.timestamp)}</div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{activity.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    By: {activity.user}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const WarehouseDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    pendingShipments: 0,
    recentInward: 0,
    recentOutward: 0,
    pendingDamage: 0
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Import NeonDB utility
      const { NeonDB } = await import('../../utils/neondb');

      // Fetch warehouse items from NeonDB
      const warehouseItems = await NeonDB.warehouse.getItems();

      // Calculate total items and value
      const totalItems = Array.isArray(warehouseItems)
        ? warehouseItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0;

      // Calculate total value - use price or unit_cost if available
      const totalValue = Array.isArray(warehouseItems)
        ? warehouseItems.reduce((sum, item) => {
            const itemValue = item.unit_cost || item.price || 0;
            return sum + ((item.quantity || 0) * itemValue);
          }, 0)
        : 0;

      // Count low stock items
      const lowStockItems = Array.isArray(warehouseItems)
        ? warehouseItems.filter(item => {
            const minStockLevel = item.min_stock_level || 10;
            return item.quantity <= minStockLevel;
          }).length
        : 0;

      // Fetch inward records
      const inwardRecords = await NeonDB.warehouse.getInwardRecords();

      // Fetch outward records
      const outwardRecords = await NeonDB.warehouse.getOutwardRecords();

      // Fetch damage records
      const damageRecords = await NeonDB.warehouse.getDamageRecords();

      // Count pending damage reports
      const pendingDamage = Array.isArray(damageRecords)
        ? damageRecords.filter(report => report.status === 'pending').length
        : 0;

      // Update dashboard stats
      setDashboardStats({
        totalItems,
        totalValue,
        lowStockItems,
        pendingShipments: Array.isArray(outwardRecords) ? outwardRecords.filter(record => record.status === 'pending').length : 0,
        recentInward: Array.isArray(inwardRecords) ? inwardRecords.length : 0,
        recentOutward: Array.isArray(outwardRecords) ? outwardRecords.length : 0,
        pendingDamage
      });

      console.log('Dashboard data loaded from NeonDB:', {
        totalItems,
        totalValue,
        lowStockItems,
        pendingShipments: Array.isArray(outwardRecords) ? outwardRecords.filter(record => record.status === 'pending').length : 0,
        pendingDamage
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data from NeonDB:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader onRefresh={fetchDashboardData} />
      <StatsCards stats={dashboardStats} />
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          {/* Alerts Summary */}
          <AlertsSummary dashboardStats={dashboardStats} />
        </div>
      </div>

      {/* Inventory Status */}
      <WarehouseInventoryStatus />

      {/* Supplier Performance */}
      <WarehouseSupplierPerformance />
    </div>
  );
};

export default WarehouseDashboard;
