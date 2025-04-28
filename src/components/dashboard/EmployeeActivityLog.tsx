import React, { useState, useEffect } from 'react';
import { FaUser, FaExchangeAlt, FaBoxOpen, FaArrowDown, FaArrowUp, FaExclamationTriangle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { mockEmployeeActivities, mockActivityLogs } from '../../utils/mockData';

interface EmployeeActivity {
  id: string;
  employeeName: string;
  employeeId: string;
  action: string;
  entityType: string;
  entityName: string;
  entityId: string;
  quantity?: number;
  timestamp: string;
  details?: string;
}

const EmployeeActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<EmployeeActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Import API utility
        const { API } = await import('../../utils/api');

        try {
          // Fetch audit logs
          const auditLogs = await API.auditLogs.getAll();

          // Transform audit logs to employee activities
          const transformedActivities: EmployeeActivity[] = auditLogs.map((log: any) => {
            let action = log.action;
            let entityType = log.entity;
            let entityName = '';
            let quantity = 0;

            // Extract entity name and quantity from details if available
            if (log.details) {
              const transferMatch = log.details.match(/Transferred (\d+) (.+?) from/);
              const createMatch = log.details.match(/Created (.+?) (.+)/);
              const approveMatch = log.details.match(/Approved (.+?) (.+)/);
              const receiveMatch = log.details.match(/Received (.+?) for (.+)/);
              const deleteMatch = log.details.match(/Deleted (.+?) (.+)/);

              if (transferMatch) {
                quantity = parseInt(transferMatch[1], 10);
                entityName = transferMatch[2];
              } else if (createMatch) {
                entityName = createMatch[2];
              } else if (approveMatch) {
                entityName = approveMatch[2];
              } else if (receiveMatch) {
                entityName = receiveMatch[2];
              } else if (deleteMatch) {
                entityName = deleteMatch[2];
              }
            }

            return {
              id: log.id,
              employeeName: log.user?.name || 'Unknown User',
              employeeId: log.userId,
              action: action,
              entityType: entityType,
              entityName: entityName,
              entityId: log.entityId,
              quantity: quantity,
              timestamp: log.createdAt,
              details: log.details
            };
          });

          // Sort by timestamp (newest first)
          transformedActivities.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          setActivities(transformedActivities);
        } catch (apiError) {
          console.error('API error fetching employee activities, using mock data:', apiError);

          // Use mock employee activities directly if available
          if (mockEmployeeActivities && mockEmployeeActivities.length > 0) {
            setActivities(mockEmployeeActivities.map(activity => ({
              ...activity,
              action: activity.action.toUpperCase()
            })));
          } else {
            // Or transform activity logs to employee activities
            const transformedMockActivities = mockActivityLogs
              .filter(log => log.action !== 'login' && log.action !== 'logout')
              .map(log => {
                let quantity = 0;
                let entityName = '';

                // Try to extract quantity and entity name from details
                if (log.details) {
                  const transferMatch = log.details.match(/Transferred (\d+) units of (.+?) to/);
                  const receivedMatch = log.details.match(/Received (\d+) units of (.+?) from/);
                  const reportedMatch = log.details.match(/Reported (\d+) units of (.+?) as/);

                  if (transferMatch) {
                    quantity = parseInt(transferMatch[1], 10);
                    entityName = transferMatch[2];
                  } else if (receivedMatch) {
                    quantity = parseInt(receivedMatch[1], 10);
                    entityName = receivedMatch[2];
                  } else if (reportedMatch) {
                    quantity = parseInt(reportedMatch[1], 10);
                    entityName = reportedMatch[2];
                  }
                }

                return {
                  id: log.id,
                  employeeName: log.userName,
                  employeeId: log.userId,
                  action: log.action.toUpperCase(),
                  entityType: log.entity,
                  entityName,
                  entityId: log.entityId || '',
                  quantity,
                  timestamp: log.timestamp,
                  details: log.details
                };
              });

            setActivities(transformedMockActivities);
          }
        }
      } catch (error) {
        console.error('Error fetching employee activities:', error);
        setError('Failed to load employee activities. Please try again later.');

        // Fallback to mock data
        const fallbackActivities = mockEmployeeActivities.map(activity => ({
          ...activity,
          action: activity.action.toUpperCase()
        }));

        setActivities(fallbackActivities);
        setError(null); // Clear error since we have fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'TRANSFER':
        return <FaExchangeAlt className="text-blue-500" />;
      case 'CREATE':
        return <FaBoxOpen className="text-green-500" />;
      case 'RECEIVE':
        return <FaArrowDown className="text-purple-500" />;
      case 'APPROVE':
        return <FaUser className="text-indigo-500" />;
      case 'DELETE':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'UPDATE':
        return <FaArrowUp className="text-orange-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(activity => activity.action === filter);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Employee Activity Log</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Activities</option>
            <option value="TRANSFER">Transfers</option>
            <option value="CREATE">Created Items</option>
            <option value="RECEIVE">Received Items</option>
            <option value="APPROVE">Approvals</option>
            <option value="DELETE">Deletions</option>
            <option value="UPDATE">Updates</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No activities found</div>
      ) : (
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{activity.employeeName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center">
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                        <div className="text-xs text-gray-500">{activity.entityType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{activity.details}</div>
                    {activity.quantity > 0 && (
                      <div className="text-xs text-gray-500">Quantity: {activity.quantity}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeActivityLog;
