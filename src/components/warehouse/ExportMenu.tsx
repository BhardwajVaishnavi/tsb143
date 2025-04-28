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
      label: 'Warehouse Items',
      endpoint: '/api/warehouse/export?type=items',
      filename: 'warehouse_items',
      headers: [
        'SKU', 'Product Name', 'Category', 'Quantity', 'Unit Cost',
        'Total Value', 'Supplier', 'Location', 'Status', 'Created Date'
      ],
      mapFunction: (item) => ({
        'SKU': item.sku || '',
        'Product Name': item.productName,
        'Category': item.category || 'Uncategorized',
        'Quantity': item.quantity,
        'Unit Cost': formatCurrencyForCSV(item.unitCost),
        'Total Value': formatCurrencyForCSV(item.totalValue),
        'Supplier': item.supplier?.name || 'Unknown',
        'Location': item.location || '',
        'Status': item.status,
        'Created Date': formatDateForCSV(item.createdAt)
      })
    },
    {
      id: 'inward',
      label: 'Inward Entries',
      endpoint: '/api/warehouse/export?type=inward',
      filename: 'inward_entries',
      headers: [
        'Date', 'Product', 'Supplier', 'Quantity', 'Unit Cost',
        'Total Cost', 'Batch Number', 'Invoice Number', 'Notes'
      ],
      mapFunction: (item) => ({
        'Date': formatDateForCSV(item.receivedDate),
        'Product': item.warehouseItem?.productName || 'Unknown',
        'Supplier': item.supplier?.name || 'Unknown',
        'Quantity': item.quantity,
        'Unit Cost': formatCurrencyForCSV(item.unitCost),
        'Total Cost': formatCurrencyForCSV(item.totalCost),
        'Batch Number': item.batchNumber || '',
        'Invoice Number': item.invoiceNumber || '',
        'Notes': item.notes || ''
      })
    },
    {
      id: 'outward',
      label: 'Outward Entries',
      endpoint: '/api/warehouse/export?type=outward',
      filename: 'outward_entries',
      headers: [
        'Date', 'Product', 'Quantity', 'Destination', 'Status', 'Notes'
      ],
      mapFunction: (item) => ({
        'Date': formatDateForCSV(item.transferDate),
        'Product': item.warehouseItem?.productName || 'Unknown',
        'Quantity': item.quantity,
        'Destination': item.destination || '',
        'Status': item.status,
        'Notes': item.notes || ''
      })
    },
    {
      id: 'damage',
      label: 'Damage Reports',
      endpoint: '/api/warehouse/export?type=damage',
      filename: 'damage_reports',
      headers: [
        'Date', 'Product', 'Quantity', 'Reason', 'Status', 'Notes'
      ],
      mapFunction: (item) => ({
        'Date': formatDateForCSV(item.reportedDate),
        'Product': item.warehouseItem?.productName || 'Unknown',
        'Quantity': item.quantity,
        'Reason': item.reason || '',
        'Status': item.status,
        'Notes': item.notes || ''
      })
    },
    {
      id: 'closing',
      label: 'Closing Stock',
      endpoint: '/api/warehouse/export?type=closing',
      filename: 'closing_stock',
      headers: [
        'Date', 'Product', 'Opening Quantity', 'Inward', 'Outward',
        'Damage', 'Adjustment', 'Closing Quantity', 'Unit Price', 'Total Value'
      ],
      mapFunction: (item) => ({
        'Date': formatDateForCSV(item.date),
        'Product': item.warehouseItem?.productName || 'Unknown',
        'Opening Quantity': item.openingQuantity,
        'Inward': item.inwardQuantity,
        'Outward': item.outwardQuantity,
        'Damage': item.damageQuantity,
        'Adjustment': item.adjustmentQuantity,
        'Closing Quantity': item.closingQuantity,
        'Unit Price': formatCurrencyForCSV(item.unitPrice),
        'Total Value': formatCurrencyForCSV(item.totalValue)
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
      const response = await API.warehouse.exportData(option.id);

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
