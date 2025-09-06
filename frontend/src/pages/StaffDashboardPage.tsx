import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  Users, 
  Home, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  BarChart3,
  FileText,
  UserCheck,
  Building,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Settings,
  Shield,
  RefreshCw,
  Activity,
  Zap,
  Star,
  Heart,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { getImageUrl } from '../services/config';
import ReportsSidepane from '../components/reports/ReportsSidepane';
import ReportViewer from '../components/reports/ReportViewer';
import AdsManagement from '../components/ads/AdsManagement';

interface DashboardStats {
  todayListings: number;
  todayVisits: number;
  pendingVisits: number;
  activeListings: number;
  usersByRole: Array<{ role: string; count: string }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    activity_type: string;
  }>;
  visitStats: {
    total_visits: string;
    scheduled_visits: string;
    completed_visits: string;
    cancelled_visits: string;
    interested_tenants: string;
    interested_owners: string;
    matches: string;
  };
  listingStats: {
    total_listings: string;
    active_listings: string;
    inactive_listings: string;
    avg_price: string;
    apartments: string;
    houses: string;
    rooms: string;
  };
  userStats: {
    total_users: string;
    tenants: string;
    owners: string;
    staff: string;
    admins: string;
    verified_users: string;
    pending_kyc: string;
  };
}

interface TodayListing {
  listing_id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  primary_photo: string;
  visit_count: string;
  created_at: string;
}

interface TodayVisit {
  visit_id: string;
  listing_id: string;
  tenant_id: string;
  visit_datetime: string;
  status: string;
  listing_title: string;
  listing_location: string;
  listing_price: number;
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  listing_photo: string;
  visit_notes: string;
}

const StaffDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayListings, setTodayListings] = useState<TodayListing[]>([]);
  const [todayVisits, setTodayVisits] = useState<TodayVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Report states
  const [visitReportData, setVisitReportData] = useState<any[]>([]);
  const [userReportData, setUserReportData] = useState<any>(null);
  const [listingReportData, setListingReportData] = useState<any[]>([]);
  const [engagementReportData, setEngagementReportData] = useState<any[]>([]);
  
  // Filter states
  const [visitFilters, setVisitFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    propertyType: ''
  });
  
  const [userFilters, setUserFilters] = useState({
    role: '',
    kycStatus: '',
    dateRange: '30'
  });
  
  const [listingFilters, setListingFilters] = useState({
    propertyType: '',
    priceRange: '',
    status: '',
    dateRange: '30'
  });

  // Visit management states
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const [allVisitsLoading, setAllVisitsLoading] = useState(false);
  const [visitManagementFilters, setVisitManagementFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // All listings report states
  const [allListingsReportData, setAllListingsReportData] = useState<any[]>([]);
  const [allListingsFilters, setAllListingsFilters] = useState({
    propertyType: '',
    priceRange: '',
    status: '',
    location: '',
    owner: ''
  });

  // Report navigation state
  const [activeReport, setActiveReport] = useState('visits');
  const [reportFilters, setReportFilters] = useState<any>({
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
  const [isReportsPaneOpen, setIsReportsPaneOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Ads Management (no ad display for staff)
  const [showAdsManagement, setShowAdsManagement] = useState(false);

  useEffect(() => {
    fetchStaffData();
  }, []);

  // No ad tracking for staff

  const fetchStaffData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/staff/dashboard-stats', { headers });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch today's listings
      const listingsResponse = await fetch('http://localhost:5000/api/staff/today-listings', { headers });
      const listingsData = await listingsResponse.json();
      setTodayListings(listingsData.listings);

      // Fetch today's visits
      const visitsResponse = await fetch('http://localhost:5000/api/staff/today-visits', { headers });
      const visitsData = await visitsResponse.json();
      setTodayVisits(visitsData.visits);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  // Report functions
  const applyReportFilters = async (filters: any) => {
    setReportFilters(filters);
    setCurrentPage(1);
    
    try {
      switch (activeReport) {
        case 'visits':
          setVisitFilters({
            dateFrom: filters.dateFrom || '',
            dateTo: filters.dateTo || '',
            status: filters.status || '',
            propertyType: filters.propertyType || ''
          });
          await fetchVisitReport();
          break;
        case 'users':
          setUserFilters({
            role: filters.role || '',
            kycStatus: filters.kycStatus || '',
            dateRange: filters.dateRange || '30'
          });
          await fetchUserReport();
          break;
        case 'listings':
          setListingFilters({
            propertyType: filters.propertyType || '',
            priceRange: filters.priceRange || '',
            status: filters.status || '',
            dateRange: filters.dateRange || '30'
          });
          await fetchListingReport();
          break;
        case 'engagement':
        case 'allListings':
          setAllListingsFilters({
            propertyType: filters.propertyType || '',
            priceRange: filters.priceRange || '',
            status: filters.status || '',
            location: filters.location || '',
            owner: filters.owner || ''
          });
          await fetchAllListingsReport();
          break;
        case 'userRegistrations':
          await fetchUserRegistrationsReport(filters);
          break;
        case 'userActivity':
          await fetchUserActivityReport(filters);
          break;
        case 'pricePreferences':
          await fetchPricePreferencesReport(filters);
          break;
        case 'userFavorites':
          await fetchUserFavoritesReport(filters);
          break;
        case 'favoritesByTenant':
          await fetchFavoritesByTenantReport(filters);
          break;
        case 'matches':
          await fetchMatchesReport(filters);
          break;
        case 'revenue':
          await fetchRevenueReport(filters);
          break;
        case 'subscriptions':
          await fetchSubscriptionsReport(filters);
          break;
        default:
          console.log('Unknown report type:', activeReport);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };
  const fetchVisitReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (visitFilters.dateFrom) params.append('date_from', visitFilters.dateFrom);
      if (visitFilters.dateTo) params.append('date_to', visitFilters.dateTo);
      if (visitFilters.status) params.append('status', visitFilters.status);
      if (visitFilters.propertyType) params.append('property_type', visitFilters.propertyType);

      const response = await fetch(`http://localhost:5000/api/staff/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVisitReportData(data.visitTrends || []);
      }
    } catch (error) {
      console.error('Error fetching visit report:', error);
    }
  };

  const fetchUserReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (userFilters.role) params.append('role', userFilters.role);
      if (userFilters.kycStatus) params.append('kyc_status', userFilters.kycStatus);
      params.append('period', userFilters.dateRange);

      const response = await fetch(`http://localhost:5000/api/staff/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserReportData(data.userStats || {});
      }
    } catch (error) {
      console.error('Error fetching user report:', error);
    }
  };

  const fetchListingReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (listingFilters.propertyType) params.append('property_type', listingFilters.propertyType);
      if (listingFilters.priceRange) params.append('price_range', listingFilters.priceRange);
      if (listingFilters.status) params.append('status', listingFilters.status);
      params.append('period', listingFilters.dateRange);

      const response = await fetch(`http://localhost:5000/api/staff/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setListingReportData(data.listingPerformance || []);
        setEngagementReportData(data.listingPerformance || []);
      }
    } catch (error) {
      console.error('Error fetching listing report:', error);
    }
  };

  // CSV utility for consistent exports
  const toCsv = (rows: Array<Record<string, any>>, columns: string[]) => {
    const escapeCell = (val: any) => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      if (/[",\n]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    const header = columns.join(',');
    const body = rows.map(r => columns.map(c => escapeCell(r[c])).join(',')).join('\n');
    return header + '\n' + body + '\n';
  };

  // Export functions (consistent columns and formatting)
  const exportReport = (type: string) => {
    let filename = '';
    let columns: string[] = [];
    let rows: Array<Record<string, any>> = [];

    switch (type) {
      case 'visits':
        filename = 'visit_statistics.csv';
        columns = ['Date', 'Total Visits', 'Completed', 'Cancelled', 'Matches'];
        rows = (visitReportData || []).map((r: any) => ({
          'Date': r.date,
          'Total Visits': r.total_visits,
          'Completed': r.completed_visits,
          'Cancelled': r.cancelled_visits,
          'Matches': r.matches
        }));
        break;
      case 'users':
        filename = 'user_statistics.csv';
        columns = ['Total Users', 'Verified Users', 'Pending KYC', 'Active Users'];
        rows = [{
          'Total Users': userReportData?.total_users ?? 0,
          'Verified Users': userReportData?.verified_users ?? 0,
          'Pending KYC': userReportData?.pending_kyc ?? 0,
          'Active Users': userReportData?.active_users ?? 0
        }];
        break;
      case 'listings':
        filename = 'listing_performance.csv';
        columns = ['Property', 'Location', 'Price', 'Total Visits', 'Interested Tenants', 'Matches'];
        rows = (listingReportData || []).map((r: any) => ({
          'Property': r.title,
          'Location': r.location,
          'Price': r.price,
          'Total Visits': r.total_visits,
          'Interested Tenants': r.interested_tenants,
          'Matches': r.matches
        }));
        break;
      case 'engagement':
        filename = 'property_engagement.csv';
        columns = ['Property', 'Location', 'Price', 'Favorites', 'Interested Tenants', 'Interested Owners', 'Matches'];
        rows = (engagementReportData || []).map((r: any) => ({
          'Property': r.title,
          'Location': r.location,
          'Price': r.price,
          'Favorites': r.favorites || 0,
          'Interested Tenants': r.interested_tenants || 0,
          'Interested Owners': r.interested_owners || 0,
          'Matches': r.matches || 0
        }));
        break;
      case 'allListings':
        filename = 'all_listings.csv';
        columns = ['Property', 'Location', 'Type', 'Price', 'Owner', 'Status', 'Created', 'Total Visits'];
        rows = (allListingsReportData || []).map((r: any) => ({
          'Property': r.title,
          'Location': r.location,
          'Type': r.property_type,
          'Price': r.price,
          'Owner': r.owner_name,
          'Status': r.is_active ? 'Active' : 'Inactive',
          'Created': new Date(r.created_at).toISOString().slice(0, 10),
          'Total Visits': r.total_visits || 0
        }));
        break;
      default:
        return;
    }

    const csv = toCsv(rows, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch all visits for management
  const fetchAllVisits = async () => {
    try {
      setAllVisitsLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (visitManagementFilters.status) {
        params.append('status', visitManagementFilters.status);
      }
      if (visitManagementFilters.dateFrom) {
        params.append('date_from', visitManagementFilters.dateFrom);
      }
      if (visitManagementFilters.dateTo) {
        params.append('date_to', visitManagementFilters.dateTo);
      }

      const response = await fetch(`http://localhost:5000/api/staff/all-visits?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllVisits(data.visits || []);
      }
    } catch (error) {
      console.error('Error fetching all visits:', error);
    } finally {
      setAllVisitsLoading(false);
    }
  };

  // Fetch all listings report
  const fetchAllListingsReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (allListingsFilters.propertyType) {
        params.append('property_type', allListingsFilters.propertyType);
      }
      if (allListingsFilters.priceRange) {
        params.append('price_range', allListingsFilters.priceRange);
      }
      if (allListingsFilters.status) {
        params.append('status', allListingsFilters.status);
      }
      if (allListingsFilters.location) {
        params.append('location', allListingsFilters.location);
      }
      if (allListingsFilters.owner) {
        params.append('owner', allListingsFilters.owner);
      }

      const response = await fetch(`http://localhost:5000/api/staff/all-listings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllListingsReportData(data.listings || []);
      }
    } catch (error) {
      console.error('Error fetching all listings report:', error);
    }
  };

  // New report fetching functions
  const fetchUserRegistrationsReport = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.role) params.append('role', filters.role);

      const response = await fetch(`http://localhost:5000/api/staff/reports/user-registrations?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserReportData(data);
      }
    } catch (error) {
      console.error('Error fetching user registrations report:', error);
    }
  };

  const fetchUserActivityReport = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.lastLoginDays) params.append('lastLoginDays', filters.lastLoginDays);

      const response = await fetch(`http://localhost:5000/api/staff/reports/user-activity?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserReportData(data);
      }
    } catch (error) {
      console.error('Error fetching user activity report:', error);
    }
  };

  const fetchPricePreferencesReport = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`http://localhost:5000/api/staff/reports/price-preferences?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setListingReportData(data);
      }
    } catch (error) {
      console.error('Error fetching price preferences report:', error);
    }
  };

  const fetchUserFavoritesReport = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.listingId) params.append('listingId', filters.listingId);

      const response = await fetch(`http://localhost:5000/api/staff/reports/user-favorites?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setListingReportData(data);
      }
    } catch (error) {
      console.error('Error fetching user favorites report:', error);
    }
  };

  const fetchFavoritesByTenantReport = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.tenantId) params.append('tenantId', filters.tenantId);

      const response = await fetch(`http://localhost:5000/api/staff/reports/favorites-by-tenant?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setListingReportData(data);
      }
    } catch (error) {
      console.error('Error fetching favorites by tenant report:', error);
    }
  };

  const fetchMatchesReport = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`http://localhost:5000/api/staff/reports/matches?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setListingReportData(data);
      }
    } catch (error) {
      console.error('Error fetching matches report:', error);
    }
  };

  const fetchRevenueReport = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`http://localhost:5000/api/staff/reports/revenue?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setListingReportData(data);
      }
    } catch (error) {
      console.error('Error fetching revenue report:', error);
    }
  };

  const fetchSubscriptionsReport = async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.planType) params.append('planType', filters.planType);

      const response = await fetch(`http://localhost:5000/api/staff/reports/subscriptions?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setListingReportData(data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !['staff', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This dashboard is only for staff and admin users.</p>
        </div>
      </div>
    );
  }

  // No ad click handling for staff

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                    Staff Dashboard
                  </h1>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' 
                      : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                  }`}>
                    {user.role === 'admin' ? '👑 Admin' : '🛡️ Staff'}
                  </span>
                </div>
                <p className="text-lg text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-900">{user?.full_name}</span>
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAdsManagement(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                Manage Ads
              </button>
              <button
                onClick={fetchStaffData}
                className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow hover:shadow-lg flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh Data
              </button>
              <button className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 p-3 rounded-xl transition-all duration-200 shadow hover:shadow-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <nav className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'today', label: "Today's Activity", icon: Calendar },
                { id: 'visits', label: 'Visit Management', icon: MapPin },
                { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayListings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Visits</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Visits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                  </div>
              </div>
            </div>
          </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visit Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Visits</span>
                    <span className="font-medium">{stats.visitStats.total_visits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled</span>
                    <span className="font-medium text-yellow-600">{stats.visitStats.scheduled_visits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">{stats.visitStats.completed_visits}</span>
              </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled</span>
                    <span className="font-medium text-red-600">{stats.visitStats.cancelled_visits}</span>
              </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Matches</span>
                    <span className="font-medium text-blue-600">{stats.visitStats.matches}</span>
            </div>
          </div>
        </div>

              {/* User Statistics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-medium">{stats.userStats.total_users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tenants</span>
                    <span className="font-medium text-blue-600">{stats.userStats.tenants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owners</span>
                    <span className="font-medium text-green-600">{stats.userStats.owners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified</span>
                    <span className="font-medium text-purple-600">{stats.userStats.verified_users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending KYC</span>
                    <span className="font-medium text-yellow-600">{stats.userStats.pending_kyc}</span>
                  </div>
                </div>
              </div>

              {/* Listing Statistics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Listings</span>
                    <span className="font-medium">{stats.listingStats.total_listings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium text-green-600">{stats.listingStats.active_listings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Price</span>
                    <span className="font-medium">{formatPrice(parseFloat(stats.listingStats.avg_price) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Apartments</span>
                    <span className="font-medium">{stats.listingStats.apartments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Houses</span>
                    <span className="font-medium">{stats.listingStats.houses}</span>
                  </div>
                </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
                  {stats.recentActivity.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.activity_type === 'new_listing' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {activity.activity_type === 'new_listing' ? (
                          <Home className="w-4 h-4 text-green-600" />
                        ) : (
                          <Calendar className="w-4 h-4 text-blue-600" />
                        )}
                </div>
                <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                </div>
              </div>
                  ))}
                </div>
                </div>
                </div>
              </div>
        )}

        {/* Today's Activity Tab */}
        {activeTab === 'today' && (
          <div className="space-y-8">
            {/* Today's Listings */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Today's New Listings</h2>
                </div>
              <div className="p-6">
                {todayListings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No new listings today</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {todayListings.map((listing) => (
                      <div key={listing.listing_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          {listing.primary_photo && (
                            <img
                              src={getImageUrl(listing.primary_photo)}
                              alt={listing.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{listing.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {listing.location}
                            </p>
                            <p className="text-sm text-gray-600">{listing.bedrooms}BHK • {listing.property_type}</p>
                            <p className="text-lg font-semibold text-blue-600">{formatPrice(listing.price)}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500">Owner: {listing.owner_name}</p>
                              <p className="text-xs text-gray-500">{listing.visit_count} visits</p>
                </div>
              </div>
            </div>
          </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Today's Visits */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Today's Visits</h2>
              </div>
              <div className="p-6">
                {todayVisits.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No visits scheduled for today</p>
                ) : (
                  <div className="space-y-4">
                    {todayVisits.map((visit) => (
                      <div key={visit.visit_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          {visit.listing_photo && (
                            <img
                              src={getImageUrl(visit.listing_photo)}
                              alt={visit.listing_title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{visit.listing_title}</h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {visit.listing_location}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-1 inline" />
                              {formatDateTime(visit.visit_datetime)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div>
                                <p className="text-sm text-gray-600">Tenant: {visit.tenant_name}</p>
                                <p className="text-sm text-gray-600">Owner: {visit.owner_name}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                visit.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {visit.status}
                              </span>
                            </div>
                            {visit.visit_notes && (
                              <p className="text-sm text-gray-500 mt-2 italic">"{visit.visit_notes}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Visit Management Tab */}
        {activeTab === 'visits' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Visit Management</h2>
                <button
                  onClick={() => fetchAllVisits()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Visit Filters */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={visitManagementFilters.status}
                      onChange={(e) => setVisitManagementFilters({...visitManagementFilters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                    <input
                      type="date"
                      value={visitManagementFilters.dateFrom}
                      onChange={(e) => setVisitManagementFilters({...visitManagementFilters, dateFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                    <input
                      type="date"
                      value={visitManagementFilters.dateTo}
                      onChange={(e) => setVisitManagementFilters({...visitManagementFilters, dateTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => fetchAllVisits()}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Visits Table */}
              {allVisitsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : allVisits.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No visits found matching your criteria.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decisions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allVisits.map((visit) => (
                        <tr key={visit.visit_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{visit.listing_title}</div>
                            <div className="text-sm text-gray-500">{visit.listing_location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{visit.tenant_name}</div>
                            <div className="text-sm text-gray-500">{visit.tenant_phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{visit.owner_name}</div>
                            <div className="text-sm text-gray-500">{visit.owner_phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(visit.visit_datetime).toLocaleDateString()} at{' '}
                            {new Date(visit.visit_datetime).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                              visit.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {visit.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="space-y-1">
                              {visit.tenant_decision && (
                                <div>Tenant: <span className={`font-medium ${
                                  visit.tenant_decision === 'interested' ? 'text-green-600' :
                                  visit.tenant_decision === 'not_interested' ? 'text-red-600' :
                                  'text-yellow-600'
                                }`}>{visit.tenant_decision.replace('_', ' ')}</span></div>
                              )}
                              {visit.owner_decision && (
                                <div>Owner: <span className={`font-medium ${
                                  visit.owner_decision === 'interested' ? 'text-green-600' :
                                  visit.owner_decision === 'not_interested' ? 'text-red-600' :
                                  'text-yellow-600'
                                }`}>{visit.owner_decision.replace('_', ' ')}</span></div>
                              )}
                              {visit.tenant_decision === 'interested' && visit.owner_decision === 'interested' && (
                                <div className="text-blue-600 font-medium">🎉 Match!</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <ReportsSidepane
                isOpen={true}
                onClose={() => {}}
                mode="inline"
                hideFilters={true}
                activeReport={activeReport}
                onReportSelect={(r) => {
                  setActiveReport(r);
                  switch (r) {
                    case 'visits':
                      fetchVisitReport();
                      break;
                    case 'users':
                      fetchUserReport();
                      break;
                    case 'listings':
                    case 'engagement':
                      fetchListingReport();
                      break;
                    case 'allListings':
                      fetchAllListingsReport();
                      break;
                    case 'userRegistrations':
                      fetchUserRegistrationsReport();
                      break;
                    case 'userActivity':
                      fetchUserActivityReport();
                      break;
                    case 'pricePreferences':
                      fetchPricePreferencesReport();
                      break;
                    case 'userFavorites':
                      fetchUserFavoritesReport();
                      break;
                    case 'favoritesByTenant':
                      fetchFavoritesByTenantReport();
                      break;
                    case 'matches':
                      fetchMatchesReport();
                      break;
                    case 'revenue':
                      fetchRevenueReport();
                      break;
                    case 'subscriptions':
                      fetchSubscriptionsReport();
                      break;
                    default:
                      console.log('Unknown report type:', r);
                  }
                }}
                onApplyFilters={(f) => applyReportFilters(f)}
                onExport={(r) => exportReport(r)}
              />
            </div>
            <div className="lg:col-span-9 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeReport === 'visits' && 'Visit Analytics'}
                  {activeReport === 'users' && 'User Analytics'}
                  {activeReport === 'listings' && 'Listing Performance'}
                  {activeReport === 'engagement' && 'Property Engagement'}
                  {activeReport === 'allListings' && 'All Listings'}
                </h2>
                {/* Export lives inside viewer toolbar */}
              </div>
              <ReportViewer
                reportType={activeReport}
                data={
                  activeReport === 'visits' ? visitReportData :
                  activeReport === 'users' ? userReportData :
                  activeReport === 'listings' ? listingReportData :
                  activeReport === 'engagement' ? engagementReportData :
                  activeReport === 'allListings' ? allListingsReportData :
                  activeReport === 'userRegistrations' ? userReportData :
                  activeReport === 'userActivity' ? userReportData :
                  activeReport === 'pricePreferences' ? listingReportData :
                  activeReport === 'userFavorites' ? listingReportData :
                  activeReport === 'favoritesByTenant' ? listingReportData :
                  activeReport === 'matches' ? listingReportData :
                  activeReport === 'revenue' ? listingReportData :
                  activeReport === 'subscriptions' ? listingReportData :
                  []
                }
                filters={reportFilters}
                onExport={(type) => exportReport(type)}
                onFilterChange={(f) => applyReportFilters(f)}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* No Ad Modal for staff */}
      
      {/* Ads Management */}
      <AdsManagement
        isOpen={showAdsManagement}
        onClose={() => setShowAdsManagement(false)}
      />
    </div>
  );
};

export default StaffDashboardPage;
