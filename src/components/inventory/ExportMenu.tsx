import React, { useState, useRef, useEffect } from 'react';
import { FiDownload, FiChevronDown } from 'react-icons/fi';
import { downloadCSV, formatDateForCSV, formatCurrencyForCSV } from '../../utils/csvExport';

interface ExportOption {
  id: string;
  label: string;
  endpoint: string;
  filename: string;
  headers?: string[];
  mapFunction?: (item: any) => any;
}

const ExportMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const exportOptions: ExportOption[] = [
    {
      id: 'items',
      label: 'Inventory Items',
      endpoint: '/api/inventory/items',
      filename: 'inventory_items',
      headers: [
        'Product Name', 'Category', 'Quantity', 'Unit Price',
        'Total Value', 'Status', 'Created Date'
      ],
      mapFunction: (item) => ({
        'Product Name': item.product?.name || 'Unknown Product',
        'Category': item.product?.category?.name || 'Uncategorized',
        'Quantity': item.quantity,
        'Unit Price': formatCurrencyForCSV(item.product?.price || 0),
        'Total Value': formatCurrencyForCSV((item.quantity || 0) * (item.product?.price || 0)),
        'Status': item.status || 'in_stock',
        'Created Date': formatDateForCSV(item.createdAt)
      })
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = async (option: ExportOption) => {
    try {
      setIsExporting(option.id);

      // Import API utility
      const { API } = await import('../../utils/api');

      // Fetch data from the API
      const response = await API.inventory.getItems();

      // Map data if a mapping function is provided
      const data = option.mapFunction ? response.map(option.mapFunction) : response;

      // Download as CSV
      downloadCSV(data, `${option.filename}_${new Date().toISOString().split('T')[0]}.csv`, option.headers);

    } catch (error) {
      console.error(`Error exporting ${option.label}:`, error);
      alert(`Failed to export ${option.label}. Please try again.`);
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        disabled={isExporting !== null}
      >
        <FiDownload className="w-4 h-4" />
        <span>Export</span>
        <FiChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 py-1">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleExport(option)}
              disabled={isExporting !== null}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              {isExporting === option.id ? (
                <span className="animate-pulse">Exporting...</span>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  <span>{option.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
