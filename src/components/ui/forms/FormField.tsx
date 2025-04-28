import React from 'react';
import { FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helpText,
  required = false,
  disabled = false,
  className = '',
  children,
  as = 'input',
  rows = 3,
  min,
  max,
  step,
}) => {
  const inputClasses = `block w-full px-3 py-2 border ${
    error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
    'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
  } rounded-md shadow-sm placeholder-gray-400 ${
    disabled ? 'bg-gray-100 text-gray-500' : ''
  } sm:text-sm`;

  const renderInput = () => {
    switch (as) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            disabled={disabled}
            className={`${inputClasses} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-description` : undefined}
          />
        );
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`${inputClasses} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-description` : undefined}
          >
            {children}
          </select>
        );
      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`${inputClasses} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-description` : undefined}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <div className="relative">
        {renderInput()}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaExclamationCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
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

export default FormField;
