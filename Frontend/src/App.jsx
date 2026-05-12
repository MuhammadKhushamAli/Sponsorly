import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ToastProvider } from './context/ToastContext';


// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorPublicProfilePage from './pages/CreatorPublicProfilePage';
import SponsorsPage from './pages/SponsorsPage';
import SponsorPublicProfilePage from './pages/SponsorPublicProfilePage';
import CollabRequestsPage from './pages/CollabRequestsPage';

// Layout
import { MainLayout } from './components/Layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <Router>
          <Routes>

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Public Routes */}
          <Route path="/creators/:creatorId" element={<CreatorPublicProfilePage />} />
          <Route path="/creators" element={<CreatorsPage />} />

          <Route
            path="/sponsors"
            element={
              <ProtectedRoute>
                <SponsorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sponsors/:sponsorId"
            element={
              <ProtectedRoute>
                <SponsorPublicProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CampaignsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/:campaignId/requests"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CollabRequestsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ChatPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
