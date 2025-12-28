# 🚀 QUICKSTART - Animesuge Color Migration

## ⚡ START HERE (5-Minute Setup)

### **Step 1: Read the Master Prompt** (2 min)
Open and read: [`AI_AGENT_MASTER_PROMPT.md`](./AI_AGENT_MASTER_PROMPT.md)

This is your **complete guide** with:
- Color mapping rules
- Component-specific instructions
- Search & replace operations
- Validation checklist

### **Step 2: Update Core Design System** (3 min)

Open [`src/lib/design-system.ts`](./src/lib/design-system.ts) and replace the color values:

```typescript
export const colors = {
  bg: {
    primary: '#161616',      // Was #0a0a0f
    secondary: '#202020',    // Was #12121a
    tertiary: '#2a2a2a',     // Was #1a1a26
    elevated: '#1a1a1a',     // Was #222232
    glass: 'rgba(32, 32, 32, 0.8)',  // Was rgba(18, 18, 26, 0.7)
  },

  accent: {
    primary: '#FF3D41',      // Was #ff0080 ⭐ MAIN CHANGE
    secondary: '#40A9FF',    // Was #00d9ff
    tertiary: '#9254DE',     // Was #b829ff
    success: '#00D98E',      // Was #00ff88
    warning: '#FFB020',      // Was #ffd000
    error: '#FF4D4F',        // Was #ff4444
  },

  text: {
    primary: '#FFFFFF',      // Unchanged
    secondary: '#CCCCCC',    // Was #b3b3b3
    tertiary: '#AAAAAA',     // Was #737373
    disabled: '#666666',     // Was #4d4d4d
    inverse: '#161616',      // Was #0a0a0f
  },

  quality: {
    '1080p': '#FF3D41',      // Was #ff0080
    '720p': '#40A9FF',       // Was #00d9ff
    '480p': '#AAAAAA',       // Was #b3b3b3
    '4k': '#FFB020',         // Was #ffd000
  },

  type: {
    movie: '#FF3D41',        // Was #ff0080
    series: '#40A9FF',       // Was #00d9ff
    anime: '#9254DE',        // Was #b829ff
    documentary: '#00D98E',  // Was #00ff88
  },

  gradient: {
    hero: 'linear-gradient(180deg, transparent 0%, rgba(22, 22, 22, 0.7) 50%, #161616 100%)',
    // Was: linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.8) 60%, #0a0a0f 100%)

    card: 'linear-gradient(135deg, rgba(255, 61, 65, 0.1) 0%, rgba(255, 61, 65, 0.05) 100%)',
    // Was: linear-gradient(135deg, rgba(255, 0, 128, 0.1) 0%, rgba(0, 217, 255, 0.1) 100%)

    premium: 'linear-gradient(135deg, #FF3D41 0%, #E02427 100%)',
    // Was: linear-gradient(135deg, #ff0080 0%, #b829ff 100%)

    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    // Unchanged
  },

  border: {
    default: '#333333',      // Was rgba(255, 255, 255, 0.1)
    hover: '#4a4a4a',        // Was rgba(255, 255, 255, 0.2)
    focus: '#FF3D41',        // Was rgba(255, 0, 128, 0.5)
  },
}

// Update shadows too
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
  glow: {
    red: '0 0 20px rgba(255, 61, 65, 0.5)',     // Was pink
    redLg: '0 0 40px rgba(255, 61, 65, 0.6)',   // Was pink
    blue: '0 0 20px rgba(64, 169, 255, 0.5)',   // Was cyan
    purple: '0 0 20px rgba(146, 84, 222, 0.5)', // Was purple
  },
}

// Update glassmorph function
export function glassmorph(opacity = 0.8, blur = 10) {
  return {
    background: `rgba(32, 32, 32, ${opacity})`,  // Was rgba(18, 18, 26, ...)
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(255, 255, 255, 0.1)`,
  };
}
```

---

## 🔥 AUTOMATED SEARCH & REPLACE (10 minutes)

Use your IDE's **Find and Replace in Files** (Ctrl+Shift+H in VS Code):

### **Round 1: Background Colors**
```
Path: src/**/*.{ts,tsx,css}

