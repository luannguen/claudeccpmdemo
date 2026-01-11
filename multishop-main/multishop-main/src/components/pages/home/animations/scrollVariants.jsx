/**
 * Scroll Animation Variants
 * 
 * Framer Motion variants cho các elements trong frames
 */

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Fade up animation cho items
export const fadeUp = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Scale in animation cho badges
export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Slide từ trái
export const slideLeft = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Slide từ phải
export const slideRight = {
  hidden: { 
    opacity: 0, 
    x: 50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// CTA button glow effect
export const ctaGlow = {
  initial: {
    boxShadow: "0 0 0 0 rgba(124, 179, 66, 0)"
  },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(124, 179, 66, 0.4)",
      "0 0 0 15px rgba(124, 179, 66, 0)",
      "0 0 0 0 rgba(124, 179, 66, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Reduced motion variants (simple fades only)
export const reducedMotion = {
  fadeOnly: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }
};

// Icon float animation
export const iconFloat = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Trust badge pulse
export const badgePulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default {
  staggerContainer,
  fadeUp,
  scaleIn,
  slideLeft,
  slideRight,
  ctaGlow,
  reducedMotion,
  iconFloat,
  badgePulse
};