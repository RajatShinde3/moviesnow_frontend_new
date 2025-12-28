# 🤖 AI AGENT MASTER PROMPT - ANIMESUGE COLOR TRANSFORMATION

## 📌 ROLE & CONTEXT

You are an **expert frontend developer and senior UI/UX architect** specializing in modern web design systems, color theory, and enterprise-grade React/Next.js applications. Your task is to transform the **MoviesNow streaming platform frontend** from its current Netflix-inspired design to the **Animesuge.bz dark red theme**.

**Platform**: MoviesNow (Movies, Web Series, Anime, Documentaries streaming/download platform)
**Framework**: Next.js 15 (App Router) + React 19 + TypeScript
**Styling**: Tailwind CSS 4 + Custom CSS + Framer Motion
**Current Theme**: Netflix-inspired (Pink #ff0080, Cyan #00d9ff, Purple #b829ff)
**Target Theme**: Animesuge.bz (Dark Gray #161616/#202020 + Red #FF3D41)

---

## 🎯 PRIMARY OBJECTIVE

Transform the **entire frontend codebase** to use the Animesuge color scheme while:
1. **Maintaining functionality** - Zero breaking changes to features
2. **Improving UX** - Content-first design, transparent cards, image focus
3. **Ensuring consistency** - Every component uses the new design system
4. **Preserving accessibility** - WCAG AA contrast compliance (4.5:1 minimum)
5. **Optimizing performance** - No performance degradation

---

## 🎨 COLOR TRANSFORMATION RULES

### **MANDATORY COLOR REPLACEMENTS**

| Old Color (Netflix Theme) | New Color (Animesuge Theme) | Usage |
|---------------------------|----------------------------|-------|
| **#0a0a0f** (near-black) | **#161616** (dark gray) | Body background |
| **#12121a** (dark purple) | **#202020** (elevated gray) | Header, cards, elevated surfaces |
| **#1a1a26** (purple-tinted) | **#202020** (elevated gray) | Card backgrounds |
| **#222232** (light purple) | **#2a2a2a** (hover gray) | Hover states |
| **#ff0080** (hot pink) | **#FF3D41** (Animesuge red) | Primary CTA, buttons, links |
| **#00d9ff** (cyan) | **#40A9FF** (blue) | Secondary highlights |
| **#b829ff** (purple) | **#9254DE** (light purple) | Premium features |
| **#00ff88** (neon green) | **#00D98E** (teal green) | Success states |
| **#ffd000** (yellow) | **#FFB020** (gold) | Warnings, 4K badges |
| **#ff4444** (red) | **#FF4D4F** (red-orange) | Errors |
| **#b3b3b3** (gray) | **#CCCCCC** (light gray) | Secondary text |
| **#737373** (dark gray) | **#AAAAAA** (muted gray) | Tertiary text |
| **rgba(18, 18, 26, 0.7)** | **rgba(32, 32, 32, 0.8)** | Glassmorphism |

### **BORDER COLORS**

| Old | New | Usage |
|-----|-----|-------|
| `rgba(255, 255, 255, 0.1)` | **#333333** | Default borders |
| `rgba(255, 255, 255, 0.2)` | **#4a4a4a** | Hover borders |
| `rgba(255, 0, 128, 0.5)` | **#FF3D41** | Focus borders |

### **SHADOW/GLOW REPLACEMENTS**

| Old (Pink/Cyan Glow) | New (Red Glow) |
|---------------------|---------------|
| `0 0 20px rgba(255, 0, 128, 0.5)` | **`0 0 20px rgba(255, 61, 65, 0.5)`** |
| `0 0 20px rgba(0, 217, 255, 0.5)` | **`0 0 20px rgba(64, 169, 255, 0.5)`** |
| `0 0 20px rgba(184, 41, 255, 0.5)` | **`0 0 20px rgba(146, 84, 222, 0.5)`** |

### **GRADIENT REPLACEMENTS**

```css
/* OLD (Netflix-style) */
background: linear-gradient(135deg, #ff0080 0%, #b829ff 100%);

/* NEW (Animesuge-style) */
background: linear-gradient(135deg, #FF3D41 0%, #E02427 100%);
```

```css
/* OLD (Card gradient) */
background: linear-gradient(135deg, rgba(255, 0, 128, 0.1) 0%, rgba(0, 217, 255, 0.1) 100%);

/* NEW (Card gradient) */
background: linear-gradient(135deg, rgba(255, 61, 65, 0.1) 0%, rgba(255, 61, 65, 0.05) 100%);
```

---

## 🏗️ COMPONENT-SPECIFIC INSTRUCTIONS

### **1. NAVIGATION (ModernNav.tsx)**

**Changes Required:**
```typescript
// Background
backgroundColor: '#202020'  // Was #12121a

// Border
borderBottom: '1px solid #333333'  // Was rgba(255,255,255,0.1)

// Logo/Brand color
color: '#FF3D41'  // Was #ff0080

// Link default
color: '#CCCCCC'  // Was #b3b3b3

// Link hover
color: '#FFFFFF'  // Remains white

// Link active
color: '#FF3D41'  // Was #ff0080
borderBottom: '2px solid #FF3D41'  // Was #ff0080

// Search button
backgroundColor: '#2a2a2a'  // Was #222232
border: '1px solid #333333'  // Was rgba(255,255,255,0.1)

// Glassmorphism (scrolled state)
background: 'rgba(32, 32, 32, 0.95)'  // Was rgba(18,18,26,0.9)
backdropFilter: 'blur(15px)'
```

### **2. BUTTONS (Button.tsx, EnhancedButton.tsx)**

**Primary Button:**
```typescript
// Default state
backgroundColor: '#FF3D41'  // Was #ff0080
color: '#FFFFFF'
boxShadow: '0 0 20px rgba(255, 61, 65, 0.3)'  // Red glow

// Hover state
backgroundColor: '#FF6366'  // Was #ff3399
boxShadow: '0 0 30px rgba(255, 61, 65, 0.5)'  // Stronger glow
transform: 'translateY(-2px)'

// Pressed/Active state
backgroundColor: '#E02427'
```

**Secondary Button (Outlined):**
```typescript
// Default
backgroundColor: 'transparent'
border: '2px solid #333333'  // Was rgba(255,255,255,0.1)
color: '#FFFFFF'

// Hover
border: '2px solid #FF3D41'  // Was #ff0080
backgroundColor: 'rgba(255, 61, 65, 0.1)'
```

**Icon Button:**
```typescript
backgroundColor: '#2a2a2a'  // Was #222232
// Hover
backgroundColor: '#FF3D41'  // Was #ff0080
```

### **3. CONTENT CARDS (TitleCard.tsx, PremiumCard.tsx, UltraContentCard.tsx)**

**Critical Change: Make cards TRANSPARENT (like Animesuge):**

```typescript
// Card container
className="group relative bg-transparent rounded-lg overflow-hidden"
// REMOVE: bg-[#1a1a26] or any background color

// Image wrapper (poster)
className="relative aspect-[2/3] overflow-hidden"

// Image
className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"

// Overlay (appears on hover only)
className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"

// Quality badge (1080p)
className="absolute top-2 left-2 bg-[#FF3D41] text-white text-xs font-bold px-2 py-1 rounded uppercase"
// Was: bg-[#ff0080]

// Quality badge (720p)
className="absolute top-2 left-2 bg-[#40A9FF] text-white text-xs font-bold px-2 py-1 rounded uppercase"
// Was: bg-[#00d9ff]

// Type badge ("TV", "Movie")
className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded border border-white/20"

// Hover glow effect
// Add on hover:
boxShadow: '0 0 30px rgba(255, 61, 65, 0.3)'
```

**Card Title (on hover):**
```typescript
// Title overlay (bottom of card, slides up on hover)
className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
style={{
  background: 'linear-gradient(to top, #161616 0%, transparent 100%)',
}}

// Title text
className="text-white font-semibold text-sm line-clamp-2"

// Metadata (year, duration)
className="text-[#AAAAAA] text-xs mt-1"
```

### **4. HERO SECTIONS (HeroSection.tsx, CinematicHero.tsx, UltraHeroSection.tsx)**

**Background:**
```typescript
// Background image
style={{
  filter: 'brightness(0.6)',  // Darken image
}}

// Gradient overlay
style={{
  background: 'linear-gradient(180deg, transparent 0%, rgba(22, 22, 22, 0.7) 50%, #161616 100%)',
}}
// Was: linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.8) 60%, #0a0a0f 100%)
```

**Hero Buttons:**
```typescript
// Play button
className="bg-[#FF3D41] hover:bg-[#FF6366] text-white font-semibold px-8 py-3 rounded-full shadow-lg"
// Was: bg-[#ff0080]

// More Info button
className="bg-[#2a2a2a] hover:bg-[#333333] text-white font-semibold px-8 py-3 rounded-full border border-[#333333]"
// Was: bg-[#222232]
```

**Hero Text:**
```typescript
// Title
className="text-6xl font-bold text-white mb-4"

// Description
className="text-lg text-[#CCCCCC] mb-6 line-clamp-3"
// Was: text-[#b3b3b3]

// Metadata (year, rating, duration)
className="flex items-center gap-4 text-[#AAAAAA] text-sm mb-6"
// Was: text-[#737373]
```

### **5. INPUT FIELDS (Input.tsx, SearchBar.tsx)**

```typescript
// Text input
className="w-full bg-[#181818] border border-[#333333] focus:border-[#FF3D41] text-white px-4 py-3 rounded-lg outline-none transition-colors placeholder:text-[#666666]"
// Was: bg-[#12121a], border rgba(255,255,255,0.1), focus:border-[#ff0080]

// Search bar
className="bg-[#202020] border border-[#333333] focus:border-[#FF3D41] text-white px-4 py-2 rounded-full pl-10"

// Icon (inside input)
className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAAAAA]"
// Was: text-[#737373]

// Focus ring
className="focus-visible:ring-2 focus-visible:ring-[#FF3D41] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]"
// Was: focus-visible:ring-[#ff0080]
```

### **6. MODALS & DIALOGS (Dialog.tsx, EnhancedModal.tsx)**

```typescript
// Backdrop
className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"

// Modal container
className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl overflow-hidden"
// Was: bg-[#12121a], border rgba(255,255,255,0.1)

// Modal header
className="px-6 py-4 border-b border-[#333333]"
// Was: border-b rgba(255,255,255,0.1)

// Modal title
className="text-xl font-bold text-white"

// Modal body
className="px-6 py-6 text-[#CCCCCC]"
// Was: text-[#b3b3b3]

// Close button
className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors text-[#AAAAAA] hover:text-white"
// Was: hover:bg-[#222232]
```

### **7. DROPDOWNS & MENUS**

```typescript
// Dropdown container
className="absolute top-full mt-2 bg-[#202020] border border-[#333333] rounded-lg shadow-xl overflow-hidden min-w-[200px]"
// Was: bg-[#12121a]

// Menu item
className="px-4 py-3 text-[#CCCCCC] hover:bg-[#2a2a2a] hover:text-white transition-colors cursor-pointer"
// Was: text-[#b3b3b3], hover:bg-[#222232]

// Active menu item
className="px-4 py-3 bg-[#FF3D41] text-white"
// Was: bg-[#ff0080]

// Divider
className="h-px bg-[#333333] my-1"
// Was: bg-rgba(255,255,255,0.1)
```

### **8. BADGES & TAGS**

```typescript
// Quality badge (1080p - Premium)
<span className="bg-[#FF3D41] text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
  1080p
</span>
// Was: bg-[#ff0080]

// Quality badge (720p - Standard HD)
<span className="bg-[#40A9FF] text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
  720p
</span>
// Was: bg-[#00d9ff]

// Quality badge (480p - SD)
<span className="bg-[#AAAAAA] text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
  480p
</span>
// Was: bg-[#b3b3b3]

// Type badge (Movie/TV/Anime)
<span className="bg-black/70 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-2 py-1 rounded uppercase">
  Movie
</span>

// New badge
<span className="bg-[#00D98E] text-white text-xs font-bold px-2 py-1 rounded uppercase">
  New
</span>
// Was: bg-[#00ff88]

// Premium badge
<span className="bg-gradient-to-r from-[#FF3D41] to-[#E02427] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
  Premium
</span>
// Was: from-[#ff0080] to-[#b829ff]

// Top 10 badge
<span className="bg-gradient-to-r from-[#FF3D41] to-[#E02427] text-white text-sm font-bold px-3 py-1 rounded-full">
  #3 in Anime
</span>
```

### **9. SCROLLBAR STYLING**

```css
/* In globals.css */
.scrollbar-animesuge::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-animesuge::-webkit-scrollbar-track {
  background: #161616;  /* Was #0a0a0f */
}

.scrollbar-animesuge::-webkit-scrollbar-thumb {
  background: #333333;  /* Was rgba(255,255,255,0.2) */
  border-radius: 4px;
}

.scrollbar-animesuge::-webkit-scrollbar-thumb:hover {
  background: #FF3D41;  /* Was #ff0080 */
}
```

### **10. FOOTER (WorldClassFooter.tsx)**

```typescript
// Footer background
className="bg-[#202020] border-t border-[#333333]"
// Was: bg-[#12121a]

// Footer links
className="text-[#AAAAAA] hover:text-white transition-colors"
// Was: text-[#737373]

// Footer social icons
className="text-[#AAAAAA] hover:text-[#FF3D41] transition-colors"
// Was: hover:text-[#ff0080]

// Copyright text
className="text-[#666666] text-sm"
// Was: text-[#4d4d4d]
```

---

## 📂 FILE-BY-FILE TRANSFORMATION PLAN

### **Phase 1: Core Design System (PRIORITY 1)**

1. **`src/lib/design-system.ts`** ✅
   - Replace ALL color values with Animesuge colors
   - Update `colors.bg.*` to use #161616, #202020, #2a2a2a
   - Update `colors.accent.primary` to #FF3D41
   - Update `colors.text.*` to #FFFFFF, #CCCCCC, #AAAAAA
   - Update `shadows.glow.pink` to use rgba(255, 61, 65, ...)
   - Update `glassmorph()` function to use rgba(32, 32, 32, ...)

2. **`src/lib/advanced-design-system.ts`** ✅
   - Update all premium gradient colors
   - Update quality tier colors
   - Replace magenta/cyan/purple triadic with red/blue/purple

3. **`src/app/globals.css`** ✅
   - Update `:root` CSS variables
   - Replace all animation glow colors (Netflix red → Animesuge red)
   - Update `.glass`, `.glass-dark`, `.glass-card` backgrounds
   - Update `.shadow-netflix` to `.shadow-animesuge`
   - Update `.btn-netflix` to `.btn-animesuge`
   - Update `.gradient-netflix` to `.gradient-animesuge`
   - Update all border colors from rgba() to #333333

4. **`tailwind.config.ts`** ✅
   - Update `colors.primary` to red (#FF3D41)
   - Update `colors.secondary` to blue (#40A9FF)
   - Update `colors.accent` to purple (#9254DE)
   - Update mesh gradient colors if needed

### **Phase 2: Navigation & Layout (PRIORITY 2)**

5. **`src/components/streaming/ModernNav.tsx`** 🔴 CRITICAL
   - Update nav background to #202020
   - Update border to #333333
   - Logo color to #FF3D41
   - Active link color to #FF3D41
   - Link hover to #FFFFFF
   - Search button background to #2a2a2a

6. **`src/components/WorldClassFooter.tsx`**
   - Update background to #202020
   - Update text colors (#AAAAAA, #666666)
   - Update link hover to #FF3D41

7. **`src/components/ui/Sidebar.tsx`** (if exists)
   - Update sidebar background to #202020
   - Update active item background to #FF3D41

### **Phase 3: Content Display Components (PRIORITY 3)**

8. **`src/components/ui/TitleCard.tsx`** 🔴 CRITICAL
   - **MAKE TRANSPARENT**: Remove all background colors
   - Update quality badges (1080p: #FF3D41, 720p: #40A9FF)
   - Update hover glow to red
   - Update overlay gradient (use #161616)

9. **`src/components/streaming/PremiumCard.tsx`**
   - Same as TitleCard + premium badge gradient (red)

10. **`src/components/ui/UltraContentCard.tsx`**
    - Same as TitleCard with enhanced animations

11. **`src/components/streaming/ContentRail.tsx`**
    - Update gradient fade edges (use #161616)
    - Update chevron button backgrounds (#2a2a2a)

12. **`src/components/ui/HeroSection.tsx`** 🔴 CRITICAL
    - Update gradient overlay (use #161616)
    - Update Play button to #FF3D41
    - Update More Info button to #2a2a2a

13. **`src/components/streaming/CinematicHero.tsx`**
    - Same as HeroSection

14. **`src/components/ui/UltraHeroSection.tsx`**
    - Same as HeroSection + premium effects

15. **`src/components/ui/Top10Row.tsx`**
    - Update badge gradient (red)

### **Phase 4: Interactive Elements (PRIORITY 4)**

16. **`src/components/ui/Button.tsx`** 🔴 CRITICAL
    - Primary variant: #FF3D41, hover #FF6366
    - Secondary variant: border #333333, hover #FF3D41
    - Update glow effect (red)

17. **`src/components/ui/EnhancedButton.tsx`**
    - Same as Button + ripple effect (red)

18. **`src/components/ui/Input.tsx`**
    - Background #181818
    - Border #333333
    - Focus border #FF3D41

19. **`src/components/ui/SearchBar.tsx`**
    - Background #202020
    - Border #333333
    - Focus border #FF3D41
    - Icon color #AAAAAA

20. **`src/components/ui/Dialog.tsx`**
    - Modal background #1a1a1a
    - Border #333333
    - Close button hover #2a2a2a

21. **`src/components/ui/EnhancedModal.tsx`**
    - Same as Dialog

22. **`src/components/ui/Dropdown.tsx`** (if exists)
    - Background #202020
    - Border #333333
    - Hover #2a2a2a
    - Active #FF3D41

### **Phase 5: Page Components (PRIORITY 5)**

23. **`src/app/(protected)/home/page.tsx`**
    - Update page background #161616
    - Ensure all child components use new colors

24. **`src/app/(protected)/browse/page.tsx`**
    - Same as home page

25. **`src/app/(protected)/watch/[id]/page.tsx`**
    - Update player controls (use red for primary actions)

26. **`src/app/(protected)/settings/page.tsx`**
    - Update all form elements

27. **`src/app/(public)/login/page.tsx`**
    - Update form backgrounds
    - Update submit button (red)

28. **`src/app/(public)/signup/page.tsx`**
    - Same as login

### **Phase 6: Feature Components (PRIORITY 6)**

29. **`src/components/admin/AdminDashboard.tsx`**
    - Update dashboard background
    - Update stat cards
    - Update charts (use red for primary data)

30. **`src/components/admin/TitleManager.tsx`**
    - Update table styling
    - Update action buttons (red)

31. **`src/components/subscription/PlanSelector.tsx`**
    - Premium plan highlight (red)
    - Update pricing cards

32. **`src/components/billing/BillingHistory.tsx`**
    - Update table borders
    - Update status badges

33. **`src/components/player/EnhancedVideoPlayer.tsx`**
    - Update controls (red for play/pause)
    - Update progress bar (red)

34. **`src/components/player/VideoPlayerWithAds.tsx`**
    - Update ad overlay

### **Phase 7: Polish & Details (PRIORITY 7)**

35. **All other components in `src/components/`**
    - Search for hardcoded colors:
      - `#ff0080` → `#FF3D41`
      - `#00d9ff` → `#40A9FF`
      - `#b829ff` → `#9254DE`
      - `#0a0a0f` → `#161616`
      - `#12121a` → `#202020`
      - `#1a1a26` → `#202020`
      - `#222232` → `#2a2a2a`
      - `rgba(18, 18, 26` → `rgba(32, 32, 32`

36. **Update all Tailwind classes:**
    - `bg-[#ff0080]` → `bg-[#FF3D41]`
    - `hover:bg-[#ff0080]` → `hover:bg-[#FF6366]`
    - `text-[#b3b3b3]` → `text-[#CCCCCC]`
    - `text-[#737373]` → `text-[#AAAAAA]`
    - `border-[rgba(255,255,255,0.1)]` → `border-[#333333]`

---

## 🔍 SEARCH & REPLACE OPERATIONS

Use your IDE's global search and replace (case-sensitive):

### **Background Colors**
```
Find: #0a0a0f
Replace: #161616

Find: #12121a
Replace: #202020

Find: #1a1a26
Replace: #202020

Find: #222232
Replace: #2a2a2a

Find: rgba(18, 18, 26
Replace: rgba(32, 32, 32
```

### **Accent Colors**
```
Find: #ff0080
Replace: #FF3D41

Find: #00d9ff
Replace: #40A9FF

Find: #b829ff
Replace: #9254DE

Find: #00ff88
Replace: #00D98E

Find: #ffd000
Replace: #FFB020
```

### **Text Colors**
```
Find: #b3b3b3
Replace: #CCCCCC

Find: #737373
Replace: #AAAAAA

Find: #4d4d4d
Replace: #666666
```

### **Glow Effects**
```
Find: rgba(255, 0, 128, 0.5)
Replace: rgba(255, 61, 65, 0.5)

Find: rgba(255, 0, 128, 0.3)
Replace: rgba(255, 61, 65, 0.3)

Find: rgba(0, 217, 255, 0.5)
Replace: rgba(64, 169, 255, 0.5)

Find: rgba(184, 41, 255, 0.5)
Replace: rgba(146, 84, 222, 0.5)
```

### **Border Colors**
```
Find: rgba(255, 255, 255, 0.1)
Replace: #333333

Find: rgba(255, 255, 255, 0.2)
Replace: #4a4a4a
```

---

## ✅ VALIDATION CHECKLIST

After each component transformation, verify:

- [ ] **No old colors remain** - Search for `#ff0080`, `#00d9ff`, `#b829ff`, `#0a0a0f`, `#12121a`
- [ ] **Consistent red usage** - All primary actions use #FF3D41
- [ ] **Dark backgrounds** - All backgrounds use #161616 or #202020
- [ ] **Text hierarchy** - #FFFFFF → #CCCCCC → #AAAAAA
- [ ] **Border consistency** - All borders use #333333
- [ ] **Cards are transparent** - No background on TitleCard, PremiumCard
- [ ] **Quality badges correct** - 1080p red, 720p blue, 480p gray
- [ ] **Hover effects work** - Red glow on hover
- [ ] **Focus states visible** - Red focus rings
- [ ] **Accessibility maintained** - Contrast ratio ≥ 4.5:1
- [ ] **No visual regressions** - Component still looks good
- [ ] **Responsive design intact** - Mobile/tablet/desktop all work
- [ ] **Performance not degraded** - No new performance issues

---

## 🚨 CRITICAL WARNINGS

### **DO NOT:**
1. ❌ **Remove functionality** - Only change colors, not behavior
2. ❌ **Break responsiveness** - Maintain all responsive breakpoints
3. ❌ **Reduce accessibility** - Ensure contrast ratios remain compliant
4. ❌ **Add new features** - This is ONLY a color transformation
5. ❌ **Change component structure** - Only update colors/styles
6. ❌ **Delete animations** - Keep all animations, just update colors
7. ❌ **Modify API calls** - Backend integration stays the same
8. ❌ **Change file names** - Keep all file/folder names unchanged

### **DO:**
1. ✅ **Test thoroughly** - Visual QA after each change
2. ✅ **Maintain consistency** - Use design system, not hardcoded colors
3. ✅ **Document changes** - Note any edge cases or decisions
4. ✅ **Check dark mode** - Default is dark, but ensure it works
5. ✅ **Validate contrast** - Use browser DevTools accessibility checker
6. ✅ **Test interactions** - Hover, focus, active states all work
7. ✅ **Review spacing** - Ensure no layout shifts from color changes

---

## 🎯 SUCCESS CRITERIA

The migration is **100% complete** when:

1. ✅ **Zero old colors** - No instances of #ff0080, #00d9ff, #b829ff, #0a0a0f, #12121a
2. ✅ **Consistent red** - All primary CTAs use #FF3D41
3. ✅ **Dark theme** - Body is #161616, elevated surfaces #202020
4. ✅ **Transparent cards** - TitleCard has no background, only image
5. ✅ **Red accents everywhere** - Nav active state, buttons, badges, focus rings
6. ✅ **Quality badges correct** - 1080p red, 720p blue, 480p gray
7. ✅ **Text hierarchy clear** - White → light gray → gray → dark gray
8. ✅ **Borders consistent** - All use #333333
9. ✅ **Hover effects work** - Red glow on interactive elements
10. ✅ **No regressions** - All features work as before
11. ✅ **Accessible** - WCAG AA compliant (4.5:1 contrast)
12. ✅ **Performant** - No performance degradation
13. ✅ **Responsive** - Works on mobile, tablet, desktop
14. ✅ **Visual approval** - Looks like Animesuge.bz aesthetic

---

## 📊 PROGRESS TRACKING

Track your progress using this template:

```markdown
### Phase 1: Core Design System
- [x] design-system.ts
- [x] advanced-design-system.ts
- [x] globals.css
- [x] tailwind.config.ts

### Phase 2: Navigation & Layout
- [ ] ModernNav.tsx
- [ ] WorldClassFooter.tsx
- [ ] Sidebar.tsx (if exists)

### Phase 3: Content Display
- [ ] TitleCard.tsx (CRITICAL)
- [ ] PremiumCard.tsx
- [ ] UltraContentCard.tsx
- [ ] ContentRail.tsx
- [ ] HeroSection.tsx (CRITICAL)
- [ ] CinematicHero.tsx
- [ ] UltraHeroSection.tsx
- [ ] Top10Row.tsx

### Phase 4: Interactive Elements
- [ ] Button.tsx (CRITICAL)
- [ ] EnhancedButton.tsx
- [ ] Input.tsx
- [ ] SearchBar.tsx
- [ ] Dialog.tsx
- [ ] EnhancedModal.tsx
- [ ] Dropdown.tsx

### Phase 5: Page Components
- [ ] home/page.tsx
- [ ] browse/page.tsx
- [ ] watch/[id]/page.tsx
- [ ] settings/page.tsx
- [ ] login/page.tsx
- [ ] signup/page.tsx

### Phase 6: Feature Components
- [ ] AdminDashboard.tsx
- [ ] TitleManager.tsx
- [ ] PlanSelector.tsx
- [ ] BillingHistory.tsx
- [ ] EnhancedVideoPlayer.tsx
- [ ] VideoPlayerWithAds.tsx

### Phase 7: Polish & Details
- [ ] Search & replace all old colors
- [ ] Update all Tailwind classes
- [ ] Final QA pass
- [ ] Accessibility audit
- [ ] Performance check
```

---

## 🎨 DESIGN SYSTEM QUICK REFERENCE

### **Color Variables (Use these!)**

```typescript
import { colors, shadows, glassmorph } from '@/lib/design-system';

// Backgrounds
colors.bg.primary      // #161616
colors.bg.secondary    // #202020
colors.bg.tertiary     // #2a2a2a

// Accents
colors.accent.primary   // #FF3D41 (red)
colors.accent.secondary // #40A9FF (blue)
colors.accent.tertiary  // #9254DE (purple)

// Text
colors.text.primary    // #FFFFFF
colors.text.secondary  // #CCCCCC
colors.text.tertiary   // #AAAAAA

// Borders
colors.border.default  // #333333
colors.border.hover    // #4a4a4a
colors.border.focus    // #FF3D41

// Shadows
shadows.glow.red       // Red glow effect
shadows.lg             // Large shadow

// Glassmorphism
glassmorph(0.8, 15)    // Generates glass effect
```

### **CSS Variables (In globals.css)**

```css
var(--bg-body)         /* #161616 */
var(--bg-header)       /* #202020 */
var(--bg-card)         /* #202020 */
var(--primary-color)   /* #FF3D41 */
var(--text-main)       /* #FFFFFF */
var(--text-secondary)  /* #CCCCCC */
var(--text-muted)      /* #AAAAAA */
var(--border-color)    /* #333333 */
```

---

## 🏁 FINAL INSTRUCTIONS

**Approach:**
1. **Start with Phase 1** (Core Design System) - This is the foundation
2. **Move to critical components** (Nav, Cards, Hero, Buttons)
3. **Work systematically** through each phase
4. **Test after each component** - Don't batch changes
5. **Use search & replace** for bulk color updates
6. **Validate each change** against the checklist
7. **Document any issues** or edge cases you find

**Communication:**
- **Ask questions** if any color mapping is unclear
- **Show progress** - Update the progress tracker regularly
- **Report blockers** - If you find incompatible design patterns
- **Suggest improvements** - If you see better ways to implement

**Timeline:**
- **Phase 1-2**: 1-2 hours (Core system + Nav)
- **Phase 3-4**: 3-4 hours (Content + Interactive)
- **Phase 5-6**: 2-3 hours (Pages + Features)
- **Phase 7**: 1-2 hours (Polish + QA)
- **Total**: 8-12 hours for complete transformation

---

## 🎬 READY TO START?

You now have:
✅ Complete color mapping guide
✅ Component-specific instructions
✅ Search & replace operations
✅ Validation checklist
✅ Progress tracking template

**Your first task:** Update `src/lib/design-system.ts` with all new Animesuge colors.

**Remember:** This is a **color transformation ONLY**. Do not add features, remove functionality, or restructure components. Focus on making the UI look like Animesuge.bz while maintaining all existing functionality.

**Good luck! Let's make MoviesNow look amazing! 🚀**
