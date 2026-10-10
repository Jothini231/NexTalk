import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Logo from './Logo';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-app-border shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-btn flex items-center justify-center transition-transform group-hover:scale-105">
              <Logo className="w-9 h-9" />
            </div>
            <div className="flex flex-col">
              <span className="text-msg-charcoal font-bold text-xl tracking-tight leading-none">
                Nex<span className="text-brand">Talk</span>
              </span>
              <span className="text-[10px] text-textSecondary font-medium tracking-wide">
                Connect instantly
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/search"
                  className="flex items-center space-x-1.5 text-textSecondary hover:text-brand
                             hover:bg-brand-soft px-3 py-2 rounded-btn text-sm font-medium transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-textSecondary hover:text-brand
                             hover:bg-brand-soft px-3 py-2 rounded-btn text-sm font-medium transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center">
                    <span className="text-brand text-xs font-bold">
                      {(user?.fullName || user?.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user?.username || 'Profile'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
