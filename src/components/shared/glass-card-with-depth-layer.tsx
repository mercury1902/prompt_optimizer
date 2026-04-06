import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  depth?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  hover?: boolean;
  animated?: boolean;
  glow?: 'none' | 'subtle' | 'strong';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  depth = 2,
  className = '',
  hover = true,
  animated = false,
  glow = 'none',
}) => {
  const depthClasses = {
    1: 'bg-[rgba(255,255,255,0.03)] backdrop-blur-sm',
    2: 'bg-[rgba(255,255,255,0.06)] backdrop-blur-md',
    3: 'bg-[rgba(255,255,255,0.10)] backdrop-blur-lg',
    4: 'bg-[rgba(255,255,255,0.15)] backdrop-blur-xl',
    5: 'bg-[rgba(255,255,255,0.20)] backdrop-blur-2xl',
  };

  const glowClasses = {
    none: '',
    subtle: 'shadow-[0_0_40px_rgba(245,166,35,0.1)]',
    strong: 'shadow-[0_0_60px_rgba(245,166,35,0.2)]',
  };

  return (
    <div
      className={`
        ${depthClasses[depth]}
        border border-white/10 rounded-2xl
        ${hover ? 'hover:bg-[rgba(255,255,255,0.10)] hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]' : ''}
        ${glowClasses[glow]}
        ${animated ? 'transition-all duration-300 ease-out' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
