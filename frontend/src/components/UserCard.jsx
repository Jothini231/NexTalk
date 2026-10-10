import React from 'react';
import OnlineStatus from './OnlineStatus';

const getAvatarUrl = (fullName, username) => {
  const name = fullName || username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5E9&color=fff&bold=true&size=128`;
};

const UserCard = ({ user }) => {
  return (
    <div className="chat-card p-4 flex items-center space-x-4
                    hover:shadow-float hover:-translate-y-px transition-all duration-200 cursor-pointer">
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
                          ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-sm font-semibold text-msg-charcoal truncate">
            {user.fullName || user.username}
          </h3>
          <OnlineStatus isOnline={user.isOnline} size="xs" showText={false} />
        </div>
        <p className="text-xs text-brand font-medium">@{user.username}</p>
        {user.bio && (
          <p className="text-xs text-gray-400 mt-1 truncate">{user.bio}</p>
        )}
      </div>
    </div>
  );
};

export default UserCard;
