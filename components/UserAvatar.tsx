
import React from 'react';
import { generateColorFromId } from './IdentityWidget';

interface UserAvatarProps {
  userId: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ userId, className = '' }) => {
  const bgColor = generateColorFromId(userId);

  return (
    <div 
      className={`relative border border-[#1D2025] dark:border-white flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor, width: '32px', height: '32px' }}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#1D2025]/90"
      >
        {/* Ghost Body (3 legs) */}
        <path 
            d="M12 2C7 2 3 6 3 11V21C3 21.55 3.45 22 4 22C4.28 22 4.53 21.89 4.71 21.71L7 19.41L9.29 21.71C9.48 21.89 9.73 22 10 22C10.27 22 10.52 21.89 10.71 21.71L13 19.41L15.29 21.71C15.48 21.89 15.73 22 16 22C16.27 22 16.52 21.89 16.71 21.71L19 19.41L21.29 21.71C21.48 21.89 21.73 22 22 22C22.55 22 23 21.55 23 21V11C23 6 19 2 12 2Z" 
            fill="currentColor"
        />
        {/* Eyes */}
        <circle cx="8.5" cy="10" r="2.5" fill="white" />
        <circle cx="15.5" cy="10" r="2.5" fill="white" />
        <circle cx="9.5" cy="10" r="1.2" fill="#1D2025" />
        <circle cx="16.5" cy="10" r="1.2" fill="#1D2025" />
      </svg>
    </div>
  );
};
