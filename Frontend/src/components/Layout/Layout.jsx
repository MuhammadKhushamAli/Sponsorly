import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, LogOut, User, Home, MessageSquare, Award } from 'lucide-react';
import { logout } from "../../redux/slices/authSlice";
import { Button } from "../common/UIComponents";
import AIChatBubble from '../common/AIChatBubble';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl bg-gradient-brand bg-clip-text text-transparent">
            <span>✨</span> Sponsorly
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/campaigns" className="text-gray-600 hover:text-primary-600 font-medium">
                  Campaigns
                </Link>
                <Link to="/chat" className="text-gray-600 hover:text-primary-600 font-medium">
                  Messages
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-primary-600 font-medium">
                  Profile
                </Link>
                {user?.role === 'creator' && (
                  <Link to="/sponsors" className="text-gray-600 hover:text-primary-600 font-medium">
                    Find sponsors
                  </Link>
                )}
                {user?.role === 'sponsor' && (
                  <Link to="/creators" className="text-gray-600 hover:text-primary-600 font-medium">
                    Discover creators
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-gray-600 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/campaigns" className="block py-2 text-gray-600 hover:text-primary-600">
                  Campaigns
                </Link>
                <Link to="/chat" className="block py-2 text-gray-600 hover:text-primary-600">
                  Messages
                </Link>
                <Link to="/profile" className="block py-2 text-gray-600 hover:text-primary-600">
                  Profile
                </Link>
                {user?.role === 'creator' && (
                  <Link to="/sponsors" className="block py-2 text-gray-600 hover:text-primary-600">
                    Find sponsors
                  </Link>
                )}
                {user?.role === 'sponsor' && (
                  <Link to="/creators" className="block py-2 text-gray-600 hover:text-primary-600">
                    Discover creators
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-600 hover:text-primary-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-600 hover:text-primary-600">
                  Login
                </Link>
                <Button onClick={() => navigate('/signup')} className="w-full mt-2">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// Sidebar Component for Dashboard
export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector(state => state.auth);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Award, label: 'Campaigns', href: '/campaigns' },
    { icon: MessageSquare, label: 'Messages', href: '/chat' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              onClick={onClose}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
};

// Main Layout
export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
      {/* AI Assistant floating bubble – visible on all authenticated pages */}
      <AIChatBubble />
    </div>
  );
};

