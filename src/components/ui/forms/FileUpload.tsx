import React, { useState, useRef } from 'react';
import { FaUpload, FaFile, FaImage, FaFilePdf, FaFileExcel, FaFileWord, FaTrash, FaExclamationCircle } from 'react-icons/fa';

type FileUploadProps = {
  label: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onChange: (files: File[]) => void;
  value?: File[];
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  name,
  accept,
  multiple = false,
  maxSize,
  onChange,
  value = [],
  error,
  helpText,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    
    // Filter by file size if maxSize is provided
    const validFiles = maxSize 
      ? filesArray.filter(file => file.size <= maxSize)
      : filesArray;
    
    if (validFiles.length !== filesArray.length) {
      // Some files were filtered out due to size
      console.warn('Some files exceeded the maximum file size and were not included');
    }
    
    if (multiple) {
      onChange([...value, ...validFiles]);
    } else {
      onChange(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type;
    if (fileType.includes('image')) return <FaImage className="text-blue-500" />;
    if (fileType.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FaFileExcel className="text-green-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord className="text-blue-700" />;
    return <FaFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      
      <div 
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        } ${error ? 'border-red-300' : ''} ${disabled ? 'bg-gray-100 opacity-75' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={disabled ? undefined : handleDrop}
      >
        <div className="space-y-1 text-center">
          <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={name}
              className={`relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Upload {multiple ? 'files' : 'a file'}</span>
              <input
                id={name}
                name={name}
                type="file"
                ref={inputRef}
                className="sr-only"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                disabled={disabled}
                required={required && value.length === 0}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {accept ? `${accept.split(',').join(', ')} • ` : ''}
            {maxSize ? `Max ${formatFileSize(maxSize)}` : 'Any file size'}
          </p>
        </div>
      </div>
      
      {value.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-200">
          {value.map((file, index) => (
            <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
              <div className="flex items-center flex-1 w-0">
                <div className="flex-shrink-0 mr-2">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-gray-500 ml-2">{formatFileSize(file.size)}</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className={`font-medium text-red-600 hover:text-red-500 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {error ? (
        <p className="mt-2 text-sm text-red-600 flex items-center" id={`${name}-error`}>
          <FaExclamationCircle className="mr-1 h-3 w-3" />
          {error}
        </p>
      ) : helpText ? (
        <p className="mt-2 text-sm text-gray-500" id={`${name}-description`}>
          {helpText}
        </p>
      ) : null}
    </div>
  );
};

export default FileUpload;
