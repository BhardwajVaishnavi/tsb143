/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Convert an array of objects to CSV string
 * @param data Array of objects to convert
 * @param headers Optional custom headers (if not provided, will use object keys)
 * @returns CSV formatted string
 */
export const convertToCSV = (data: any[], headers?: string[]): string => {
  if (!data || !data.length) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  let csvString = csvHeaders.join(',') + '\n';

  // Add data rows
  data.forEach(item => {
    const row = csvHeaders.map(header => {
      // Get the value (handle nested properties with dot notation)
      const value = header.split('.').reduce((obj, key) => obj?.[key] ?? '', item);

      // Format the value for CSV
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma, quote or newline
        const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
        return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
      } else if (value instanceof Date) {
        return value.toISOString();
      } else if (typeof value === 'object') {
        // Convert objects to JSON string and wrap in quotes
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(',');

    csvString += row + '\n';
  });

  return csvString;
};

/**
 * Download data as a CSV file
 * @param data Array of objects to convert to CSV
 * @param filename Filename for the downloaded file
 * @param headers Optional custom headers
 */
export const downloadCSV = (data: any[], filename: string, headers?: string[]): void => {
  // Convert data to CSV
  const csvContent = convertToCSV(data, headers);

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a download link
  const link = document.createElement('a');

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Add link to document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the URL object
  URL.revokeObjectURL(url);
};

/**
 * Format date for CSV export
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDateForCSV = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Format currency for CSV export
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatCurrencyForCSV = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return value.toFixed(2);
};
