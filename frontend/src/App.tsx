import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffLoginPage from './pages/StaffLoginPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import DashboardPage from './pages/DashboardPage';
import CreateListingPage from './pages/CreateListingPage';
import VisitsPage from './pages/VisitsPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';

// New Pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import HelpCenterPage from './pages/HelpCenterPage';
import FAQPage from './pages/FAQPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import FinalizePage from './pages/FinalizePage';
import SSOCallbackPage from './pages/SSOCallbackPage';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/staff-login" element={<StaffLoginPage />} />
          <Route path="/auth/callback" element={<SSOCallbackPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          
          {/* Legal & Information Pages */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/finalize" element={<FinalizePage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/create-listing" element={
            <ProtectedRoute requiredRole="owner">
              <CreateListingPage />
            </ProtectedRoute>
          } />
          <Route path="/visits" element={
            <ProtectedRoute>
              <VisitsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
