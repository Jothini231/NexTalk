import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Logo from './Logo';
import api from '../api/axios';

const getAvatarUrl = (fullName, username) => {
  const name = fullName || username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5E9&color=fff&bold=true&size=128`;
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Search Bar States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Debounced search query
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/users/search?query=${encodeURIComponent(query.trim())}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Navbar search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Focus input when search bar opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search dropdown on click outside or Esc
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectUser = (targetUserId) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/chat?userId=${targetUserId}`);
  };

  return (
    <nav className="bg-white border-b border-app-border shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-btn flex items-center justify-center transition-transform group-hover:scale-105">
              <Logo className="w-9 h-9" />
            </div>
            <div className="flex flex-col">
              <span className="text-msg-charcoal font-bold text-xl tracking-tight leading-none">
                Nex<span className="text-brand">Talk</span>
              </span>
              <span className="text-[10px] text-textSecondary font-medium tracking-wide hidden sm:block">
                Connect instantly
              </span>
            </div>
          </Link>

          {/* Inline Search Bar in Navbar */}
          {isAuthenticated && (
            <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-4">
              {isSearchOpen ? (
                <div className="relative flex items-center w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    {isSearching ? (
                      <svg className="animate-spin h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people to chat…"
                    className="w-full pl-10 pr-9 py-2 text-sm bg-app-bg border border-brand/40 rounded-btn
                               text-msg-charcoal placeholder-textSecondary focus:outline-none focus:ring-2
                               focus:ring-brand/30 focus:border-brand shadow-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary hover:text-msg-charcoal"
                    title="Close search"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Dropdown Live Results */}
                  {searchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-card shadow-card border border-app-border overflow-hidden z-50 max-h-80 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-xs text-textSecondary">
                          Searching users…
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-app-border">
                          {searchResults.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectUser(u.id)}
                              className="w-full p-3 flex items-center space-x-3 text-left hover:bg-brand-soft transition-colors"
                            >
                              <div className="relative flex-shrink-0">
                                <img
                                  src={u.avatarUrl || getAvatarUrl(u.fullName, u.username)}
                                  alt={u.fullName || u.username}
                                  className="w-9 h-9 rounded-full object-cover border border-app-border"
                                  onError={(e) => {
                                    e.target.src = getAvatarUrl(u.fullName, u.username);
                                  }}
                                />
                                {u.isOnline && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border border-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-msg-charcoal truncate">
                                    {u.fullName || u.username}
                                  </p>
                                  <span className="text-[10px] text-brand font-medium">Chat</span>
                                </div>
                                <p className="text-xs text-textSecondary truncate">@{u.username}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-5 text-center text-xs text-textSecondary">
                          No users found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Hidden/Idle state on larger screens */
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center space-x-2.5 w-full px-3.5 py-1.5 text-xs text-textSecondary
                             bg-app-bg hover:bg-brand-soft border border-app-border rounded-btn transition-colors"
                >
                  <svg className="w-4 h-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search users…</span>
                  <kbd className="ml-auto text-[10px] font-semibold text-textSecondary bg-white border border-app-border px-1.5 py-0.5 rounded">
                    /
                  </kbd>
                </button>
              )}
            </div>
          )}

          {/* Nav Links */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Search toggle button (visible on mobile or when search bar is collapsed) */}
                {!isSearchOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="flex md:hidden items-center p-2 text-textSecondary hover:text-brand hover:bg-brand-soft rounded-btn transition-all"
                    title="Search"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}

                <Link
                  to="/chat"
                  className="flex items-center space-x-1.5 text-textSecondary hover:text-brand
                             hover:bg-brand-soft px-3 py-2 rounded-btn text-sm font-medium transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Chats</span>
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
