import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaFileContract, 
  FaShoppingCart, 
  FaChartLine, 
  FaEdit, 
  FaTrash,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaClock,
  FaDollarSign,
  FaPercentage,
  FaCreditCard,
  FaIdCard,
  FaFileInvoiceDollar,
  FaExclamationTriangle
} from 'react-icons/fa';

type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  taxId: string;
  paymentTerms: string;
  preferredCurrency: string;
  rating: number;
  notes: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLACKLISTED';
  category: string;
  website: string;
  leadTime: number;
  minimumOrderValue: number;
  discountRate: number;
  creditLimit: number;
  createdAt: string;
  updatedAt: string;
};

type PurchaseOrder = {
  id: string;
  orderNumber: string;
  status: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: number;
};

type Contract = {
  id: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
};

type PerformanceMetric = {
  name: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
};

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [recentOrders, setRecentOrders] = useState<PurchaseOrder[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchSupplierData = async () => {
      try {
        setTimeout(() => {
          // Mock data
          setSupplier({
            id: id || '1',
            name: 'Tech Supplies Inc.',
            email: 'info@techsupplies.com',
            phone: '+1 (555) 123-4567',
            address: '123 Tech St, San Francisco, CA 94107',
            contactPerson: 'John Smith',
            taxId: 'TAX-12345678',
            paymentTerms: 'Net 30',
            preferredCurrency: 'USD',
            rating: 4.8,
            notes: 'Reliable supplier for electronic components. Has been our partner for over 5 years.',
            status: 'ACTIVE',
            category: 'Electronics',
            website: 'https://techsupplies.example.com',
            leadTime: 7,
            minimumOrderValue: 1000,
            discountRate: 5.5,
            creditLimit: 50000,
            createdAt: '2020-05-15T10:00:00Z',
            updatedAt: '2023-10-20T14:30:00Z',
          });

          setRecentOrders([
            {
              id: 'po1',
              orderNumber: 'PO-2023-156',
              status: 'DELIVERED',
              orderDate: '2023-10-15T10:00:00Z',
              expectedDelivery: '2023-10-22T10:00:00Z',
              totalAmount: 12500,
            },
            {
              id: 'po2',
              orderNumber: 'PO-2023-142',
              status: 'DELIVERED',
              orderDate: '2023-09-28T10:00:00Z',
              expectedDelivery: '2023-10-05T10:00:00Z',
              totalAmount: 8750,
            },
            {
              id: 'po3',
              orderNumber: 'PO-2023-128',
              status: 'DELIVERED',
              orderDate: '2023-09-10T10:00:00Z',
              expectedDelivery: '2023-09-17T10:00:00Z',
              totalAmount: 15200,
            },
          ]);

          setContracts([
            {
              id: 'c1',
              contractNumber: 'CNT-2023-001',
              status: 'ACTIVE',
              startDate: '2023-01-01T00:00:00Z',
              endDate: '2023-12-31T23:59:59Z',
              autoRenew: true,
            },
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching supplier details:', error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSupplierData();
    }
  }, [id]);

  const handleDelete = () => {
    // In a real app, this would be an API call
    console.log('Deleting supplier:', id);
    setShowDeleteModal(false);
    navigate('/suppliers');
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }

    return stars;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'BLACKLISTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const performanceMetrics: PerformanceMetric[] = supplier
    ? [
        {
          name: 'Lead Time',
          value: `${supplier.leadTime} days`,
          icon: <FaClock className="text-blue-500" />,
          color: 'bg-blue-50',
        },
        {
          name: 'Min. Order',
          value: `$${supplier.minimumOrderValue.toLocaleString()}`,
          icon: <FaDollarSign className="text-green-500" />,
          color: 'bg-green-50',
        },
        {
          name: 'Discount Rate',
          value: `${supplier.discountRate}%`,
          icon: <FaPercentage className="text-purple-500" />,
          color: 'bg-purple-50',
        },
        {
          name: 'Credit Limit',
          value: `$${supplier.creditLimit.toLocaleString()}`,
          icon: <FaCreditCard className="text-indigo-500" />,
          color: 'bg-indigo-50',
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Supplier not found</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>The supplier you are looking for does not exist or has been removed.</p>
            </div>
            <div className="mt-4">
              <Link
                to="/suppliers"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go back to suppliers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <span className={`ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(supplier.status)}`}>
            {supplier.status}
          </span>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/suppliers/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaEdit className="mr-2 -ml-1 h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <FaTrash className="mr-2 -ml-1 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Supplier details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Supplier Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaUser className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Contact Person</p>
                      <p className="text-sm font-medium">{supplier.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaEnvelope className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{supplier.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaPhone className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{supplier.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium">{supplier.address}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaGlobe className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <a 
                        href={supplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary-600 hover:text-primary-800"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaIdCard className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Tax ID</p>
                      <p className="text-sm font-medium">{supplier.taxId}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaFileInvoiceDollar className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Payment Terms</p>
                      <p className="text-sm font-medium">{supplier.paymentTerms}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaChartLine className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium">{supplier.category}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm mt-1">{supplier.notes}</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Performance Metrics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className={`mx-auto w-12 h-12 ${metric.color} rounded-full flex items-center justify-center mb-2`}>
                      {metric.icon}
                    </div>
                    <p className="text-sm font-medium">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.name}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Supplier Rating</p>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-2">
                        {renderRatingStars(supplier.rating)}
                      </div>
                      <span className="text-sm text-gray-500">{supplier.rating.toFixed(1)}/5.0</span>
                    </div>
                  </div>
                  <Link 
                    to={`/suppliers/${id}/performance`}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    View Full Performance →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Purchase Orders</h2>
              <Link 
                to={`/suppliers/${id}/orders`}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${order.totalAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/purchase-orders/${order.id}`} className="text-primary-600 hover:text-primary-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recentOrders.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No purchase orders found for this supplier.
              </div>
            )}
          </div>
        </div>

        {/* Right column - Contracts and additional info */}
        <div className="space-y-6">
          {/* Contracts */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Contracts</h2>
              <Link 
                to={`/suppliers/${id}/contracts/new`}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Add Contract
              </Link>
            </div>
            <div className="p-6">
              {contracts.map((contract) => (
                <div key={contract.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{contract.contractNumber}</p>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          contract.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contract.status}
                        </span>
                        {contract.autoRenew && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Auto-Renew
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Link 
                      to={`/suppliers/${id}/contracts/${contract.id}`}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
              {contracts.length === 0 && (
                <div className="text-center text-gray-500">
                  No contracts found for this supplier.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link 
                  to={`/purchase-orders/new?supplierId=${id}`}
                  className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FaShoppingCart className="text-primary-500 mr-3" />
                    <span className="font-medium">Create Purchase Order</span>
                  </div>
                </Link>
                <Link 
                  to={`/suppliers/${id}/contracts/new`}
                  className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FaFileContract className="text-primary-500 mr-3" />
                    <span className="font-medium">Create Contract</span>
                  </div>
                </Link>
                <Link 
                  to={`/suppliers/${id}/performance`}
                  className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FaChartLine className="text-primary-500 mr-3" />
                    <span className="font-medium">View Performance</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Supplier History */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Supplier History</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Created On</p>
                  <p className="text-sm font-medium">
                    {new Date(supplier.createdAt).toLocaleDateString()} ({new Date(supplier.createdAt).toLocaleTimeString()})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(supplier.updatedAt).toLocaleDateString()} ({new Date(supplier.updatedAt).toLocaleTimeString()})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Supplier</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this supplier? This action cannot be undone.
                        All data associated with this supplier will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDetail;
