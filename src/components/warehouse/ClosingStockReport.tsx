import React, { useState, useEffect } from 'react';
import {
  FaBoxOpen,
  FaSearch,
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaFileExcel,
  FaFilePdf
} from 'react-icons/fa';
import { FormField, FormSection } from '../ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import { WarehouseItem, ClosingStock } from '../../types/warehouse';

const ClosingStockReport: React.FC = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [closingStocks, setClosingStocks] = useState<ClosingStock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<ClosingStock[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [showFilters, setShowFilters] = useState(false);

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch warehouse items
        const items = await API.warehouse.getItems();

        // Transform the data to match our WarehouseItem type
        const warehouseItems: WarehouseItem[] = items.map((item: any) => ({
          id: item.id,
          sku: item.sku || `SKU-${item.id}`,
          name: item.productName,
          description: item.description || '',
          categoryId: item.categoryId || 'cat-1',
          supplierId: item.supplierId,
          warehouseId: item.warehouseId || 'wh-1',
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.unitCost,
          costPrice: item.costPrice || item.unitCost,
          minStockLevel: item.minStockLevel || 10,
          maxStockLevel: item.maxStockLevel || 100,
          reorderPoint: item.reorderPoint || 20,
          status: item.status || 'in_stock',
          location: {
            zone: item.locationZone || 'A',
            rack: item.locationRack || 'R1',
            shelf: item.locationShelf || 'S1',
            bin: item.locationBin || 'B1'
          },
          lastUpdated: item.updatedAt || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
          createdBy: item.createdBy || 'user-1'
        }));

        setWarehouseItems(warehouseItems);

        // Fetch closing stocks
        const stocks = await API.warehouse.getClosingStocks();

        // Filter stocks for the selected month
        const [year, month] = selectedMonth.split('-');
        const filteredStocks = stocks.filter((stock: any) => {
          const stockDate = new Date(stock.date);
          return (
            stockDate.getFullYear() === parseInt(year) &&
            stockDate.getMonth() === parseInt(month) - 1
          );
        });

        // If no stocks found for the selected month, generate them
        if (filteredStocks.length === 0) {
          try {
            // Generate closing stock for the selected month
            const generatedStocks = await API.warehouse.generateClosingStock({
              warehouseId: 'wh-1', // Default warehouse ID
              date: `${selectedMonth}-01` // First day of the selected month
            });

            setClosingStocks(generatedStocks);
            setFilteredStocks(generatedStocks);
          } catch (error) {
            console.error('Error generating closing stock:', error);
            setClosingStocks([]);
            setFilteredStocks([]);
          }
        } else {
          setClosingStocks(filteredStocks);
          setFilteredStocks(filteredStocks);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setClosingStocks([]);
        setFilteredStocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // Filter closing stocks based on search term and category
  useEffect(() => {
    let filtered = [...closingStocks];

    if (searchTerm) {
      const matchingItems = warehouseItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchingItemIds = matchingItems.map(item => item.id);
      filtered = filtered.filter(stock => matchingItemIds.includes(stock.itemId));
    }

    if (selectedCategory) {
      const matchingItems = warehouseItems.filter(item => item.categoryId === selectedCategory);
      const matchingItemIds = matchingItems.map(item => item.id);
      filtered = filtered.filter(stock => matchingItemIds.includes(stock.itemId));
    }

    setFilteredStocks(filtered);
  }, [searchTerm, selectedCategory, closingStocks, warehouseItems]);

  // Get item details by ID
  const getItemDetails = (itemId: string) => {
    return warehouseItems.find(item => item.id === itemId);
  };

  // Get unique categories for filtering
  const categories = Array.from(new Set(warehouseItems.map(item => item.categoryId)))
    .map(categoryId => {
      const categoryNames = ['Electronics', 'Clothing', 'Home & Kitchen', 'Office Supplies', 'Spices'];
      return {
        id: categoryId,
        name: categoryNames[parseInt(categoryId.split('-')[1]) - 1]
      };
    });

  // Calculate totals
  const totals = filteredStocks.reduce((acc, stock) => {
    return {
      openingQuantity: acc.openingQuantity + stock.openingQuantity,
      inwardQuantity: acc.inwardQuantity + stock.inwardQuantity,
      outwardQuantity: acc.outwardQuantity + stock.outwardQuantity,
      damageQuantity: acc.damageQuantity + stock.damageQuantity,
      adjustmentQuantity: acc.adjustmentQuantity + stock.adjustmentQuantity,
      closingQuantity: acc.closingQuantity + stock.closingQuantity,
      totalValue: acc.totalValue + stock.totalValue
    };
  }, {
    openingQuantity: 0,
    inwardQuantity: 0,
    outwardQuantity: 0,
    damageQuantity: 0,
    adjustmentQuantity: 0,
    closingQuantity: 0,
    totalValue: 0
  });

  // Format date for display
  const formatMonthYear = (dateString: string) => {
    const date = new Date(dateString + '-01'); // Add day to make a valid date
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Closing Stock Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            View closing stock quantities and values for {formatMonthYear(selectedMonth)}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaFilter className="mr-2 -ml-1 h-4 w-4 text-gray-500" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            type="button"
            onClick={() => {
              // Export to CSV
              if (filteredStocks.length === 0) {
                alert('No data to export');
                return;
              }

              // Create CSV content
              const headers = [
                'Product Name',
                'SKU',
                'Opening Quantity',
                'Inward Quantity',
                'Outward Quantity',
                'Damage Quantity',
                'Adjustment Quantity',
                'Closing Quantity',
                'Unit Price',
                'Total Value',
                'Date'
              ];

              const rows = filteredStocks.map(stock => {
                const item = getItemDetails(stock.itemId);
                return [
                  item?.name,
                  item?.sku,
                  stock.openingQuantity,
                  stock.inwardQuantity,
                  stock.outwardQuantity,
                  stock.damageQuantity,
                  stock.adjustmentQuantity,
                  stock.closingQuantity,
                  stock.unitPrice.toFixed(2),
                  stock.totalValue.toFixed(2),
                  new Date(stock.date).toLocaleDateString()
                ];
              });

              const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
              ].join('\n');

              // Create a blob and download link
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `closing-stock-${selectedMonth}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // Log activity
              logActivity(
                'export_closing_stock',
                `Exported closing stock report for ${formatMonthYear(selectedMonth)}`,
                'ClosingStock'
              );
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={filteredStocks.length === 0}
          >
            <FaFileExcel className="mr-2 -ml-1 h-4 w-4 text-green-600" />
            Export CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <FormSection
          title="Filters"
          description="Filter the closing stock report"
          collapsible
          defaultExpanded={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  type="month"
                  id="month"
                  name="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="Search by product name or SKU"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </FormSection>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opening Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inward
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outward
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Damage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adjustment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closing Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.map((stock) => {
                const item = getItemDetails(stock.itemId);
                const adjustmentDisplay = stock.adjustmentQuantity > 0
                  ? <span className="text-green-500">+{stock.adjustmentQuantity}</span>
                  : stock.adjustmentQuantity < 0
                    ? <span className="text-red-500">{stock.adjustmentQuantity}</span>
                    : <span>0</span>;

                return (
                  <tr key={stock.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <FaBoxOpen className="text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item?.name}</div>
                          <div className="text-xs text-gray-500">SKU: {item?.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.openingQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.inwardQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.outwardQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.damageQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {adjustmentDisplay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stock.closingQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${stock.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${stock.totalValue.toFixed(2)}
                    </td>
                  </tr>
                );
              })}

              {/* Totals row */}
              <tr className="bg-gray-50 font-medium">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Totals
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totals.openingQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totals.inwardQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totals.outwardQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totals.damageQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totals.adjustmentQuantity > 0
                    ? <span className="text-green-500">+{totals.adjustmentQuantity}</span>
                    : totals.adjustmentQuantity < 0
                      ? <span className="text-red-500">{totals.adjustmentQuantity}</span>
                      : <span>0</span>
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totals.closingQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${totals.totalValue.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {filteredStocks.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <FaBoxOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">No closing stock data found</p>
            <p className="text-sm">Try adjusting your filters or selecting a different month</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClosingStockReport;
