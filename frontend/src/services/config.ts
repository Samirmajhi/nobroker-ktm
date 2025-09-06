// Configuration for No-Broker Kathmandu Frontend

export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Image Configuration
  IMAGE_BASE_URL: process.env.REACT_APP_IMAGE_URL || 'http://localhost:5000',
  
  // App Configuration
  APP_NAME: 'No-Broker Kathmandu',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  FEATURES: {
    IMAGE_UPLOAD: true,
    REAL_TIME_MESSAGING: true,
    VISIT_SCHEDULING: true,
    FAVORITES: true,
    KYC_VERIFICATION: true,
    PAYMENTS: false, // Disabled for now
  },
  
  // File Upload Limits
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILES: 10,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
};

// Helper function to get full image URL
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '/placeholder-property.jpg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the image base URL
  if (imagePath.startsWith('/')) {
    return `${config.IMAGE_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend the image base URL
  return `${config.IMAGE_BASE_URL}/${imagePath}`;
};

// Helper function to validate image URL
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default config;
