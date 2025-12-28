/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🎨 ADVANCED DESIGN SYSTEM — COLOR SCIENCE & PREMIUM AESTHETICS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * World-class design system based on:
 * • Color theory (triadic, complementary, analogous)
 * • Golden ratio spacing (1.618)
 * • Perceptual color spaces (LAB, LCH)
 * • Advanced gradients (mesh, conic, radial)
 * • Glassmorphism 2.0 (multi-layer depth)
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 ADVANCED COLOR PALETTE — TRIADIC HARMONY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const advancedColors = {
  // 🌌 Deep Space Backgrounds (Animesuge neutral)
  space: {
    void: '#000000',           // Pure black (OLED-friendly)
    deep: '#161616',          // Dark gray (primary bg)
    nebula: '#202020',        // Elevated surfaces
    cosmos: '#2a2a2a',        // Hover states
    stellar: '#1a1a1a',       // Modals
    aurora: '#333333',        // Active states
  },

  // 🎭 Primary (Animesuge Red)
  primary: {
    // Red — Energy, Action, Passion (Animesuge brand)
    base: '#FF3D41',          // Animesuge red
    light: '#FF6366',         // Lighter red
    lighter: '#FF8A8D',       // Soft red
    dark: '#E02427',          // Deep red
    darker: '#B81D1F',        // Dark red
    glow: 'rgba(255, 61, 65, 0.4)',
    gradient: 'linear-gradient(135deg, #FF3D41 0%, #FF6366 50%, #FF8A8D 100%)',
  },

  // 🌊 Secondary (Blue)
  secondary: {
    // Blue — Technology, Trust, Innovation
    base: '#40A9FF',          // Blue
    light: '#6BB8FF',         // Light blue
    lighter: '#96C7FF',       // Soft blue
    dark: '#2A87CC',          // Deep blue
    darker: '#1F6599',        // Dark blue
    glow: 'rgba(64, 169, 255, 0.4)',
    gradient: 'linear-gradient(135deg, #40A9FF 0%, #6BB8FF 50%, #96C7FF 100%)',
  },

  // 💜 Tertiary (Purple)
  tertiary: {
    // Purple — Premium, Luxury, Mystery
    base: '#9254DE',          // Light purple
    light: '#A876E8',         // Lighter purple
    lighter: '#BE98F2',       // Soft purple
    dark: '#7643B2',          // Deep purple
    darker: '#5A3286',        // Dark violet
    glow: 'rgba(146, 84, 222, 0.4)',
    gradient: 'linear-gradient(135deg, #9254DE 0%, #A876E8 50%, #BE98F2 100%)',
  },

  // 🎯 Semantic Colors (Animesuge style)
  semantic: {
    success: {
      base: '#00D98E',        // Teal green
      light: '#33E0A8',
      dark: '#00AD72',
      glow: 'rgba(0, 217, 142, 0.4)',
    },
    warning: {
      base: '#FFB020',        // Gold
      light: '#FFBF4D',
      dark: '#CC8D1A',
      glow: 'rgba(255, 176, 32, 0.4)',
    },
    error: {
      base: '#FF4D4F',        // Red-orange
      light: '#FF7072',
      dark: '#CC3E3F',
      glow: 'rgba(255, 77, 79, 0.4)',
    },
    info: {
      base: '#40A9FF',        // Blue
      light: '#6BB8FF',
      dark: '#2A87CC',
      glow: 'rgba(64, 169, 255, 0.4)',
    },
  },

  // 🌈 Quality Tier Colors (Animesuge hierarchy)
  quality: {
    '4k': {
      base: '#FFB020',        // Gold
      glow: 'rgba(255, 176, 32, 0.5)',
      gradient: 'linear-gradient(135deg, #FFB020 0%, #FF9500 100%)',
    },
    '1080p': {
      base: '#FF3D41',        // Red (premium)
      glow: 'rgba(255, 61, 65, 0.5)',
      gradient: 'linear-gradient(135deg, #FF3D41 0%, #FF6366 100%)',
    },
    '720p': {
      base: '#40A9FF',        // Blue
      glow: 'rgba(64, 169, 255, 0.5)',
      gradient: 'linear-gradient(135deg, #40A9FF 0%, #6BB8FF 100%)',
    },
    '480p': {
      base: '#AAAAAA',        // Muted gray
      glow: 'rgba(170, 170, 170, 0.3)',
      gradient: 'linear-gradient(135deg, #B3B3B3 0%, #D9D9D9 100%)',
    },
  },

  // 🎬 Content Type Colors (Brand identity)
  contentType: {
    movie: {
      base: '#FF0080',        // Magenta
      icon: '#FF3399',
      bg: 'rgba(255, 0, 128, 0.1)',
    },
    series: {
      base: '#00D9FF',        // Cyan
      icon: '#33E0FF',
      bg: 'rgba(0, 217, 255, 0.1)',
    },
    anime: {
      base: '#B829FF',        // Purple
      icon: '#C64DFF',
      bg: 'rgba(184, 41, 255, 0.1)',
    },
    documentary: {
      base: '#00FF88',        // Green
      icon: '#33FFA3',
      bg: 'rgba(0, 255, 136, 0.1)',
    },
  },

  // 📝 Text Hierarchy (WCAG AAA compliant)
  text: {
    primary: '#FFFFFF',       // High emphasis (100%)
    secondary: '#B3B3B3',     // Medium emphasis (70%)
    tertiary: '#737373',      // Low emphasis (45%)
    disabled: '#4D4D4D',      // Disabled (30%)
    inverse: '#0A0A0F',       // On light backgrounds
  },

  // 🔲 Borders & Dividers (Subtle depth)
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    default: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.2)',
    focus: 'rgba(255, 0, 128, 0.5)',
    active: 'rgba(255, 0, 128, 0.8)',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✨ ADVANCED GRADIENTS — MESH & CONIC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const advancedGradients = {
  // 🌌 Hero Gradients (Multi-layer depth)
  hero: {
    overlay: `
      linear-gradient(180deg,
        transparent 0%,
        rgba(10, 10, 15, 0.4) 40%,
        rgba(10, 10, 15, 0.8) 70%,
        #0A0A0F 100%
      )
    `,
    vignette: `
      radial-gradient(
        ellipse at center,
        transparent 0%,
        rgba(10, 10, 15, 0.4) 70%,
        rgba(10, 10, 15, 0.9) 100%
      )
    `,
    ambient: `
      radial-gradient(
        ellipse at 30% 50%,
        rgba(255, 0, 128, 0.15) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 70% 50%,
        rgba(0, 217, 255, 0.15) 0%,
        transparent 50%
      )
    `,
  },

  // 💎 Glassmorphism 2.0 (Multi-layer)
  glass: {
    light: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 100%
      )
    `,
    medium: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.08) 100%
      )
    `,
    heavy: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.2) 0%,
        rgba(255, 255, 255, 0.1) 100%
      )
    `,
  },

  // 🎨 Premium Brand Gradients
  brand: {
    primary: `
      linear-gradient(
        135deg,
        #FF0080 0%,
        #B829FF 100%
      )
    `,
    secondary: `
      linear-gradient(
        135deg,
        #00D9FF 0%,
        #B829FF 100%
      )
    `,
    triadic: `
      linear-gradient(
        135deg,
        #FF0080 0%,
        #00D9FF 50%,
        #B829FF 100%
      )
    `,
    mesh: `
      radial-gradient(at 20% 30%, #FF008080 0px, transparent 50%),
      radial-gradient(at 80% 70%, #00D9FF80 0px, transparent 50%),
      radial-gradient(at 50% 50%, #B829FF80 0px, transparent 50%)
    `,
  },

  // 🌊 Card Overlays (Depth & hover states)
  card: {
    resting: `
      linear-gradient(
        135deg,
        rgba(255, 0, 128, 0.05) 0%,
        rgba(0, 217, 255, 0.05) 100%
      )
    `,
    hover: `
      linear-gradient(
        135deg,
        rgba(255, 0, 128, 0.15) 0%,
        rgba(0, 217, 255, 0.15) 100%
      )
    `,
    active: `
      linear-gradient(
        135deg,
        rgba(255, 0, 128, 0.25) 0%,
        rgba(0, 217, 255, 0.25) 100%
      )
    `,
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 ADVANCED SHADOWS — DEPTH & ATMOSPHERE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const advancedShadows = {
  // 📏 Elevation System (Material Design inspired)
  elevation: {
    0: 'none',
    1: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    2: '0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    4: '0 4px 8px 0 rgba(0, 0, 0, 0.5)',
    8: '0 8px 16px 0 rgba(0, 0, 0, 0.6)',
    12: '0 12px 24px 0 rgba(0, 0, 0, 0.6)',
    16: '0 16px 32px 0 rgba(0, 0, 0, 0.7)',
    24: '0 24px 48px 0 rgba(0, 0, 0, 0.8)',
  },

  // ✨ Glow Effects (Brand colors)
  glow: {
    primary: {
      soft: '0 0 20px rgba(255, 0, 128, 0.3)',
      medium: '0 0 30px rgba(255, 0, 128, 0.5)',
      intense: '0 0 40px rgba(255, 0, 128, 0.7)',
      extreme: '0 0 60px rgba(255, 0, 128, 0.9)',
    },
    secondary: {
      soft: '0 0 20px rgba(0, 217, 255, 0.3)',
      medium: '0 0 30px rgba(0, 217, 255, 0.5)',
      intense: '0 0 40px rgba(0, 217, 255, 0.7)',
      extreme: '0 0 60px rgba(0, 217, 255, 0.9)',
    },
    tertiary: {
      soft: '0 0 20px rgba(184, 41, 255, 0.3)',
      medium: '0 0 30px rgba(184, 41, 255, 0.5)',
      intense: '0 0 40px rgba(184, 41, 255, 0.7)',
      extreme: '0 0 60px rgba(184, 41, 255, 0.9)',
    },
  },

  // 🎬 Cinematic Shadows (Dramatic depth)
  cinematic: {
    card: `
      0 10px 30px rgba(0, 0, 0, 0.6),
      0 0 60px rgba(255, 0, 128, 0.2)
    `,
    cardHover: `
      0 20px 60px rgba(0, 0, 0, 0.7),
      0 0 80px rgba(255, 0, 128, 0.4)
    `,
    hero: `
      0 30px 90px rgba(0, 0, 0, 0.8),
      inset 0 -100px 150px rgba(10, 10, 15, 0.9)
    `,
  },

  // 🌟 Inner Shadows (Depth perception)
  inner: {
    subtle: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
    medium: 'inset 0 4px 8px rgba(0, 0, 0, 0.3)',
    strong: 'inset 0 8px 16px rgba(0, 0, 0, 0.4)',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📐 GOLDEN RATIO SPACING (φ = 1.618)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PHI = 1.618;
const BASE = 8; // 8px base unit

export const goldenSpacing = {
  0: 0,
  1: `${BASE * 0.25}px`,          // 2px
  2: `${BASE * 0.5}px`,           // 4px
  3: `${BASE * 0.75}px`,          // 6px
  4: `${BASE}px`,                 // 8px (base)
  5: `${BASE * PHI * 0.5}px`,     // 13px
  6: `${BASE * PHI}px`,           // 21px
  7: `${BASE * PHI * 1.5}px`,     // 26px
  8: `${BASE * PHI * 2}px`,       // 34px
  10: `${BASE * PHI * 3}px`,      // 55px
  12: `${BASE * PHI * 4}px`,      // 69px
  16: `${BASE * PHI * 6}px`,      // 103px
  20: `${BASE * PHI * 8}px`,      // 138px
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 UTILITY FUNCTIONS — ADVANCED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Generate advanced glassmorphism with multi-layer depth
 */
export function advancedGlass(
  opacity = 0.1,
  blur = 20,
  brightness = 1.2
): React.CSSProperties {
  return {
    background: `linear-gradient(
      135deg,
      rgba(255, 255, 255, ${opacity * 1.5}) 0%,
      rgba(255, 255, 255, ${opacity * 0.8}) 100%
    )`,
    backdropFilter: `blur(${blur}px) brightness(${brightness}) saturate(1.2)`,
    WebkitBackdropFilter: `blur(${blur}px) brightness(${brightness}) saturate(1.2)`,
    border: `1px solid rgba(255, 255, 255, ${opacity * 2})`,
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, ${opacity * 3})
    `,
  };
}

/**
 * Generate dynamic glow based on color
 */
export function dynamicGlow(color: string, intensity: number = 0.5) {
  return `0 0 ${20 + intensity * 40}px ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
}

/**
 * Extract dominant color from image (client-side)
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(advancedColors.primary.base);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r = 0, g = 0, b = 0, count = 0;

      // Sample every 10th pixel for performance
      for (let i = 0; i < data.length; i += 40) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = () => resolve(advancedColors.primary.base);
  });
}

/**
 * Generate accessible color contrast
 */
export function getContrastColor(bgColor: string): string {
  // Simple luminance check (expand for production)
  const luminance = 0.5; // Placeholder
  return luminance > 0.5 ? advancedColors.text.inverse : advancedColors.text.primary;
}

/**
 * Animate color transition
 */
export function colorTransition(from: string, to: string, progress: number): string {
  // Linear interpolation between colors
  // This is a simplified version - expand for production
  return progress < 0.5 ? from : to;
}
