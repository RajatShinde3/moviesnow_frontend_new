# 🎨 ANIMESUGE DESIGN SYSTEM - MASTER PROMPT

## 📌 EXECUTIVE SUMMARY

This document contains the **complete design system transformation guide** to migrate the MoviesNow frontend from its current Netflix-inspired aesthetic to the **Animesuge.bz dark red theme**. This is the **single source of truth** for all UI/UX color decisions across the entire codebase.

---

## 🎯 COLOR PALETTE (ANIMESUGE THEME)

### **Primary Colors**

```css
:root {
  /* ═══════════════════════════════════════════════════════════ */
  /* BACKGROUND LAYERS (Dark, Content-First) */
  /* ═══════════════════════════════════════════════════════════ */
  --bg-body: #161616;           /* Main page background (very dark gray) */
  --bg-header: #202020;         /* Navigation bar, headers (elevated dark) */
  --bg-card: #202020;           /* Movie/anime card backgrounds (elevated dark) */
  --bg-elevated: #2a2a2a;       /* Hover states, dropdowns */
  --bg-modal: #1a1a1a;          /* Modal/dialog backgrounds */
  --bg-input: #181818;          /* Input field backgrounds */

  /* ═══════════════════════════════════════════════════════════ */
  /* PRIMARY BRAND COLOR (Animesuge Red) */
  /* ═══════════════════════════════════════════════════════════ */
  --primary-color: #FF3D41;     /* Main red (buttons, links, active states) */
  --primary-hover: #FF6366;     /* Lighter red on hover */
  --primary-dark: #E02427;      /* Darker red for pressed states */
  --primary-glow: rgba(255, 61, 65, 0.4);  /* Red glow effect */

  /* ═══════════════════════════════════════════════════════════ */
  /* TEXT HIERARCHY */
  /* ═══════════════════════════════════════════════════════════ */
  --text-main: #FFFFFF;         /* High emphasis text (headings, important) */
  --text-secondary: #CCCCCC;    /* Medium emphasis (body text, descriptions) */
  --text-muted: #AAAAAA;        /* Low emphasis (labels, hints) */
  --text-disabled: #666666;     /* Disabled state text */
  --text-inverse: #161616;      /* Text on light backgrounds (rare) */

  /* ═══════════════════════════════════════════════════════════ */
  /* BORDER & DIVIDERS */
  /* ═══════════════════════════════════════════════════════════ */
  --border-color: #333333;      /* Default borders, dividers */
  --border-hover: #4a4a4a;      /* Hover state borders */
  --border-focus: #FF3D41;      /* Focused input borders (red) */

  /* ═══════════════════════════════════════════════════════════ */
  /* SEMANTIC COLORS (Status, Feedback) */
  /* ═══════════════════════════════════════════════════════════ */
  --success-color: #00D98E;     /* Success messages, completed states */
  --warning-color: #FFB020;     /* Warnings, caution */
  --error-color: #FF4D4F;       /* Errors, destructive actions */
  --info-color: #40A9FF;        /* Info messages, help text */

  /* ═══════════════════════════════════════════════════════════ */
  /* QUALITY BADGES (HD, 1080p, etc.) */
  /* ═══════════════════════════════════════════════════════════ */
  --badge-1080p: #FF3D41;       /* Premium quality (red) */
  --badge-720p: #40A9FF;        /* Standard HD (blue) */
  --badge-480p: #AAAAAA;        /* SD (gray) */
  --badge-4k: #FFB020;          /* Ultra HD (gold) */

  /* ═══════════════════════════════════════════════════════════ */
  /* CONTENT TYPE COLORS */
  /* ═══════════════════════════════════════════════════════════ */
  --type-movie: #FF3D41;        /* Movies (red) */
  --type-series: #40A9FF;       /* TV Series (blue) */
  --type-anime: #9254DE;        /* Anime (purple) */
  --type-documentary: #00D98E;  /* Documentaries (green) */

  /* ═══════════════════════════════════════════════════════════ */
  /* GRADIENTS (Overlays, Backgrounds) */
  /* ═══════════════════════════════════════════════════════════ */
  --gradient-hero-overlay: linear-gradient(
    180deg,
    transparent 0%,
    rgba(22, 22, 22, 0.7) 50%,
    #161616 100%
  );

  --gradient-card-hover: linear-gradient(
    135deg,
    rgba(255, 61, 65, 0.1) 0%,
    rgba(255, 61, 65, 0.05) 100%
  );

  --gradient-premium: linear-gradient(
    135deg,
    #FF3D41 0%,
    #E02427 100%
  );

  --gradient-glass: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );

  /* ═══════════════════════════════════════════════════════════ */
  /* SHADOWS (Depth, Focus) */
  /* ═══════════════════════════════════════════════════════════ */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.6);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.7);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.8);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.9);

  --shadow-red-glow: 0 0 20px rgba(255, 61, 65, 0.5);
  --shadow-red-glow-lg: 0 0 40px rgba(255, 61, 65, 0.6);

  /* ═══════════════════════════════════════════════════════════ */
  /* GLASSMORPHISM (Backdrop Blur Effects) */
  /* ═══════════════════════════════════════════════════════════ */
  --glass-bg: rgba(32, 32, 32, 0.8);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

---

## 🎨 DESIGN TOKENS (JavaScript/TypeScript)

### **Updated `design-system.ts`**

```typescript
/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🎨 MOVIESNOW DESIGN SYSTEM (ANIMESUGE THEME)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Inspired by Animesuge.bz - Dark, content-first design with red accents
 *
 * Philosophy:
 * • Dark-first for reduced eye strain
 * • Red as primary brand color (Animesuge signature)
 * • High contrast for accessibility
 * • Transparent cards (image-focused)
 * • Content over chrome
 */

