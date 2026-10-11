import React from 'react';
import { useNavigate } from 'react-router-dom';
import OnlineStatus from './OnlineStatus';

const getAvatarUrl = (fullName, username) => {
  const name = fullName || username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5E9&color=fff&bold=true&size=128`;
};

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate(`/chat?userId=${user.id}`);
  };

  return (
    <div
      onClick={handleStartChat}
      className="chat-card p-4 flex items-center justify-between space-x-4
                 hover:shadow-float hover:-translate-y-px transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center space-x-4 min-w-0">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={user.avatarUrl || getAvatarUrl(user.fullName, user.username)}
            alt={user.fullName || user.username}
            className="w-12 h-12 rounded-full object-cover border-2 border-brand-light"
            onError={(e) => { e.target.src = getAvatarUrl(user.fullName, user.username); }}
          />
          {/* Online dot */}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                            ${user.isOnline ? 'bg-success' : 'bg-gray-300'}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-0.5">
            <h3 className="text-sm font-semibold text-msg-charcoal truncate">
              {user.fullName || user.username}
            </h3>
            <OnlineStatus isOnline={user.isOnline} size="xs" showText={false} />
          </div>
          <p className="text-xs text-brand font-medium">@{user.username}</p>
          {user.bio && (
            <p className="text-xs text-textSecondary mt-1 truncate">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Message action button */}
      <button
        type="button"
        className="px-3 py-1.5 rounded-btn bg-brand-light text-brand text-xs font-semibold
                   group-hover:bg-brand group-hover:text-white transition-colors flex-shrink-0 flex items-center space-x-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Chat</span>
      </button>
    </div>
  );
};

export default UserCard;
