import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchUserListings } from '../store/slices/listingsSlice';
import { fetchVisits } from '../store/slices/visitsSlice';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Eye, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
// Ads are not shown on owner dashboard

const OwnerDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { listings: userListings, loading } = useSelector((state: RootState) => state.listings);
  const { visits } = useSelector((state: RootState) => state.visits);
  const dispatch = useDispatch<AppDispatch>();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingVisits: 0,
    totalViews: 0
  });
  const [analytics, setAnalytics] = useState({
    monthlyViews: [],
    propertyPerformance: [],
    visitTrends: [],
    revenueData: []
  });
  
  // No ad system for owner

  useEffect(() => {
    if (user?.role === 'owner') {
      dispatch(fetchUserListings());
      dispatch(fetchVisits());
      fetchOwnerStats();
      fetchAnalytics();
    }
  }, [dispatch, user]);

  // No ad tracking for owner

  // No ad click handling for owner

  const fetchOwnerStats = async () => {
    try {
      const response = await fetch('/api/owners/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching owner stats:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/owners/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleVisitStatusUpdate = async (visitId: string, status: string) => {
    try {
      const response = await fetch(`/api/visits/${visitId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        dispatch(fetchVisits());
        fetchOwnerStats();
      }
    } catch (error) {
      console.error('Error updating visit status:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This dashboard is only for property owners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.full_name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalListings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeListings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Visits</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingVisits}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Properties
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visit Requests
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link
                      to="/create-listing"
                      className="block w-full text-left text-sm text-blue-800 hover:text-blue-900"
                    >
                      Add New Property
                    </Link>
                    <button
                      onClick={() => setActiveTab('visits')}
                      className="block w-full text-left text-sm text-blue-800 hover:text-blue-900"
                    >
                      Review Visit Requests
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="block w-full text-left text-sm text-blue-800 hover:text-blue-900"
                    >
                      View Analytics
                    </button>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-900 mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>• {stats.pendingVisits} pending visit requests</p>
                    <p>• {stats.activeListings} active properties</p>
                    <p>• {stats.totalViews} total property views</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Properties</h3>
                <Link
                  to="/create-listing"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add New Property
                </Link>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't added any properties yet.</p>
                  <Link
                    to="/create-listing"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Property
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userListings.map((listing) => (
                        <tr key={listing.listing_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                            <div className="text-sm text-gray-500">{listing.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(listing.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              listing.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {listing.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stats.totalViews}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/listings/${listing.listing_id}`}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </Link>
                            <button className="text-green-600 hover:text-green-900">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === 'visits' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Visit Requests</h3>
              {visits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No visit requests yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tenant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visits.map((visit) => (
                        <tr key={visit.visit_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{visit.tenant_name}</div>
                            <div className="text-sm text-gray-500">{visit.tenant_phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{visit.listing_title}</div>
                            <div className="text-sm text-gray-500">{visit.listing_location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(visit.visit_datetime).toLocaleDateString()} at{' '}
                            {new Date(visit.visit_datetime).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                              visit.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              visit.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {visit.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {visit.status === 'scheduled' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleVisitStatusUpdate(visit.visit_id, 'completed')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleVisitStatusUpdate(visit.visit_id, 'cancelled')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Monthly Views Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Monthly Views</h4>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                    <p className="text-sm text-gray-500">Chart will be displayed here</p>
                  </div>
                </div>

                {/* Property Performance */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Property Performance</h4>
                    <PieChart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                    <p className="text-sm text-gray-500">Chart will be displayed here</p>
                  </div>
                </div>

                {/* Visit Trends */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Visit Trends</h4>
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                    <p className="text-sm text-gray-500">Chart will be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Average Views per Property</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-2">
                      {stats.totalListings > 0 ? Math.round(stats.totalViews / stats.totalListings) : 0}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">Visit Conversion Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-2">
                      {stats.totalViews > 0 ? Math.round((stats.pendingVisits / stats.totalViews) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-900">Average Property Value</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-2">
                      {userListings.length > 0 
                        ? formatPrice(userListings.reduce((sum, listing) => sum + listing.price, 0) / userListings.length)
                        : formatPrice(0)
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* No Ad Modal for owner */}
    </div>
  );
};

export default OwnerDashboardPage;
