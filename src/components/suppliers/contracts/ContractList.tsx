import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaSearch, 
  FaFileContract, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';

type Contract = {
  id: string;
  contractNumber: string;
  supplier: {
    id: string;
    name: string;
  };
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING_RENEWAL';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
};

const ContractList = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchContracts = async () => {
      try {
        setTimeout(() => {
          // Mock data
          const mockContracts: Contract[] = [
            {
              id: '1',
              contractNumber: 'CNT-2023-001',
              supplier: {
                id: '1',
                name: 'Tech Supplies Inc.',
              },
              status: 'ACTIVE',
              startDate: '2023-01-01T00:00:00Z',
              endDate: '2023-12-31T23:59:59Z',
              autoRenew: true,
              createdAt: '2022-12-15T10:00:00Z',
            },
            {
              id: '2',
              contractNumber: 'CNT-2023-002',
              supplier: {
                id: '2',
                name: 'Fashion Wholesale',
              },
              status: 'ACTIVE',
              startDate: '2023-02-15T00:00:00Z',
              endDate: '2024-02-14T23:59:59Z',
              autoRenew: false,
              createdAt: '2023-02-01T10:00:00Z',
            },
            {
              id: '3',
              contractNumber: 'CNT-2022-015',
              supplier: {
                id: '3',
                name: 'Home Goods Distributors',
              },
              status: 'EXPIRED',
              startDate: '2022-06-01T00:00:00Z',
              endDate: '2023-05-31T23:59:59Z',
              autoRenew: false,
              createdAt: '2022-05-15T10:00:00Z',
            },
            {
              id: '4',
              contractNumber: 'CNT-2023-008',
              supplier: {
                id: '4',
                name: 'Global Parts Ltd.',
              },
              status: 'PENDING_RENEWAL',
              startDate: '2023-04-01T00:00:00Z',
              endDate: '2023-10-31T23:59:59Z',
              autoRenew: true,
              createdAt: '2023-03-15T10:00:00Z',
            },
            {
              id: '5',
              contractNumber: 'CNT-2023-012',
              supplier: {
                id: '5',
                name: 'Office Supplies Co.',
              },
              status: 'DRAFT',
              startDate: '2023-11-01T00:00:00Z',
              endDate: '2024-10-31T23:59:59Z',
              autoRenew: false,
              createdAt: '2023-10-15T10:00:00Z',
            },
          ];
          
          setContracts(mockContracts);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? contract.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'TERMINATED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_RENEWAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'EXPIRED':
        return 'Expired';
      case 'TERMINATED':
        return 'Terminated';
      case 'PENDING_RENEWAL':
        return 'Pending Renewal';
      case 'DRAFT':
        return 'Draft';
      default:
        return status;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        <h1 className="text-2xl font-bold">Supplier Contracts</h1>
        <Link 
          to="/contracts/new" 
          className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-700 transition-colors"
        >
          <FaPlus className="mr-2" /> New Contract
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search contracts..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="TERMINATED">Terminated</option>
                <option value="PENDING_RENEWAL">Pending Renewal</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.map((contract) => {
                const daysRemaining = getDaysRemaining(contract.endDate);
                const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
                
                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaFileContract className="text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{contract.contractNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/suppliers/${contract.supplier.id}`} className="text-primary-600 hover:text-primary-900">
                          {contract.supplier.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contract.status)}`}>
                        {getStatusDisplayName(contract.status)}
                      </span>
                      {contract.autoRenew && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Auto-Renew
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contract.status === 'ACTIVE' && (
                        <div className="flex items-center">
                          {daysRemaining > 0 ? (
                            <>
                              {isExpiringSoon ? (
                                <FaExclamationTriangle className="text-yellow-500 mr-1" />
                              ) : (
                                <FaCalendarAlt className="text-gray-400 mr-1" />
                              )}
                              <span className={`text-sm ${isExpiringSoon ? 'text-yellow-700 font-medium' : 'text-gray-500'}`}>
                                {daysRemaining} days
                              </span>
                            </>
                          ) : (
                            <>
                              <FaExclamationTriangle className="text-red-500 mr-1" />
                              <span className="text-sm text-red-700 font-medium">
                                Expired
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      {contract.status === 'EXPIRED' && (
                        <div className="flex items-center">
                          <FaCheckCircle className="text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            Ended
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/contracts/${contract.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                        View
                      </Link>
                      <Link to={`/contracts/${contract.id}/edit`} className="text-primary-600 hover:text-primary-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No contracts found. Try adjusting your search or filters.
          </div>
        )}
      </div>

      {/* Contract Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Contracts</p>
              <p className="text-2xl font-bold">{contracts.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FaFileContract className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'ACTIVE').length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FaCheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold">
                {contracts.filter(c => 
                  c.status === 'ACTIVE' && 
                  getDaysRemaining(c.endDate) > 0 && 
                  getDaysRemaining(c.endDate) <= 30
                ).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'EXPIRED').length}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <FaExclamationTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Contracts Alert */}
      {contracts.some(c => 
        c.status === 'ACTIVE' && 
        getDaysRemaining(c.endDate) > 0 && 
        getDaysRemaining(c.endDate) <= 30
      ) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attention Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have {contracts.filter(c => 
                    c.status === 'ACTIVE' && 
                    getDaysRemaining(c.endDate) > 0 && 
                    getDaysRemaining(c.endDate) <= 30
                  ).length} contracts expiring within the next 30 days. Please review and take appropriate action.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractList;
