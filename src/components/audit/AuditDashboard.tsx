import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload } from 'react-icons/fa';

type AuditLog = {
  id: string;
  user: {
    name: string;
  };
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
};

const AuditDashboard = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    // Simulate API call to fetch audit logs
    const fetchLogs = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          const actions = ['created', 'updated', 'deleted', 'transferred'];
          const entities = ['User', 'Product', 'WarehouseItem', 'InventoryItem', 'Supplier', 'Transfer'];
          
          const mockLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => {
            const action = actions[Math.floor(Math.random() * actions.length)];
            const entity = entities[Math.floor(Math.random() * entities.length)];
            
            return {
              id: `log-${i + 1}`,
              user: {
                name: `User ${(i % 3) + 1}`,
              },
              action,
              entity,
              entityId: `${entity.toLowerCase()}-${Math.floor(Math.random() * 100) + 1}`,
              details: `${action} ${entity.toLowerCase()} with details`,
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            };
          });
          
          // Sort by date, newest first
          mockLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setLogs(mockLogs);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntityFilter = filterEntity ? log.entity === filterEntity : true;
    const matchesActionFilter = filterAction ? log.action === filterAction : true;
    
    return matchesSearch && matchesEntityFilter && matchesActionFilter;
  });

  const uniqueEntities = Array.from(new Set(logs.map(log => log.entity)));
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  const exportLogs = () => {
    // In a real app, this would generate a CSV or PDF file
    alert('Exporting logs...');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Dashboard</h1>
        <button 
          className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center"
          onClick={exportLogs}
        >
          <FaDownload className="mr-2" /> Export Logs
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
              >
                <option value="">All Entities</option>
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.action === 'created' ? 'bg-green-100 text-green-800' :
                      log.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'deleted' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.entity}</div>
                    <div className="text-xs text-gray-500">{log.entityId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No logs found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDashboard;
