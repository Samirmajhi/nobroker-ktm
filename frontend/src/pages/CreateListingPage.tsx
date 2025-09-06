import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  Upload, 
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { RootState } from '../store/store';
import { createListing } from '../store/slices/listingsSlice';

interface CreateListingForm {
  title: string;
  description: string;
  price: number;
  deposit: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  propertyType: 'apartment' | 'house' | 'room' | 'studio' | 'penthouse';
  furnishingStatus: 'furnished' | 'semi-furnished' | 'unfurnished';
  parkingAvailable: boolean;
  petFriendly: boolean;
  amenities: string[];
  availabilityDate: string;
  latitude?: number;
  longitude?: number;
}

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateListingForm>({
    defaultValues: {
      propertyType: 'apartment',
      furnishingStatus: 'unfurnished',
      parkingAvailable: false,
      petFriendly: false,
      amenities: [],
      availabilityDate: new Date().toISOString().split('T')[0],
    },
  });

  // Check if user is owner
  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only property owners can create listings.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Require KYC verification for owners
  if (user.kyc_status !== 'verified') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0021 17.09L13.93 4.91a2 2 0 00-3.86 0L3 17.09A2 2 0 005.07 19z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">KYC Verification Required</h2>
          <p className="text-gray-600 mb-6">
            Please verify your KYC before creating a listing. Your current status is
            <span className="font-medium"> {user.kyc_status}</span>.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary"
            >
              Update KYC
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length + uploadedPhotos.length > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }

    setUploadedPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities(prev => [...prev, newAmenity.trim()]);
      setValue('amenities', [...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    const updatedAmenities = amenities.filter(a => a !== amenity);
    setAmenities(updatedAmenities);
    setValue('amenities', updatedAmenities);
  };

  const onSubmit = async (data: CreateListingForm) => {
    if (uploadedPhotos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          deposit: data.deposit,
          size: data.size,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          amenities: data.amenities,
          availabilityDate: data.availabilityDate,
          propertyType: data.propertyType,
          furnishingStatus: data.furnishingStatus,
          parkingAvailable: data.parkingAvailable,
          petFriendly: data.petFriendly,
        },
        photos: uploadedPhotos,
      };

      // Use dispatch with correct typing for async thunk
      await dispatch<any>(createListing(payload)).unwrap();

      toast.success('Listing created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast.error(error.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-600 mt-2">
            Add your property to our platform and connect with potential tenants
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Basic Information
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="input-field"
                    placeholder="e.g., Modern 2BHK Apartment in Thamel"
                  />
                  {errors.title && (
                    <p className="text-accent-600 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    {...register('propertyType')}
                    className="input-field"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="room">Room</option>
                    <option value="studio">Studio</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="input-field"
                  placeholder="Describe your property, amenities, and what makes it special..."
                />
                {errors.description && (
                  <p className="text-accent-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address/Location *
                </label>
                <input
                  type="text"
                  {...register('location', { required: 'Location is required' })}
                  className="input-field"
                  placeholder="e.g., Thamel, Kathmandu"
                />
                {errors.location && (
                  <p className="text-accent-600 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('latitude')}
                    className="input-field"
                    placeholder="27.7172"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('longitude')}
                    className="input-field"
                    placeholder="85.3240"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Square className="w-5 h-5 mr-2" />
                Property Details
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size (sq ft) *
                  </label>
                  <input
                    type="number"
                    {...register('size', { 
                      required: 'Size is required',
                      min: { value: 1, message: 'Size must be positive' }
                    })}
                    className="input-field"
                    placeholder="1200"
                  />
                  {errors.size && (
                    <p className="text-accent-600 text-sm mt-1">{errors.size.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    {...register('bedrooms', { 
                      required: 'Bedrooms is required',
                      min: { value: 0, message: 'Bedrooms cannot be negative' }
                    })}
                    className="input-field"
                    placeholder="2"
                  />
                  {errors.bedrooms && (
                    <p className="text-accent-600 text-sm mt-1">{errors.bedrooms.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    {...register('bathrooms', { 
                      required: 'Bathrooms is required',
                      min: { value: 1, message: 'At least 1 bathroom required' }
                    })}
                    className="input-field"
                    placeholder="2"
                  />
                  {errors.bathrooms && (
                    <p className="text-accent-600 text-sm mt-1">{errors.bathrooms.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Date *
                  </label>
                  <input
                    type="date"
                    {...register('availabilityDate', { required: 'Availability date is required' })}
                    className="input-field"
                  />
                  {errors.availabilityDate && (
                    <p className="text-accent-600 text-sm mt-1">{errors.availabilityDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing Status
                  </label>
                  <select
                    {...register('furnishingStatus')}
                    className="input-field"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi-furnished</option>
                    <option value="furnished">Furnished</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('parkingAvailable')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Parking Available
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('petFriendly')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Pet Friendly
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Pricing
              </h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent (NPR) *
                  </label>
                  <input
                    type="number"
                    {...register('price', { 
                      required: 'Price is required',
                      min: { value: 1, message: 'Price must be positive' }
                    })}
                    className="input-field"
                    placeholder="25000"
                  />
                  {errors.price && (
                    <p className="text-accent-600 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit (NPR) *
                  </label>
                  <input
                    type="number"
                    {...register('deposit', { 
                      required: 'Deposit is required',
                      min: { value: 1, message: 'Deposit must be positive' }
                    })}
                    className="input-field"
                    placeholder="50000"
                  />
                  {errors.deposit && (
                    <p className="text-accent-600 text-sm mt-1">{errors.deposit.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Bed className="w-5 h-5 mr-2" />
                Amenities
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Add amenity (e.g., WiFi, AC, Gym)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="btn-secondary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Property Photos
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Upload Photos
                  </p>
                  <p className="text-gray-600">
                    Drag and drop or click to select up to 10 photos
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Maximum file size: 5MB per photo
                  </p>
                </label>
              </div>

              {uploadedPhotos.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Photos ({uploadedPhotos.length}/10)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListingPage;
