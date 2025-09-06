import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      category: 'General Questions',
      icon: '❓',
      items: [
        {
          question: 'What is No-Broker Kathmandu?',
          answer: 'No-Broker Kathmandu is a rental property platform that connects property owners directly with tenants in Kathmandu, Nepal. We eliminate the need for real estate brokers, making the rental process more transparent and cost-effective.'
        },
        {
          question: 'How is No-Broker Kathmandu different from traditional real estate agencies?',
          answer: 'Unlike traditional agencies, we don\'t charge brokerage fees. Property owners and tenants can connect directly, saving money and time. Our platform provides tools for property search, communication, and rental management.'
        },
        {
          question: 'Is No-Broker Kathmandu available only in Kathmandu?',
          answer: 'Currently, we focus on the Kathmandu Valley area, including Kathmandu, Lalitpur, and Bhaktapur. We plan to expand to other cities in Nepal in the future.'
        },
        {
          question: 'What languages does the platform support?',
          answer: 'Our platform currently supports English and Nepali. We\'re working on adding more local languages to better serve our users.'
        }
      ]
    },
    {
      category: 'Account & Registration',
      icon: '👤',
      items: [
        {
          question: 'How do I create an account?',
          answer: 'Creating an account is simple! Click the "Sign Up" button, fill in your basic information including name, email, and phone number, and verify your email address. You can then complete your profile with additional details.'
        },
        {
          question: 'What information do I need to provide during registration?',
          answer: 'You\'ll need to provide your full name, email address, phone number, and create a password. For property owners, we may also require property ownership verification documents.'
        },
        {
          question: 'Can I have multiple accounts?',
          answer: 'No, we allow only one account per person. However, if you\'re both a property owner and looking to rent, you can use the same account for both purposes.'
        },
        {
          question: 'How do I verify my account?',
          answer: 'Account verification involves email verification and, for property owners, document verification. We may also require phone number verification for enhanced security.'
        }
      ]
    },
    {
      category: 'Property Search',
      icon: '🔍',
      items: [
        {
          question: 'How do I search for properties?',
          answer: 'Use our advanced search filters to find properties by location, price range, property type, number of bedrooms, and other amenities. You can also save your search criteria for future use.'
        },
        {
          question: 'Can I save properties I\'m interested in?',
          answer: 'Yes! You can save properties to your favorites list by clicking the heart icon. This allows you to easily access them later and compare different options.'
        },
        {
          question: 'How do I know if a property is still available?',
          answer: 'Property availability is updated in real-time. However, we recommend contacting the property owner directly to confirm current availability before scheduling a viewing.'
        },
        {
          question: 'Can I set up alerts for new properties?',
          answer: 'Yes! You can set up property alerts based on your search criteria. We\'ll notify you via email or push notification when new properties matching your preferences are listed.'
        }
      ]
    },
    {
      category: 'Property Listing',
      icon: '🏠',
      items: [
        {
          question: 'How do I list my property?',
          answer: 'To list your property, create an account, verify your property ownership, and use our listing form to add property details, photos, and rental terms. Our team will review and approve your listing.'
        },
        {
          question: 'What documents do I need to list a property?',
          answer: 'You\'ll need property ownership documents, government-issued ID, and recent property photos. For commercial properties, additional business registration documents may be required.'
        },
        {
          question: 'How much does it cost to list a property?',
          answer: 'Basic property listings are free! We offer premium features like featured listings, virtual tours, and priority placement for a small fee. Check our pricing page for current rates.'
        },
        {
          question: 'Can I edit my property listing after posting?',
          answer: 'Yes, you can edit your listing anytime through your dashboard. Changes are reviewed and updated within 24 hours to ensure accuracy and compliance.'
        }
      ]
    },
    {
      category: 'Communication & Viewings',
      icon: '💬',
      items: [
        {
          question: 'How do I contact property owners or tenants?',
          answer: 'Use our secure messaging system to communicate directly with property owners or tenants. You can send messages, share documents, and schedule viewings all within the platform.'
        },
        {
          question: 'How do I schedule a property viewing?',
          answer: 'Once you\'ve contacted a property owner, you can schedule a viewing through our appointment system. Choose your preferred date and time, and the owner will confirm or suggest alternatives.'
        },
        {
          question: 'Is my personal information shared with other users?',
          answer: 'We protect your privacy by only sharing necessary contact information after mutual agreement. Your personal details are never publicly visible on property listings.'
        },
        {
          question: 'Can I block users if needed?',
          answer: 'Yes, you can block users who are harassing or spamming you. Blocked users cannot contact you or view your profile. You can unblock them later if needed.'
        }
      ]
    },
    {
      category: 'Payments & Fees',
      icon: '💳',
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept various payment methods including bank transfers, digital wallets (eSewa, Khalti), and credit/debit cards. Payment options may vary based on the service you\'re using.'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No hidden fees! We\'re transparent about all costs. Basic services are free, and premium features are clearly priced. You\'ll see the total cost before making any payment.'
        },
        {
          question: 'How do I get a receipt for my payment?',
          answer: 'Receipts are automatically generated and sent to your email after each payment. You can also download them from your billing history in your account dashboard.'
        },
        {
          question: 'Can I get a refund if I\'m not satisfied?',
          answer: 'Refund policies vary by service. Premium listing fees are generally non-refundable, but we may offer refunds for technical issues or service failures. Contact our support team for specific cases.'
        }
      ]
    },
    {
      category: 'Safety & Security',
      icon: '🔒',
      items: [
        {
          question: 'How do you verify property owners?',
          answer: 'We verify property ownership through government documents, property tax records, and in some cases, physical verification. This helps ensure that only legitimate owners can list properties.'
        },
        {
          question: 'What should I do if I encounter a scam or fraud?',
          answer: 'Immediately report any suspicious activity to our support team. We have fraud detection systems and will investigate all reports. Never share personal financial information outside our secure platform.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties without your explicit consent.'
        },
        {
          question: 'What if I have a dispute with a property owner or tenant?',
          answer: 'We provide mediation services for disputes. If we cannot resolve the issue, we recommend seeking legal advice. Our platform maintains records of all communications for reference.'
        }
      ]
    },
    {
      category: 'Technical Support',
      icon: '🛠️',
      items: [
        {
          question: 'What browsers are supported?',
          answer: 'Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.'
        },
        {
          question: 'Is there a mobile app available?',
          answer: 'We\'re currently developing mobile apps for iOS and Android. In the meantime, our website is fully responsive and works great on mobile devices.'
        },
        {
          question: 'What if I forget my password?',
          answer: 'Use the "Forgot Password" link on the login page. We\'ll send you a password reset link via email. Make sure to use a strong, unique password for security.'
        },
        {
          question: 'How do I report a technical issue?',
          answer: 'Report technical issues through our help center or contact our support team directly. Include details about the problem, your device, and browser for faster resolution.'
        }
      ]
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find quick answers to the most common questions about No-Broker Kathmandu. 
            Can't find what you're looking for? Check our Help Center or contact our support team.
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900">FAQ</li>
          </ol>
        </nav>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search FAQ..."
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

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <h2 className="text-xl font-semibold text-white">{category.category}</h2>
                </div>
              </div>

              {/* FAQ Items */}
              <div className="divide-y divide-gray-200">
                {category.items.map((item, itemIndex) => {
                  const globalIndex = categoryIndex * 100 + itemIndex;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <div key={itemIndex} className="px-6 py-4">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full text-left flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <h3 className="text-lg font-medium text-gray-900 pr-4">
                          {item.question}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isOpen && (
                        <div className="mt-4 pl-4 border-l-4 border-blue-500">
                          <p className="text-gray-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {searchQuery && filteredFAQs.every(category => category.items.length === 0) && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No FAQ results found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any FAQ items matching "{searchQuery}". Try different keywords or browse all categories.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search and show all FAQs
            </button>
          </div>
        )}

        {/* Still Have Questions Section */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help. 
            Reach out to us through any of these channels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/help"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Visit Help Center
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/help"
              className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Help Center</h4>
              <p className="text-gray-600">Detailed guides and tutorials</p>
            </Link>

            <Link
              to="/contact"
              className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Contact Us</h4>
              <p className="text-gray-600">Get in touch with our team</p>
            </Link>

            <Link
              to="/about"
              className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">About Us</h4>
              <p className="text-gray-600">Learn more about our platform</p>
            </Link>
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

export default FAQPage;
