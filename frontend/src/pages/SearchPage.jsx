import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import UserCard from '../components/UserCard';

const SearchPage = () => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState('');

  const searchUsers = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setError('');
    try {
      const res = await api.get(`/users/search?query=${encodeURIComponent(q)}`);
      setResults(res.data);
      setSearched(true);
    } catch {
      setError('Failed to search users. Please try again.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(t);
  }, [query, searchUsers]);

  return (
    <div className="min-h-screen bg-app-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-msg-charcoal">Find People</h1>
          <p className="text-textSecondary text-sm mt-1">Search for friends and colleagues on NexTalk</p>
        </div>

        {/* Search box */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          <input
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="chat-input pl-11 shadow-soft"
            placeholder="Search by username or full name…"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500">
              ✕
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-btn">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          results.length > 0 ? (
            <>
              <p className="text-xs text-gray-400 mb-3">
                <span className="font-semibold text-brand">{results.length}</span>{' '}
                user{results.length !== 1 ? 's' : ''} found
              </p>
              <div className="space-y-3">
                {results.map(u => <UserCard key={u.id} user={u} />)}
              </div>
            </>
          ) : (
            <div className="chat-card p-12 text-center">
              <div className="w-14 h-14 bg-brand-soft rounded-card flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                       M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                       m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-msg-charcoal font-semibold">No users found</h3>
              <p className="text-gray-400 text-sm mt-1">Try a different name or username</p>
            </div>
          )
        )}

        {/* Empty state */}
        {!searched && !loading && (
          <div className="capsule-card p-12 text-center">
            <div className="w-16 h-16 bg-white rounded-card flex items-center justify-center mx-auto mb-4 shadow-soft">
              <svg className="h-8 w-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-msg-charcoal font-semibold text-base">Search for users</h3>
            <p className="text-gray-400 text-sm mt-1">Type a name or username above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
