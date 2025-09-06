import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchListingById } from '../store/slices/listingsSlice';
import { scheduleVisit, fetchVisits } from '../store/slices/visitsSlice';
import { getImageUrl } from '../services/config';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  Star,
  Share2,
  Heart,
  ArrowLeft,
  Clock,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentListing, loading } = useSelector((state: RootState) => state.listings);
  const { visits } = useSelector((state: RootState) => state.visits);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({
    date: '',
    time: '',
    message: ''
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchListingById(id));
      if (user?.role === 'tenant') {
        dispatch(fetchVisits());
      }
    }
  }, [dispatch, id, user]);

  // Get tenant's visits for this specific property
  const tenantVisitsForThisProperty = visits.filter(visit => 
    visit.listing_id === id && visit.tenant_id === user?.user_id
  );

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentListing) return;

    try {
      const visitDateTime = new Date(`${visitForm.date}T${visitForm.time}`);
      
      await dispatch(scheduleVisit({
        listing_id: currentListing.listing_id,
        visit_datetime: visitDateTime.toISOString(),
        visit_notes: visitForm.message
      })).unwrap();
      
      setShowVisitModal(false);
      alert('Visit scheduled successfully!');
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      alert(error.message || 'Failed to schedule visit');
    }
  };

  const startConversation = async () => {
    if (!currentListing || !user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: currentListing.listing_id,
          otherUserId: currentListing.owner_id
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to messages page with the conversation
        navigate(`/messages?conversation=${data.conversation_id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentListing) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-4">The listing you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/listings')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </button>
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <Heart className="w-5 h-5 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {currentListing.photos && currentListing.photos.length > 0 ? (
                <div className="relative">
                  {/* Main Image */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={getImageUrl(currentListing.photos[selectedImage]?.photo_url || currentListing.primary_photo)}
                      alt={currentListing.title}
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-96 flex items-center justify-center bg-gray-200">
                              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                  
                  {/* Image Navigation Dots */}
                  {currentListing.photos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {currentListing.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === selectedImage ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Previous/Next Buttons */}
                  {currentListing.photos && currentListing.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage(prev => 
                          prev === 0 ? (currentListing.photos?.length || 1) - 1 : prev - 1
                        )}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedImage(prev => 
                          (prev + 1) % (currentListing.photos?.length || 1)
                        )}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ) : currentListing.primary_photo ? (
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={getImageUrl(currentListing.primary_photo)}
                    alt={currentListing.title}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-96 flex items-center justify-center bg-gray-200">
                            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">No images available</p>
                  </div>
                </div>
              )}
              
              {/* Thumbnail Gallery */}
              {currentListing.photos && currentListing.photos.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {currentListing.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === selectedImage ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={getImageUrl(photo.photo_url)}
                          alt={`${currentListing.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentListing.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{currentListing.location}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center">
                  <Bed className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{currentListing.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{currentListing.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <Square className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{currentListing.size} sq ft</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">₹{currentListing.price}/month</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed">{currentListing.description}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentListing.amenities && currentListing.amenities.length > 0 ? (
                  currentListing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {amenity}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-gray-500 text-center py-4">
                    No amenities listed
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">Property Type</span>
                  <p className="font-medium">{currentListing.property_type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Furnishing Status</span>
                  <p className="font-medium">{currentListing.furnishing_status}</p>
                </div>
                <div>
                  <span className="text-gray-500">Parking Available</span>
                  <p className="font-medium">{currentListing.parking_available ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Pet Friendly</span>
                  <p className="font-medium">{currentListing.pet_friendly ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Security Deposit</span>
                  <p className="font-medium">₹{currentListing.deposit}</p>
                </div>
                <div>
                  <span className="text-gray-500">Available From</span>
                  <p className="font-medium">
                    {currentListing.availability_date 
                      ? new Date(currentListing.availability_date).toLocaleDateString()
                      : 'Immediate'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Tenant's Visit History for This Property */}
            {user?.role === 'tenant' && tenantVisitsForThisProperty.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Visits for This Property</h3>
                <div className="space-y-4">
                  {tenantVisitsForThisProperty.map((visit) => (
                    <div key={visit.visit_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            visit.status === 'scheduled' ? 'bg-yellow-100' :
                            visit.status === 'completed' ? 'bg-green-100' :
                            'bg-red-100'
                          }`}>
                            {visit.status === 'scheduled' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : visit.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(visit.visit_datetime).toLocaleDateString()} at{' '}
                              {new Date(visit.visit_datetime).toLocaleTimeString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: <span className={`font-medium ${
                                visit.status === 'scheduled' ? 'text-yellow-600' :
                                visit.status === 'completed' ? 'text-green-600' :
                                'text-red-600'
                              }`}>{visit.status}</span>
                            </p>
                            {visit.visit_notes && (
                              <p className="text-sm text-gray-500 mt-1 italic">"{visit.visit_notes}"</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {visit.status === 'completed' && (
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
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600">₹{currentListing.price}</div>
                <div className="text-gray-500">per month</div>
              </div>

              {user?.role === 'tenant' && (
                <>
                  {tenantVisitsForThisProperty.some(visit => visit.status === 'scheduled') ? (
                    <div className="w-full bg-yellow-100 text-yellow-800 py-3 px-4 rounded-md mb-3 text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-sm font-medium">Visit Already Scheduled</p>
                      <p className="text-xs">Check your visits tab for details</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowVisitModal(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors mb-3"
                    >
                      Schedule Visit
                    </button>
                  )}
                  <button
                    onClick={() => startConversation()}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Message Owner
                  </button>
                </>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Security Deposit</span>
                  <span className="font-medium">₹{currentListing.deposit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium">{currentListing.property_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Size</span>
                  <span className="font-medium">{currentListing.size} sq ft</span>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Owner</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Name</span>
                  <p className="font-medium">{currentListing.owner_name || 'Owner'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">KYC Status</span>
                  <p className="font-medium">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      currentListing.owner_kyc_status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {currentListing.owner_kyc_status || 'Pending'}
                    </span>
        </p>
      </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule a Visit</h3>
            <form onSubmit={handleVisitSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={visitForm.date}
                    onChange={(e) => setVisitForm({...visitForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={visitForm.time}
                    onChange={(e) => setVisitForm({...visitForm, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    value={visitForm.message}
                    onChange={(e) => setVisitForm({...visitForm, message: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
