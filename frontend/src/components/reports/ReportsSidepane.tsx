import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Home, 
  Calendar, 
  TrendingUp, 
  Download, 
  Filter,
  X,
  ChevronRight,
  FileText,
  Eye,
  DollarSign,
  MapPin,
  Building,
  CheckCircle,
  Heart,
  Crown,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  status: string;
  propertyType: string;
  priceRange: string;
  location: string;
  owner: string;
  role: string;
  kycStatus: string;
  dateRange: string;
}

interface ReportsSidepaneProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSelect: (reportType: string) => void;
  activeReport: string;
  onApplyFilters?: (filters: ReportFilters) => void;
  onExport?: (reportType: string, filters: ReportFilters) => void;
  mode?: 'drawer' | 'inline';
  hideFilters?: boolean;
}

const ReportsSidepane: React.FC<ReportsSidepaneProps> = ({
  isOpen,
  onClose,
  onReportSelect,
  activeReport,
  onApplyFilters,
  onExport,
  mode = 'drawer',
  hideFilters = false
}) => {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: '',
    dateTo: '',
    status: '',
    propertyType: '',
    priceRange: '',
    location: '',
    owner: '',
    role: '',
    kycStatus: '',
    dateRange: '30'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['analytics']);

  const reportCategories = [
    {
      id: 'analytics',
      name: 'Analytics & Performance',
      icon: BarChart3,
      reports: [
        {
          id: 'visits',
          name: 'Visit Analytics',
          icon: Calendar,
          description: 'Visit statistics and trends',
          color: 'bg-blue-500'
        },
        {
          id: 'engagement',
          name: 'Property Engagement',
          icon: Eye,
          description: 'Likes, interests, matches per property',
          color: 'bg-teal-500'
        },
        {
          id: 'listings',
          name: 'Listing Performance',
          icon: Home,
          description: 'Property listing analytics',
          color: 'bg-purple-500'
        }
      ]
    },
    {
      id: 'users',
      name: 'User Reports',
      icon: Users,
      reports: [
        {
          id: 'userRegistrations',
          name: 'User Registrations',
          icon: Users,
          description: 'New user registrations by date',
          color: 'bg-green-500'
        },
        {
          id: 'userActivity',
          name: 'User Activity',
          icon: TrendingUp,
          description: 'User login and activity patterns',
          color: 'bg-indigo-500'
        },
        {
          id: 'pricePreferences',
          name: 'Price Preferences',
          icon: DollarSign,
          description: 'Users interested in specific price ranges',
          color: 'bg-yellow-500'
        },
        {
          id: 'userFavorites',
          name: 'User Favorites',
          icon: Heart,
          description: 'Which users favorited which properties',
          color: 'bg-pink-500'
        }
      ]
    },
    {
      id: 'properties',
      name: 'Property Reports',
      icon: Building,
      reports: [
        {
          id: 'allListings',
          name: 'All Listings',
          icon: Building,
          description: 'Complete property inventory',
          color: 'bg-orange-500'
        },
        {
          id: 'favoritesByTenant',
          name: 'Favorites by Tenant',
          icon: Users,
          description: 'Which tenant liked which property',
          color: 'bg-rose-500'
        },
        {
          id: 'matches',
          name: 'Matches & Residency',
          icon: CheckCircle,
          description: 'Mutual interest, occupancy mapping',
          color: 'bg-indigo-500'
        }
      ]
    },
    {
      id: 'financial',
      name: 'Financial Reports',
      icon: DollarSign,
      reports: [
        {
          id: 'revenue',
          name: 'Revenue Analytics',
          icon: DollarSign,
          description: 'Revenue and payment tracking',
          color: 'bg-emerald-500'
        },
        {
          id: 'subscriptions',
          name: 'Premium Subscriptions',
          icon: Crown,
          description: 'Premium user subscriptions',
          color: 'bg-amber-500'
        }
      ]
    }
  ];

  const quickFilters = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 90 Days', value: '90' },
    { label: 'Last Year', value: '365' },
    { label: 'Custom Range', value: 'custom' }
  ];

  const propertyTypes = [
    'apartment', 'house', 'room', 'studio', 'villa', 'penthouse'
  ];

  const priceRanges = [
    '0-10000', '10000-25000', '25000-50000', '50000-100000', '100000+'
  ];

  const statuses = [
    'active', 'inactive', 'pending', 'approved', 'rejected'
  ];

  const roles = [
    'tenant', 'owner', 'staff', 'admin'
  ];

  const kycStatuses = [
    'verified', 'pending', 'rejected', 'unverified'
  ];

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      status: '',
      propertyType: '',
      priceRange: '',
      location: '',
      owner: '',
      role: '',
      kycStatus: '',
      dateRange: '30'
    });
  };

  const exportReport = (reportType: string) => {
    if (onExport) {
      onExport(reportType, filters);
    }
  };

  if (!isOpen && mode === 'drawer') return null;

  const containerClass = mode === 'inline'
    ? 'w-64 bg-white border-r border-gray-200 h-full sticky top-0 overflow-y-auto'
    : 'fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Reports & Analytics</h2>
          {mode === 'drawer' && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">Generate comprehensive reports and insights</p>
      </div>

      {/* Quick Actions */}
      {!hideFilters && (
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange('dateRange', filter.value)}
              className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                filters.dateRange === filter.value
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Filters Panel */}
      {showFilters && !hideFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Advanced Filters</h3>
          
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Property Filters */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Prices</option>
                {priceRanges.map(range => (
                  <option key={range} value={range}>₹{range.replace('-', ' - ₹')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status and Role Filters */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Inputs */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Enter location"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                value={filters.owner}
                onChange={(e) => handleFilterChange('owner', e.target.value)}
                placeholder="Owner name"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Report Categories */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Reports</h3>
        <div className="space-y-1">
          {reportCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategories.includes(category.id);
            
            return (
              <div key={category.id} className="border border-gray-200 rounded-md">
                <div
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setExpandedCategories(prev => 
                      prev.includes(category.id) 
                        ? prev.filter(id => id !== category.id)
                        : [...prev, category.id]
                    );
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-2 space-y-1">
                      {category.reports.map((report) => {
                        const IconComponent = report.icon;
                        return (
                          <div
                            key={report.id}
                            className={`p-2 rounded cursor-pointer transition-all hover:bg-white ${
                              activeReport === report.id
                                ? 'bg-blue-100 border border-blue-300'
                                : 'hover:bg-white'
                            }`}
                            onClick={() => onReportSelect(report.id)}
                          >
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-3 h-3 text-gray-600" />
                              <div className="flex-1">
                                <h4 className="text-xs font-medium text-gray-900 truncate">{report.name}</h4>
                                <p className="text-xs text-gray-600 truncate">{report.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Reports</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">Visit Report - Today</span>
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700">
              <Eye className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">User Analytics - Yesterday</span>
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700">
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSidepane;
