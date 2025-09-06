import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchListings } from '../store/slices/listingsSlice';
import { fetchVisits, scheduleVisit, cancelVisit } from '../store/slices/visitsSlice';
import { fetchFavorites, removeFromFavorites } from '../store/slices/favoritesSlice';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, DollarSign, Calendar, X, Clock } from 'lucide-react';
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
    }).format(price);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.full_name}!</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Browse Properties
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Visits ({visits.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Favorites ({favorites.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Browse Properties Tab */}
          {activeTab === 'browse' && (
            <div className="p-6">
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="created_at">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="room">Room</option>
                    <option value="studio">Studio</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Bedrooms</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>
              </div>

              {/* Properties Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : sortedListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No properties found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedListings.map((listing) => (
                    <div key={listing.listing_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={getImageUrl(listing.primary_photo)}
                          alt={listing.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => handleRemoveFavorite(listing.listing_id)}
                            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                          >
                            <Heart className="w-5 h-5 text-red-500 fill-current" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{listing.location}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Bed className="w-4 h-4 mr-1" />
                              <span>{listing.bedrooms}</span>
                            </div>
                            <div className="flex items-center">
                              <Bath className="w-4 h-4 mr-1" />
                              <span>{listing.bathrooms}</span>
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            {formatPrice(listing.price)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleScheduleVisit(listing.listing_id)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Schedule Visit
                          </button>
                          <Link
                            to={`/listings/${listing.listing_id}`}
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

          {/* Visits Tab */}
          {activeTab === 'visits' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">My Scheduled Visits</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-6">My Favorite Properties</h3>
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
