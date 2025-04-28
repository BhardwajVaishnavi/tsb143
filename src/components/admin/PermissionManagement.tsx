import React, { useState, useEffect } from 'react';
import {
  FaLayerGroup,
  FaPlus,
  FaEdit,
  FaTrash,
  FaClone,
  FaSearch
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { FormField, FormSection, FormActions } from '../ui/forms';
import {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  PERMISSION_TEMPLATES,
  ROLE_PERMISSIONS
} from '../../constants/permissions';

type PermissionTemplate = {
  id: string;
  name: string;
  description: string;
  permissions: Array<{ module: string; action: string; resource: string; }>;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
  module: string;
  action: string;
  resource: string;
};

const PermissionManagement: React.FC = () => {
  const { user, logActivity } = useAuth();

  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for creating/editing templates
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Array<{ module: string; action: string; resource: string; }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<string>('');

  // Load templates and permissions
  useEffect(() => {
    // Generate permissions from constants
    const generatedPermissions: Permission[] = [];

    // For each module
    Object.entries(PERMISSION_MODULES).forEach(([moduleKey, moduleValue]) => {
      // For each action
      Object.entries(PERMISSION_ACTIONS).forEach(([actionKey, actionValue]) => {
        // Get relevant resources for this module
        const relevantResources = Object.entries(PERMISSION_RESOURCES)
          .filter(([resourceKey]) => resourceKey.startsWith(moduleKey))
          .map(([_, resourceValue]) => resourceValue);

        // If no specific resources, add a wildcard permission
        if (relevantResources.length === 0) {
          generatedPermissions.push({
            id: `${moduleValue}_${actionValue}_all`,
            name: `${actionKey.charAt(0).toUpperCase() + actionKey.slice(1)} All ${moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1)}`,
            description: `Can ${actionValue} all ${moduleValue} data`,
            category: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
            module: moduleValue,
            action: actionValue,
            resource: '*'
          });
        } else {
          // Add a permission for each resource
          relevantResources.forEach(resource => {
            const resourceName = resource.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            generatedPermissions.push({
              id: `${moduleValue}_${actionValue}_${resource}`,
              name: `${actionKey.charAt(0).toUpperCase() + actionKey.slice(1)} ${resourceName}`,
              description: `Can ${actionValue} ${resource} in ${moduleValue}`,
              category: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
              module: moduleValue,
              action: actionValue,
              resource: resource
            });
          });
        }
      });
    });

    // Add special all permissions
    generatedPermissions.push({
      id: 'all_permissions',
      name: 'All Permissions',
      description: 'Has access to all features',
      category: 'Super Admin',
      module: '*',
      action: '*',
      resource: '*'
    });

    setAvailablePermissions(generatedPermissions);

    // Generate permission templates from constants
    const generatedTemplates: PermissionTemplate[] = Object.entries(PERMISSION_TEMPLATES).map(([key, value]) => ({
      id: value,
      name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: `Standard permissions for ${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} role`,
      permissions: ROLE_PERMISSIONS[value] || [],
      isDefault: value !== PERMISSION_TEMPLATES.CUSTOM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Simulate API call to fetch templates
    setTimeout(() => {
      setTemplates(generatedTemplates);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Group permissions by category
  const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Start creating a new template
  const handleCreateNew = () => {
    setIsEditing(true);
    setEditingTemplateId(null);
    setTemplateName('');
    setTemplateDescription('');
    setSelectedPermissions([]);
    setErrors({});
  };

  // Start editing an existing template
  const handleEdit = (template: PermissionTemplate) => {
    setIsEditing(true);
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setTemplateDescription(template.description);
    setSelectedPermissions(template.permissions);
    setErrors({});
  };

  // Clone an existing template
  const handleClone = (template: PermissionTemplate) => {
    setIsEditing(true);
    setEditingTemplateId(null);
    setTemplateName(`${template.name} (Copy)`);
    setTemplateDescription(template.description);
    setSelectedPermissions([...template.permissions]);
    setErrors({});
  };

  // Delete a template
  const handleDelete = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      // Filter out the template to delete
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      setTemplates(updatedTemplates);

      // Log activity
      if (user) {
        logActivity(
          'template_delete',
          'Deleted permission template',
          'permission_template',
          templateId
        );
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setEditingTemplateId(null);
    setTemplateName('');
    setTemplateDescription('');
    setSelectedPermissions([]);
    setErrors({});
  };

  // Toggle permission selection
  const togglePermission = (permission: Permission) => {
    if (!permission.module || !permission.action || !permission.resource) {
      return;
    }

    // Special case for all permissions
    if (permission.module === '*' && permission.action === '*' && permission.resource === '*') {
      if (selectedPermissions.some(p => p.module === '*' && p.action === '*' && p.resource === '*')) {
        setSelectedPermissions([]);
      } else {
        setSelectedPermissions([{ module: '*', action: '*', resource: '*' }]);
      }
      return;
    }

    // If all permissions is selected and we're selecting another permission, remove all permissions
    if (selectedPermissions.some(p => p.module === '*' && p.action === '*' && p.resource === '*')) {
      setSelectedPermissions([{ module: permission.module, action: permission.action, resource: permission.resource }]);
      return;
    }

    // Check if this permission is already selected
    const isSelected = selectedPermissions.some(
      p => p.module === permission.module && p.action === permission.action && p.resource === permission.resource
    );

    if (isSelected) {
      // Remove the permission
      setSelectedPermissions(selectedPermissions.filter(
        p => !(p.module === permission.module && p.action === permission.action && p.resource === permission.resource)
      ));
    } else {
      // Add the permission
      setSelectedPermissions([
        ...selectedPermissions,
        { module: permission.module, action: permission.action, resource: permission.resource }
      ]);
    }
  };

  // Check if a permission is selected
  const isPermissionSelected = (permission: Permission) => {
    if (!permission.module || !permission.action || !permission.resource) {
      return false;
    }

    // If all permissions is selected, return true
    if (selectedPermissions.some(p => p.module === '*' && p.action === '*' && p.resource === '*')) {
      return true;
    }

    // Check for module wildcard
    if (selectedPermissions.some(p => p.module === permission.module && p.action === '*' && p.resource === '*')) {
      return true;
    }

    // Check for action wildcard
    if (selectedPermissions.some(p => p.module === permission.module && p.action === permission.action && p.resource === '*')) {
      return true;
    }

    // Check for specific permission
    return selectedPermissions.some(
      p => p.module === permission.module && p.action === permission.action && p.resource === permission.resource
    );
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!templateName) {
      newErrors.name = 'Template name is required';
    }

    if (!templateDescription) {
      newErrors.description = 'Template description is required';
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }

    // Check for duplicate name
    const isDuplicateName = templates.some(
      t => t.id !== editingTemplateId && t.name.toLowerCase() === templateName.toLowerCase()
    );

    if (isDuplicateName) {
      newErrors.name = 'A template with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Create template object
    const templateData: PermissionTemplate = {
      id: editingTemplateId || `template-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      permissions: selectedPermissions,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate API call to create/update template
    setTimeout(() => {
      if (editingTemplateId) {
        // Update existing template
        const updatedTemplates = templates.map(t =>
          t.id === editingTemplateId ? templateData : t
        );
        setTemplates(updatedTemplates);

        // Log activity
        if (user) {
          logActivity(
            'template_update',
            `Updated permission template: ${templateName}`,
            'permission_template',
            editingTemplateId
          );
        }
      } else {
        // Add new template
        setTemplates([...templates, templateData]);

        // Log activity
        if (user) {
          logActivity(
            'template_create',
            `Created new permission template: ${templateName}`,
            'permission_template',
            templateData.id
          );
        }
      }

      setIsSubmitting(false);
      setIsEditing(false);
      setEditingTemplateId(null);
      setTemplateName('');
      setTemplateDescription('');
      setSelectedPermissions([]);
    }, 1500);
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
          <h1 className="text-2xl font-bold text-gray-900">Permission Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage permission templates for user roles
          </p>
        </div>
        {!isEditing && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaPlus className="-ml-1 mr-2 h-4 w-4" />
              Create New Template
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <FormSection
            title="Template Information"
            description="Basic template details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <FormField
                  label="Template Name"
                  name="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="pl-10"
                  error={errors.name}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{top: '30px'}}>
                  <FaLayerGroup className="text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <FormField
                  label="Description"
                  name="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Enter template description"
                  className="pl-10"
                  error={errors.description}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{top: '30px'}}>
                  <FaLayerGroup className="text-gray-400" />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Permissions"
            description="Select the permissions for this template"
          >
            {errors.permissions && (
              <div className="mb-4 text-sm text-red-600">{errors.permissions}</div>
            )}

            <div className="mb-4">
              <label htmlFor="filterModule" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Module
              </label>
              <div className="relative">
                <select
                  id="filterModule"
                  name="filterModule"
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All Modules</option>
                  {Object.entries(PERMISSION_MODULES).map(([key, _value]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(permissionsByCategory)
                .filter(([category]) => !filterModule || category.toLowerCase().includes(filterModule.toLowerCase()))
                .map(([category, permissions]) => (
                <div key={category} className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">{category}</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {permissions.map(permission => (
                        <div key={permission.id} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={permission.id}
                              name={permission.id}
                              type="checkbox"
                              checked={isPermissionSelected(permission)}
                              onChange={() => togglePermission(permission)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={permission.id} className="font-medium text-gray-700">
                              {permission.name}
                            </label>
                            <p className="text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          <FormActions
            submitText={editingTemplateId ? 'Update Template' : 'Create Template'}
            cancelText="Cancel"
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </form>
      ) : (
        <>
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <li key={template.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaLayerGroup className="text-gray-500 mr-3" />
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {template.name}
                          </p>
                          {template.isDefault && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleClone(template)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Clone Template"
                          >
                            <FaClone />
                          </button>
                          {!template.isDefault && (
                            <>
                              <button
                                onClick={() => handleEdit(template)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit Template"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(template.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Template"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {template.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {template.permissions.length} permission{template.permissions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-gray-500">
                  No templates found matching your search.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default PermissionManagement;
