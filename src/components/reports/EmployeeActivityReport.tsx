import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaExchangeAlt, 
  FaBoxOpen, 
  FaArrowDown, 
  FaArrowUp, 
  FaExclamationTriangle,
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { API } from '../../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ActivityData {
  id: string;
  userId: string;
  user: User;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

interface ActivitySummary {
  userId: string;
  userName: string;
  role: string;
  totalActions: number;
  actionBreakdown: {
    [key: string]: number;
  };
  entityBreakdown: {
    [key: string]: number;
  };
}

const EmployeeActivityReport: React.FC = () => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activitySummaries, setActivitySummaries] = useState<ActivitySummary[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch users
        const usersData = await API.users.getAll();
        setUsers(usersData);

        // Fetch audit logs
        const logsData = await API.auditLogs.getAll();
        setActivities(logsData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Generate activity summaries when activities or users change
    if (activities.length > 0 && users.length > 0) {
      generateActivitySummaries();
    }
  }, [activities, users]);

  const generateActivitySummaries = () => {
    const summaries: ActivitySummary[] = [];
    const userMap = new Map<string, User>();
    
    // Create a map of users for quick lookup
    users.forEach(user => userMap.set(user.id, user));
    
    // Group activities by user
    const userActivities = new Map<string, ActivityData[]>();
    
    activities.forEach(activity => {
      if (!userActivities.has(activity.userId)) {
        userActivities.set(activity.userId, []);
      }
      userActivities.get(activity.userId)?.push(activity);
    });
    
    // Generate summaries for each user
    userActivities.forEach((userActs, userId) => {
      const user = userMap.get(userId);
      if (!user) return;
      
      const actionBreakdown: {[key: string]: number} = {};
      const entityBreakdown: {[key: string]: number} = {};
      
      userActs.forEach(act => {
        // Count actions
        if (!actionBreakdown[act.action]) {
          actionBreakdown[act.action] = 0;
        }
        actionBreakdown[act.action]++;
        
        // Count entities
        if (!entityBreakdown[act.entity]) {
          entityBreakdown[act.entity] = 0;
        }
        entityBreakdown[act.entity]++;
      });
      
      summaries.push({
        userId,
        userName: user.name,
        role: user.role,
        totalActions: userActs.length,
        actionBreakdown,
        entityBreakdown
      });
    });
    
    // Sort by total actions (descending)
    summaries.sort((a, b) => b.totalActions - a.totalActions);
    
    setActivitySummaries(summaries);
  };

  const filterActivities = () => {
    if (!activities.length) return [];
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.createdAt);
      const matchesDateRange = 
        activityDate >= startOfDay(dateRange.start) && 
        activityDate <= endOfDay(dateRange.end);
      
      const matchesUser = selectedUser === 'all' || activity.userId === selectedUser;
      
      const matchesAction = selectedAction === 'all' || activity.action === selectedAction;
      
      const matchesSearch = 
        searchTerm === '' || 
        activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.entity.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDateRange && matchesUser && matchesAction && matchesSearch;
    });
  };

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

  const uniqueActions = Array.from(new Set(activities.map(a => a.action))).sort();

  const filteredActivities = filterActivities();

  const exportToCSV = () => {
    const filtered = filterActivities();
    if (filtered.length === 0) return;
    
    const headers = ['Date', 'Employee', 'Role', 'Action', 'Entity', 'Details'];
    const csvData = filtered.map(activity => [
      format(new Date(activity.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      activity.user?.name || 'Unknown',
      activity.user?.role || 'Unknown',
      activity.action,
      activity.entity,
      activity.details
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employee-activity-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Employee Activity Report</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-100">
                <FaCalendarAlt className="text-gray-500" />
              </div>
              <input
                type="date"
                className="px-3 py-2 border-0 focus:ring-0"
                value={format(dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange({...dateRange, start: new Date(e.target.value)})}
              />
              <span className="px-2">to</span>
              <input
                type="date"
                className="px-3 py-2 border-0 focus:ring-0"
                value={format(dateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange({...dateRange, end: new Date(e.target.value)})}
              />
            </div>
          </div>
          
          <button 
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            onClick={exportToCSV}
          >
            <FaDownload className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="all">All Employees</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFilter className="text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : (
        <>
          {/* Activity Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activitySummaries.slice(0, 3).map(summary => (
              <div key={summary.userId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <FaUser className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{summary.userName}</h3>
                    <p className="text-sm text-gray-500">{summary.role}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-500 mb-1">Total Activities</div>
                  <div className="text-2xl font-bold text-gray-900">{summary.totalActions}</div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-500 mb-1">Top Actions</div>
                  <div className="space-y-1">
                    {Object.entries(summary.actionBreakdown)
                      .sort(([, countA], [, countB]) => countB - countA)
                      .slice(0, 3)
                      .map(([action, count]) => (
                        <div key={action} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">{getActionIcon(action)}</span>
                            <span className="text-sm">{action}</span>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Activity Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No activities found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map(activity => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(activity.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{activity.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{activity.user?.role || 'Unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-2">{getActionIcon(activity.action)}</div>
                          <span className="text-sm font-medium">{activity.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.entity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {activity.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeActivityReport;
