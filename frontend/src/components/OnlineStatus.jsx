import React from 'react';

const OnlineStatus = ({ isOnline, size = 'sm', showText = true }) => {
  const dotSizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-4 h-4' };
  const textSizes = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base' };

  return (
    <div className="flex items-center space-x-1.5">
      <span className={`${dotSizes[size]} rounded-full flex-shrink-0 ${
        isOnline
          ? 'bg-green-500 ring-2 ring-green-100'
          : 'bg-gray-300 ring-2 ring-gray-100'
      }`} />
      {showText && (
        <span className={`${textSizes[size]} font-medium ${
          isOnline ? 'text-green-600' : 'text-gray-400'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
