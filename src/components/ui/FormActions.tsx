import React from 'react';
import { Link } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';

interface FormActionsProps {
  submitText?: string;
  cancelText?: string;
  cancelHref: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  className?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
  submitText = 'Save',
  cancelText = 'Cancel',
  cancelHref,
  isSubmitting = false,
  onCancel,
  className = ''
}) => {
  return (
    <div className={`flex justify-end space-x-3 mt-6 ${className}`}>
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isSubmitting}
        >
          <FaTimes className="mr-2 -ml-1 h-4 w-4" />
          {cancelText}
        </button>
      ) : (
        <Link
          to={cancelHref}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FaTimes className="mr-2 -ml-1 h-4 w-4" />
          {cancelText}
        </Link>
      )}
      
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <FaSave className="mr-2 -ml-1 h-4 w-4" />
            {submitText}
          </>
        )}
      </button>
    </div>
  );
};

export default FormActions;
