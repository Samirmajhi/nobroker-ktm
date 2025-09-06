import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchListings } from '../store/slices/listingsSlice';
import { fetchVisits, scheduleVisit, cancelVisit } from '../store/slices/visitsSlice';
import { fetchFavorites, removeFromFavorites } from '../store/slices/favoritesSlice';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Calendar, 
  X, 
  Clock,
  Search,
  Filter,
  Star,
  Wifi,
  Car,
  Utensils,
  Home,
  CheckCircle2,
  Eye,
  Maximize,
  Users,
  TrendingUp,
  Bookmark,
  CalendarDays,
  Settings,
  Bell,
  Activity
} from 'lucide-react';
import { getImageUrl } from '../services/config';
import AdModal from '../components/ads/PremiumAdModal';
import { useVisitTracker } from '../hooks/useVisitTracker';

const TenantDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { listings, loading } = useSelector((state: RootState) => state.listings);
  const { visits, loading: visitsLoading } = useSelector((state: RootState) => state.visits);
  const { favorites, loading: favoritesLoading } = useSelector((state: RootState) => state.favorites);
  const dispatch = useDispatch<AppDispatch>();
  
  const [activeTab, setActiveTab] = useState('browse');
  const [filters, setFilters] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: ''
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ad System
  const { visitCount, showAd, currentAd, trackVisit, markAdAsSeen, skipAd } = useVisitTracker('tenant');

  useEffect(() => {
    if (user?.role === 'tenant') {
      dispatch(fetchListings(filters));
      dispatch(fetchVisits());
      dispatch(fetchFavorites());
    }
  }, [dispatch, user, filters]);

  // Track visits for ad system
  useEffect(() => {
    if (activeTab === 'browse') {
      trackVisit();
    }
  }, [activeTab, trackVisit]);

  const handleAdClick = async (ad: any) => {
    try {
      await fetch(`/api/ads/${ad.id}/click`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (ad.clickUrl) {
        window.open(ad.clickUrl, '_blank');
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const handleScheduleVisit = async (listingId: string) => {
    try {
      const visitDate = new Date();
      visitDate.setDate(visitDate.getDate() + 1); // Schedule for tomorrow
      
      await dispatch(scheduleVisit({
        listing_id: listingId,
        visit_datetime: visitDate.toISOString(),
        visit_notes: 'I would like to schedule a visit for this property.'
      })).unwrap();
      
      alert('Visit scheduled successfully!');
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      alert(error.message || 'Failed to schedule visit');
    }
  };

  const handleCancelVisit = async (visitId: string) => {
    try {
      await dispatch(cancelVisit(visitId)).unwrap();
      alert('Visit cancelled successfully!');
    } catch (error: any) {
      console.error('Error cancelling visit:', error);
      alert(error.message || 'Failed to cancel visit');
    }
  };

  const handleRemoveFavorite = async (listingId: string) => {
    try {
      await dispatch(removeFromFavorites(listingId)).unwrap();
      alert('Removed from favorites successfully!');
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      alert(error.message || 'Failed to remove from favorites');
    }
  };

  const filteredListings = listings.filter(listing => {
    if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !listing.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.propertyType && listing.property_type !== filters.propertyType) return false;
    if (filters.minPrice && listing.price < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && listing.price > parseInt(filters.maxPrice)) return false;
    if (filters.location && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.bedrooms && listing.bedrooms !== parseInt(filters.bedrooms)) return false;
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price).replace('NPR', '$');
  };

  const getStatusBadge = (listing: any) => {
    if (!listing.is_active) {
      return { text: 'Occupied', color: 'bg-gray-500 text-white' };
    }
    
    switch (listing.property_type) {
      case 'studio':
        return { text: 'Studio', color: 'bg-blue-500 text-white' };
      case 'room':
        return { text: 'Private Room', color: 'bg-blue-500 text-white' };
      case 'apartment':
        return { text: 'Available', color: 'bg-green-500 text-white' };
      case 'house':
        return { text: 'Available', color: 'bg-green-500 text-white' };
      case 'penthouse':
        return { text: 'Suite', color: 'bg-purple-500 text-white' };
      default:
        return { text: 'Available', color: 'bg-green-500 text-white' };
    }
  };

  const generateRating = (listingId: string) => {
    const hash = listingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 4.0 + (hash % 10) / 10;
    const reviewCount = 15 + (hash % 30);
    return { rating: Number(rating.toFixed(1)), reviewCount };
  };

  const getAmenityIcons = (listing: any) => {
    const amenities = [];
    
    amenities.push({ icon: Wifi, label: 'WiFi' });
    
    if (['apartment', 'house', 'studio'].includes(listing.property_type)) {
      amenities.push({ icon: Utensils, label: 'Kitchen' });
    }
    
    if (listing.parking_available) {
      amenities.push({ icon: Car, label: 'Parking' });
    }
    
    if (listing.property_type === 'room') {
      amenities.push({ icon: Users, label: 'Shared' });
      amenities.push({ icon: Utensils, label: 'Kitchen' });
    }
    
    return amenities.slice(0, 4);
  };

  if (!user || user.role !== 'tenant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This dashboard is only for tenants.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                      Welcome back, {user.full_name?.split(' ')[0]}!
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      Your property journey continues here
                    </p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Bookmark className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                      <p className="text-sm text-gray-600">Saved Properties</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
                      <p className="text-sm text-gray-600">Scheduled Visits</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{sortedListings.length}</p>
                      <p className="text-sm text-gray-600">Available Properties</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/listings"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse All Properties
                </Link>
                <button className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow hover:shadow-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Preferences
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <nav className="flex space-x-2">
              {[
                { id: 'browse', label: 'Browse Properties', icon: Search, count: sortedListings.length },
                { id: 'visits', label: 'My Visits', icon: CalendarDays, count: visits.length },
                { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length }
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
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          {/* Browse Properties Tab */}
          {activeTab === 'browse' && (
            <div className="p-6">
              {/* Enhanced Search Section */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Search className="w-6 h-6 mr-2 text-blue-600" />
                    Find Your Perfect Property
                  </h3>
                  
                  {/* Main Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by location, property name, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-lg"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <select
                      value={filters.propertyType}
                      onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                      className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                    >
                      <option value="">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="room">Room</option>
                      <option value="studio">Studio</option>
                      <option value="penthouse">Penthouse</option>
                    </select>

                    <select
                      value={filters.bedrooms}
                      onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                      className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                    >
                      <option value="">Bedrooms</option>
                      <option value="1">1 BR</option>
                      <option value="2">2 BR</option>
                      <option value="3">3 BR</option>
                      <option value="4">4+ BR</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Location"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                        className="w-28 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        className="w-28 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                    >
                      <option value="created_at">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 font-medium">
                      {sortedListings.length} properties found
                    </p>
                    <Link
                      to="/listings"
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View All Properties →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Properties Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : sortedListings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search criteria or browse all properties.
                    </p>
                    <Link
                      to="/listings"
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Browse All Properties
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedListings.slice(0, 6).map((listing) => {
                    const statusBadge = getStatusBadge(listing);
                    const { rating, reviewCount } = generateRating(listing.listing_id);
                    const amenities = getAmenityIcons(listing);

                    return (
                      <div
                        key={listing.listing_id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                      >
                        {/* Property Image */}
                        <div className="relative h-64 bg-gray-200 overflow-hidden">
                          {listing.primary_photo ? (
                            <img
                              src={getImageUrl(listing.primary_photo)}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Home className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.color} shadow-lg`}>
                              {statusBadge.text}
                            </span>
                          </div>

                          {/* Favorite Button */}
                          <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg group/heart">
                            <Heart className="w-5 h-5 text-red-500 fill-current group-hover/heart:scale-110 transition-transform" />
                          </button>

                          {/* View Count */}
                          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {Math.floor(Math.random() * 50) + 10}
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-6">
                          {/* Title and Rating */}
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {listing.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-700 ml-1">{rating}</span>
                              </div>
                              <span className="text-sm text-gray-500">({reviewCount})</span>
                            </div>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-center text-gray-600 mb-4">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm font-medium">{listing.location}</span>
                          </div>
                          
                          {/* Amenities Icons */}
                          <div className="flex items-center gap-3 mb-4">
                            {amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center text-gray-500">
                                <amenity.icon className="w-4 h-4" />
                              </div>
                            ))}
                          </div>
                          
                          {/* Property Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                            {listing.bedrooms > 0 && (
                              <div className="flex items-center">
                                <Bed className="w-4 h-4 mr-1" />
                                <span>{listing.bedrooms}</span>
                              </div>
                            )}
                            {listing.bathrooms > 0 && (
                              <div className="flex items-center">
                                <Bath className="w-4 h-4 mr-1" />
                                <span>{listing.bathrooms}</span>
                              </div>
                            )}
                            {listing.size > 0 && (
                              <div className="flex items-center">
                                <Maximize className="w-4 h-4 mr-1" />
                                <span>{listing.size} sqft</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Price and Actions */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">{formatPrice(listing.price)}</span>
                                <span className="text-gray-500 text-sm font-medium">/month</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleScheduleVisit(listing.listing_id)}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Visit
                            </button>
                            <Link
                              to={`/listings/${listing.listing_id}`}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-center flex items-center justify-center"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show More Button */}
              {sortedListings.length > 6 && (
                <div className="text-center mt-8">
                  <Link
                    to="/listings"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    View All {sortedListings.length} Properties
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === 'visits' && (
            <div className="p-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                  <CalendarDays className="w-6 h-6 mr-2 text-green-600" />
                  My Scheduled Visits
                </h3>
                <p className="text-gray-600">Track your property visits and manage appointments</p>
              </div>
              {visitsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : visits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't scheduled any visits yet.</p>
                  <Link
                    to="/listings"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Browse Properties
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visits.map((visit) => (
                    <div key={visit.visit_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {visit.listing_title || 'Property'}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{visit.listing_location || 'Location not available'}</span>
                            </div>
                            {visit.listing_price && (
                              <p className="text-lg font-semibold text-blue-600 mb-2">
                                {formatPrice(visit.listing_price)}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                            visit.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            visit.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {visit.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{new Date(visit.visit_datetime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{new Date(visit.visit_datetime).toLocaleTimeString()}</span>
                          </div>
                          {visit.owner_name && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="w-4 h-4 mr-2">👤</span>
                              <span>Owner: {visit.owner_name}</span>
                            </div>
                          )}
                        </div>

                        {visit.visit_notes && (
                          <p className="text-sm text-gray-500 mb-4 italic">"{visit.visit_notes}"</p>
                        )}

                        {visit.status === 'completed' && (
                          <div className="border-t pt-3 mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Visit Results</h4>
                            <div className="space-y-1">
                              {visit.tenant_decision && (
                                <p className="text-sm">
                                  <span className="text-gray-600">Your decision:</span>{' '}
                                  <span className={`font-medium ${
                                    visit.tenant_decision === 'interested' ? 'text-green-600' :
                                    visit.tenant_decision === 'not_interested' ? 'text-red-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {visit.tenant_decision.replace('_', ' ')}
                                  </span>
                                </p>
                              )}
                              {visit.owner_decision && (
                                <p className="text-sm">
                                  <span className="text-gray-600">Owner's decision:</span>{' '}
                                  <span className={`font-medium ${
                                    visit.owner_decision === 'interested' ? 'text-green-600' :
                                    visit.owner_decision === 'not_interested' ? 'text-red-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {visit.owner_decision.replace('_', ' ')}
                                  </span>
                                </p>
                              )}
                              {visit.tenant_decision === 'interested' && visit.owner_decision === 'interested' && (
                                <p className="text-sm font-medium text-blue-600">🎉 Match Found!</p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          {visit.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancelVisit(visit.visit_id)}
                              className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 transition-colors text-sm"
                            >
                              Cancel Visit
                            </button>
                          )}
                          <Link
                            to={`/listings/${visit.listing_id}`}
                            className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 transition-colors text-sm text-center"
                          >
                            View Property
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="p-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                  <Heart className="w-6 h-6 mr-2 text-pink-600" />
                  My Favorite Properties
                </h3>
                <p className="text-gray-600">Properties you've saved for quick access</p>
              </div>
              {favoritesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't added any properties to your favorites yet.</p>
                  <Link
                    to="/listings"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Browse Properties
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((favorite) => (
                    <div key={favorite.favorite_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={getImageUrl(favorite.listing.primary_photo)}
                          alt={favorite.listing.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => handleRemoveFavorite(favorite.listing.listing_id)}
                            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{favorite.listing.title}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{favorite.listing.location}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Bed className="w-4 h-4 mr-1" />
                              <span>{favorite.listing.bedrooms}</span>
                            </div>
                            <div className="flex items-center">
                              <Bath className="w-4 h-4 mr-1" />
                              <span>{favorite.listing.bathrooms}</span>
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            {formatPrice(favorite.listing.price)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleScheduleVisit(favorite.listing.listing_id)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Schedule Visit
                          </button>
                          <Link
                            to={`/listings/${favorite.listing.listing_id}`}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-center"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Ad Modal */}
      <AdModal
        isOpen={showAd}
        onClose={markAdAsSeen}
        onSkip={skipAd}
        onAdClick={handleAdClick}
        ad={currentAd}
        visitCount={visitCount}
        userType="tenant"
      />
    </div>
  );
};

export default TenantDashboardPage;
