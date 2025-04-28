import React from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
};

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
  className = '',
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg mb-6 ${className}`}>
      <div 
        className={`px-4 py-5 sm:px-6 border-b border-gray-200 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
            )}
          </div>
          {collapsible && (
            <div className="text-gray-400">
              {expanded ? <FaChevronDown /> : <FaChevronRight />}
            </div>
          )}
        </div>
      </div>
      {(!collapsible || expanded) && (
        <div className="px-4 py-5 sm:p-6">{children}</div>
      )}
    </div>
  );
};

export default FormSection;
