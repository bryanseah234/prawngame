import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-wnrs-red text-white hover:bg-red-700 px-6 py-3 rounded-lg shadow-sm",
    secondary: "bg-gray-200 text-gray-800 dark:bg-wnrs-darkgrey dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-2 rounded-lg",
    icon: "p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-current",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};