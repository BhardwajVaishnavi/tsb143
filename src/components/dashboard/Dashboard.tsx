import React, { useState, useEffect } from 'react';
import {
  FaBoxes,
  FaWarehouse,
  FaUsers,
  FaChartLine,
  FaShippingFast,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDownload,
  FaSync,
  FaInfoCircle,
  FaUserClock,
  FaWifi
} from 'react-icons/fa';
import { MdWifiOff } from 'react-icons/md';
import EmployeeActivityLog from './EmployeeActivityLog';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// Real data is fetched from the API

// Connection Status Component
const ConnectionStatus = ({ isOffline }: { isOffline: boolean }) => {
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center ${isOffline ? 'bg-yellow-100' : 'bg-green-100'}`}>
      {isOffline ? (
        <>
          <MdWifiOff className="text-yellow-600 mr-2" />
          <span className="text-yellow-800 text-sm font-medium">Offline Mode</span>
        </>
      ) : (
        <>
          <FaWifi className="text-green-600 mr-2" />
          <span className="text-green-800 text-sm font-medium">Connected</span>
        </>
      )}
    </div>
  );
};

// Dashboard Header Component
const DashboardHeader = () => {
  const [dateRange, setDateRange] = useState('month');

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive overview of your business operations, inventory, and supplier metrics
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
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
          <div className="relative">
            <button className="flex items-center pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              <FaFilter className="absolute left-3 top-2.5 text-gray-400" />
              <span>Filters</span>
            </button>
          </div>
          <button className="btn-primary inline-flex items-center px-4 py-2 rounded-lg shadow-sm">
            <FaDownload className="mr-2 -ml-1 h-4 w-4" />
            Export
          </button>
          <button className="btn-outline inline-flex items-center px-4 py-2 rounded-lg shadow-sm">
            <FaSync className="mr-2 -ml-1 h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// Advanced Stat Card Component
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  period?: string;
  linkTo?: string;
  linkText?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
};

const StatCard = ({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  period = 'vs last month',
  linkTo,
  linkText = 'View Details',
  color = 'primary'
}: StatCardProps) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-600'
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-600'
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600'
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-600'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-600'
    }
  };

  const changeColorClass = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
  }[changeType];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${colorClasses[color].bg} rounded-lg p-3`}>
            <div className={`h-6 w-6 ${colorClasses[color].text}`}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <div className="text-lg font-bold text-gray-900">{value}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          {change !== undefined && (
            <div className="flex items-center text-sm">
              {changeType === 'positive' ? (
                <FaArrowUp className={`mr-1 h-3 w-3 ${changeColorClass}`} />
              ) : changeType === 'negative' ? (
                <FaArrowDown className={`mr-1 h-3 w-3 ${changeColorClass}`} />
              ) : null}
              <span className={`font-medium ${changeColorClass}`}>{Math.abs(change)}%</span>
              <span className="ml-1 text-gray-500">{period}</span>
            </div>
          )}
          {linkTo && (
            <Link to={linkTo} className="text-sm font-medium text-primary-600 hover:text-primary-700">
              {linkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Advanced Recent Activity Component
const RecentActivity = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!isAuthenticated) {
          setIsLoading(false);
          return;
        }

        // Import DB client
        const { default: DBClient } = await import('../../utils/db-client-simple');

        try {
          // Fetch audit logs
          const logs = await DBClient.auditLogs.getAll();

          // Transform logs to activity format
          const transformedLogs = Array.isArray(logs)
            ? logs.slice(0, 10).map((log: any) => {
                let type = 'other';
                if (log.action.includes('INWARD') || log.action.includes('SHIPMENT')) {
                  type = 'shipment';
                } else if (log.action.includes('INVENTORY') || log.action.includes('ITEM')) {
                  type = 'inventory';
                } else if (log.action.includes('ORDER') || log.action.includes('PURCHASE')) {
                  type = 'order';
                } else if (log.action.includes('SUPPLIER')) {
                  type = 'supplier';
                }

                return {
                  id: log.id,
                  type,
                  title: log.action.replace('_', ' '),
                  description: log.description,
                  timestamp: log.createdAt,
                  user: log.userName || 'System'
                };
              })
            : [];

          setActivities(transformedLogs);
        } catch (apiError) {
          console.error('API error fetching activities, using mock data:', apiError);

          // Create empty array since API failed
          const transformedLogs: any[] = [];
          setActivities(transformedLogs);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Create empty array since API failed
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [isAuthenticated]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipment':
        return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><FaShippingFast className="h-4 w-4 text-green-600" /></div>;
      case 'inventory':
        return <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><FaBoxes className="h-4 w-4 text-yellow-600" /></div>;
      case 'order':
        return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><FaFileInvoiceDollar className="h-4 w-4 text-blue-600" /></div>;
      case 'supplier':
        return <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"><FaUsers className="h-4 w-4 text-purple-600" /></div>;
      default:
        return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><FaClipboardList className="h-4 w-4 text-gray-600" /></div>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <Link to="/audit" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View All
        </Link>
      </div>
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading activities...</p>
          </div>
        ) : activities.length > 0 ? (
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
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">No recent activities found</p>
          </div>
        )}
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
        <Link to="/warehouse/items/new" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
            <FaBoxes className="h-6 w-6 text-primary-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Add Item</span>
        </Link>

        <Link to="/warehouse/shipments/new" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <FaShippingFast className="h-6 w-6 text-green-600" />
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

// Alerts Summary Component
const AlertsSummary = () => {
  const [alerts, setAlerts] = useState({
    critical: 0,
    warnings: 0,
    info: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        if (!isAuthenticated) {
          setIsLoading(false);
          return;
        }

        // Import DB client
        const { default: DBClient } = await import('../../utils/db-client-simple');

        try {
          // Fetch warehouse items to check for low stock
          const items = await DBClient.warehouse.getItems();

          // Count low stock items (critical)
          const lowStockItems = Array.isArray(items)
            ? items.filter((item: any) => {
                const reorderPoint = item.reorderPoint || 10;
                return item.quantity <= reorderPoint;
              }).length
            : 0;

          // Fetch pending damage reports (warnings)
          const damageReports = await DBClient.warehouse.getDamageRecords();
          const pendingDamage = Array.isArray(damageReports)
            ? damageReports.filter((report: any) =>
                report.status === 'pending'
              ).length
            : 0;

          // Fetch pending purchase orders (info)
          const purchaseOrders = await DBClient.purchaseOrders.getAll();
          const pendingOrders = Array.isArray(purchaseOrders)
            ? purchaseOrders.filter((order: any) =>
                order.status === 'PENDING' || order.status === 'APPROVED'
              ).length
            : 0;

          setAlerts({
            critical: lowStockItems,
            warnings: pendingDamage,
            info: pendingOrders
          });
        } catch (apiError) {
          console.error('API error fetching alerts, using mock data:', apiError);

          // Set default values since API failed
          setAlerts({
            critical: 0,
            warnings: 0,
            info: 0
          });
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
        // Set default values since API failed
        setAlerts({
          critical: 0,
          warnings: 0,
          info: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [isAuthenticated]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Alerts Summary</h3>
      </div>
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading alerts...</p>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FaExclamationTriangle className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-sm font-medium">Low Stock Items</span>
            </div>
            <span className="text-sm font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">{alerts.critical}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <FaExclamationTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-sm font-medium">Pending Damage Reports</span>
            </div>
            <span className="text-sm font-bold bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full">{alerts.warnings}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FaInfoCircle className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Pending Orders</span>
            </div>
            <span className="text-sm font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">{alerts.info}</span>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link to="/warehouse" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center">
              View Warehouse
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Performance Chart Component
const PerformanceChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Inventory Performance</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">Daily</button>
          <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Weekly</button>
          <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Monthly</button>
        </div>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <FaChartLine className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Advanced performance charts will be displayed here</p>
            <p className="text-xs text-gray-400 mt-1">Showing inventory levels, turnover rates, and value trends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Distribution Component
const InventoryDistribution = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Inventory Distribution</h3>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-4 h-4 bg-primary-500 rounded-full mx-1"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full mx-1"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full mx-1"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full mx-1"></div>
              <div className="w-4 h-4 bg-purple-500 rounded-full mx-1"></div>
            </div>
            <p className="text-sm text-gray-500">Advanced distribution chart will be displayed here</p>
            <p className="text-xs text-gray-400 mt-1">Showing inventory distribution by category, location, and value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    inventoryCount: 0,
    warehouseItemCount: 0,
    supplierCount: 0,
    pendingOrderCount: 0
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!isAuthenticated) {
          setIsLoading(false);
          return;
        }

        // Import API utility
        const { API } = await import('../../utils/api');

        try {
          // Fetch data in parallel
          const [inventoryItems, warehouseItems, suppliers, orders] = await Promise.all([
            API.inventory.getItems(),
            API.warehouse.getItems(),
            API.suppliers.getAll(),
            API.purchaseOrders.getAll()
          ]);

          // Calculate total inventory quantity
          const totalInventory = Array.isArray(inventoryItems)
            ? inventoryItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
            : 0;

          // Count active suppliers
          const activeSuppliers = Array.isArray(suppliers)
            ? suppliers.filter((supplier: any) => supplier.status === 'ACTIVE').length
            : 0;

          // Count pending orders
          const pendingOrders = Array.isArray(orders)
            ? orders.filter((order: any) =>
                order.status === 'PENDING' || order.status === 'APPROVED' || order.status === 'SHIPPED'
              ).length
            : 0;

          setDashboardData({
            inventoryCount: totalInventory,
            warehouseItemCount: Array.isArray(warehouseItems) ? warehouseItems.length : 0,
            supplierCount: activeSuppliers,
            pendingOrderCount: pendingOrders
          });

          // We successfully fetched data, so we're online
          setIsOffline(false);
        } catch (apiError) {
          console.error('API error, using mock data:', apiError);

          // Set default values since API failed
          setIsOffline(true);

          setDashboardData({
            inventoryCount: 0,
            warehouseItemCount: 0,
            supplierCount: 0,
            pendingOrderCount: 0
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // If all fails, set default values
        setIsOffline(true);
        setDashboardData({
          inventoryCount: 0,
          warehouseItemCount: 0,
          supplierCount: 0,
          pendingOrderCount: 0
        });
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader />
      <ConnectionStatus isOffline={isOffline} />

      <QuickActions />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Inventory"
          value={dashboardData.inventoryCount.toLocaleString()}
          icon={<FaBoxes />}
          change={5.2}
          changeType="positive"
          linkTo="/inventory"
          color="primary"
        />
        <StatCard
          title="Warehouse Items"
          value={dashboardData.warehouseItemCount.toLocaleString()}
          icon={<FaWarehouse />}
          change={-3.5}
          changeType="negative"
          linkTo="/warehouse"
          color="info"
        />
        <StatCard
          title="Active Suppliers"
          value={dashboardData.supplierCount.toLocaleString()}
          icon={<FaUsers />}
          change={2.8}
          changeType="positive"
          linkTo="/suppliers"
          color="success"
        />
        <StatCard
          title="Pending Orders"
          value={dashboardData.pendingOrderCount.toLocaleString()}
          icon={<FaFileInvoiceDollar />}
          change={12.3}
          changeType="positive"
          linkTo="/purchase-orders"
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div>
          <AlertsSummary />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <InventoryDistribution />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FaUserClock className="text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Employee Activity Tracking</h2>
        </div>
        <EmployeeActivityLog />
      </div>
    </div>
  );
};

export default Dashboard;
