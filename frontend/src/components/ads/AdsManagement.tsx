import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Calendar,
  Users,
  Target,
  Play,
  Image as ImageIcon,
  ExternalLink,
  X
} from 'lucide-react';

interface AdData {
  ad_id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  click_url?: string;
  duration: number;
  is_active: boolean;
  target_audience: string[];
  priority: number;
  views_count: number;
  clicks_count: number;
  created_at: string;
  updated_at: string;
}

interface AdsManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdsManagement: React.FC<AdsManagementProps> = ({ isOpen, onClose }) => {
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAd, setEditingAd] = useState<AdData | null>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'analytics'>('ads');

  useEffect(() => {
    if (isOpen) {
      fetchAds();
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/ads/analytics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCreateAd = async (adData: Partial<AdData>) => {
    try {
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(adData)
      });

      if (response.ok) {
        await fetchAds();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating ad:', error);
    }
  };

  const handleUpdateAd = async (id: string, adData: Partial<AdData>) => {
    try {
      const response = await fetch(`/api/ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(adData)
      });

      if (response.ok) {
        await fetchAds();
        setEditingAd(null);
      }
    } catch (error) {
      console.error('Error updating ad:', error);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        const response = await fetch(`/api/ads/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
          await fetchAds();
        }
      } catch (error) {
        console.error('Error deleting ad:', error);
      }
    }
  };

  const toggleAdStatus = async (id: string, isActive: boolean) => {
    await handleUpdateAd(id, { is_active: !isActive });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCTR = (views: number, clicks: number) => {
    return views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Ads Management</h2>
              <p className="text-blue-100">Manage advertisements and track performance</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('ads')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ads
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'ads' && (
            <div>
              {/* Actions */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Ads</h3>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Ad</span>
                </button>
              </div>

              {/* Ads List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.ad_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{ad.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ad.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {ad.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Priority: {ad.priority}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{ad.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>{ad.target_audience.join(', ')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{ad.duration}s</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{ad.views_count} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MousePointer className="w-4 h-4" />
                              <span>{ad.clicks_count} clicks</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{getCTR(ad.views_count, ad.clicks_count)}% CTR</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setEditingAd(ad)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleAdStatus(ad.ad_id, ad.is_active)}
                            className={`p-2 transition-colors ${
                              ad.is_active 
                                ? 'text-green-400 hover:text-green-600' 
                                : 'text-gray-400 hover:text-green-600'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.ad_id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Ad Performance Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Views</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {analytics.reduce((sum, ad) => sum + ad.views_count, 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <MousePointer className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Total Clicks</p>
                      <p className="text-2xl font-bold text-green-900">
                        {analytics.reduce((sum, ad) => sum + ad.clicks_count, 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Avg CTR</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {analytics.length > 0 
                          ? (analytics.reduce((sum, ad) => sum + parseFloat(ad.click_through_rate), 0) / analytics.length).toFixed(2)
                          : '0.00'
                        }%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {analytics.map((ad) => (
                  <div key={ad.ad_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{ad.title}</h4>
                      <span className="text-sm text-gray-500">{formatDate(ad.created_at)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{ad.views_count}</p>
                        <p className="text-sm text-gray-600">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{ad.clicks_count}</p>
                        <p className="text-sm text-gray-600">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{ad.click_through_rate}%</p>
                        <p className="text-sm text-gray-600">CTR</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {ad.views_count > 0 ? Math.round(ad.clicks_count / ad.views_count * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-600">Conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdsManagement;
