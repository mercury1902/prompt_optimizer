# Immersive UI/UX Design System

## Design Philosophy

**"Conversational AI, Elevated"**

Tạo experience mượt mà, intuitive, và visually stunning cho ClaudeKit chatbot. Mỗi interaction đều có purpose và delight.

---

## Core Interactions

### 1. Message Stream Animation

**Concept:** Messages flow in like thoughts forming

```typescript
// Message entrance animation variants
const messageVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
    filter: 'blur(4px)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

// Stagger children for conversation flow
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};
```

**Visual:**
```
User: Hello          →  Fade in + slight scale up (0.4s)
                    ↓
AI: (typing)        →  Bouncing dots animation
                    ↓
AI: Hi there!        →  Fade in + blur clear (0.5s)
```

### 2. Streaming Text Effect

**Concept:** Characters appear organically like typing

```typescript
// Character-by-character reveal
const streamingVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.02,
      duration: 0.05
    }
  })
};

// Smooth word-by-word for better performance
const wordVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.1 }
  }
};
```

**Visual:**
```
"Let me help you..."
 L → Le → Let → Let  → ... (smooth cursor follow)
```

### 3. Tool Call Visualization

**Concept:** Tools materialize with satisfying micro-interactions

```typescript
// Tool card entrance
const toolCardVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  }
};

// Status indicator pulse
const pulseVariants = {
  pending: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: { repeat: Infinity, duration: 1.5 }
  },
  running: {
    rotate: [0, 360],
    transition: { repeat: Infinity, duration: 1, ease: 'linear' }
  },
  completed: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.3 }
  }
};
```

**Visual States:**
```
[🔍 web_search]        [🔄 executing...]      [✓ completed]
  ↓ fade in            ↓ spinner rotates     ↓ checkmark pop
  "Searching..."       "Fetching results"    "Found 5 results"
```

### 4. Command Browser Interactions

**Concept:** Browse commands như duyệt app store

```typescript
// Card hover lift effect
const cardHoverVariants = {
  rest: {
    y: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: { duration: 0.2 }
  },
  hover: {
    y: -4,
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    transition: { duration: 0.2 }
  }
};

// Filter tab slide indicator
const tabIndicatorVariants = {
  engineer: { x: 0, width: 80 },
  marketing: { x: 88, width: 90 },
  all: { x: 186, width: 50 },
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 30
  }
};

// Search focus expansion
const searchVariants = {
  collapsed: { width: '100%' },
  focused: { 
    width: '100%',
    scale: 1.02,
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
  }
};
```

