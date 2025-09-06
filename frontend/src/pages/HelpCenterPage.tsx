import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpCenterPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        {
          title: 'How to create an account',
          content: 'Learn how to sign up and create your No-Broker Kathmandu account in just a few simple steps.',
          tags: ['account', 'registration', 'signup']
        },
        {
          title: 'Complete your profile',
          content: 'Set up your profile with all necessary information to get the most out of our platform.',
          tags: ['profile', 'setup', 'verification']
        },
        {
          title: 'Understanding user roles',
          content: 'Learn about different user types: tenants, property owners, and staff members.',
          tags: ['roles', 'users', 'permissions']
        }
      ]
    },
    {
      id: 'property-search',
      title: 'Property Search',
      icon: '🔍',
      articles: [
        {
          title: 'Search for properties',
          content: 'Use our advanced search filters to find the perfect rental property in Kathmandu.',
          tags: ['search', 'filters', 'properties']
        },
        {
          title: 'Save favorite properties',
          content: 'Learn how to save and organize properties you\'re interested in for easy access later.',
          tags: ['favorites', 'bookmarks', 'saved']
        },
        {
          title: 'Property alerts',
          content: 'Set up notifications to get alerts when new properties matching your criteria are listed.',
          tags: ['alerts', 'notifications', 'updates']
        }
      ]
    },
    {
      id: 'property-listing',
      title: 'Property Listing',
      icon: '🏠',
      articles: [
        {
          title: 'List your property',
          content: 'Step-by-step guide to listing your rental property on our platform.',
          tags: ['listing', 'property', 'owner']
        },
        {
          title: 'Property photos and descriptions',
          content: 'Tips for creating compelling property listings with great photos and descriptions.',
          tags: ['photos', 'descriptions', 'marketing']
        },
        {
          title: 'Manage your listings',
          content: 'Learn how to update, edit, and manage your property listings effectively.',
          tags: ['management', 'editing', 'updates']
        }
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      icon: '💬',
      articles: [
        {
          title: 'Messaging system',
          content: 'How to communicate with property owners or tenants through our secure messaging system.',
          tags: ['messaging', 'communication', 'chat']
        },
        {
          title: 'Schedule property viewings',
          content: 'Learn how to schedule and manage property viewing appointments.',
          tags: ['viewings', 'appointments', 'scheduling']
        },
        {
          title: 'Notifications',
          content: 'Understand how to manage your notification preferences and stay updated.',
          tags: ['notifications', 'preferences', 'updates']
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: '💳',
      articles: [
        {
          title: 'Payment methods',
          content: 'Learn about accepted payment methods and how to add payment information.',
          tags: ['payments', 'methods', 'billing']
        },
        {
          title: 'Service fees',
          content: 'Understanding our fee structure and what services are included.',
          tags: ['fees', 'pricing', 'services']
        },
        {
          title: 'Billing history',
          content: 'How to view and download your billing history and receipts.',
          tags: ['billing', 'history', 'receipts']
        }
      ]
    },
    {
      id: 'account-management',
      title: 'Account Management',
      icon: '⚙️',
      articles: [
        {
          title: 'Update account information',
          content: 'Learn how to modify your account details, contact information, and preferences.',
          tags: ['account', 'updates', 'settings']
        },
        {
          title: 'Security and privacy',
          content: 'Best practices for keeping your account secure and managing privacy settings.',
          tags: ['security', 'privacy', 'password']
        },
        {
          title: 'Delete account',
          content: 'How to deactivate or permanently delete your account if needed.',
          tags: ['deletion', 'deactivation', 'account']
        }
      ]
    }
  ];

  const filteredArticles = helpCategories
    .flatMap(category => category.articles)
    .filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and learn how to use No-Broker Kathmandu effectively. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900">Help Center</li>
          </ol>
        </nav>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Get instant help from our support team</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us a detailed message</p>
              <Link
                to="/contact"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Send Email
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Call us directly for urgent issues</p>
              <a
                href="tel:+977-1-4XXXXXX"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>

        {/* Help Categories and Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                {helpCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Articles Content */}
          <div className="lg:col-span-3">
            {searchQuery ? (
              // Search Results
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Search Results for "{searchQuery}"
                </h2>
                {filteredArticles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredArticles.map((article, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                        <p className="text-gray-600 mb-3">{article.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms or browse our categories below.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Category Articles
              <div>
                {helpCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`${activeCategory === category.id ? 'block' : 'hidden'}`}
                  >
                    <div className="flex items-center mb-6">
                      <span className="text-3xl mr-3">{category.icon}</span>
                      <h2 className="text-2xl font-semibold text-gray-900">{category.title}</h2>
                    </div>
                    <div className="space-y-4">
                      {category.articles.map((article, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                          <p className="text-gray-600 mb-3">{article.content}</p>
                          <div className="flex flex-wrap gap-2">
                            {article.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our support team is here to help you with any questions or issues you might have. 
            Don't hesitate to reach out to us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              Schedule a Call
            </button>
          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
