import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiProxy } from '../../utils/api-proxy';
import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaCalendarAlt,
  FaClock,
  FaShieldAlt,
  FaCheck,
  FaTimes,
  FaUserEdit,
  FaTrash,
  FaLock,
  FaUnlock,
  FaHistory,
  FaBoxes,
  FaWarehouse
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'inactive';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
};

type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
};

type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  description: string;
  entityType: string;
  entityId?: string;
  timestamp: string;
};

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, logActivity } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'activity'>('overview');

  // Load user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data
        const userData = await apiProxy.get<User>(`/api/users/${id}`);

        // Normalize user data
        const normalizedUser = {
          ...userData,
          role: typeof userData.role === 'string' ? userData.role.toUpperCase() : 'USER',
          permissions: Array.isArray(userData.permissions) ? userData.permissions : []
        };

        setUser(normalizedUser);

        // Fetch permissions
        const permissionsData = await apiProxy.get<Permission[]>('/api/permissions');
        setPermissions(permissionsData);

        // Fetch activity logs
        const logsData = await apiProxy.get<ActivityLog[]>(`/api/audit/logs?userId=${id}`);
        setActivityLogs(logsData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Handle user status change
  const handleStatusChange = async () => {
    if (!user) return;

    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';

      // Update user status via API
      await apiProxy.put(`/api/users/${user.id}`, {
        ...user,
        status: newStatus
      });

      // Update local state
      setUser({ ...user, status: newStatus });

      // Log activity
      if (currentUser) {
        logActivity(
          'user_status_change',
          `Changed user status to ${newStatus}`,
          'user',
          user.id
        );
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Delete user via API
        await apiProxy.delete(`/api/users/${user.id}`);

        // Log activity
        if (currentUser) {
          logActivity(
            'user_delete',
            'Deleted user',
            'user',
            user.id
          );
        }

        navigate('/admin/users');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  if (isLoading || !user) {
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
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage user information
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaUserEdit className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
            Edit User
          </button>
          <button
            onClick={handleStatusChange}
            className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              user.status === 'active'
                ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            {user.status === 'active' ? (
              <>
                <FaLock className="-ml-1 mr-2 h-4 w-4" />
                Deactivate User
              </>
            ) : (
              <>
                <FaUnlock className="-ml-1 mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </button>
          <button
            onClick={handleDeleteUser}
            className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaTrash className="-ml-1 mr-2 h-4 w-4" />
            Delete User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 flex justify-center md:justify-start">
              <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-2xl">
                  {user.fullName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
            <div className="md:w-3/4 mt-4 md:mt-0">
              <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 mr-2" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <FaUserTag className="text-gray-400 mr-2" />
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'warehouse_manager'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'inventory_manager'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    Last Login: {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString() + ' ' + new Date(user.lastLogin).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'permissions'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Permissions
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'activity'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity Log
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h3>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    user.status === 'active'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}>
                    {user.status === 'active'
                      ? <FaCheck className="text-green-600" />
                      : <FaTimes className="text-red-600" />
                    }
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Account Status: {user.status === 'active' ? 'Active' : 'Inactive'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {user.status === 'active'
                        ? 'This user can log in and access the system.'
                        : 'This user cannot log in to the system.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <dl>
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.fullName}</dd>
                      </div>
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Username</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">@{user.username}</dd>
                      </div>
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                      </div>
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.role.replace('_', ' ')}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Access Information</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <dl>
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                        <dt className="text-sm font-medium text-gray-500">Created On</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString() + ' ' + new Date(user.lastLogin).toLocaleTimeString()
                            : 'Never'
                          }
                        </dd>
                      </div>
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                        <dt className="text-sm font-medium text-gray-500">Permissions</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.permissions.includes('all')
                            ? 'All permissions (Super Admin)'
                            : `${user.permissions.length} permission(s)`
                          }
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Permissions</h3>
                <button
                  onClick={() => navigate(`/admin/users/${id}/edit`)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FaUserEdit className="-ml-1 mr-1 h-4 w-4 text-gray-500" />
                  Edit Permissions
                </button>
              </div>

              {user.permissions.includes('all') ? (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaShieldAlt className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-purple-800">Super Admin Access</h3>
                      <div className="mt-2 text-sm text-purple-700">
                        <p>
                          This user has full access to all features and functionality in the system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category} className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700">{category}</h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryPermissions.map(permission => (
                            <div key={permission.id} className="flex items-start">
                              <div className="flex items-center h-5">
                                {user.permissions.includes(permission.id) ? (
                                  <FaCheck className="h-4 w-4 text-green-500" />
                                ) : (
                                  <FaTimes className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="ml-3 text-sm">
                                <p className={`font-medium ${
                                  user.permissions.includes(permission.id)
                                    ? 'text-gray-700'
                                    : 'text-gray-400'
                                }`}>
                                  {permission.name}
                                </p>
                                <p className={`${
                                  user.permissions.includes(permission.id)
                                    ? 'text-gray-500'
                                    : 'text-gray-400'
                                }`}>
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Log</h3>

              {activityLogs.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FaHistory className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-lg font-medium text-gray-900">No activity recorded</p>
                  <p className="text-sm text-gray-500">This user has not performed any actions yet</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {activityLogs.map((log) => (
                      <li key={log.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {log.action.includes('login') ? (
                                <FaUser className="text-blue-500" />
                              ) : log.action.includes('warehouse') ? (
                                <FaWarehouse className="text-green-500" />
                              ) : log.action.includes('inventory') ? (
                                <FaBoxes className="text-purple-500" />
                              ) : (
                                <FaHistory className="text-gray-500" />
                              )}
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {log.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Action: {log.action.replace('_', ' ')} | Entity: {log.entityType}
                              {log.entityId && ` | ID: ${log.entityId}`}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