export const colors = {
  // Background layers (dark gray hierarchy)
  bg: {
    primary: '#161616',      // Body background
    secondary: '#202020',    // Header, cards
    tertiary: '#2a2a2a',     // Elevated elements
    elevated: '#1a1a1a',     // Modals, overlays
    glass: 'rgba(32, 32, 32, 0.8)',  // Glassmorphism
  },

  // Accent colors (Animesuge red primary)
  accent: {
    primary: '#FF3D41',      // Main red (buttons, links)
    secondary: '#40A9FF',    // Blue (secondary highlights)
    tertiary: '#9254DE',     // Purple (premium features)
    success: '#00D98E',      // Green (success states)
    warning: '#FFB020',      // Gold (warnings, 4K badge)
    error: '#FF4D4F',        // Red-orange (errors)
  },

  // Text hierarchy
  text: {
    primary: '#FFFFFF',      // High emphasis
    secondary: '#CCCCCC',    // Medium emphasis
    tertiary: '#AAAAAA',     // Low emphasis
    disabled: '#666666',     // Disabled state
    inverse: '#161616',      // On light backgrounds
  },

  // Quality badge colors
  quality: {
    '1080p': '#FF3D41',      // Premium (red)
    '720p': '#40A9FF',       // Standard HD (blue)
    '480p': '#AAAAAA',       // SD (gray)
    '4k': '#FFB020',         // Ultra HD (gold)
  },

  // Content type colors
  type: {
    movie: '#FF3D41',        // Red
    series: '#40A9FF',       // Blue
    anime: '#9254DE',        // Purple
    documentary: '#00D98E',  // Green
  },

  // Gradients
  gradient: {
    hero: 'linear-gradient(180deg, transparent 0%, rgba(22, 22, 22, 0.7) 50%, #161616 100%)',
    card: 'linear-gradient(135deg, rgba(255, 61, 65, 0.1) 0%, rgba(255, 61, 65, 0.05) 100%)',
    premium: 'linear-gradient(135deg, #FF3D41 0%, #E02427 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  },

  // Border colors
  border: {
    default: '#333333',
    hover: '#4a4a4a',
    focus: '#FF3D41',
  },

  // Hover states
  hover: {
    primary: '#FF6366',      // Lighter red
    card: '#2a2a2a',         // Card hover background
    border: '#4a4a4a',       // Border hover
  },
} as const;

// Shadows (adjusted for dark theme)
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
  glow: {
    red: '0 0 20px rgba(255, 61, 65, 0.5)',
    redLg: '0 0 40px rgba(255, 61, 65, 0.6)',
    blue: '0 0 20px rgba(64, 169, 255, 0.5)',
    purple: '0 0 20px rgba(146, 84, 222, 0.5)',
  },
} as const;

