import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

interface FavoriteButtonWithToggleAnimationProps {
  commandId: string;
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const buttonSizes = {
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
};

export function FavoriteButtonWithToggleAnimation({
  commandId,
  isFavorite,
  onToggle,
  size = 'md',
  className,
}: FavoriteButtonWithToggleAnimationProps): JSX.Element {
  return (
    <motion.button
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'rounded-full transition-colors duration-200',
        isFavorite
          ? 'text-yellow-500 hover:bg-yellow-100'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
        buttonSizes[size],
        className
      )}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      whileTap={{ scale: 0.85 }}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
    >
      <motion.div
        animate={{
          scale: isFavorite ? [1, 1.3, 1] : 1,
          rotate: isFavorite ? [0, 15, -15, 0] : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Star
          className={cn(
            sizeClasses[size],
            'transition-all duration-200',
            isFavorite && 'fill-current'
          )}
        />
      </motion.div>
    </motion.button>
  );
}
