import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu, X, LogOut, User, Home, MessageSquare,
  Award, Link2, LayoutDashboard, Briefcase,
} from 'lucide-react';
import { logout } from "../../redux/slices/authSlice";
import { Button } from "../common/UIComponents";
import AIChatBubble from '../common/AIChatBubble';

// ── Navbar ────────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      key={to}
      to={to}
      className={`text-sm font-semibold transition-colors px-1 pb-0.5 border-b-2
        ${isActive(to)
          ? 'text-primary-600 border-primary-500'
          : 'text-gray-600 hover:text-primary-600 border-transparent hover:border-primary-300'
        }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-black text-xl">
            <span className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-sm">✦</span>
            <span className="bg-gradient-brand bg-clip-text text-transparent">Sponsorly</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {navLink('/dashboard', 'Dashboard')}
                {navLink('/campaigns', 'Campaigns')}
                {navLink('/chat', 'Messages')}
                {navLink('/profile', 'Profile')}
                {user?.role === 'creator' && navLink('/sponsors', 'Find Sponsors')}
                {user?.role === 'sponsor' && navLink('/creators', 'Find Creators')}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                {navLink('/creators', 'Creators')}
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">Login</Link>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-primary-50 hover:text-primary-600"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 slide-down">
            {isAuthenticated ? (
              <>
                {['/dashboard','Dashboard',' /campaigns','Campaigns','/chat','Messages','/profile','Profile'].reduce((acc, v, i, arr) => {
                  if (i % 2 === 0) acc.push([arr[i], arr[i+1]]);
                  return acc;
                }, []).map(([to, label]) => (
                  <Link key={to} to={to} onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
                      ${isActive(to) ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'}`}>
                    {label}
                  </Link>
                ))}
                {user?.role === 'creator' && (
                  <Link to="/sponsors" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-primary-50 hover:text-primary-600">Find Sponsors</Link>
                )}
                {user?.role === 'sponsor' && (
                  <Link to="/creators" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-primary-50 hover:text-primary-600">Find Creators</Link>
                )}
                <button onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-primary-50 hover:text-primary-600 flex items-center gap-2">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-primary-50">Login</Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard' },
    { icon: Briefcase,       label: 'Campaigns',  href: '/campaigns' },
    { icon: MessageSquare,   label: 'Messages',   href: '/chat' },
    { icon: User,            label: 'Profile',    href: '/profile' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 md:hidden z-30" onClick={onClose} />
      )}

      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-white border-r border-gray-200
        shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${isActive(item.href)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Bottom user chip */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary-50">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-primary-600 capitalize font-semibold">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// ── MainLayout ────────────────────────────────────────────────────────────────
export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
            {children}
          </div>
        </main>
      </div>
      <AIChatBubble />
    </div>
  );
};
