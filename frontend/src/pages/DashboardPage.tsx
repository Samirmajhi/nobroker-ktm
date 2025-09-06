import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Navigate } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';
import OwnerDashboardPage from './OwnerDashboardPage';
import TenantDashboardPage from './TenantDashboardPage';
import StaffDashboardPage from './StaffDashboardPage';

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to role-specific dashboards
  switch (user.role) {
    case 'admin':
      return <AdminDashboardPage />;
    case 'owner':
      return <OwnerDashboardPage />;
    case 'tenant':
      return <TenantDashboardPage />;
    case 'staff':
      return <StaffDashboardPage />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Role</h2>
            <p className="text-gray-600">Your account has an invalid role. Please contact support.</p>
          </div>
        </div>
      );
  }
};

export default DashboardPage;
