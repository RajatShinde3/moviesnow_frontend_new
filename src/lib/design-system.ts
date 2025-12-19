/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🎨 MOVIESNOW DESIGN SYSTEM
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * A cinematic, premium design system inspired by:
 * - Netflix's dark, immersive aesthetic
 * - Crunchyroll's vibrant anime energy
 * - Apple TV+'s refined elegance
 * - Animesuge's content-first layout
 *
 * Philosophy:
 * • Dark-first for cinematic immersion
 * • High contrast for accessibility
 * • Neon accents for energy
 * • Smooth animations for delight
 * • Content is king
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 COLOR PALETTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const colors = {
  // Background layers (dark, cinematic)
  bg: {
    primary: '#0a0a0f',      // Near-black base
    secondary: '#12121a',    // Elevated surfaces
    tertiary: '#1a1a26',     // Card backgrounds
    elevated: '#222232',     // Hover states
    glass: 'rgba(18, 18, 26, 0.7)',  // Glassmorphism
  },

  // Accent colors (vibrant, energetic)
  accent: {
    primary: '#ff0080',      // Hot pink/magenta (CTA)
    secondary: '#00d9ff',    // Cyan (highlights)
    tertiary: '#b829ff',     // Purple (premium)
    success: '#00ff88',      // Green (success states)
    warning: '#ffd000',      // Yellow (warnings)
    error: '#ff4444',        // Red (errors)
  },

  // Text hierarchy
  text: {
    primary: '#ffffff',      // High emphasis
    secondary: '#b3b3b3',    // Medium emphasis
    tertiary: '#737373',     // Low emphasis
    disabled: '#4d4d4d',     // Disabled state
    inverse: '#0a0a0f',      // On light backgrounds
  },

  // Semantic colors
  quality: {
    '1080p': '#ff0080',      // Premium quality
    '720p': '#00d9ff',       // Standard HD
    '480p': '#b3b3b3',       // SD
    '4k': '#ffd000',         // Ultra HD (future)
  },

  // Content type colors
  type: {
    movie: '#ff0080',
    series: '#00d9ff',
    anime: '#b829ff',
    documentary: '#00ff88',
  },

  // Gradients (for backgrounds, overlays)
  gradient: {
    hero: 'linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.8) 60%, #0a0a0f 100%)',
    card: 'linear-gradient(135deg, rgba(255, 0, 128, 0.1) 0%, rgba(0, 217, 255, 0.1) 100%)',
    premium: 'linear-gradient(135deg, #ff0080 0%, #b829ff 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  },

  // Border colors
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.2)',
    focus: 'rgba(255, 0, 128, 0.5)',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📐 SPACING SYSTEM (8px base)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔤 TYPOGRAPHY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const typography = {
  // Font families
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
  },

  // Font sizes (fluid, responsive)
  size: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
  },

  // Font weights
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  // Line heights
  leading: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 ANIMATION PRESETS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const animation = {
  // Durations
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
  },

  // Easing curves
  easing: {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    spring: [0.68, -0.55, 0.265, 1.55],
  },

  // Framer Motion variants
  variants: {
    // Fade in
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    // Slide up
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },

    // Scale
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },

    // Hover lift
    hoverLift: {
      initial: { y: 0 },
      whileHover: { y: -8, transition: { duration: 0.2 } },
    },

    // Stagger children
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📏 BREAKPOINTS (Mobile-first)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const breakpoints = {
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet portrait
  lg: 1024,  // Tablet landscape / Small desktop
  xl: 1280,  // Desktop
  '2xl': 1536, // Large desktop
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 Z-INDEX LAYERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 SHADOWS (Soft, cinematic)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
  glow: {
    pink: '0 0 20px rgba(255, 0, 128, 0.5)',
    cyan: '0 0 20px rgba(0, 217, 255, 0.5)',
    purple: '0 0 20px rgba(184, 41, 255, 0.5)',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📐 CONTENT CARD DIMENSIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const cardDimensions = {
  // Poster aspect ratio (2:3)
  poster: {
    width: {
      sm: 140,  // Mobile
      md: 180,  // Tablet
      lg: 220,  // Desktop
    },
    aspectRatio: '2/3',
  },

  // Landscape aspect ratio (16:9)
  landscape: {
    width: {
      sm: 200,  // Mobile
      md: 280,  // Tablet
      lg: 340,  // Desktop
    },
    aspectRatio: '16/9',
  },

  // Hero banner
  hero: {
    minHeight: {
      sm: '400px',
      md: '500px',
      lg: '600px',
      xl: '70vh',
    },
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Generate glassmorphism styles
 */
export function glassmorph(opacity = 0.7, blur = 10) {
  return {
    background: `rgba(18, 18, 26, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid ${colors.border.default}`,
  };
}

/**
 * Generate quality badge color
 */
export function qualityColor(quality: '480p' | '720p' | '1080p' | '4k') {
  return colors.quality[quality] || colors.text.secondary;
}

/**
 * Generate content type color
 */
export function typeColor(type: 'movie' | 'series' | 'anime' | 'documentary') {
  return colors.type[type] || colors.accent.primary;
}

/**
 * Responsive value helper
 */
export function responsive<T>(values: { sm?: T; md?: T; lg?: T; xl?: T }) {
  return values;
}

/**
 * Media query helper
 */
export function mediaQuery(breakpoint: keyof typeof breakpoints) {
  return `@media (min-width: ${breakpoints[breakpoint]}px)`;
}
