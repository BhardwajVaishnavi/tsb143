import React, { useState, useEffect } from 'react';
import {
  FaBoxOpen,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChevronDown,
  FaChevronRight,
  FaChartLine
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Inventory Status Component
const WarehouseInventoryStatus = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Electronics');
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryByCategory, setInventoryByCategory] = useState<any[]>([]);
  const [inventoryAnalytics, setInventoryAnalytics] = useState({
    totalItems: 0,
    totalValue: 0,
    averageUtilization: 0,
    topPerformingCategory: '',
    topPerformingCategoryGrowth: 0,
    underperformingCategory: '',
    underperformingCategoryDecline: 0,
    inventoryTurnoverRate: 0,
    averageDaysInInventory: 0
  });

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setIsLoading(true);

        // Import NeonDB utility
        const { NeonDB } = await import('../../utils/neondb');

        // Fetch warehouse items from NeonDB
        const warehouseItems = await NeonDB.warehouse.getItems();

        // Group items by category
        const itemsByCategory: Record<string, any[]> = {};

        if (Array.isArray(warehouseItems)) {
          warehouseItems.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!itemsByCategory[category]) {
              itemsByCategory[category] = [];
            }
            itemsByCategory[category].push(item);
          });
        }

        // Transform data for display
        const transformedCategories = Object.keys(itemsByCategory).map(category => {
          const items = itemsByCategory[category];
          const itemCount = items.length;
          const value = items.reduce((sum, item) => {
            const itemValue = item.unit_cost || item.price || 0;
            return sum + (item.quantity * itemValue);
          }, 0);

          // Calculate utilization rate (mock for now)
          const utilizationRate = Math.floor(Math.random() * 40) + 45; // 45-85%

          // Determine trend (mock for now)
          const trend = Math.random() > 0.5 ? 'up' : 'down';
          const trendValue = parseFloat((Math.random() * 10).toFixed(1));

          // Count low stock items
          const lowStockCount = items.filter(item => {
            const minStockLevel = item.min_stock_level || 10;
            return item.quantity <= minStockLevel;
          }).length;

          // Create subcategories (mock for now since we don't have real subcategories)
          const subcategories = [
            { id: `${category}-1`, name: `${category} Type A`, count: Math.floor(itemCount * 0.4), value: Math.floor(value * 0.4), trend: Math.random() > 0.5 ? 'up' : 'down' },
            { id: `${category}-2`, name: `${category} Type B`, count: Math.floor(itemCount * 0.3), value: Math.floor(value * 0.3), trend: Math.random() > 0.5 ? 'up' : 'down' },
            { id: `${category}-3`, name: `${category} Type C`, count: Math.floor(itemCount * 0.2), value: Math.floor(value * 0.2), trend: Math.random() > 0.5 ? 'up' : 'down' },
            { id: `${category}-4`, name: `${category} Other`, count: Math.floor(itemCount * 0.1), value: Math.floor(value * 0.1), trend: Math.random() > 0.5 ? 'up' : 'down' },
          ];

          return {
            id: category,
            name: category,
            itemCount,
            value,
            utilizationRate,
            trend,
            trendValue,
            lowStockCount,
            items: subcategories
          };
        });

        setInventoryByCategory(transformedCategories);

        // Calculate inventory analytics
        const totalItems = warehouseItems.length;
        const totalValue = warehouseItems.reduce((sum, item) => {
          const itemValue = item.unit_cost || item.price || 0;
          return sum + (item.quantity * itemValue);
        }, 0);

        // Find top and underperforming categories
        let topCategory = { name: '', growth: 0 };
        let worstCategory = { name: '', decline: 0 };

        transformedCategories.forEach(category => {
          if (category.trend === 'up' && category.trendValue > topCategory.growth) {
            topCategory = { name: category.name, growth: category.trendValue };
          }
          if (category.trend === 'down' && category.trendValue > worstCategory.decline) {
            worstCategory = { name: category.name, decline: category.trendValue };
          }
        });

        setInventoryAnalytics({
          totalItems,
          totalValue,
          averageUtilization: Math.floor(transformedCategories.reduce((sum, cat) => sum + cat.utilizationRate, 0) / transformedCategories.length),
          topPerformingCategory: topCategory.name,
          topPerformingCategoryGrowth: topCategory.growth,
          underperformingCategory: worstCategory.name,
          underperformingCategoryDecline: worstCategory.decline,
          inventoryTurnoverRate: parseFloat((Math.random() * 3 + 3).toFixed(1)), // Mock data 3-6
          averageDaysInInventory: Math.floor(Math.random() * 30 + 60) // Mock data 60-90
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setIsLoading(false);

        // Fallback to mock data
        setInventoryByCategory([
    {
      id: '1',
      name: 'Electronics',
      itemCount: 2156,
      value: 850000,
      utilizationRate: 78,
      trend: 'up',
      trendValue: 5.2,
      lowStockCount: 12,
      items: [
        { id: 'e1', name: 'Smartphones', count: 450, value: 225000, trend: 'up' },
        { id: 'e2', name: 'Laptops', count: 320, value: 384000, trend: 'up' },
        { id: 'e3', name: 'Tablets', count: 280, value: 112000, trend: 'down' },
        { id: 'e4', name: 'Accessories', count: 1106, value: 129000, trend: 'up' },
      ]
    },
    {
      id: '2',
      name: 'Clothing',
      itemCount: 3542,
      value: 530000,
      utilizationRate: 65,
      trend: 'down',
      trendValue: 2.8,
      lowStockCount: 18,
      items: [
        { id: 'c1', name: 'Men\'s Apparel', count: 1200, value: 180000, trend: 'down' },
        { id: 'c2', name: 'Women\'s Apparel', count: 1450, value: 217500, trend: 'down' },
        { id: 'c3', name: 'Children\'s Apparel', count: 650, value: 97500, trend: 'up' },
        { id: 'c4', name: 'Accessories', count: 242, value: 35000, trend: 'down' },
      ]
    },
    {
      id: '3',
      name: 'Home & Kitchen',
      itemCount: 1876,
      value: 620000,
      utilizationRate: 82,
      trend: 'up',
      trendValue: 7.5,
      lowStockCount: 8,
      items: [
        { id: 'h1', name: 'Appliances', count: 450, value: 315000, trend: 'up' },
        { id: 'h2', name: 'Furniture', count: 320, value: 192000, trend: 'up' },
        { id: 'h3', name: 'Kitchenware', count: 780, value: 93600, trend: 'up' },
        { id: 'h4', name: 'Decor', count: 326, value: 19400, trend: 'down' },
      ]
    },
    {
      id: '4',
      name: 'Books',
      itemCount: 720,
      value: 43000,
      utilizationRate: 45,
      trend: 'down',
      trendValue: 1.2,
      lowStockCount: 4,
      items: [
        { id: 'b1', name: 'Fiction', count: 320, value: 16000, trend: 'down' },
        { id: 'b2', name: 'Non-Fiction', count: 280, value: 14000, trend: 'down' },
        { id: 'b3', name: 'Children\'s Books', count: 120, value: 13000, trend: 'up' },
      ]
    },
        ]);

        // Fallback to mock analytics
        setInventoryAnalytics({
    totalItems: 8294,
    totalValue: 2043000,
    averageUtilization: 72,
    topPerformingCategory: 'Electronics',
    topPerformingCategoryGrowth: 5.2,
    underperformingCategory: 'Books',
    underperformingCategoryDecline: 1.2,
    inventoryTurnoverRate: 4.8,
    averageDaysInInventory: 76
        });
      }
    };

    fetchInventoryData();
  }, []);

  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
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
      {/* Inventory Status Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Inventory Status by Category</h3>
            <Link to="/warehouse/inventory" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View All Categories
            </Link>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Current inventory levels, value, and utilization rates across all categories
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Low Stock
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryByCategory.map((category) => (
                <React.Fragment key={category.id}>
                  <tr className={`hover:bg-gray-50 ${expandedCategory === category.id ? 'bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="mr-2 text-gray-400 hover:text-gray-500"
                        >
                          {expandedCategory === category.id ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                        <div className="flex items-center">
                          <FaBoxOpen className="mr-2 text-primary-500" />
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.itemCount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{category.value.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            category.utilizationRate >= 80 ? 'bg-green-600' :
                            category.utilizationRate >= 60 ? 'bg-blue-600' :
                            category.utilizationRate >= 40 ? 'bg-yellow-500' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${category.utilizationRate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{category.utilizationRate}% utilized</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.trend === 'up' ? (
                          <FaArrowUp className="text-green-500 mr-1" />
                        ) : (
                          <FaArrowDown className="text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${category.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                          {category.trendValue}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.lowStockCount > 0 ? (
                        <div className="flex items-center">
                          <FaExclamationTriangle className="text-yellow-500 mr-1" />
                          <span className="text-sm text-yellow-700">{category.lowStockCount} items</span>
                        </div>
                      ) : (
                        <span className="text-sm text-green-500">None</span>
                      )}
                    </td>
                  </tr>
                  {expandedCategory === category.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="border-l-2 border-primary-200 pl-4">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subcategory
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Items
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Value
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Trend
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {category.items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-100">
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-xs text-gray-900">{item.name}</div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-xs text-gray-900">{item.count.toLocaleString()}</div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-xs text-gray-900">₹{item.value.toLocaleString()}</div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {item.trend === 'up' ? (
                                        <FaArrowUp className="text-green-500 mr-1 text-xs" />
                                      ) : (
                                        <FaArrowDown className="text-red-500 mr-1 text-xs" />
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Analytics */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Inventory Analytics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Key performance indicators and metrics for inventory management
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-base font-medium text-gray-900 flex items-center">
                <FaInfoCircle className="text-primary-500 mr-2" />
                Inventory Overview
              </h4>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Items:</span>
                  <span className="text-sm font-medium">{inventoryAnalytics.totalItems.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Value:</span>
                  <span className="text-sm font-medium">₹{inventoryAnalytics.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Average Utilization:</span>
                  <span className="text-sm font-medium">{inventoryAnalytics.averageUtilization}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-base font-medium text-gray-900 flex items-center">
                <FaChartLine className="text-primary-500 mr-2" />
                Performance Metrics
              </h4>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Top Category:</span>
                  <span className="text-sm font-medium flex items-center">
                    {inventoryAnalytics.topPerformingCategory}
                    <FaArrowUp className="ml-1 text-green-500" />
                    <span className="text-green-500 ml-1">{inventoryAnalytics.topPerformingCategoryGrowth}%</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Underperforming:</span>
                  <span className="text-sm font-medium flex items-center">
                    {inventoryAnalytics.underperformingCategory}
                    <FaArrowDown className="ml-1 text-red-500" />
                    <span className="text-red-500 ml-1">{inventoryAnalytics.underperformingCategoryDecline}%</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-base font-medium text-gray-900 flex items-center">
                <FaBoxOpen className="text-primary-500 mr-2" />
                Inventory Efficiency
              </h4>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Turnover Rate:</span>
                  <span className="text-sm font-medium">{inventoryAnalytics.inventoryTurnoverRate} times/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Avg. Days in Inventory:</span>
                  <span className="text-sm font-medium">{inventoryAnalytics.averageDaysInInventory} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseInventoryStatus;