/**
 * Generate glassmorphism styles (Animesuge style)
 */
export function glassmorph(opacity = 0.8, blur = 10) {
  return {
    background: `rgba(32, 32, 32, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(255, 255, 255, 0.1)`,
  };
}

/**
 * Generate quality badge color
 */
export function qualityColor(quality: '480p' | '720p' | '1080p' | '4k') {
  return colors.quality[quality] || colors.text.tertiary;
}

/**
 * Generate content type color
 */
export function typeColor(type: 'movie' | 'series' | 'anime' | 'documentary') {
  return colors.type[type] || colors.accent.primary;
}
```

---

## 🎯 COMPONENT STYLING GUIDELINES

### **1. NAVIGATION BAR (ModernNav)**

```tsx
// Animesuge-style sticky navigation
style={{
  backgroundColor: 'var(--bg-header, #202020)',
  borderBottom: '1px solid var(--border-color, #333333)',
  ...glassmorph(0.95, 15), // Slight transparency when scrolled
}}

// Logo/Brand
style={{
  color: 'var(--primary-color, #FF3D41)', // Red logo text
  fontWeight: 700,
}}

// Navigation links
style={{
  color: 'var(--text-secondary, #CCCCCC)',
  transition: 'color 0.2s',
}}

// Active link
style={{
  color: 'var(--primary-color, #FF3D41)', // Red active state
  borderBottom: '2px solid var(--primary-color, #FF3D41)',
}}

// Hover state
onMouseEnter: {
  color: 'var(--text-main, #FFFFFF)',
}

// Search button
style={{
  backgroundColor: 'var(--bg-elevated, #2a2a2a)',
  border: '1px solid var(--border-color, #333333)',
  color: 'var(--text-main, #FFFFFF)',
}}
```

### **2. BUTTONS (Primary CTA)**

```tsx
// Primary button (Animesuge red)
className="bg-[#FF3D41] hover:bg-[#FF6366] text-white font-semibold px-6 py-3 rounded-full transition-all duration-200"
style={{
  boxShadow: '0 0 20px rgba(255, 61, 65, 0.3)', // Red glow
}}

// On hover
onMouseEnter: {
  boxShadow: '0 0 30px rgba(255, 61, 65, 0.5)', // Stronger glow
}

// Secondary button (outlined)
className="border-2 border-[#333333] hover:border-[#FF3D41] bg-transparent text-white px-6 py-3 rounded-full"

// Icon button
className="bg-[#2a2a2a] hover:bg-[#FF3D41] p-3 rounded-full transition-colors"
```

### **3. CONTENT CARDS (TitleCard, PremiumCard)**

```tsx
// Card container (transparent like Animesuge)
className="group relative bg-transparent rounded-lg overflow-hidden transition-all duration-300"

// Image wrapper
className="relative aspect-[2/3] overflow-hidden"

// Image
className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"

// Overlay gradient (on hover)
className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"

// Quality badge (top-left corner)
className="absolute top-2 left-2 bg-[#FF3D41] text-white text-xs font-bold px-2 py-1 rounded"
// For HD/720p: bg-[#40A9FF]
// For SD/480p: bg-[#AAAAAA]

// "TV" or "Movie" badge
className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded border border-white/20"

// Title overlay (bottom of card on hover)
className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
style={{
  background: 'linear-gradient(to top, #161616 0%, transparent 100%)',
}}
```

### **4. HERO SECTION (CinematicHero, HeroSection)**

```tsx
// Hero container
className="relative h-[70vh] overflow-hidden"

// Background image
className="absolute inset-0 w-full h-full object-cover"
style={{
  filter: 'brightness(0.6)', // Darken for text readability
}}

// Gradient overlay
className="absolute inset-0"
style={{
  background: 'linear-gradient(180deg, transparent 0%, rgba(22, 22, 22, 0.7) 50%, #161616 100%)',
}}

// Content wrapper
className="relative z-10 h-full flex flex-col justify-end p-12 max-w-2xl"

