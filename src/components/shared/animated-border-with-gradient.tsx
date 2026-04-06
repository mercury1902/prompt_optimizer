import React from 'react';

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  className = '',
  intensity = 'medium',
}) => {
  const intensityClasses = {
    subtle: 'before:p-[1px] before:opacity-50',
    medium: 'before:p-[1px] before:opacity-100',
    strong: 'before:p-[2px] before:opacity-100',
  };

  return (
    <div
      className={`
        relative rounded-2xl
        before:absolute before:inset-0 before:rounded-2xl
        before:bg-gradient-to-r before:from-[rgba(245,166,35,0.5)] before:via-[rgba(147,51,234,0.3)] before:to-[rgba(59,130,246,0.5)]
        before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
        before:[mask-composite:exclude]
        before:animate-[hueRotate_4s_linear_infinite]
        ${intensityClasses[intensity]}
        ${className}
      `}
      style={{
        ['--tw-content' as string]: '""',
      }}
    >
      <style>{`
        @keyframes hueRotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
      <div className="relative z-10 rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};
