import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'full';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = {
    primary: 'bg-black hover:bg-gray-900 text-white focus:ring-gray-500',
    secondary: 'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400',
    outline: 'border-2 border-purple-600 bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800 focus:ring-gray-300',
  };
  
  const sizeClasses = {
    sm: 'text-sm h-9 px-4',
    md: 'text-base h-10 px-5',
    lg: 'text-base h-11 px-6',
    full: 'text-base py-2.5 w-full',
  };
  
  const disabledClasses = disabled 
    ? 'opacity-60 cursor-not-allowed' 
    : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} whitespace-nowrap
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