// Title
className="text-6xl font-bold text-white mb-4"

// Description
className="text-lg text-[#CCCCCC] mb-6 line-clamp-3"

// Button group
<button className="bg-[#FF3D41] hover:bg-[#FF6366] text-white font-semibold px-8 py-3 rounded-full mr-3">
  Play
</button>
<button className="bg-[#2a2a2a] hover:bg-[#333333] text-white font-semibold px-8 py-3 rounded-full border border-[#333333]">
  More Info
</button>
```

### **5. INPUT FIELDS**

```tsx
// Text input
className="w-full bg-[#181818] border border-[#333333] focus:border-[#FF3D41] text-white px-4 py-3 rounded-lg outline-none transition-colors"

// Search bar
className="bg-[#202020] border border-[#333333] focus:border-[#FF3D41] text-white px-4 py-2 rounded-full pl-10"

// Icon (inside input)
className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAAAAA]"
```

### **6. DROPDOWN MENUS**

```tsx
// Dropdown container
className="absolute top-full mt-2 bg-[#202020] border border-[#333333] rounded-lg shadow-xl overflow-hidden min-w-[200px]"

// Menu item
className="px-4 py-3 text-[#CCCCCC] hover:bg-[#2a2a2a] hover:text-white transition-colors cursor-pointer"

// Active item
className="px-4 py-3 bg-[#FF3D41] text-white"
```

### **7. MODALS & DIALOGS**

```tsx
// Modal backdrop
className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"

// Modal container
className="bg-[#1a1a1a] border border-[#333333] rounded-xl max-w-2xl w-full mx-4 shadow-2xl overflow-hidden"

// Modal header
className="px-6 py-4 border-b border-[#333333] flex items-center justify-between"

// Modal title
className="text-xl font-bold text-white"

// Close button
className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors"

// Modal body
className="px-6 py-6 text-[#CCCCCC]"

// Modal footer
className="px-6 py-4 border-t border-[#333333] flex justify-end gap-3"
```

### **8. BADGES & TAGS**

```tsx
// Quality badge (1080p)
<span className="bg-[#FF3D41] text-white text-xs font-bold px-2 py-1 rounded uppercase">
  1080p
</span>

// Type badge (Movie)
<span className="bg-black/70 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-2 py-1 rounded uppercase">
  Movie
</span>

// New badge
<span className="bg-[#00D98E] text-white text-xs font-bold px-2 py-1 rounded uppercase">
  New
</span>

// Top 10 badge
<span className="bg-gradient-to-r from-[#FF3D41] to-[#E02427] text-white text-sm font-bold px-3 py-1 rounded-full">
  #3 in Anime
</span>
```

### **9. SCROLLBAR STYLING**

```css
/* Custom scrollbar (Animesuge style) */
.scrollbar-animesuge::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-animesuge::-webkit-scrollbar-track {
  background: #161616;
}

.scrollbar-animesuge::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 4px;
}

.scrollbar-animesuge::-webkit-scrollbar-thumb:hover {
  background: #FF3D41;
}
```

---

## 🎨 TYPOGRAPHY SYSTEM

### **Font Families**

```css
/* Primary font: Poppins (like Animesuge) */
body {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Headings: Poppins Bold */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
}

/* Buttons: Poppins Semi-bold */
button {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}
```

### **Font Sizes & Weights**

```typescript
export const typography = {
  fonts: {
    sans: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  // Font sizes
  size: {
    xs: '0.75rem',     // 12px - Badges, captions
    sm: '0.875rem',    // 14px - Secondary text
    base: '1rem',      // 16px - Body text
    lg: '1.125rem',    // 18px - Large body
    xl: '1.25rem',     // 20px - Subheadings
    '2xl': '1.5rem',   // 24px - Section headers
    '3xl': '1.875rem', // 30px - Large headers
    '4xl': '2.25rem',  // 36px - Page titles
    '5xl': '3rem',     // 48px - Hero titles
    '6xl': '3.75rem',  // 60px - Large hero
  },

  // Font weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
}
```

---

## 🎯 ANIMATION & TRANSITIONS

### **Hover Effects (Animesuge Style)**

```css
/* Card hover (subtle scale + glow) */
.card-animesuge {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-animesuge:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(255, 61, 65, 0.3);
}

/* Button hover (glow effect) */
.btn-animesuge {
  transition: all 0.2s ease;
}

.btn-animesuge:hover {
  box-shadow: 0 0 30px rgba(255, 61, 65, 0.5);
  transform: translateY(-2px);
}

/* Link hover (red underline) */
.link-animesuge {
  position: relative;
  color: #CCCCCC;
  transition: color 0.2s;
}

.link-animesuge::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #FF3D41;
  transition: width 0.3s ease;
}

