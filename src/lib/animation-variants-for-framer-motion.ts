import type { Variants } from "framer-motion";

/**
 * Fade in from bottom animation variants
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Simple fade in/out animation variants
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Scale in animation for modals/popovers
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/**
 * Slide in from right for sidebars/drawers
 */
export const slideInRight: Variants = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
};

/**
 * Slide in from left for sidebars/drawers
 */
export const slideInLeft: Variants = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
};

/**
 * Container variant for staggering children animations
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

/**
 * Stagger item for use within stagger container
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

/**
 * Spring transition preset for smooth animations
 */
export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/**
 * Smooth transition preset for general use
 */
export const smoothTransition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * Bounce transition for playful interactions
 */
export const bounceTransition = {
  type: "spring",
  stiffness: 400,
  damping: 10,
};

/**
 * Toast slide up animation
 */
export const toastSlideUp: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

/**
 * Skeleton shimmer animation
 */
export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
};

/**
 * Pulse animation for loading dots
 */
export const pulseDot = (delay: number) => ({
  y: [0, -4, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    delay,
  },
});
