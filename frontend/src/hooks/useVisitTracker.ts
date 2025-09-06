import { useState, useEffect } from 'react';

interface VisitData {
  visitCount: number;
  lastVisitTime: number;
  hasSeenAd: boolean;
  userType: 'tenant' | 'owner' | 'staff' | 'admin';
  lastAdShown: number;
}

interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  clickUrl?: string;
  duration: number; // in seconds
  isActive: boolean;
  targetAudience: ('tenant' | 'owner' | 'all')[];
  priority: number;
}

const VISIT_THRESHOLD = 3;
const AD_COOLDOWN = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export const useVisitTracker = (userType: 'tenant' | 'owner' | 'staff' | 'admin' = 'tenant') => {
  const [visitData, setVisitData] = useState<VisitData>({
    visitCount: 0,
    lastVisitTime: 0,
    hasSeenAd: false,
    userType,
    lastAdShown: 0
  });
  const [showAd, setShowAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<AdData | null>(null);

  useEffect(() => {
    // Load visit data from localStorage
    const savedData = localStorage.getItem(`visitTracker_${userType}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setVisitData({ ...parsed, userType });
      } catch (error) {
        console.error('Error parsing visit data:', error);
      }
    } else {
      // Initialize with user type
      setVisitData(prev => ({ ...prev, userType }));
    }
  }, [userType]);

  const trackVisit = async () => {
    const now = Date.now();
    const newVisitData = {
      ...visitData,
      visitCount: visitData.visitCount + 1,
      lastVisitTime: now,
      userType
    };

    setVisitData(newVisitData);
    localStorage.setItem(`visitTracker_${userType}`, JSON.stringify(newVisitData));

    // Check if we should show an ad
    if (shouldShowAd(newVisitData, now)) {
      await fetchAndShowAd();
    }
  };

  const shouldShowAd = (data: VisitData, now: number): boolean => {
    return (
      data.visitCount >= VISIT_THRESHOLD &&
      !data.hasSeenAd &&
      (now - data.lastAdShown) > AD_COOLDOWN
    );
  };

  const fetchAndShowAd = async () => {
    try {
      // Fetch ads from backend
      const response = await fetch(`/api/ads/active?userType=${userType}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const ads = await response.json();
        if (ads.length > 0) {
          // Select ad based on priority and target audience
          const relevantAds = ads.filter((ad: AdData) => 
            ad.isActive && 
            (ad.targetAudience.includes(userType as 'tenant' | 'owner' | 'all') || ad.targetAudience.includes('all'))
          );
          
          if (relevantAds.length > 0) {
            const selectedAd = relevantAds.sort((a: AdData, b: AdData) => b.priority - a.priority)[0];
            setCurrentAd(selectedAd);
            setShowAd(true);
          }
        }
      } else {
        // Fallback to default ad
        setCurrentAd(getDefaultAd());
        setShowAd(true);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      // Fallback to default ad
      setCurrentAd(getDefaultAd());
      setShowAd(true);
    }
  };

  const getDefaultAd = (): AdData => {
    const defaultAds = {
      tenant: {
        id: 'default_tenant',
        title: 'Find Your Perfect Home!',
        description: 'Discover amazing properties with our premium search features. Get instant notifications for new listings that match your preferences.',
        duration: 15,
        isActive: true,
        targetAudience: ['tenant'] as ('tenant' | 'owner' | 'all')[],
        priority: 1
      },
      owner: {
        id: 'default_owner',
        title: 'List Your Property Today!',
        description: 'Reach thousands of potential tenants. Our premium listing features help you find the right match faster.',
        duration: 15,
        isActive: true,
        targetAudience: ['owner'] as ('tenant' | 'owner' | 'all')[],
        priority: 1
      },
      staff: {
        id: 'default_staff',
        title: 'Premium Analytics Dashboard',
        description: 'Access advanced reporting and analytics features to better manage your platform.',
        duration: 15,
        isActive: true,
        targetAudience: ['all'] as ('tenant' | 'owner' | 'all')[],
        priority: 1
      },
      admin: {
        id: 'default_admin',
        title: 'Admin Tools & Analytics',
        description: 'Comprehensive admin tools and analytics to manage your platform effectively.',
        duration: 15,
        isActive: true,
        targetAudience: ['all'] as ('tenant' | 'owner' | 'all')[],
        priority: 1
      }
    };

    return defaultAds[userType] || defaultAds.tenant;
  };

  const markAdAsSeen = () => {
    const now = Date.now();
    const updatedData = {
      ...visitData,
      hasSeenAd: true,
      lastAdShown: now
    };
    setVisitData(updatedData);
    localStorage.setItem(`visitTracker_${userType}`, JSON.stringify(updatedData));
    setShowAd(false);
    setCurrentAd(null);
  };

  const skipAd = () => {
    setShowAd(false);
    setCurrentAd(null);
    // Reset visit count after showing ad
    const resetData = {
      ...visitData,
      visitCount: 0,
      hasSeenAd: false,
      lastAdShown: Date.now()
    };
    setVisitData(resetData);
    localStorage.setItem(`visitTracker_${userType}`, JSON.stringify(resetData));
  };

  const resetVisitCount = () => {
    const resetData = {
      visitCount: 0,
      lastVisitTime: Date.now(),
      hasSeenAd: false,
      userType,
      lastAdShown: 0
    };
    setVisitData(resetData);
    localStorage.setItem(`visitTracker_${userType}`, JSON.stringify(resetData));
  };

  return {
    visitCount: visitData.visitCount,
    showAd,
    currentAd,
    trackVisit,
    markAdAsSeen,
    skipAd,
    resetVisitCount,
    userType
  };
};
