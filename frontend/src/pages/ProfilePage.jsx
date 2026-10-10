import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import OnlineStatus from '../components/OnlineStatus';
import api from '../api/axios';

const getAvatarUrl = (fullName, username) => {
  const name = fullName || username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5E9&color=fff&bold=true&size=128`;
};

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'Never';
  const diff = Math.floor((Date.now() - new Date(lastSeen)) / 60000);
  if (diff < 1)  return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24)   return `${h}h ago`;
  return new Date(lastSeen).toLocaleDateString();
};

const ProfilePage = () => {
  const { user, fetchCurrentUser, updateUserState } = useAuth();
  const [isEditing, setIsEditing]   = useState(false);
  const [editData, setEditData]     = useState({ fullName: '', bio: '' });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  useEffect(() => { fetchCurrentUser(); }, []);
  useEffect(() => {
    if (user) setEditData({ fullName: user.fullName || '', bio: user.bio || '' });
  }, [user]);

  const handleSave = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.put('/users/profile', editData);
      updateUserState({ ...user, ...res.data });
      setIsEditing(false);
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-light border-t-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Profile Card */}
        <div className="chat-card overflow-hidden">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600" />

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-10 mb-5">
              <div className="relative">
                <img
                  src={user.avatarUrl || getAvatarUrl(user.fullName, user.username)}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-card border-4 border-white shadow-card object-cover"
                  onError={(e) => { e.target.src = getAvatarUrl(user.fullName, user.username); }}
                />
                <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white
                                  ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>

              {/* Action buttons */}
              {!isEditing ? (
                <button onClick={() => { setIsEditing(true); setError(''); setSuccess(''); }}
                  className="btn-primary text-sm">
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button onClick={() => { setIsEditing(false); setEditData({ fullName: user.fullName || '', bio: user.bio || '' }); }}
                    className="btn-secondary text-sm">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={loading} className="btn-primary text-sm">
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Alerts */}
            {success && (
              <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-100 rounded-btn">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-100 rounded-btn">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* View / Edit */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-msg-charcoal mb-1.5">Full Name</label>
                  <input type="text" value={editData.fullName}
                    onChange={(e) => setEditData(p => ({ ...p, fullName: e.target.value }))}
                    className="chat-input" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-msg-charcoal mb-1.5">Bio</label>
                  <textarea value={editData.bio}
                    onChange={(e) => setEditData(p => ({ ...p, bio: e.target.value }))}
                    className="chat-input resize-none" rows={3} maxLength={500}
                    placeholder="Tell us about yourself…" />
                  <p className="text-xs text-gray-300 mt-1 text-right">{editData.bio.length}/500</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-xl font-bold text-msg-charcoal">{user.fullName || user.username}</h1>
                  <OnlineStatus isOnline={user.isOnline} size="xs" />
                </div>
                <p className="text-brand text-sm font-medium mb-1">@{user.username}</p>
                <p className="text-gray-400 text-sm mb-3">{user.email}</p>
                {user.bio && <p className="text-msg-charcoal text-sm">{user.bio}</p>}
                {!user.isOnline && user.lastSeen && (
                  <p className="text-gray-300 text-xs mt-2">Last seen {formatLastSeen(user.lastSeen)}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="capsule-card text-center">
            <p className="text-2xl font-bold text-brand">0</p>
            <p className="text-gray-400 text-sm mt-0.5">Conversations</p>
          </div>
          <div className="capsule-card text-center">
            <p className="text-base font-bold text-brand">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : '—'}
            </p>
            <p className="text-gray-400 text-sm mt-0.5">Member Since</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
