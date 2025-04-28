import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaIdCard,
  FaUserTag,
  FaLayerGroup
} from 'react-icons/fa';
import { FormField, FormSection, FormActions } from '../ui/forms';
import { useAuth } from '../../contexts/AuthContext';
import {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  PERMISSION_TEMPLATES,
  ROLE_PERMISSIONS
} from '../../constants/permissions';

type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'inactive';
  permissions: Array<{ module: string; action: string; resource: string; } | string>;
  createdAt: string;
  lastLogin?: string;
};

type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
  module?: string;
  action?: string;
  resource?: string;
};

type PermissionTemplate = {
  id: string;
  name: string;
  description: string;
  permissions: Array<{ module: string; action: string; resource: string; }>;
};

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, logActivity } = useAuth();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [selectedPermissions, setSelectedPermissions] = useState<Array<{ module: string; action: string; resource: string; }>>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Available roles and permissions
  const roles = ['admin', 'warehouse_manager', 'inventory_manager', 'supplier_manager', 'viewer', 'custom'];

  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [permissionTemplates, setPermissionTemplates] = useState<PermissionTemplate[]>([]);

  // Load available permissions and templates
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

    // Generate permission templates
    const templates: PermissionTemplate[] = Object.entries(PERMISSION_TEMPLATES).map(([key, value]) => ({
      id: value,
      name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: `Standard permissions for ${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} role`,
      permissions: ROLE_PERMISSIONS[value] || []
    }));

    setPermissionTemplates(templates);

    // If in edit mode, load user data
    if (isEditMode) {
      // Simulate API call to fetch user data
      setTimeout(() => {
        // Mock user data
        const mockUser: User = {
          id: 'user-2',
          username: 'warehouse_manager',
          email: 'warehouse@example.com',
          fullName: 'Warehouse Manager',
          role: 'warehouse_manager',
          status: 'active',
          permissions: [
            { module: 'warehouse', action: 'view', resource: '*' },
            { module: 'warehouse', action: 'create', resource: 'items' },
            { module: 'warehouse', action: 'edit', resource: 'items' },
            { module: 'warehouse', action: 'create', resource: 'inward' },
            { module: 'warehouse', action: 'create', resource: 'outward' },
            { module: 'inventory', action: 'view', resource: '*' }
          ],
          createdAt: '2023-02-15T00:00:00Z',
          lastLogin: '2023-06-14T09:15:00Z'
        };

        setUsername(mockUser.username);
        setEmail(mockUser.email);
        setFullName(mockUser.fullName);
        setRole(mockUser.role);
        setStatus(mockUser.status);

        // Convert permissions if they're in the old string format
        const formattedPermissions = mockUser.permissions.map(p => {
          if (typeof p === 'string') {
            // Handle special case for 'all' permission
            if (p === 'all') {
              return { module: '*', action: '*', resource: '*' };
            }

            // Try to parse the permission string (e.g., 'warehouse_view')
            const parts = p.split('_');
            if (parts.length >= 2) {
              return {
                module: parts[0],
                action: parts[1],
                resource: parts.length > 2 ? parts.slice(2).join('_') : '*'
              };
            }

            // Default fallback
            return { module: p, action: 'view', resource: '*' };
          }

          // If it's already in the correct format, return as is
          return p;
        });

        setSelectedPermissions(formattedPermissions as Array<{ module: string; action: string; resource: string; }>);

        // Determine if this matches a template
        const matchingTemplate = permissionTemplates.find(template => {
          // Check if the permissions match exactly
          if (template.permissions.length !== formattedPermissions.length) {
            return false;
          }

          // Check if all permissions match
          return template.permissions.every(tp =>
            formattedPermissions.some(fp =>
              typeof fp !== 'string' &&
              fp.module === tp.module &&
              fp.action === tp.action &&
              fp.resource === tp.resource
            )
          );
        });

        if (matchingTemplate) {
          setSelectedTemplate(matchingTemplate.id);
        } else {
          setSelectedTemplate('custom');
        }

        setIsLoading(false);
      }, 1000);
    }
  }, [isEditMode, id]);

  // Group permissions by category
  const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Handle role change
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);

    // Set default template based on role
    if (newRole === 'admin') {
      setSelectedTemplate(PERMISSION_TEMPLATES.SUPER_ADMIN);
      setSelectedPermissions(ROLE_PERMISSIONS[PERMISSION_TEMPLATES.SUPER_ADMIN]);
    } else if (newRole === 'warehouse_manager') {
      setSelectedTemplate(PERMISSION_TEMPLATES.WAREHOUSE_MANAGER);
      setSelectedPermissions(ROLE_PERMISSIONS[PERMISSION_TEMPLATES.WAREHOUSE_MANAGER]);
    } else if (newRole === 'inventory_manager') {
      setSelectedTemplate(PERMISSION_TEMPLATES.INVENTORY_MANAGER);
      setSelectedPermissions(ROLE_PERMISSIONS[PERMISSION_TEMPLATES.INVENTORY_MANAGER]);
    } else if (newRole === 'supplier_manager') {
      setSelectedTemplate(PERMISSION_TEMPLATES.SUPPLIER_MANAGER);
      setSelectedPermissions(ROLE_PERMISSIONS[PERMISSION_TEMPLATES.SUPPLIER_MANAGER]);
    } else if (newRole === 'viewer') {
      setSelectedTemplate(PERMISSION_TEMPLATES.VIEWER);
      setSelectedPermissions(ROLE_PERMISSIONS[PERMISSION_TEMPLATES.VIEWER]);
    } else if (newRole === 'custom') {
      setSelectedTemplate(PERMISSION_TEMPLATES.CUSTOM);
      // For custom role, don't set any default permissions
      setSelectedPermissions([]);
    }
  };

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);

    if (templateId === 'custom') {
      // For custom template, don't change permissions
      return;
    }

    // Find the template and set its permissions
    const template = permissionTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedPermissions(template.permissions);
    }
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
      setSelectedTemplate('custom');
      return;
    }

    // If all permissions is selected and we're selecting another permission, remove all permissions
    if (selectedPermissions.some(p => p.module === '*' && p.action === '*' && p.resource === '*')) {
      setSelectedPermissions([{ module: permission.module, action: permission.action, resource: permission.resource }]);
      setSelectedTemplate('custom');
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

    // When manually changing permissions, set to custom template
    setSelectedTemplate('custom');
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

    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!isEditMode) {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!role) {
      newErrors.role = 'Role is required';
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
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

    // Create user object
    const userData = {
      id: isEditMode ? id : `user-${Date.now()}`,
      username,
      email,
      fullName,
      role,
      status,
      permissions: selectedPermissions,
      createdAt: isEditMode ? '' : new Date().toISOString()
    };

    // Simulate API call to create/update user
    setTimeout(() => {
      console.log('User data submitted:', userData);

      // Log activity
      if (currentUser) {
        logActivity(
          isEditMode ? 'user_update' : 'user_create',
          isEditMode
            ? `Updated user: ${fullName} (${username})`
            : `Created new user: ${fullName} (${username})`,
          'user',
          userData.id as string
        );
      }

      setIsSubmitting(false);
      navigate('/admin/users');
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? 'Update user information and permissions'
              : 'Add a new user to the system'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection
          title="User Information"
          description="Basic user account details"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FormField
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="pl-10"
                error={errors.username}
                required
                disabled={isEditMode} // Username cannot be changed in edit mode
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{top: '30px'}}>
                <FaUser className="text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="pl-10"
                error={errors.email}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{top: '30px'}}>
                <FaEnvelope className="text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <FormField
                label="Full Name"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="pl-10"
                error={errors.fullName}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{top: '30px'}}>
                <FaIdCard className="text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={`block w-full pl-10 pr-4 py-2 border ${
                    errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map(r => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTag className="text-gray-400" />
                </div>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
          </div>

          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="relative">
                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10"
                  error={errors.password}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{top: '30px'}}>
                  <FaLock className="text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <FormField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="pl-10"
                  error={errors.confirmPassword}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{top: '30px'}}>
                  <FaLock className="text-gray-400" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Permission Template"
          description="Select a predefined permission template or customize permissions"
        >
          <div className="mb-6">
            <label htmlFor="permissionTemplate" className="block text-sm font-medium text-gray-700 mb-1">
              Permission Template
            </label>
            <div className="relative">
              <select
                id="permissionTemplate"
                name="permissionTemplate"
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select a template</option>
                {permissionTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLayerGroup className="text-gray-400" />
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {selectedTemplate && permissionTemplates.find(t => t.id === selectedTemplate)?.description}
            </p>
          </div>
        </FormSection>

        <FormSection
          title="Permissions"
          description="Select the permissions for this user"
        >
          {errors.permissions && (
            <div className="mb-4 text-sm text-red-600">{errors.permissions}</div>
          )}

          <div className="space-y-6">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
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
          submitText={isEditMode ? 'Update User' : 'Create User'}
          cancelHref="/admin/users"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default UserForm;