**Visual:**
```
┌─────────────────────────────────────┐
│ [All───] [Engineer───] [Marketing] │ ← Sliding underline
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🔍 Search commands...           ││ ← Focus: glow + scale
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ⚡ /ck:cook    ⚡⚡⚡          ││ ← Hover: lift + shadow
│ │                                 ││
│ │ Intelligent feature...          ││
│ │                                 ││
│ │ [implement] [feature] [build]   ││ ← Tags: stagger fade
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Advanced Animations

### 5. Morphing Background

**Concept:** Subtle ambient motion keeps interface alive

```typescript
// Animated gradient background
const gradientVariants = {
  animate: {
    background: [
      'radial-gradient(circle at 0% 0%, #f0f9ff 0%, transparent 50%)',
      'radial-gradient(circle at 100% 0%, #f0f9ff 0%, transparent 50%)',
      'radial-gradient(circle at 100% 100%, #f0f9ff 0%, transparent 50%)',
      'radial-gradient(circle at 0% 100%, #f0f9ff 0%, transparent 50%)',
      'radial-gradient(circle at 0% 0%, #f0f9ff 0%, transparent 50%)'
    ],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Floating particles (decorative)
const particleVariants = {
  animate: (i: number) => ({
    y: [0, -20, 0],
    x: [0, i % 2 === 0 ? 10 : -10, 0],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 4 + i * 0.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  })
};
```

### 6. Smooth Page Transitions

**Concept:** Seamless navigation between views

```typescript
// Page transition wrapper
const pageVariants = {
  initial: { 
    opacity: 0,
    x: 20 
  },
  enter: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
};

// Content reveal
const contentRevealVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};
```

### 7. Micro-interactions

**Concept:** Every action có immediate visual feedback

```typescript
// Button press
const buttonTapVariants = {
  tap: { scale: 0.95 },
  hover: { scale: 1.02 }
};

// Favorite star burst
const starBurstVariants = {
  initial: { scale: 0, rotate: 0 },
  animate: { 
    scale: [0, 1.4, 1],
    rotate: [0, 180, 360],
    transition: { duration: 0.5 }
  }
};

// Copy success ripple
const rippleVariants = {
  initial: { scale: 0, opacity: 1 },
  animate: { 
    scale: 2,
    opacity: 0,
    transition: { duration: 0.4 }
  }
};

// Input focus glow
const inputFocusVariants = {
  focus: {
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
    borderColor: '#3b82f6',
    transition: { duration: 0.2 }
  }
};
```

**Visual Sequence:**
```
Hover    →  Slight scale up (1.02)
Click    →  Press down (0.95) → Release
Success  →  Green flash + checkmark pop
Error    →  Red shake (x: -5, 5, -5, 0)
```

---

## Component-Specific Designs

### Chat Interface

```
┌───────────────────────────────────────────┐
│  ClaudeKit Assistant              [⚙️] [👤]│ ← Header with glassmorphism
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │  👤 What can you help me with?     │  │ ← User: slide from right
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │  🤖                                │  │ ← AI: slide from left
│  │  I can help you with:               │  │
│  │  • Code implementation              │  │
│  │  • Project planning                 │  │
│  │  • Debugging issues                 │  │
│  │                                     │  │
│  │  [🔍 web_search] Searching...     │  │ ← Tool: spring in
│  │                                     │  │
│  │  Here are relevant resources:      │  │
│  │  ↓                                  │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │  ● ● ●  AI is thinking             │  │ ← Typing: bouncing dots
│  └─────────────────────────────────────┘  │
│                                           │
├───────────────────────────────────────────┤
│  [📎] ┌──────────────────────────────┐ [➤]│
│       │  Type your message...        │     │ ← Input: focus glow
│       └──────────────────────────────┘     │
└───────────────────────────────────────────┘
```

### Command Browser

```
┌───────────────────────────────────────────┐
│  🔍 Commands                              │
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ 🔍 Search all commands...           │  │ ← Search: expand on focus
│  └─────────────────────────────────────┘  │
│                                           │
│  [All────] [Engineer────] [Marketing]   │ ← Animated underline
│  ═══════                                  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ ⚡⚡⚡  /ck:cook                  │  │ ← Card: hover lift
│  │ ⚡⚡⚡⚡⚡                         │  │
│  │                                     │  │
│  │ Implement feature [step by step]   │  │
│  │                                     │  │
│  │ [⚡] Implement   [⚡] Feature      │  │ ← Tags
│  │                                     │  │
│  │ ☆              ℹ️  →             │  │ ← Fav + Info
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ 🔧 /ck:fix                        │  │
│  │ ⚡⚡                               │  │
│  │                                     │  │
│  │ Analyze and fix issues            │  │
│  └─────────────────────────────────────┘  │
│                                           │
│         ↓ Pull to refresh               │
└───────────────────────────────────────────┘
```

---

## Dark Mode Considerations

```typescript
// Adaptive animations for dark mode
const adaptiveGlow = {
  light: '0 4px 20px rgba(59, 130, 246, 0.2)',
  dark: '0 4px 20px rgba(59, 130, 246, 0.4)'
};

// Adjusted contrast
const textGlow = {
  light: 'none',
  dark: '0 0 20px rgba(255, 255, 255, 0.1)'
};
```

---

## Performance Guidelines

1. **Use `transform` and `opacity`** - GPU accelerated
2. **`will-change` sparingly** - Only during animation
3. **`prefers-reduced-motion`** - Respect user preferences
4. **Lazy load animations** - Below-fold content
5. **Debounce rapid interactions** - Throttle hover states

```typescript
// Respect reduced motion
const prefersReducedMotion = 
  typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationProps = prefersReducedMotion 
  ? { initial: false, animate: false }
  : { initial: 'hidden', animate: 'visible' };
```

---

## Implementation Priority

| Priority | Interaction | File |
|----------|-------------|------|
| 1 | Message stream animation | `message-list-with-animated-entrance.tsx` |
| 2 | Streaming text effect | `streaming-text-with-character-reveal.tsx` |
| 3 | Tool call visualization | `tool-call-visualizer-with-spring-animation.tsx` |
| 4 | Command card hover | `command-card-with-hover-lift.tsx` |
| 5 | Tab indicator slide | `kit-filter-tabs-with-slide-indicator.tsx` |
| 6 | Micro-interactions | `animated-button-with-feedback.tsx` |
| 7 | Page transitions | `page-transition-wrapper.tsx` |

---

## Cook Command

```bash
/cook D:\project\Clone\ck\claudekit-chatbot-astro\plans\260406-2305-immersive-ui-designs\plan.md --auto
```
