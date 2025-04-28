import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { downloadCSV } from '../../utils/csvExport';

interface ExportButtonProps {
  endpoint: string;
  filename: string;
  label?: string;
  buttonClassName?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
  headers?: string[];
  mapFunction?: (item: any) => any;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  endpoint,
  filename,
  label = 'Export',
  buttonClassName = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2',
  onExportStart,
  onExportComplete,
  onExportError,
  headers,
  mapFunction
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (onExportStart) onExportStart();

      // No need to import API utility as we're using fetch directly

      // Fetch data from the API
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());

      // Map data if a mapping function is provided
      const data = mapFunction ? response.map(mapFunction) : response;

      // Download as CSV
      downloadCSV(data, `${filename}_${new Date().toISOString().split('T')[0]}.csv`, headers);

      if (onExportComplete) onExportComplete();
    } catch (error) {
      console.error('Error exporting data:', error);
      if (onExportError) onExportError(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={buttonClassName}
      title={`Export ${label} as CSV`}
    >
      <FiDownload className="w-4 h-4" />
      <span>{isExporting ? 'Exporting...' : label}</span>
    </button>
  );
};

export default ExportButton;
