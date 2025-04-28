import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock, 
  FaMoneyBillWave,
  FaShippingFast,
  FaExchangeAlt,
  FaPercentage
} from 'react-icons/fa';

type PerformanceData = {
  supplierId: string;
  supplierName: string;
  metrics: {
    onTimeDelivery: number;
    qualityRating: number;
    responseTime: number;
    fulfillmentRate: number;
    returnRate: number;
    costSavings: number;
  };
  trends: {
    period: string;
    onTimeDelivery: number;
    qualityRating: number;
  }[];
  recentIssues: {
    id: string;
    date: string;
    type: string;
    description: string;
    status: string;
  }[];
};

const SupplierPerformance = () => {
  const { id } = useParams<{ id: string }>();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchPerformanceData = async () => {
      try {
        setTimeout(() => {
          // Mock data
          setPerformanceData({
            supplierId: id || '1',
            supplierName: 'Tech Supplies Inc.',
            metrics: {
              onTimeDelivery: 96.5,
              qualityRating: 4.8,
              responseTime: 4.2,
              fulfillmentRate: 98.3,
              returnRate: 1.2,
              costSavings: 7.5,
            },
            trends: [
              { period: 'Jan', onTimeDelivery: 95, qualityRating: 4.7 },
              { period: 'Feb', onTimeDelivery: 94, qualityRating: 4.6 },
              { period: 'Mar', onTimeDelivery: 96, qualityRating: 4.8 },
              { period: 'Apr', onTimeDelivery: 97, qualityRating: 4.9 },
              { period: 'May', onTimeDelivery: 98, qualityRating: 4.9 },
              { period: 'Jun', onTimeDelivery: 96, qualityRating: 4.8 },
            ],
            recentIssues: [
              {
                id: 'issue1',
                date: '2023-05-15T10:00:00Z',
                type: 'Delivery Delay',
                description: 'Order #PO-2023-089 was delivered 2 days late',
                status: 'Resolved',
              },
              {
                id: 'issue2',
                date: '2023-04-22T10:00:00Z',
                type: 'Quality Issue',
                description: '5% of items in Order #PO-2023-076 had minor defects',
                status: 'Resolved',
              },
            ],
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching supplier performance data:', error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPerformanceData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Performance data not found</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>The performance data for this supplier is not available.</p>
            </div>
            <div className="mt-4">
              <Link
                to={`/suppliers/${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Back to supplier details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getMetricColor = (value: number, metricType: string) => {
    switch (metricType) {
      case 'onTimeDelivery':
      case 'qualityRating':
      case 'fulfillmentRate':
      case 'costSavings':
        return value >= 95 ? 'text-green-500' : value >= 90 ? 'text-yellow-500' : 'text-red-500';
      case 'returnRate':
        return value <= 2 ? 'text-green-500' : value <= 5 ? 'text-yellow-500' : 'text-red-500';
      case 'responseTime':
        return value <= 6 ? 'text-green-500' : value <= 12 ? 'text-yellow-500' : 'text-red-500';
      default:
        return 'text-gray-700';
    }
  };

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'onTimeDelivery':
        return <FaShippingFast className="h-6 w-6" />;
      case 'qualityRating':
        return <FaCheckCircle className="h-6 w-6" />;
      case 'responseTime':
        return <FaClock className="h-6 w-6" />;
      case 'fulfillmentRate':
        return <FaExchangeAlt className="h-6 w-6" />;
      case 'returnRate':
        return <FaExclamationTriangle className="h-6 w-6" />;
      case 'costSavings':
        return <FaMoneyBillWave className="h-6 w-6" />;
      default:
        return <FaChartLine className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Supplier Performance</h1>
          <p className="text-gray-500">{performanceData.supplierName}</p>
        </div>
        <div className="flex space-x-2">
          <select
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full ${getMetricColor(performanceData.metrics.onTimeDelivery, 'onTimeDelivery') === 'text-green-500' ? 'bg-green-100' : getMetricColor(performanceData.metrics.onTimeDelivery, 'onTimeDelivery') === 'text-yellow-500' ? 'bg-yellow-100' : 'bg-red-100'} mb-3`}>
              {getMetricIcon('onTimeDelivery')}
            </div>
            <p className="text-sm font-medium">On-Time Delivery</p>
            <p className={`text-xl font-bold ${getMetricColor(performanceData.metrics.onTimeDelivery, 'onTimeDelivery')}`}>
              {performanceData.metrics.onTimeDelivery}%
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full ${getMetricColor(performanceData.metrics.qualityRating, 'qualityRating') === 'text-green-500' ? 'bg-green-100' : getMetricColor(performanceData.metrics.qualityRating, 'qualityRating') === 'text-yellow-500' ? 'bg-yellow-100' : 'bg-red-100'} mb-3`}>
              {getMetricIcon('qualityRating')}
            </div>
            <p className="text-sm font-medium">Quality Rating</p>
            <p className={`text-xl font-bold ${getMetricColor(performanceData.metrics.qualityRating, 'qualityRating')}`}>
              {performanceData.metrics.qualityRating}/5.0
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full ${getMetricColor(performanceData.metrics.responseTime, 'responseTime') === 'text-green-500' ? 'bg-green-100' : getMetricColor(performanceData.metrics.responseTime, 'responseTime') === 'text-yellow-500' ? 'bg-yellow-100' : 'bg-red-100'} mb-3`}>
              {getMetricIcon('responseTime')}
            </div>
            <p className="text-sm font-medium">Response Time</p>
            <p className={`text-xl font-bold ${getMetricColor(performanceData.metrics.responseTime, 'responseTime')}`}>
              {performanceData.metrics.responseTime} hrs
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full ${getMetricColor(performanceData.metrics.fulfillmentRate, 'fulfillmentRate') === 'text-green-500' ? 'bg-green-100' : getMetricColor(performanceData.metrics.fulfillmentRate, 'fulfillmentRate') === 'text-yellow-500' ? 'bg-yellow-100' : 'bg-red-100'} mb-3`}>
              {getMetricIcon('fulfillmentRate')}
            </div>
            <p className="text-sm font-medium">Fulfillment Rate</p>
            <p className={`text-xl font-bold ${getMetricColor(performanceData.metrics.fulfillmentRate, 'fulfillmentRate')}`}>
              {performanceData.metrics.fulfillmentRate}%
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full ${getMetricColor(performanceData.metrics.returnRate, 'returnRate') === 'text-green-500' ? 'bg-green-100' : getMetricColor(performanceData.metrics.returnRate, 'returnRate') === 'text-yellow-500' ? 'bg-yellow-100' : 'bg-red-100'} mb-3`}>
              {getMetricIcon('returnRate')}
            </div>
            <p className="text-sm font-medium">Return Rate</p>
            <p className={`text-xl font-bold ${getMetricColor(performanceData.metrics.returnRate, 'returnRate')}`}>
              {performanceData.metrics.returnRate}%
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full ${getMetricColor(performanceData.metrics.costSavings, 'costSavings') === 'text-green-500' ? 'bg-green-100' : getMetricColor(performanceData.metrics.costSavings, 'costSavings') === 'text-yellow-500' ? 'bg-yellow-100' : 'bg-red-100'} mb-3`}>
              {getMetricIcon('costSavings')}
            </div>
            <p className="text-sm font-medium">Cost Savings</p>
            <p className={`text-xl font-bold ${getMetricColor(performanceData.metrics.costSavings, 'costSavings')}`}>
              {performanceData.metrics.costSavings}%
            </p>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Performance Trends</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center">
            {/* In a real app, this would be a chart component */}
            <div className="text-center text-gray-500">
              <FaChartLine className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p>Performance trend chart would be displayed here.</p>
              <p className="text-sm">Showing data for {selectedPeriod === '3months' ? 'the last 3 months' : selectedPeriod === '6months' ? 'the last 6 months' : selectedPeriod === '1year' ? 'the last year' : 'all time'}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">On-Time Delivery Trend</h3>
              <div className="flex items-end space-x-2 h-20">
                {performanceData.trends.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${item.onTimeDelivery}%` }}
                    ></div>
                    <span className="text-xs mt-1">{item.period}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quality Rating Trend</h3>
              <div className="flex items-end space-x-2 h-20">
                {performanceData.trends.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(item.qualityRating / 5) * 100}%` }}
                    ></div>
                    <span className="text-xs mt-1">{item.period}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Issues */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Issues</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {performanceData.recentIssues.length > 0 ? (
            performanceData.recentIssues.map((issue) => (
              <div key={issue.id} className="p-6">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-2 rounded-full ${issue.status === 'Resolved' ? 'bg-green-100' : 'bg-yellow-100'} mr-4`}>
                    {issue.status === 'Resolved' ? (
                      <FaCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">{issue.type}</h3>
                      <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{issue.description}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(issue.date).toLocaleDateString()} ({new Date(issue.date).toLocaleTimeString()})
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recent issues found for this supplier.
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recommendations</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 mr-4">
                <FaPercentage className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Negotiate Better Terms</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Based on the consistent performance and order volume, consider negotiating better payment terms or volume discounts.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-full bg-purple-100 mr-4">
                <FaFileContract className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Renew Contract Early</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The current contract expires in 3 months. Consider early renewal to secure current pricing and terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPerformance;
