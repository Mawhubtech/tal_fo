import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm', 
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
};

/**
 * Avatar component that shows profile image or generates initials-based avatar
 */
export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (name: string): string => {
    // Generate consistent color based on name
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const baseClasses = `inline-flex items-center justify-center rounded-full flex-shrink-0 font-medium text-white ${sizeClasses[size]} ${className}`;

  if (src && src !== '') {
    return (
      <img
        src={src}
        alt={`${name}'s profile`}
        className={`${baseClasses} object-cover`}
        onError={(e) => {
          // If image fails to load, replace with initials avatar
          const target = e.target as HTMLImageElement;
          const initialsDiv = document.createElement('div');
          initialsDiv.className = `${baseClasses} ${getBackgroundColor(name)}`;
          initialsDiv.textContent = getInitials(name);
          target.parentNode?.replaceChild(initialsDiv, target);
        }}
      />
    );
  }

  // Fallback to initials-based avatar
  return (
    <div className={`${baseClasses} ${getBackgroundColor(name)}`}>
      {getInitials(name)}
    </div>
  );
};

/**
 * Enhanced Avatar component with LinkedIn integration hint
 */
export const EnhancedAvatar: React.FC<AvatarProps & { 
  linkedIn?: string;
  email?: string; 
}> = ({ 
  src, 
  name, 
  linkedIn, 
  email, 
  size = 'md', 
  className = '' 
}) => {
  // Future enhancement: Could integrate with LinkedIn API or Gravatar
  const getPotentialAvatarSources = () => {
    const sources = [];
    
    if (src) sources.push(src);
    
    // Gravatar integration (if email available)
    if (email && typeof email === 'string' && email.includes('@')) {
      const emailHash = btoa(email.toLowerCase().trim()); // Simple hash for demo
      sources.push(`https://www.gravatar.com/avatar/${emailHash}?d=404&s=200`);
    }
    
    return sources;
  };

  const avatarSources = getPotentialAvatarSources();

  return (
    <div className="relative">
      <Avatar 
        src={avatarSources[0]} 
        name={name} 
        size={size} 
        className={className} 
      />
      
      {/* LinkedIn indicator if available */}
      {linkedIn && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">in</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;