import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchListings } from '../store/slices/listingsSlice';
import { Listing } from '../store/slices/listingsSlice';
import { getImageUrl } from '../services/config';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Wifi, 
  Car, 
  Utensils,
  Grid3X3,
  List,
  SlidersHorizontal,
  Heart,
  Eye,
  Bath,
  Bed,
  Maximize,
  CheckCircle2,
  Clock,
  Users,
  Home
} from 'lucide-react';

const ListingsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { listings, loading, error } = useSelector((state: RootState) => state.listings);
  const dispatch = useDispatch<AppDispatch>();
  
  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    furnished: '',
    petFriendly: '',
    parking: '',
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchListings(filters));
  }, [dispatch, filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      furnished: '',
      petFriendly: '',
      parking: '',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price).replace('NPR', '$');
  };

  const getStatusBadge = (listing: Listing) => {
    if (!listing.is_active) {
      return { text: 'Occupied', color: 'bg-gray-500 text-white' };
    }
    
    // Determine badge based on property type and features
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

  const getPropertyTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'studio': 'Studio',
      'room': 'Private Room', 
      'apartment': 'Apartment',
      'house': 'House',
      'penthouse': 'Suite',
      'commercial': 'Commercial'
    };
    return typeMap[type] || type;
  };

  const generateRating = (listingId: string) => {
    // Generate consistent pseudo-random rating based on listing ID
    const hash = listingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 4.0 + (hash % 10) / 10; // Rating between 4.0 and 4.9
    const reviewCount = 15 + (hash % 30); // Review count between 15 and 44
    return { rating: Number(rating.toFixed(1)), reviewCount };
  };

  const getAmenityIcons = (listing: Listing) => {
    const amenities = [];
    
    // Add WiFi for all properties
    amenities.push({ icon: Wifi, label: 'WiFi' });
    
    // Add kitchen for apartments, houses, studios
    if (['apartment', 'house', 'studio'].includes(listing.property_type)) {
      amenities.push({ icon: Utensils, label: 'Kitchen' });
    }
    
    // Add parking if available
    if (listing.parking_available) {
      amenities.push({ icon: Car, label: 'Parking' });
    }
    
    // Add shared amenities for rooms
    if (listing.property_type === 'room') {
      amenities.push({ icon: Users, label: 'Shared' });
      amenities.push({ icon: Utensils, label: 'Kitchen' });
    }
    
    return amenities.slice(0, 4); // Limit to 4 amenities for clean UI
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">Discover Your Perfect Home</h1>
              <p className="mt-2 text-lg text-gray-600">
                {listings.length} verified properties available in Kathmandu
              </p>
            </div>
            {user?.role === 'owner' && (
              <Link
                to="/create-listing"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              >
                <Home className="w-5 h-5 mr-2" />
                List Your Property
              </Link>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          {/* Quick Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, property name, or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-lg"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
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
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
            >
              <option value="">Bedrooms</option>
              <option value="1">1 BR</option>
              <option value="2">2 BR</option>
              <option value="3">3 BR</option>
              <option value="4">4+ BR</option>
            </select>

            <select
              value={filters.furnished}
              onChange={(e) => handleFilterChange('furnished', e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
            >
              <option value="">Furnished</option>
              <option value="furnished">Furnished</option>
              <option value="semi-furnished">Semi-furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-28 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-28 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {Object.values(filters).some(value => value !== '') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          
          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">
                {listings.length} properties found
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              >
                <option value="createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="size">Size: Small to Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Property Cards */}
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or check back later for new listings.
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'grid grid-cols-1 gap-6'
          }>
            {listings.map((listing) => {
              const statusBadge = getStatusBadge(listing);
              const { rating, reviewCount } = generateRating(listing.listing_id);
              const amenities = getAmenityIcons(listing);

              return (
                <div
                  key={listing.listing_id}
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Property Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-80 h-64' : 'h-64'} bg-gray-200 overflow-hidden`}>
                    {listing.primary_photo ? (
                      <img
                        src={getImageUrl(listing.primary_photo)}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                          if (sibling) {
                            sibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${listing.primary_photo ? 'hidden' : ''}`}>
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.color} shadow-lg`}>
                        {statusBadge.text}
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg group/heart">
                      <Heart className="w-5 h-5 text-gray-600 group-hover/heart:text-red-500 transition-colors" />
                    </button>

                    {/* View Count */}
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
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
                      {amenities.length > 3 && (
                        <span className="text-xs text-gray-500 font-medium">+{amenities.length - 3} more</span>
                      )}
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
                    
                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">{formatPrice(listing.price)}</span>
                          <span className="text-gray-500 text-sm font-medium">/month</span>
                        </div>
                      </div>
                      <Link
                        to={`/listings/${listing.listing_id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
      </div>
    </div>
  );
};

export default ListingsPage;
