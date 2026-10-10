import React from 'react';

export const Logo = ({ className = "w-8 h-8", bubbleSize = 24 }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Secondary chat bubble (upper right) */}
    <path
      d="M17 26C17 18.268 23.268 12 31 12C38.732 12 45 18.268 45 26C45 33.732 38.732 40 31 40C27.9739 40 25.1702 39.0398 22.8715 37.4052L15 39L17.3915 32.6252C17.1352 30.5408 17 28.3228 17 26Z"
      fill="#38BDF8"
      fillOpacity="0.85"
    />
    {/* Primary chat bubble (front left) */}
    <path
      d="M3 18C3 10.268 9.26801 4 17 4C24.732 4 31 10.268 31 18C31 25.732 24.732 32 17 32C13.9739 32 11.1702 31.0398 8.87153 29.4052L1 31L3.39148 24.6252C3.13521 22.5408 3 20.3228 3 18Z"
      fill="#0EA5E9"
    />
    {/* Connection indicator dots */}
    <circle cx="12" cy="18" r="1.75" fill="#FFFFFF" />
    <circle cx="17" cy="18" r="1.75" fill="#FFFFFF" />
    <circle cx="22" cy="18" r="1.75" fill="#FFFFFF" />
  </svg>
);

export default Logo;
