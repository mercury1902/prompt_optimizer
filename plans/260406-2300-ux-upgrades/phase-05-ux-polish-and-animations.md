---
phase: 5
title: UX Polish and Animations
priority: low
esteffort: 2h
blockedBy: [phase-04-favorites-and-recent-commands]
---

# Phase 5: UX Polish & Animations

## Context

Hoàn thiện UX với animations, transitions, và các improvements cuối cùng dựa trên research findings.

## Key Insights from Research

1. **Animation Patterns**:
   - Smooth transitions (200-300ms)
   - Fade in/out cho modals
   - Slide cho sidebars
   - Scale cho buttons
   - Stagger cho lists

2. **Loading States**:
   - Skeleton screens
   - Shimmer effects
   - Progress indicators
   - Typing indicators (đã có, cần enhance)

3. **Micro-interactions**:
   - Button hover states
   - Copy feedback
   - Favorite toggle animation
   - Toast notifications

## Files to Create

1. `src/components/skeleton-loader-for-command-cards.tsx`
2. `src/components/animated-modal-with-fade-and-scale.tsx`
3. `src/components/toast-notification-system.tsx`
4. `src/lib/animation-variants-for-framer-motion.ts`

## Implementation Steps

### Step 1: Animation Variants
```typescript
// src/lib/animation-variants-for-framer-motion.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};
```

### Step 2: Skeleton Loader
```typescript
// src/components/skeleton-loader-for-command-cards.tsx
export function CommandCardSkeleton() {
  return (
    <div className="p-4 border rounded-xl space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-full w-14" />
      </div>
    </div>
  );
}

export function CommandListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CommandCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### Step 3: Toast Notification System
```typescript
// src/components/toast-notification-system.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
    
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 3000);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };
  
  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };
  
  const Icon = icons[toast.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px]',
        colors[toast.type]
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1">{toast.message}</span>
      <button onClick={onClose}>
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
```

### Step 4: Enhanced Typing Indicator
```typescript
// src/components/enhanced-typing-indicator-with-dots-animation.tsx
export function EnhancedTypingIndicator() {
  return (
    <div className="flex items-center gap-1 text-gray-500">
      <span className="text-sm">AI is thinking</span>
      <span className="flex gap-0.5">
        <motion.span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
      </span>
    </div>
  );
}
```

## Implementation Checklist

- [ ] Add Framer Motion animations cho modals
- [ ] Skeleton loaders cho loading states
- [ ] Toast notifications cho user feedback
- [ ] Enhanced typing indicator với bouncing dots
- [ ] Hover states cho tất cả interactive elements
- [ ] Smooth page transitions
- [ ] Stagger animations cho lists

## Testing

- [ ] Animations không gây lag
- [ ] Reduced motion preferences respected
- [ ] Loading states hiển thị đúng
- [ ] Toasts auto-dismiss và manual dismiss đều work

## Success Criteria

- [ ] Tất cả interactions có smooth transitions
- [ ] Loading states với skeleton screens
- [ ] Toast system functional
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No visual glitches

## Cook Command

```bash
/cook D:\project\Clone\ck\claudekit-chatbot-astro\plans\260406-2300-ux-upgrades\phase-05-ux-polish-and-animations.md --auto
```
