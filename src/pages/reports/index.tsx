import React, { useState } from 'react';
import { FaChartBar, FaUserClock, FaBoxes, FaExchangeAlt, FaExclamationTriangle, FaFileInvoiceDollar } from 'react-icons/fa';
import Layout from '../../components/layout/Layout';
import EmployeeActivityReport from '../../components/reports/EmployeeActivityReport';

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState<string>('employee-activity');

  const reportTypes = [
    {
      id: 'employee-activity',
      name: 'Employee Activity',
      icon: <FaUserClock className="h-5 w-5" />,
      description: 'Track employee actions across the system'
    },
    {
      id: 'inventory-movement',
      name: 'Inventory Movement',
      icon: <FaBoxes className="h-5 w-5" />,
      description: 'Track inventory movement and stock levels'
    },
    {
      id: 'transfers',
      name: 'Transfers',
      icon: <FaExchangeAlt className="h-5 w-5" />,
      description: 'Track transfers between warehouse and inventory'
    },
    {
      id: 'damage-reports',
      name: 'Damage Reports',
      icon: <FaExclamationTriangle className="h-5 w-5" />,
      description: 'Track damage reports and approvals'
    },
    {
      id: 'purchase-orders',
      name: 'Purchase Orders',
      icon: <FaFileInvoiceDollar className="h-5 w-5" />,
      description: 'Track purchase orders and supplier performance'
    }
  ];

  const renderReport = () => {
    switch (activeReport) {
      case 'employee-activity':
        return <EmployeeActivityReport />;
      case 'inventory-movement':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <FaBoxes className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Inventory Movement Report</h3>
              <p className="mt-2 text-sm text-gray-500">
                This report is coming soon. It will provide detailed insights into inventory movement and stock levels.
              </p>
            </div>
          </div>
        );
      case 'transfers':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Transfers Report</h3>
              <p className="mt-2 text-sm text-gray-500">
                This report is coming soon. It will provide detailed insights into transfers between warehouse and inventory.
              </p>
            </div>
          </div>
        );
      case 'damage-reports':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Damage Reports</h3>
              <p className="mt-2 text-sm text-gray-500">
                This report is coming soon. It will provide detailed insights into damage reports and approvals.
              </p>
            </div>
          </div>
        );
      case 'purchase-orders':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <FaFileInvoiceDollar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Purchase Orders Report</h3>
              <p className="mt-2 text-sm text-gray-500">
                This report is coming soon. It will provide detailed insights into purchase orders and supplier performance.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="mt-1 text-sm text-gray-500">
              Generate and view detailed reports for your warehouse and inventory operations
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
              <FaChartBar className="mr-2 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Advanced Analytics</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Types</h2>
            <nav className="space-y-2">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeReport === report.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveReport(report.id)}
                >
                  <span className="mr-3">{report.icon}</span>
                  <span>{report.name}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">About This Report</h3>
              <p className="text-xs text-gray-500">
                {reportTypes.find(r => r.id === activeReport)?.description}
              </p>
            </div>
          </div>

          <div className="md:col-span-4">
            {renderReport()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
