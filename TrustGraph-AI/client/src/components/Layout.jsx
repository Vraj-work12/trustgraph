import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Shield, LayoutDashboard, Search, UserCheck, FileText,
  Flag, Settings, LogOut, User, ChevronDown, Menu, X,
  Bell, BookOpen
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',         label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/analyze',           label: 'Analyze',         icon: Search },
  { to: '/verify-recruiter',  label: 'Verify Recruiter', icon: UserCheck },
  { to: '/offer-letter',      label: 'Offer Letter',    icon: FileText },
  { to: '/report',            label: 'Report Scam',     icon: Flag },
  { to: '/community-reports', label: 'Investigations',  icon: BookOpen },
];

const ADMIN_ITEMS = [
  { to: '/admin', label: 'Admin Console', icon: Settings },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const handleLogout = () => { logout(); navigate('/'); };
  const items = user?.role === 'admin' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <aside className="sidebar hidden md:flex flex-col">
      <nav className="flex-1 px-3 pt-2">
        <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Platform</p>
        <ul className="space-y-0.5">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} className={isActive(to) ? 'text-gray-700' : 'text-gray-400'} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {user && (
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <Link to="/profile"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-2xs text-gray-400 truncate">{user.email}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full mt-0.5"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      )}
    </aside>
  );
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/analyze?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-[52px] bg-white border-b border-gray-200 flex items-center">
        <div className="flex items-center justify-between w-full px-4 lg:px-6 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Shield size={15} className="text-gray-800" />
            <span className="text-sm font-semibold text-gray-900">TrustGraph</span>
            <span className="hidden sm:inline text-2xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium border border-gray-200">AI</span>
          </Link>

          {/* Search bar — visible when logged in */}
          {user && !isAuthPage && (
            <div className="flex-1 max-w-xs hidden md:block">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Quick analyze — paste text, press Enter"
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white transition-colors placeholder:text-gray-400 text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Public nav links */}
          {!user && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {[
                { to: '/community-reports', label: 'Investigations' },
                { to: '/analyze', label: 'Analyze' },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-1.5 ml-auto">
            {user ? (
              <>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell size={14} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-700 hidden sm:block max-w-24 truncate">{user.name}</span>
                    {user.role === 'admin' && (
                      <span className="hidden sm:inline text-2xs px-1 py-0.5 bg-red-50 text-red-600 rounded border border-red-200 font-medium">Admin</span>
                    )}
                    <ChevronDown size={11} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-dropdown z-50 py-1 animate-fade-up">
                        <div className="px-3 py-2.5 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-2xs text-gray-400 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                            <User size={13} className="text-gray-400" /> Profile settings
                          </Link>
                          <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                            <LayoutDashboard size={13} className="text-gray-400" /> Dashboard
                          </Link>
                          {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={13} className="text-gray-400" /> Admin Console
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                            <LogOut size={13} /> Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                  {mobileOpen ? <X size={15} /> : <Menu size={15} />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-[52px] left-0 bottom-0 w-60 bg-white border-r border-gray-200 py-4 px-3"
            onClick={e => e.stopPropagation()}>
            <ul className="space-y-0.5">
              {(user?.role === 'admin' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS).map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      location.pathname === to ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                    <Icon size={14} />{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export const AppShell = ({ children }) => (
  <div className="sidebar-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

const FOOTER_LINKS = {
  Platform: [
    { label: 'Analyze Jobs',      to: '/analyze' },
    { label: 'Verify Recruiters', to: '/verify-recruiter' },
    { label: 'Offer Letters',     to: '/offer-letter' },
    { label: 'Investigations',    to: '/community-reports' },
  ],
  Company: [
    { label: 'About',         to: '/about' },
    { label: 'Documentation', to: '/documentation' },
    { label: 'Changelog',     to: '/changelog' },
    { label: 'Contact',       to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy',   to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/terms-of-service' },
    { label: 'Security',         to: '/security' },
    { label: 'GDPR',             to: '/gdpr' },
  ],
};

export const Footer = () => (
  <footer className="border-t border-gray-100 bg-white mt-16">
    <div className="page-container py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={13} className="text-gray-700" />
            <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Employment fraud detection for students, universities, and placement departments.
          </p>
        </div>
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
            <ul className="space-y-2">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-2xs text-gray-400">&copy; {new Date().getFullYear()} TrustGraph AI. All rights reserved.</p>
        <p className="text-2xs text-gray-400">Built for safer hiring environments</p>
      </div>
    </div>
  </footer>
);