.link-animesuge:hover {
  color: #FFFFFF;
}

.link-animesuge:hover::after {
  width: 100%;
}
```

### **Page Transitions**

```typescript
// Framer Motion variants
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
}
```

---

## 📋 MIGRATION CHECKLIST

### **Files to Update**

1. **Core Design System**
   - [ ] `src/lib/design-system.ts` - Update all color values
   - [ ] `src/lib/advanced-design-system.ts` - Update premium colors
   - [ ] `src/app/globals.css` - Update CSS variables
   - [ ] `tailwind.config.ts` - Update Tailwind theme colors

2. **Navigation Components**
   - [ ] `src/components/streaming/ModernNav.tsx` - Update nav colors
   - [ ] Update logo color to red (#FF3D41)
   - [ ] Update active link styles

3. **Content Cards**
   - [ ] `src/components/ui/TitleCard.tsx` - Transparent cards, red badges
   - [ ] `src/components/streaming/PremiumCard.tsx` - Update premium glow
   - [ ] `src/components/ui/UltraContentCard.tsx` - Update hover effects

4. **Hero Sections**
   - [ ] `src/components/ui/HeroSection.tsx` - Update gradient overlays
   - [ ] `src/components/streaming/CinematicHero.tsx` - Update button colors
   - [ ] `src/components/ui/UltraHeroSection.tsx` - Update premium hero

5. **Buttons**
   - [ ] `src/components/ui/Button.tsx` - Primary red, secondary outlined
   - [ ] `src/components/ui/EnhancedButton.tsx` - Update glow effects

6. **Forms & Inputs**
   - [ ] `src/components/ui/Input.tsx` - Dark backgrounds, red focus
   - [ ] `src/components/ui/SearchBar.tsx` - Update search styling

7. **Modals & Dialogs**
   - [ ] `src/components/ui/Dialog.tsx` - Dark modal backgrounds
   - [ ] `src/components/ui/EnhancedModal.tsx` - Update backdrop

8. **Page Components**
   - [ ] `src/app/(protected)/home/page.tsx` - Update homepage colors
   - [ ] `src/app/(protected)/browse/page.tsx` - Update browse page
   - [ ] `src/app/(protected)/watch/[id]/page.tsx` - Update player UI
   - [ ] `src/app/(public)/login/page.tsx` - Update auth pages

9. **Admin Components**
   - [ ] `src/components/admin/AdminDashboard.tsx` - Update admin UI
   - [ ] `src/components/admin/TitleManager.tsx` - Update content manager

10. **Subscription/Billing**
    - [ ] `src/components/subscription/PlanSelector.tsx` - Red premium plan
    - [ ] `src/components/billing/BillingHistory.tsx` - Update invoices

---

## 🚀 IMPLEMENTATION STRATEGY

### **Phase 1: Core System (Day 1)**
1. Update `design-system.ts` with Animesuge colors
2. Update `globals.css` CSS variables
3. Update `tailwind.config.ts` theme
4. Test color changes in Storybook/dev

### **Phase 2: Navigation & Layout (Day 2)**
1. Update ModernNav component
2. Update footer component
3. Update sidebar/drawer components
4. Test navigation flow

### **Phase 3: Content Components (Day 3-4)**
1. Update all card components (TitleCard, PremiumCard, etc.)
2. Update hero sections
3. Update content rows
4. Update badges and tags
5. Test content display pages

### **Phase 4: Forms & UI Elements (Day 5)**
1. Update all button variants
2. Update input fields
3. Update modals/dialogs
4. Update dropdowns/menus
5. Test user interactions

### **Phase 5: Pages & Features (Day 6-7)**
1. Update homepage
2. Update browse/search pages
3. Update watch page
4. Update settings pages
5. Update admin dashboard
6. Update subscription pages

### **Phase 6: Polish & QA (Day 8)**
1. Fix any visual inconsistencies
2. Test dark mode thoroughly
3. Test responsive design
4. Accessibility audit
5. Performance check
6. Final review

---

## 💡 PRO TIPS

### **1. Content-First Design (Like Animesuge)**
- **Transparent card backgrounds** - Let the poster/thumbnail be the star
- **Minimal borders** - Use subtle borders (#333333) only when necessary
- **Image focus** - Large, high-quality images with minimal chrome
- **Clean layout** - Generous whitespace, no clutter

### **2. Red Accent Usage**
- **Primary actions** - Play button, subscribe, download (red)
- **Active states** - Active nav link, selected item (red)
- **Quality badges** - 1080p badge (red)
- **Hover effects** - Red glow on hover
- **Links** - Red underline on hover

### **3. Typography Hierarchy**
- **#FFFFFF** - Headings, important text (high contrast)
- **#CCCCCC** - Body text, descriptions (medium contrast)
- **#AAAAAA** - Labels, hints, secondary info (low contrast)
- **#666666** - Disabled states (very low contrast)

### **4. Dark Theme Best Practices**
- **Avoid pure black (#000000)** - Use #161616 for body
- **Use elevated backgrounds** - #202020 for cards/header
- **Subtle borders** - #333333 for dividers
- **Sufficient contrast** - WCAG AA compliant (4.5:1 minimum)

### **5. Performance**
- **Use CSS variables** - Easy theme switching, better performance
- **Avoid inline styles** - Use Tailwind classes or CSS modules
- **Optimize shadows** - Don't overuse heavy box-shadows
- **Hardware acceleration** - Use `transform` over `top/left` for animations

---

## 🎨 QUICK REFERENCE CHEAT SHEET

| Element | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| **Body** | #161616 | #FFFFFF | - | - |
| **Navigation** | #202020 | #CCCCCC | #333333 | #FFFFFF |
| **Card** | transparent | #FFFFFF | none | scale(1.05) |
| **Button (Primary)** | #FF3D41 | #FFFFFF | none | #FF6366 + glow |
| **Button (Secondary)** | transparent | #FFFFFF | #333333 | #FF3D41 border |
| **Input** | #181818 | #FFFFFF | #333333 | #FF3D41 border |
| **Modal** | #1a1a1a | #CCCCCC | #333333 | - |
| **Badge (1080p)** | #FF3D41 | #FFFFFF | none | - |
| **Badge (720p)** | #40A9FF | #FFFFFF | none | - |
| **Link** | - | #CCCCCC | - | #FFFFFF + red underline |

---

## 🔗 RESOURCES

- **Animesuge Reference**: https://animesuge.bz
- **Color Palette Tool**: https://coolors.co/161616-202020-ff3d41-aaaaaa-ffffff
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Design System Documentation**: See `CLAUDE.md` for platform context

---

## ✅ VALIDATION CHECKLIST

Before marking the migration complete, ensure:

- [ ] All components use new color variables
- [ ] No hardcoded old colors (e.g., #ff0080, #00d9ff, #b829ff)
- [ ] Consistent red (#FF3D41) for primary actions
- [ ] Dark backgrounds (#161616, #202020) everywhere
- [ ] Text hierarchy correct (#FFFFFF → #CCCCCC → #AAAAAA)
- [ ] Borders use #333333 consistently
- [ ] Hover states show red glow effect
- [ ] Quality badges use correct colors
- [ ] Navigation bar is #202020 with red accents
- [ ] Cards are transparent with image focus
- [ ] Buttons have red primary color
- [ ] Inputs have dark backgrounds with red focus
- [ ] Modals use dark theme (#1a1a1a)
- [ ] All text is readable (contrast ratio ≥ 4.5:1)
- [ ] Mobile responsive design works
- [ ] Dark mode is default
- [ ] No visual regressions
- [ ] Performance is not degraded

---

**🎬 MoviesNow × Animesuge Design System**
*Last Updated: December 2024*
*Status: Ready for Implementation*
