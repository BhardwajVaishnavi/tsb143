import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaChartBar,
  FaBoxes,
  FaArrowDown,
  FaArrowUp,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFilter,
  FaDownload,
  FaSearch,
  FaExclamationTriangle,
  FaWarehouse
} from 'react-icons/fa';
import { format, subDays } from 'date-fns';

// Types
interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  location: string;
  lowStockThreshold?: number;
}

interface CategorySummary {
  categoryId: string;
  categoryName: string;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
}

interface ProductMovement {
  productId: string;
  productName: string;
  category: string;
  inwardQuantity: number;
  outwardQuantity: number;
  netChange: number;
}

interface InventoryStatusReport {
  reportType: 'inventory-status';
  generatedAt: string;
  summary: {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  categoryBreakdown: CategorySummary[];
  items: InventoryItem[];
}

interface MovementAnalysisReport {
  reportType: 'movement-analysis';
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalInward: number;
    totalOutward: number;
    netChange: number;
  };
  productMovement: ProductMovement[];
}

interface ValueReport {
  reportType: 'value-report';
  generatedAt: string;
  summary: {
    totalItems: number;
    totalValue: number;
  };
  categoryValues: {
    categoryId: string;
    categoryName: string;
    itemCount: number;
    totalValue: number;
  }[];
  items: InventoryItem[];
}

type ReportData = InventoryStatusReport | MovementAnalysisReport | ValueReport;

