import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Shield, 
  Clock, 
  Star, 
  Users, 
  Home, 
  TrendingUp,
  ChevronRight,
  Play,
  Award,
  CheckCircle2,
  ArrowRight,
  Building2,
  Heart,
  Camera,
  Calendar
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [animatedNumbers, setAnimatedNumbers] = useState({ properties: 0, users: 0, transactions: 0 });

  useEffect(() => {
    // Animate numbers on load
    const timer = setTimeout(() => {
      setAnimatedNumbers({ properties: 1500, users: 5000, transactions: 3200 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to listings with search params
    window.location.href = `/listings?search=${searchQuery}&type=${propertyType}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8">
              <Award className="w-4 h-4 mr-2" />
              #1 No-Broker Platform in Kathmandu
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 leading-tight">
              Find Your Dream
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Home in Kathmandu
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect directly with property owners. No middlemen, no hidden fees, 
              no hassle. Find verified rentals with our smart matching technology.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by location, area, or property name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-0 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-4 border-0 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                    >
                      <option value="">Property Type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="room">Room</option>
                      <option value="studio">Studio</option>
                    </select>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/listings"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Browse Properties
              </Link>
              <Link
                to="/register"
                className="border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                List Your Property
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {animatedNumbers.properties.toLocaleString()}+
                </div>
                <div className="text-blue-200 text-sm font-medium">Verified Properties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {animatedNumbers.users.toLocaleString()}+
                </div>
                <div className="text-blue-200 text-sm font-medium">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {animatedNumbers.transactions.toLocaleString()}+
                </div>
                <div className="text-blue-200 text-sm font-medium">Successful Deals</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full animate-float hidden lg:block"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full animate-float hidden lg:block" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-20 w-16 h-16 bg-pink-500/20 rounded-full animate-float hidden lg:block" style={{animationDelay: '2s'}}></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              The Future of Property Rental
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing how people find and rent homes in Kathmandu with cutting-edge technology and transparent practices.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-blue-200">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Zero Commission</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Save up to NPR 50,000 in broker fees. Connect directly with verified property owners through our secure platform.
                </p>
                <div className="flex items-center text-blue-600 font-semibold">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Verified Properties</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Every property undergoes rigorous verification including legal documents, safety checks, and quality assessments.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>See verification process</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-purple-200">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Smart Matching</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  AI-powered algorithms analyze your preferences to recommend properties that perfectly match your lifestyle and budget.
                </p>
                <div className="flex items-center text-purple-600 font-semibold">
                  <span>Try smart search</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
              <p className="text-gray-600 text-sm">Round-the-clock customer assistance</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Prime Locations</h4>
              <p className="text-gray-600 text-sm">Properties in Kathmandu's best areas</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Trusted Community</h4>
              <p className="text-gray-600 text-sm">Join thousands of verified users</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Virtual Tours</h4>
              <p className="text-gray-600 text-sm">Explore properties from home</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
              <Play className="w-4 h-4 mr-2" />
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              Get Your Dream Home in 4 Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes finding and renting properties effortless and transparent
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 hidden lg:block">
              <div className="w-1 bg-gradient-to-b from-blue-200 to-purple-200 h-96"></div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="group relative">
                <div className="text-center lg:text-left">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Search className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Smart Search</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Use our advanced search with filters for location, budget, amenities, and property type. Our AI suggests the best matches.
                  </p>
                  <div className="inline-flex items-center text-blue-600 font-semibold">
                    <span>Start searching</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative">
                <div className="text-center lg:text-left">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Book Visit</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Schedule visits instantly through our platform. Get confirmation and directions. Virtual tours available for quick previews.
                  </p>
                  <div className="inline-flex items-center text-green-600 font-semibold">
                    <span>Schedule now</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative">
                <div className="text-center lg:text-left">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Connect Direct</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Chat directly with property owners. Negotiate terms, ask questions, and get authentic information without intermediaries.
                  </p>
                  <div className="inline-flex items-center text-purple-600 font-semibold">
                    <span>Start chatting</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="group relative">
                <div className="text-center lg:text-left">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Home className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      4
                    </div>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Move In</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Complete digital agreements, secure payments, and get your keys. Our support team ensures a smooth transition.
                  </p>
                  <div className="inline-flex items-center text-orange-600 font-semibold">
                    <span>Get started</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Customer Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't take our word for it. Here's what people who use our platform have to say
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "I saved over NPR 40,000 in broker fees! The platform made it so easy to connect with property owners directly. Found my dream apartment in just 3 days."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sabina Karki</div>
                  <div className="text-gray-600 text-sm">Software Engineer</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "As a property owner, listing on this platform was incredibly simple. No middlemen, direct communication with tenants, and faster transactions."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  R
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Rajesh Shrestha</div>
                  <div className="text-gray-600 text-sm">Property Owner</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "The verification process gave me confidence. All properties are genuine, and the virtual tours saved me time before visiting in person."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  P
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Priya Maharjan</div>
                  <div className="text-gray-600 text-sm">Teacher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v20h40V20H20z"/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            Ready to Find Your
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Perfect Home?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of happy tenants and property owners in Kathmandu. 
            Start your journey to hassle-free property rental today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center"
            >
              <Users className="w-6 h-6 mr-3" />
              Get Started Today
            </Link>
            <Link
              to="/listings"
              className="border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
            >
              <Building2 className="w-6 h-6 mr-3" />
              Browse Properties
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">100% Verified Properties</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">24/7 Customer Support</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Best Rated Platform</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                No-Broker Kathmandu
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-gray-400 text-sm">
              <span>© 2024 No-Broker Kathmandu. All rights reserved.</span>
              <div className="flex gap-4">
                <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/contact" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
