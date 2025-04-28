import React from 'react';
// Using React component instead of Next.js page
import { FaChartBar, FaFileAlt } from 'react-icons/fa';
import Layout from '../../components/layout/Layout';
import InventoryReport from '../../components/inventory/InventoryReport';

const InventoryReportsPage = () => {
  return (
    <Layout title="Inventory Reports | Warehouse Management System">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
            <p className="mt-1 text-sm text-gray-500">
              Generate and view detailed reports for your inventory
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
              <FaChartBar className="mr-2 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Advanced Analytics</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaFileAlt className="text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Report Generator</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Use the tools below to generate detailed inventory reports. You can filter by location, category, and date range.
          </p>

          <InventoryReport />
        </div>
      </div>
    </Layout>
  );
};

export default InventoryReportsPage;