const InventoryReport = () => {
  const { user, logActivity } = useAuth();
  // State
  const [reportType, setReportType] = useState<'inventory-status' | 'movement-analysis' | 'value-report'>('inventory-status');
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [locationId, setLocationId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch locations and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch locations
        const locationsData = await API.locations.getAll();
        setLocations(locationsData);

        // Fetch categories
        const categoriesData = await API.products.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load locations and categories');
      }
    };

    fetchData();
  }, []);

  // Generate report
  const generateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Import API utility
      const { API } = await import('../../utils/api');

      // Prepare parameters
      const params = {
        startDate,
        endDate,
        locationId: locationId || undefined,
        categoryId: categoryId || undefined
      };

      // Fetch report data
      const data = await API.inventory.getReport(reportType, params);
      setReportData(data);

      // Log the activity
      logActivity(
        'GENERATE',
        `Generated ${reportType} report`,
        'InventoryReport',
        `${reportType}-${new Date().toISOString()}`
      );
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Export report as CSV
  const exportReportCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    if (reportData.reportType === 'inventory-status') {
      // Headers
      csvContent = 'Product Name,Category,Quantity,Unit Price,Total Value,Location,Low Stock Threshold\n';

      // Data rows
      reportData.items.forEach(item => {
        csvContent += `"${item.productName}","${item.category}",${item.quantity},${item.unitPrice.toFixed(2)},${item.totalValue.toFixed(2)},"${item.location}",${item.lowStockThreshold || 0}\n`;
      });

      filename = `inventory-status-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else if (reportData.reportType === 'movement-analysis') {
      // Headers
      csvContent = 'Product Name,Category,Inward Quantity,Outward Quantity,Net Change\n';

      // Data rows
      reportData.productMovement.forEach(item => {
        csvContent += `"${item.productName}","${item.category}",${item.inwardQuantity},${item.outwardQuantity},${item.netChange}\n`;
      });

      filename = `inventory-movement-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    } else if (reportData.reportType === 'value-report') {
      // Headers
      csvContent = 'Product Name,Category,Quantity,Unit Price,Total Value,Location\n';

      // Data rows
      reportData.items.forEach(item => {
        csvContent += `"${item.productName}","${item.category}",${item.quantity},${item.unitPrice.toFixed(2)},${item.totalValue.toFixed(2)},"${item.location}"\n`;
      });

      filename = `inventory-value-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log the activity
    logActivity(
      'EXPORT',
      `Exported ${reportData.reportType} report as CSV`,
      'InventoryReport',
      `${reportData.reportType}-export-${new Date().toISOString()}`
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Inventory Reports</h2>

        <div className="flex flex-wrap gap-3">
          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              reportType === 'inventory-status'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('inventory-status')}
          >
            <FaBoxes className="mr-2" />
            Inventory Status
          </button>

          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              reportType === 'movement-analysis'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('movement-analysis')}
          >
            <FaExchangeAlt className="mr-2" />
            Movement Analysis
          </button>

          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              reportType === 'value-report'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('value-report')}
          >
            <FaMoneyBillWave className="mr-2" />
            Value Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range (only for movement analysis) */}
          {reportType === 'movement-analysis' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaWarehouse className="text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="flex items-end">
            <button
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={generateReport}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <FaChartBar className="mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      {reportData && (
        <div className="mt-6">
          {/* Report Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {reportType === 'inventory-status' && 'Current Inventory Status'}
                {reportType === 'movement-analysis' && 'Inventory Movement Analysis'}
                {reportType === 'value-report' && 'Inventory Value Report'}
              </h3>
              <p className="text-sm text-gray-500">
                Generated on {format(new Date(reportData.generatedAt), 'PPP p')}
              </p>
            </div>

            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={exportReportCSV}
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
          </div>

          {/* Report Content based on type */}
          {reportType === 'inventory-status' && reportData.reportType === 'inventory-status' && (
            <InventoryStatusReportContent report={reportData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          )}

          {reportType === 'movement-analysis' && reportData.reportType === 'movement-analysis' && (
            <MovementAnalysisReportContent report={reportData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          )}

          {reportType === 'value-report' && reportData.reportType === 'value-report' && (
            <ValueReportContent report={reportData} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          )}
        </div>
      )}
    </div>
  );
};

// Inventory Status Report Content Component
interface InventoryStatusReportContentProps {
  report: InventoryStatusReport;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const InventoryStatusReportContent: React.FC<InventoryStatusReportContentProps> = ({ report, searchTerm, setSearchTerm }) => {
  // Filter items based on search term
  const filteredItems = report.items.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FaBoxes className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-500">Total Items</p>
              <p className="text-2xl font-bold text-blue-700">{report.summary.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FaBoxes className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-500">Total Quantity</p>
              <p className="text-2xl font-bold text-green-700">{report.summary.totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <FaMoneyBillWave className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-500">Total Value</p>
              <p className="text-2xl font-bold text-purple-700">
                ${report.summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <FaExclamationTriangle className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-700">{report.summary.lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <FaExclamationTriangle className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-700">{report.summary.outOfStockItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.categoryBreakdown.map((category) => (
                <tr key={category.categoryId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.itemCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${category.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Inventory Items</h4>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity === 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>
                    ) : item.quantity <= (item.lowStockThreshold || 0) ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-4 text-gray-500">No items found matching your search criteria.</div>
        )}
      </div>
    </div>
  );
};

// Movement Analysis Report Content Component
interface MovementAnalysisReportContentProps {
  report: MovementAnalysisReport;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const MovementAnalysisReportContent: React.FC<MovementAnalysisReportContentProps> = ({ report, searchTerm, setSearchTerm }) => {
  // Filter items based on search term
  const filteredItems = report.productMovement.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FaArrowDown className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-500">Total Inward</p>
              <p className="text-2xl font-bold text-green-700">{report.summary.totalInward}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <FaArrowUp className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-500">Total Outward</p>
              <p className="text-2xl font-bold text-red-700">{report.summary.totalOutward}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FaExchangeAlt className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-500">Net Change</p>
              <p className="text-2xl font-bold text-blue-700">{report.summary.netChange}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-md font-medium text-gray-700 mb-2">Report Period</h4>
        <p className="text-sm text-gray-600">
          From {format(new Date(report.period.startDate), 'PPP')} to {format(new Date(report.period.endDate), 'PPP')}
        </p>
      </div>

      {/* Product Movement List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Product Movement</h4>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inward</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outward</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Change</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.productId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.inwardQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.outwardQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.netChange}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.netChange > 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Increasing</span>
                    ) : item.netChange < 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Decreasing</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Stable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-4 text-gray-500">No products found matching your search criteria.</div>
        )}
      </div>
    </div>
  );
};

// Value Report Content Component
interface ValueReportContentProps {
  report: ValueReport;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ValueReportContent: React.FC<ValueReportContentProps> = ({ report, searchTerm, setSearchTerm }) => {
  // Filter items based on search term
  const filteredItems = report.items.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FaBoxes className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-500">Total Items</p>
              <p className="text-2xl font-bold text-blue-700">{report.summary.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <FaMoneyBillWave className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-500">Total Value</p>
              <p className="text-2xl font-bold text-purple-700">
                ${report.summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Values */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Value by Category</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.categoryValues.map((category) => (
                <tr key={category.categoryId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.itemCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${category.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((category.totalValue / report.summary.totalValue) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Item Values</h4>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-4 text-gray-500">No items found matching your search criteria.</div>
        )}
      </div>
    </div>
  );
};

export default InventoryReport;
