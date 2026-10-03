import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'green' | 'purple' | 'coral' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-heading font-semibold transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-2xl cursor-pointer min-h-[44px]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 min-h-[44px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[48px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[52px]',
  };

  const variantStyles = {
    primary:
      'bg-[#08B9EF] text-white hover:bg-[#07a6d7] shadow-[0_4px_14px_rgba(8,185,239,0.3)] active:shadow-none border-b-3 border-[#058db6]',
    secondary:
      'bg-[#164C68] text-white hover:bg-[#113d54] shadow-[0_4px_14px_rgba(22,76,104,0.25)] border-b-3 border-[#0d2e40]',
    green:
      'bg-[#81E850] text-[#164C68] hover:bg-[#72d741] shadow-[0_4px_14px_rgba(129,232,80,0.35)] font-bold border-b-3 border-[#62b936]',
    purple:
      'bg-[#B797F6] text-white hover:bg-[#a682ed] shadow-[0_4px_14px_rgba(183,151,246,0.35)] border-b-3 border-[#956de6]',
    coral:
      'bg-[#FF946F] text-white hover:bg-[#f5835c] shadow-[0_4px_14px_rgba(255,148,111,0.35)] border-b-3 border-[#e07550]',
    outline:
      'bg-white text-[#164C68] border-2 border-[#C9E1ED] hover:border-[#08B9EF] hover:bg-[#EEF8FF] shadow-2xs',
    ghost:
      'bg-transparent text-[#164C68] hover:bg-[#EEF8FF] border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
