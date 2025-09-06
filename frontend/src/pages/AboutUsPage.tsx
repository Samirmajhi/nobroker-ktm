import React from 'react';
import { Link } from 'react-router-dom';

const AboutUsPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Anish Ghimire',
      role: 'Founder & CEO',
      image: '/api/placeholder/150/150',
      bio: 'Anish Ghimire, a passionate and curious professional with a strong interest in product development and digital solutions. I enjoy bridging the gap between ideas and execution, turning concepts into tangible results. Always eager to learn, I thrive in dynamic environments where I can solve problems creatively and contribute meaningfully to projects..',
      linkedin: '#',
      email: 'anish@nobrokerkathmandu.com'
    }
  ];
    /*#
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      image: '/api/placeholder/150/150',
      bio: 'Operations expert with a background in property management and customer service. Ensures smooth platform operations and user satisfaction.',
      linkedin: '#',
      email: 'priya@nobrokerkathmandu.com'
    },
    {
      name: 'Amit Gurung',
      role: 'Head of Technology',
      image: '/api/placeholder/150/150',
      bio: 'Tech enthusiast with expertise in building scalable web platforms. Leads our development team in creating innovative solutions for the rental market.',
      linkedin: '#',
      email: 'amit@nobrokerkathmandu.com'
    },
    {
      name: 'Sita Tamang',
      role: 'Head of Marketing',
      image: '/api/placeholder/150/150',
      bio: 'Marketing professional with deep understanding of local markets. Develops strategies to connect property owners with potential tenants effectively.',
      linkedin: '#',
      email: 'sita@nobrokerkathmandu.com'
    }
  ];
*/
  const milestones = [
    {
      year: '2023',
      title: 'Platform Launch',
      description: 'Successfully launched No-Broker Kathmandu with basic property listing and search functionality.'
    },
    {
      year: '2024',
      title: 'User Growth',
      description: 'Reached 1,000+ registered users and 500+ property listings across Kathmandu Valley.'
    },
    {
      year: '2024',
      title: 'Feature Expansion',
      description: 'Added advanced search, messaging system, and property verification features.'
    },
    {
      year: '2025',
      title: 'Future Goals',
      description: 'Plans to expand to other major cities in Nepal and introduce mobile applications.'
    }
  ];

  const values = [
    {
      icon: '🤝',
      title: 'Transparency',
      description: 'We believe in complete transparency in all our operations, from pricing to property information.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Continuously innovating to provide the best user experience and solve real estate challenges.'
    },
    {
      icon: '🛡️',
      title: 'Trust & Security',
      description: 'Building trust through secure transactions, verified listings, and reliable user verification.'
    },
    {
      icon: '🌱',
      title: 'Community Focus',
      description: 'Supporting local communities by making housing more accessible and affordable.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About No-Broker Kathmandu</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing the rental market in Kathmandu by connecting property owners directly with tenants, 
            eliminating unnecessary brokerage fees and creating a more transparent, efficient rental experience.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <nav className="mb-12">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900">About Us</li>
          </ol>
        </nav>

        {/* Our Story Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Finding a home in Kathmandu shouldn’t be this hard — but for years, tenants and property owners have faced the same challenges: 
              Unreasonably high brokerage fees 
              Limited access to verified property information 
              Zero transparency between owners and tenants
              Outdated time-consuming manual processes 
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Having experienced these frustrations firsthand, 
              our founder, Anish Ghimire, 
              decided to reimagine the rental ecosystem. 
              The goal? Remove middlemen, empower owners, help tenants, and create trust through technology.

              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
              That’s how No-Broker Kathmandu was born — a digital-first rental platform designed for the Kathmandu Valley, 
              built to make renting simple, affordable, and transparent for everyone.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🏠</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  To democratize access to rental properties in Kathmandu by eliminating brokerage barriers, 
                  promoting transparency, and creating a seamless digital experience for property owners and tenants.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These fundamental principles guide everything we do and shape how we serve our community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-700">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What We Do Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive platform that simplifies the rental process for everyone involved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Property Listings</h3>
              <p className="text-gray-700">
                Help property owners showcase their rental properties with detailed information, 
                high-quality photos, and accurate pricing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Search</h3>
              <p className="text-gray-700">
                Provide tenants with advanced search tools to find properties that match their 
                specific requirements and preferences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Direct Communication</h3>
              <p className="text-gray-700">
                Enable direct communication between property owners and tenants through our 
                secure messaging and scheduling system.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verification Services</h3>
              <p className="text-gray-700">
                Verify property ownership and tenant credentials to ensure a safe and 
                trustworthy rental experience for all parties.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cost Savings</h3>
              <p className="text-gray-700">
                Eliminate traditional brokerage fees, saving both property owners and tenants 
                significant amounts of money.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Market Insights</h3>
              <p className="text-gray-700">
                Provide valuable market data and insights to help users make informed 
                decisions about rental properties.
              </p>
            </div>
          </div>
        </section>

        {/* Our Journey Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Key milestones that mark our growth and development as a platform.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-700">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind No-Broker Kathmandu who are committed to 
              transforming the rental market in Kathmandu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{member.bio}</p>
                  <div className="flex justify-center space-x-3">
                    <a
                      href={member.linkedin}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      title="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-gray-600 hover:text-gray-700 transition-colors"
                      title="Email"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join Us in Transforming the Rental Market</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're a property owner looking to list your property or a tenant searching for 
            the perfect home, we're here to help you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>

        {/* Back to Top */}
        <div className="text-center mt-12">
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

export default AboutUsPage;
