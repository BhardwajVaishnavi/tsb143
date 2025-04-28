import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

type Option = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

type SearchableSelectProps = {
  label: string;
  name: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  noOptionsMessage?: string;
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helpText,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  noOptionsMessage = 'No options found',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`mb-4 ${className}`} ref={containerRef}>
      <div className="flex justify-between">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      
      <div className="relative">
        <button
          type="button"
          className={`relative w-full bg-white border ${
            error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
            'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          } rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 sm:text-sm ${
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${name}-label`}
          disabled={disabled}
        >
          <span className="flex items-center">
            {selectedOption ? (
              <>
                {selectedOption.icon && <span className="mr-2">{selectedOption.icon}</span>}
                <span className="block truncate">{selectedOption.label}</span>
              </>
            ) : (
              <span className="block truncate text-gray-400">{placeholder}</span>
            )}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <FaChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </span>
          {selectedOption && !disabled && (
            <button
              type="button"
              className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-500"
              onClick={handleClear}
            >
              <FaTimes className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <div className="sticky top-0 z-10 bg-white p-2 border-b">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  ref={searchInputRef}
                />
              </div>
            </div>
            
            {filteredOptions.length > 0 ? (
              <ul className="py-1 overflow-auto text-base focus:outline-none sm:text-sm" role="listbox">
                {filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 ${
                      option.value === value ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                    }`}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center">
                      {option.icon && <span className="mr-2">{option.icon}</span>}
                      <div>
                        <span className={`block truncate ${option.value === value ? 'font-medium' : 'font-normal'}`}>
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="block truncate text-xs text-gray-500">{option.description}</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-gray-500">
                <p>{noOptionsMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error ? (
        <p className="mt-2 text-sm text-red-600 flex items-center" id={`${name}-error`}>
          <FaExclamationCircle className="mr-1 h-3 w-3" />
          {error}
        </p>
      ) : helpText ? (
        <p className="mt-2 text-sm text-gray-500 flex items-center" id={`${name}-description`}>
          <FaInfoCircle className="mr-1 h-3 w-3" />
          {helpText}
        </p>
      ) : null}
    </div>
  );
};

export default SearchableSelect;
