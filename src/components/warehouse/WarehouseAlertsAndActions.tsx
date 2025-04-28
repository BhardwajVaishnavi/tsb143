import React, { useState } from 'react';
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaClipboardList,
  FaShippingFast,
  FaBoxOpen,
  FaFileInvoiceDollar,
  FaUserClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Warehouse Alerts and Action Items Component
const WarehouseAlertsAndActions = () => {
  const [showResolvedAlerts, setShowResolvedAlerts] = useState(false);

  // Mock data for alerts
  const alerts = [
    {
      id: '1',
      type: 'critical',
      title: 'Low Stock Alert',
      description: '12 items are below minimum stock level and require immediate reordering.',
      timestamp: '2023-10-25T08:15:00Z',
      status: 'active',
      actionRequired: true,
      actionLink: '/warehouse/low-stock',
      actionText: 'View Low Stock Items',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Shipment Delayed',
      description: 'Shipment #SH-2023-145 from Tech Supplies Inc. is delayed by 2 days.',
      timestamp: '2023-10-24T14:30:00Z',
      status: 'active',
      actionRequired: true,
      actionLink: '/warehouse/shipments/SH-2023-145',
      actionText: 'View Shipment Details',
    },
    {
      id: '3',
      type: 'info',
      title: 'Inventory Count Scheduled',
      description: 'Quarterly inventory count is scheduled for October 31, 2023.',
      timestamp: '2023-10-23T09:45:00Z',
      status: 'active',
      actionRequired: false,
      actionLink: '/warehouse/inventory-counts',
      actionText: 'View Schedule',
    },
    {
      id: '4',
      type: 'success',
      title: 'Shipment Received',
      description: 'Shipment #SH-2023-142 from Fashion Wholesale has been received and processed.',
      timestamp: '2023-10-22T16:20:00Z',
      status: 'resolved',
      actionRequired: false,
      actionLink: '/warehouse/shipments/SH-2023-142',
      actionText: 'View Shipment',
    },
    {
      id: '5',
      type: 'warning',
      title: 'Quality Issue Resolved',
      description: 'Quality issue with shipment #SH-2023-138 has been resolved with the supplier.',
      timestamp: '2023-10-21T11:10:00Z',
      status: 'resolved',
      actionRequired: false,
      actionLink: '/warehouse/issues/QI-2023-012',
      actionText: 'View Issue',
    },
  ];

  // Mock data for action items
  const actionItems = [
    {
      id: '1',
      type: 'order',
      title: 'Create Purchase Orders',
      description: 'Create purchase orders for 12 items that are below minimum stock level.',
      dueDate: '2023-10-27T23:59:59Z',
      priority: 'high',
      assignedTo: 'John Smith',
      status: 'pending',
      link: '/purchase-orders/new?filter=low-stock',
    },
    {
      id: '2',
      type: 'shipment',
      title: 'Process Incoming Shipment',
      description: 'Process and verify incoming shipment #SH-2023-158 from Home Goods Distributors.',
      dueDate: '2023-10-26T17:00:00Z',
      priority: 'medium',
      assignedTo: 'Sarah Johnson',
      status: 'in-progress',
      link: '/warehouse/shipments/SH-2023-158',
    },
    {
      id: '3',
      type: 'inventory',
      title: 'Prepare for Inventory Count',
      description: 'Prepare warehouse sections A through D for quarterly inventory count.',
      dueDate: '2023-10-30T17:00:00Z',
      priority: 'medium',
      assignedTo: 'Michael Brown',
      status: 'pending',
      link: '/warehouse/inventory-counts/IC-2023-Q4',
    },
    {
      id: '4',
      type: 'invoice',
      title: 'Review Pending Invoices',
      description: 'Review and approve 5 pending supplier invoices.',
      dueDate: '2023-10-28T17:00:00Z',
      priority: 'low',
      assignedTo: 'Emily Davis',
      status: 'pending',
      link: '/finance/invoices?status=pending',
    },
    {
      id: '5',
      type: 'supplier',
      title: 'Supplier Performance Review',
      description: 'Conduct quarterly performance review for Tech Supplies Inc.',
      dueDate: '2023-10-31T17:00:00Z',
      priority: 'low',
      assignedTo: 'John Smith',
      status: 'pending',
      link: '/suppliers/1/performance',
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <FaExclamationCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <FaInfoCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      case 'success':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getActionItemIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <FaClipboardList className="h-5 w-5 text-purple-500" />;
      case 'shipment':
        return <FaShippingFast className="h-5 w-5 text-blue-500" />;
      case 'inventory':
        return <FaBoxOpen className="h-5 w-5 text-green-500" />;
      case 'invoice':
        return <FaFileInvoiceDollar className="h-5 w-5 text-gray-500" />;
      case 'supplier':
        return <FaUserClock className="h-5 w-5 text-indigo-500" />;
      default:
        return <FaClipboardList className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = showResolvedAlerts
    ? alerts
    : alerts.filter(alert => alert.status === 'active');

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Warehouse Alerts</h3>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setShowResolvedAlerts(!showResolvedAlerts)}
            >
              {showResolvedAlerts ? (
                <>
                  <FaEyeSlash className="mr-1.5 h-4 w-4 text-gray-400" />
                  Hide Resolved
                </>
              ) : (
                <>
                  <FaEye className="mr-1.5 h-4 w-4 text-gray-400" />
                  Show Resolved
                </>
              )}
            </button>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Important alerts and notifications requiring attention
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className={`px-4 py-4 sm:px-6 ${getAlertBgColor(alert.type)}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                      <div className="ml-2 flex-shrink-0 flex">
                        {alert.status === 'active' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleDateString()} at {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {alert.actionRequired && (
                      <div className="mt-2">
                        <Link
                          to={alert.actionLink}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          {alert.actionText}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No alerts to display.
            </div>
          )}
        </div>
      </div>

      {/* Action Items Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Action Items</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Tasks and actions requiring attention from warehouse staff
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actionItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getActionItemIcon(item.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(item.priority)}`}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.assignedTo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                      {item.status === 'in-progress' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={item.link} className="text-primary-600 hover:text-primary-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="text-sm">
            <Link to="/warehouse/tasks" className="font-medium text-primary-600 hover:text-primary-500">
              View all tasks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseAlertsAndActions;
