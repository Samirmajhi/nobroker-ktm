import React, { useState } from 'react';
import { Download, Filter, BarChart3 } from 'lucide-react';

interface ReportViewerProps {
  reportType: string;
  data: any;
  filters: any;
  onExport: (type: string) => void;
  onFilterChange: (filters: any) => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  reportType,
  data,
  filters,
  onExport,
  onFilterChange
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const isTabular = Array.isArray(data);
  const totalItems = isTabular ? data.length : 0;
  const totalPages = isTabular ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  const pagedData = isTabular ? data.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : data;

  const handleApplyFilters = (updated: any) => {
    setPage(1);
    onFilterChange(updated);
  };

  const renderFilters = () => {
    switch (reportType) {
      case 'visits':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input type="date" value={filters.dateFrom || ''} onChange={(e) => handleApplyFilters({ ...filters, dateFrom: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input type="date" value={filters.dateTo || ''} onChange={(e) => handleApplyFilters({ ...filters, dateTo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={filters.status || ''} onChange={(e) => handleApplyFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select value={filters.propertyType || ''} onChange={(e) => handleApplyFilters({ ...filters, propertyType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="studio">Studio</option>
              </select>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={filters.role || ''} onChange={(e) => handleApplyFilters({ ...filters, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="tenant">Tenant</option>
                <option value="owner">Owner</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KYC</label>
              <select value={filters.kycStatus || ''} onChange={(e) => handleApplyFilters({ ...filters, kycStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select value={filters.dateRange || '30'} onChange={(e) => handleApplyFilters({ ...filters, dateRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        );
      case 'listings':
      case 'engagement':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select value={filters.propertyType || ''} onChange={(e) => handleApplyFilters({ ...filters, propertyType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select value={filters.priceRange || ''} onChange={(e) => handleApplyFilters({ ...filters, priceRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="0-10000">₹0 - ₹10,000</option>
                <option value="10000-25000">₹10,000 - ₹25,000</option>
                <option value="25000-50000">₹25,000 - ₹50,000</option>
                <option value="50000+">₹50,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={filters.status || ''} onChange={(e) => handleApplyFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select value={filters.dateRange || '30'} onChange={(e) => handleApplyFilters({ ...filters, dateRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        );
      case 'allListings':
        return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select value={filters.propertyType || ''} onChange={(e) => handleApplyFilters({ ...filters, propertyType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select value={filters.priceRange || ''} onChange={(e) => handleApplyFilters({ ...filters, priceRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="0-10000">₹0 - ₹10,000</option>
                <option value="10000-25000">₹10,000 - ₹25,000</option>
                <option value="25000-50000">₹25,000 - ₹50,000</option>
                <option value="50000+">₹50,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={filters.status || ''} onChange={(e) => handleApplyFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={filters.location || ''} onChange={(e) => handleApplyFilters({ ...filters, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input type="text" value={filters.owner || ''} onChange={(e) => handleApplyFilters({ ...filters, owner: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderVisitReport = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Visit Analytics Report</h3>
      
      {pagedData && pagedData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedData.map((row: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total_visits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{row.completed_visits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{row.cancelled_visits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{row.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available for the selected filters</div>
      )}
      {isTabular && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="space-x-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1 border rounded ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={`px-3 py-1 border rounded ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Next</button>
            <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderUserReport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">User Analytics Report</h3>
        <button
          onClick={() => onExport('users')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>
      
      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{data.total_users}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Verified Users</h3>
            <p className="text-3xl font-bold text-green-600">{data.verified_users}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900">Pending KYC</h3>
            <p className="text-3xl font-bold text-yellow-600">{data.pending_kyc}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900">Active Users</h3>
            <p className="text-3xl font-bold text-purple-600">{data.active_users}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available for the selected filters</div>
      )}
    </div>
  );

  const renderListingReport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Listing Performance Report</h3>
        <button
          onClick={() => onExport('listings')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>
      
      {pagedData && pagedData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interested Tenants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedData.map((listing: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{listing.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(listing.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.total_visits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{listing.interested_tenants}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{listing.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available for the selected filters</div>
      )}
      {isTabular && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="space-x-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1 border rounded ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={`px-3 py-1 border rounded ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Next</button>
            <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderEngagementReport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Property Engagement Report</h3>
        <button
          onClick={() => onExport('engagement')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {pagedData && pagedData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorites</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interested Tenants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interested Owners</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedData.map((row: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(row.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.favorites || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{row.interested_tenants || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">{row.interested_owners || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{row.matches || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available for the selected filters</div>
      )}
      {isTabular && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="space-x-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1 border rounded ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={`px-3 py-1 border rounded ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Next</button>
            <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderAllListingsReport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Listings Report</h3>
        <button
          onClick={() => onExport('allListings')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>
      
      {pagedData && pagedData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedData.map((listing: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{listing.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{listing.property_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(listing.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.owner_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      listing.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {listing.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(listing.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.total_visits || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available for the selected filters</div>
      )}
      {isTabular && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="space-x-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1 border rounded ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={`px-3 py-1 border rounded ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Next</button>
            <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderReport = () => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">No data found for the selected filters.</p>
        </div>
      );
    }

    switch (reportType) {
      case 'visits':
        return renderVisitReport();
      case 'users':
        return renderUserReport();
      case 'listings':
        return renderListingReport();
      case 'engagement':
        return renderEngagementReport();
      case 'allListings':
        return renderAllListingsReport();
      case 'userRegistrations':
        return renderUserRegistrationsReport();
      case 'userActivity':
        return renderUserActivityReport();
      case 'pricePreferences':
        return renderPricePreferencesReport();
      case 'userFavorites':
        return renderUserFavoritesReport();
      case 'favoritesByTenant':
        return renderFavoritesByTenantReport();
      case 'matches':
        return renderMatchesReport();
      case 'revenue':
        return renderRevenueReport();
      case 'subscriptions':
        return renderSubscriptionsReport();
      default:
        return (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
            <p className="text-gray-600">The selected report type is not available.</p>
          </div>
        );
    }
  };

  const renderUserRegistrationsReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owners</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.new_users || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tenants || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.owners || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.staff || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.total || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderUserActivityReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties Viewed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorites</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name || item.email}</div>
                  <div className="text-sm text-gray-500">{item.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.last_login)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.properties_viewed || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.favorites_count || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPricePreferencesReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users Interested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties Available</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.price_range}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.users_interested || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.properties_available || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.match_rate || '0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderUserFavoritesReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorited Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.user_name || item.user_email}</div>
                  <div className="text-sm text-gray-500">{item.user_role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.property_title}</div>
                  <div className="text-sm text-gray-500">{item.property_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.property_location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(item.property_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.favorited_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFavoritesByTenantReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorited Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.tenant_name || item.tenant_email}</div>
                  <div className="text-sm text-gray-500">{item.tenant_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.property_title}</div>
                  <div className="text-sm text-gray-500">{item.property_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.property_location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(item.property_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.favorited_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMatchesReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.property_title}</div>
                  <div className="text-sm text-gray-500">{item.property_location} - {formatPrice(item.property_price)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.tenant_name}</div>
                  <div className="text-sm text-gray-500">{item.tenant_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.owner_name}</div>
                  <div className="text-sm text-gray-500">{item.owner_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.match_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' : 
                    item.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRevenueReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatPrice(item.revenue)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.transactions || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.premium_users || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.growth || '0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSubscriptionsReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.user_name || item.user_email}</div>
                  <div className="text-sm text-gray-500">{item.user_role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plan_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.start_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.end_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatPrice(item.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' : 
                    item.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3 w-full">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {reportType === 'visits' && 'Visit Analytics'}
            {reportType === 'users' && 'User Analytics'}
            {reportType === 'listings' && 'Listing Performance'}
            {reportType === 'engagement' && 'Property Engagement'}
            {reportType === 'allListings' && 'All Listings'}
            {reportType === 'userRegistrations' && 'User Registrations'}
            {reportType === 'userActivity' && 'User Activity'}
            {reportType === 'pricePreferences' && 'Price Preferences'}
            {reportType === 'userFavorites' && 'User Favorites'}
            {reportType === 'favoritesByTenant' && 'Favorites by Tenant'}
            {reportType === 'matches' && 'Matches & Residency'}
            {reportType === 'revenue' && 'Revenue Analytics'}
            {reportType === 'subscriptions' && 'Premium Subscriptions'}
          </h2>
          <button onClick={() => setShowFilters(!showFilters)} className="ml-auto px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center">
            <Filter className="w-4 h-4 mr-1" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        <button onClick={() => onExport(reportType)} className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          {renderFilters()}
        </div>
      )}
      <div className="p-6">
        {renderReport()}
      </div>
    </div>
  );
};

export default ReportViewer;
