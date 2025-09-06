import React, { useState, useEffect } from 'react';
import { X, Play, ExternalLink, Clock, Eye, Users, Home, DollarSign } from 'lucide-react';

interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  clickUrl?: string;
  duration: number;
  isActive: boolean;
  targetAudience: ('tenant' | 'owner' | 'all')[];
  priority: number;
}

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onAdClick: (ad: AdData) => void;
  ad: AdData | null;
  visitCount: number;
  userType: 'tenant' | 'owner' | 'staff' | 'admin';
}

const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  onSkip,
  onAdClick,
  ad,
  visitCount,
  userType
}) => {
  const [timeLeft, setTimeLeft] = useState(ad?.duration || 15);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen && ad) {
      setTimeLeft(ad.duration);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, ad]);

  if (!isOpen || !ad) return null;

  const getAdIcon = () => {
    switch (userType) {
      case 'tenant':
        return <Home className="w-8 h-8 text-blue-500" />;
      case 'owner':
        return <DollarSign className="w-8 h-8 text-green-500" />;
      default:
        return <Eye className="w-8 h-8 text-purple-500" />;
    }
  };

  const getAdTheme = () => {
    switch (userType) {
      case 'tenant':
        return 'from-blue-500 to-cyan-500';
      case 'owner':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const handleAdClick = () => {
    onAdClick(ad);
    onClose();
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${getAdTheme()} p-6 text-white`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              {getAdIcon()}
            </div>
            <h2 className="text-2xl font-bold mb-2">{ad.title}</h2>
            <p className="text-white text-opacity-90">
              You've viewed {visitCount} properties! Check out this special offer.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Ad Media */}
          {ad.videoUrl ? (
            <div className="mb-6">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <video
                  className="w-full h-48 object-cover"
                  controls
                  autoPlay
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src={ad.videoUrl} type="video/mp4" />
                </video>
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all"
                    >
                      <Play className="w-8 h-8 text-gray-800" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : ad.imageUrl ? (
            <div className="mb-6">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center">
                  {getAdIcon()}
                  <p className="text-gray-600 mt-2">Advertisement</p>
                </div>
              </div>
            </div>
          )}

          {/* Ad Description */}
          <div className="mb-6">
            <p className="text-gray-700 text-center leading-relaxed">
              {ad.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {ad.clickUrl && (
              <button
                onClick={handleAdClick}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Learn More</span>
              </button>
            )}
            
            <button
              onClick={handleSkip}
              className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Continue Browsing</span>
            </button>
          </div>

          {/* Timer */}
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500 flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Ad will close in {timeLeft} seconds</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className={`bg-gradient-to-r ${getAdTheme()} h-1 rounded-full transition-all duration-1000`}
                style={{ width: `${(timeLeft / (ad.duration || 15)) * 100}%` }}
              />
            </div>
          </div>

          {/* Visit Counter */}
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-400">
              Free visits remaining: {Math.max(0, 3 - (visitCount % 3))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdModal;