Find: #0a0a0f
Replace: #161616
---
Find: #12121a
Replace: #202020
---
Find: #1a1a26
Replace: #202020
---
Find: #222232
Replace: #2a2a2a
---
Find: rgba\(18, 18, 26
Replace: rgba(32, 32, 32
(Use regex: ✓)
```

### **Round 2: Accent Colors**
```
Find: #ff0080
Replace: #FF3D41
---
Find: #00d9ff
Replace: #40A9FF
---
Find: #b829ff
Replace: #9254DE
---
Find: #00ff88
Replace: #00D98E
---
Find: #ffd000
Replace: #FFB020
```

### **Round 3: Text Colors**
```
Find: #b3b3b3
Replace: #CCCCCC
---
Find: #737373
Replace: #AAAAAA
---
Find: #4d4d4d
Replace: #666666
```

### **Round 4: Glow Effects**
```
Find: rgba\(255, 0, 128, 0\.5\)
Replace: rgba(255, 61, 65, 0.5)
(Use regex: ✓)
---
Find: rgba\(255, 0, 128, 0\.3\)
Replace: rgba(255, 61, 65, 0.3)
(Use regex: ✓)
---
Find: rgba\(0, 217, 255, 0\.5\)
Replace: rgba(64, 169, 255, 0.5)
(Use regex: ✓)
```

---

## ✅ QUICK VALIDATION (5 minutes)

After search & replace, verify these key components:

### **1. Check Navigation**
Open [`ModernNav.tsx`](./src/components/streaming/ModernNav.tsx)
- ✅ Background should be `#202020` (not #12121a)
- ✅ Logo should use `#FF3D41` (not #ff0080)
- ✅ Active link should use `#FF3D41`

### **2. Check Buttons**
Open [`Button.tsx`](./src/components/ui/Button.tsx)
- ✅ Primary button should be `bg-[#FF3D41]` (not #ff0080)
- ✅ Hover should be `hover:bg-[#FF6366]`

### **3. Check Cards**
Open [`TitleCard.tsx`](./src/components/ui/TitleCard.tsx)
- ✅ Card should have `bg-transparent` (no background color!)
- ✅ 1080p badge should be `bg-[#FF3D41]`

### **4. Check Hero**
Open [`HeroSection.tsx`](./src/components/ui/HeroSection.tsx)
- ✅ Gradient should use `#161616` at the bottom (not #0a0a0f)
- ✅ Play button should be `#FF3D41`

---

## 🎯 PRIORITY COMPONENTS (Do these first!)

### **High Priority (Do Now)**
1. ✅ `src/lib/design-system.ts` - **DONE** (Step 2)
2. 🔴 `src/components/streaming/ModernNav.tsx` - Navigation bar
3. 🔴 `src/components/ui/Button.tsx` - Buttons
4. 🔴 `src/components/ui/TitleCard.tsx` - Content cards (MAKE TRANSPARENT!)
5. 🔴 `src/components/ui/HeroSection.tsx` - Hero banner

### **Medium Priority (Do Next)**
6. `src/components/ui/Input.tsx` - Form inputs
7. `src/components/ui/Dialog.tsx` - Modals
8. `src/components/streaming/ContentRail.tsx` - Content rows
9. `src/app/(protected)/home/page.tsx` - Homepage
10. `src/components/WorldClassFooter.tsx` - Footer

### **Low Priority (Do Later)**
11. All other components in `src/components/`
12. Admin dashboard components
13. Settings pages
14. Subscription pages

---

## 🔍 FIND REMAINING OLD COLORS

After search & replace, find any stragglers:

```bash
# In your terminal (from Frontend directory)

# Find any remaining old pink color
grep -r "#ff0080" src/

# Find any remaining old cyan color
grep -r "#00d9ff" src/

# Find any remaining old purple color
grep -r "#b829ff" src/

# Find any remaining old background colors
grep -r "#0a0a0f" src/
grep -r "#12121a" src/
grep -r "#1a1a26" src/
```

If these return results, manually update those files.

---

## 🧪 TEST YOUR CHANGES

### **Visual Test (5 min)**
1. Run dev server: `npm run dev`
2. Open http://localhost:3000
3. Check:
   - ✅ Navigation bar is dark gray (#202020), not purple-tinted
   - ✅ Logo/active links are RED (#FF3D41), not pink
   - ✅ Content cards are TRANSPARENT, not dark purple
   - ✅ 1080p badges are RED, not pink
   - ✅ Buttons are RED, not pink
   - ✅ Page background is dark gray (#161616), not near-black
   - ✅ Text is readable (white/light gray on dark backgrounds)

### **Hover Test**
- Hover over cards → Should scale up with RED glow
- Hover over buttons → Should get RED glow
- Hover over links → Should show RED underline

### **Interaction Test**
- Click buttons → Should work normally
- Click cards → Should navigate correctly
- Search → Should focus with RED border

---

## 📊 PROGRESS TRACKER

Copy this to track your work:

```markdown
## Color Migration Progress

### ✅ Completed
- [x] design-system.ts
- [x] Automated search & replace (backgrounds, accents, text)

### 🔄 In Progress
- [ ] ModernNav.tsx
- [ ] Button.tsx
- [ ] TitleCard.tsx (MAKE TRANSPARENT!)
- [ ] HeroSection.tsx
- [ ] Input.tsx

### ⏳ To Do
- [ ] Dialog.tsx
- [ ] ContentRail.tsx
- [ ] home/page.tsx
- [ ] WorldClassFooter.tsx
- [ ] All remaining components

### 🐛 Issues Found
(List any problems here)

### 📝 Notes
(Add any observations or decisions)
```

---

## 🆘 TROUBLESHOOTING

### **Problem: Colors not changing**
- ✅ **Solution**: Clear Next.js cache
  ```bash
  rm -rf .next
  npm run dev
  ```

### **Problem: Some components still show old colors**
- ✅ **Solution**: Check if they use CSS variables instead of design-system.ts
  - Update `src/app/globals.css` CSS variables
  - Search for `:root {` and update values there too

### **Problem: Contrast too low (text hard to read)**
- ✅ **Solution**: Check text color hierarchy
  - Headings: `#FFFFFF` (white)
  - Body: `#CCCCCC` (light gray)
  - Secondary: `#AAAAAA` (muted gray)
  - Disabled: `#666666` (dark gray)

### **Problem: Cards have ugly backgrounds**
- ✅ **Solution**: Make cards TRANSPARENT (like Animesuge)
  - Remove `bg-[#...]` classes
  - Add `bg-transparent`
  - Let the poster image be the background

---

## 🎨 REFERENCE: BEFORE → AFTER

### **Navigation Bar**
```diff
- background: '#12121a'  // Purple-tinted dark
+ background: '#202020'  // Neutral dark gray

- active color: '#ff0080'  // Hot pink
+ active color: '#FF3D41'  // Animesuge red
```

### **Primary Button**
```diff
- bg-[#ff0080]  // Pink
+ bg-[#FF3D41]  // Red

- hover:bg-[#ff3399]  // Lighter pink
+ hover:bg-[#FF6366]  // Lighter red
```

### **Content Card**
```diff
- bg-[#1a1a26]  // Dark purple background
+ bg-transparent  // No background (image shows)

- Quality badge: bg-[#ff0080]  // Pink
+ Quality badge: bg-[#FF3D41]  // Red
```

### **Hero Section**
```diff
- gradient: rgba(10, 10, 15, 0.8)  // Purple-black
+ gradient: rgba(22, 22, 22, 0.7)  // Gray-black

- Play button: bg-[#ff0080]  // Pink
+ Play button: bg-[#FF3D41]  // Red
```

---

## 📚 FULL DOCUMENTATION

For complete details, see:
1. **[AI_AGENT_MASTER_PROMPT.md](./AI_AGENT_MASTER_PROMPT.md)** - Complete transformation guide
2. **[ANIMESUGE_DESIGN_SYSTEM.md](./ANIMESUGE_DESIGN_SYSTEM.md)** - Design system reference
3. **[CLAUDE.md](../CLAUDE.md)** - Project context & requirements

---

## ✨ FINAL CHECKLIST

Before considering the migration complete:

- [ ] All search & replace operations completed
- [ ] design-system.ts updated
- [ ] globals.css CSS variables updated (if needed)
- [ ] ModernNav uses red (#FF3D41)
- [ ] Buttons use red (#FF3D41)
- [ ] Cards are transparent with red badges
- [ ] Hero sections use red Play buttons
- [ ] Inputs have red focus borders
- [ ] Modals use dark gray backgrounds
- [ ] No old colors remain (verified with grep)
- [ ] Visual QA passed (homepage looks good)
- [ ] Hover effects work (red glow)
- [ ] Text is readable (good contrast)
- [ ] Responsive design intact
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🚀 LET'S GO!

**Estimated time to 80% complete:** 30-45 minutes (if you follow this quickstart)

**Order of operations:**
1. ✅ **Step 1-2** (5 min) - Update design-system.ts
2. 🔥 **Automated Replace** (10 min) - Search & replace in IDE
3. 🔍 **Find Stragglers** (5 min) - grep for remaining old colors
4. 🎯 **Priority Components** (15 min) - Update Nav, Buttons, Cards, Hero
5. 🧪 **Test** (5 min) - Visual QA
6. ✅ **Polish** (10+ min) - Fix any remaining issues

**Total:** ~45-60 minutes for a working prototype!

---

**Good luck! The new Animesuge-inspired theme will look amazing! 🎬🔴**
