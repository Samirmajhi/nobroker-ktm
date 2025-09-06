import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900">Terms of Service</li>
          </ol>
        </nav>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using No-Broker Kathmandu ("the Platform"), you accept and agree to be 
                bound by the terms and provision of this agreement. If you do not agree to abide by the 
                above, please do not use this service.
              </p>
              <p className="text-gray-700">
                These Terms of Service ("Terms") govern your use of our website and services. By using 
                our Platform, you agree to these Terms in full.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                No-Broker Kathmandu is a rental property platform that connects property owners with 
                potential tenants in Kathmandu, Nepal. Our services include:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Property listing and management</li>
                <li>Property search and discovery</li>
                <li>Direct communication between owners and tenants</li>
                <li>Property viewing scheduling</li>
                <li>Rental agreement facilitation</li>
                <li>Payment processing services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To use certain features of our Platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your account credentials secure</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Types</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>Tenants:</strong> Users seeking rental properties</li>
                <li><strong>Property Owners:</strong> Users listing properties for rent</li>
                <li><strong>Staff:</strong> Platform administrators and support personnel</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Property Listings and Content</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Listing Requirements</h3>
              <p className="text-gray-700 mb-4">
                Property owners must ensure their listings:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Contain accurate and truthful information</li>
                <li>Include current and high-quality photographs</li>
                <li>Provide complete property details and amenities</li>
                <li>Disclose any known issues or limitations</li>
                <li>Comply with local rental laws and regulations</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Content Standards</h3>
              <p className="text-gray-700 mb-4">
                All content on our Platform must:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Be lawful and not infringe on others' rights</li>
                <li>Not contain false, misleading, or fraudulent information</li>
                <li>Not include discriminatory language or practices</li>
                <li>Respect intellectual property rights</li>
                <li>Not contain harmful, offensive, or inappropriate material</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Conduct and Responsibilities</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Prohibited Activities</h3>
              <p className="text-gray-700 mb-4">
                Users are prohibited from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Violating any applicable laws or regulations</li>
                <li>Harassing, threatening, or intimidating other users</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with the proper functioning of the Platform</li>
                <li>Using the Platform for commercial purposes without authorization</li>
                <li>Sharing false or misleading information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 User Responsibilities</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Maintain appropriate behavior during property viewings</li>
                <li>Respect scheduled appointments and property owners' time</li>
                <li>Provide honest feedback and reviews</li>
                <li>Report suspicious or inappropriate behavior</li>
                <li>Comply with rental agreements and local laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment and Fees</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Service Fees</h3>
              <p className="text-gray-700 mb-4">
                Our Platform may charge fees for certain services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Premium listing features</li>
                <li>Property verification services</li>
                <li>Background check services</li>
                <li>Payment processing fees</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Payment Terms</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>Payment must be made in advance of service delivery</li>
                <li>We accept various payment methods as indicated on our Platform</li>
                <li>Prices are subject to change with prior notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our collection and use of personal information is 
                governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-gray-700">
                By using our Platform, you consent to the collection and use of your information 
                as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property Rights</h2>
              <p className="text-gray-700 mb-4">
                The Platform and its original content, features, and functionality are owned by 
                No-Broker Kathmandu and are protected by international copyright, trademark, patent, 
                trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-700">
                Users retain ownership of their content but grant us a license to use, display, and 
                distribute it on our Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">9.1 Service Availability</h3>
              <p className="text-gray-700 mb-4">
                We strive to provide reliable service but cannot guarantee:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Uninterrupted or error-free operation</li>
                <li>Immediate response to all inquiries</li>
                <li>Availability of all features at all times</li>
                <li>Compatibility with all devices or browsers</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">9.2 Property Information</h3>
              <p className="text-gray-700">
                While we verify property listings, we cannot guarantee the accuracy of all information 
                provided by property owners. Users should conduct their own due diligence before 
                entering into rental agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Liability and Indemnification</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">10.1 Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, No-Broker Kathmandu shall not be liable for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages resulting from user disputes or rental agreements</li>
                <li>Third-party actions or content</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">10.2 Indemnification</h3>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless No-Broker Kathmandu from any claims, damages, 
                or expenses arising from your use of the Platform or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination and Suspension</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">11.1 Account Termination</h3>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You violate these Terms</li>
                <li>You engage in fraudulent or illegal activities</li>
                <li>You provide false information</li>
                <li>Your account poses a security risk</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">11.2 Effect of Termination</h3>
              <p className="text-gray-700">
                Upon termination, your right to use the Platform ceases immediately. We may retain 
                certain information as required by law or for legitimate business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law and Disputes</h2>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of Nepal. Any disputes arising from these Terms 
                or your use of the Platform shall be resolved through:
              </p>
              <ol className="list-decimal pl-6 text-gray-700">
                <li>Direct communication and negotiation</li>
                <li>Mediation if direct resolution fails</li>
                <li>Legal proceedings in courts of competent jurisdiction in Kathmandu, Nepal</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Changes will be effective 
                immediately upon posting on our Platform. Your continued use of the Platform after 
                changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> legal@nobrokerkathmandu.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> +977-1-4XXXXXX
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> Kathmandu, Nepal
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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

export default TermsOfServicePage;
