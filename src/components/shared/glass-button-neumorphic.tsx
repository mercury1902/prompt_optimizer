import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  glow = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: `
      bg-white/10 backdrop-blur-sm border border-white/20
      hover:bg-white/15 hover:border-white/30
      active:bg-white/5
      shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]
    `,
    primary: `
      bg-gradient-to-br from-[rgba(245,166,35,0.3)] to-[rgba(245,166,35,0.1)]
      backdrop-blur-sm border border-[rgba(245,166,35,0.4)]
      hover:from-[rgba(245,166,35,0.4)] hover:to-[rgba(245,166,35,0.2)]
      hover:border-[rgba(245,166,35,0.5)]
      active:opacity-90
      shadow-[0_4px_20px_rgba(245,166,35,0.2)]
    `,
    ghost: `
      bg-transparent border border-transparent
      hover:bg-white/5 hover:border-white/10
      active:bg-white/10
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl',
  };

  const glowClass = glow
    ? 'shadow-[0_0_30px_rgba(245,166,35,0.3)] hover:shadow-[0_0_40px_rgba(245,166,35,0.4)]'
    : '';

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${glowClass}
        text-white font-medium
        transition-all duration-150 ease-out
        hover:-translate-y-0.5
        active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
