# 🎨 Enhanced UI Components Guide
**MoviesNow Platform - Production-Ready Component Library**

---

## 📋 Overview

This guide documents the enhanced UI component library created for the MoviesNow platform. All components feature:

✅ **Beautiful Design** - Glassmorphism, gradients, and modern aesthetics
✅ **Advanced Animations** - Smooth transitions using Framer Motion
✅ **Accessibility** - ARIA labels, keyboard navigation, screen reader support
✅ **TypeScript** - Full type safety with comprehensive prop types
✅ **Responsive** - Mobile-first, works on all screen sizes
✅ **Dark Mode** - Designed for dark themes (platform standard)

---

## 🧩 Component Catalog

### 1. **EnhancedCard** - Advanced Card Component

**Location:** `components/ui/EnhancedCard.tsx`

**Features:**
- 4 visual variants (glass, solid, gradient, neon)
- 4 hover effects (lift, glow, scale, tilt)
- Shimmer loading state
- Gradient borders
- Modular sub-components

**Usage:**
```tsx
import { EnhancedCard, CardHeader, CardContent, CardFooter } from "@/components/ui";
import { Activity } from "lucide-react";

<EnhancedCard variant="glass" hoverEffect="lift" borderGradient>
  <CardHeader icon={<Activity className="w-5 h-5" />} action={<button>...</button>}>
    Active Users
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">1,234</div>
    <p className="text-slate-400">Currently streaming</p>
  </CardContent>
  <CardFooter>
    <button>View Details</button>
  </CardFooter>
</EnhancedCard>
```

**Props:**
```typescript
variant?: "glass" | "solid" | "gradient" | "neon"
hoverEffect?: "lift" | "glow" | "scale" | "tilt" | "none"
isLoading?: boolean
glowColor?: string
borderGradient?: boolean
```

---

### 2. **EnhancedButton** - Advanced Button Component

**Location:** `components/ui/EnhancedButton.tsx`

**Features:**
- 8 visual variants
- 5 sizes (xs, sm, md, lg, xl)
- Loading states with spinners
- Icon support (left/right positions)
- Ripple effect on click
- Full keyboard accessibility

**Usage:**
```tsx
import { EnhancedButton, ButtonGroup, IconButton } from "@/components/ui";
import { Download, Trash2 } from "lucide-react";

// Primary button with icon
<EnhancedButton
  variant="primary"
  size="lg"
  icon={Download}
  iconPosition="left"
  isLoading={isDownloading}
>
  Download
</EnhancedButton>

// Button group
<ButtonGroup orientation="horizontal">
  <EnhancedButton variant="success">Save</EnhancedButton>
  <EnhancedButton variant="ghost">Cancel</EnhancedButton>
</ButtonGroup>

// Icon-only button
<IconButton
  icon={Trash2}
  label="Delete"
  variant="danger"
  size="sm"
/>
```

**Variants:**
- `primary` - Emerald gradient (default)
- `secondary` - Slate gray
- `success` - Green gradient
- `danger` - Red gradient
- `ghost` - Transparent with border
- `link` - Text-style button
- `gradient` - Purple/pink/red gradient
- `neon` - Glowing border effect

---

### 3. **EnhancedInput** - Advanced Input Component

**Location:** `components/ui/EnhancedInput.tsx`

**Features:**
- Beautiful glassmorphism design
- Icon support (left/right)
- Password visibility toggle
- Success/error states with icons
- Character count
- Helper text
- Floating labels
- Focus animations

**Usage:**
```tsx
import { EnhancedInput, EnhancedTextarea } from "@/components/ui";
import { Mail, Lock, User } from "lucide-react";

// Email input with validation
<EnhancedInput
  label="Email Address"
  type="email"
  icon={Mail}
  placeholder="Enter your email"
  error={errors.email}
  success={isValidEmail ? "Email is valid" : undefined}
  required
/>

// Password input (auto-shows toggle)
<EnhancedInput
  label="Password"
  type="password"
  icon={Lock}
  helperText="Must be at least 8 characters"
  showCharCount
  maxLength={50}
/>

// Textarea with character count
<EnhancedTextarea
  label="Description"
  placeholder="Tell us about your title..."
  showCharCount
  maxLength={500}
  textareaSize="lg"
/>
```

**Props:**
```typescript
label?: string
icon?: LucideIcon
iconPosition?: "left" | "right"
error?: string
success?: string
helperText?: string
showCharCount?: boolean
maxLength?: number
variant?: "default" | "filled" | "outlined"
inputSize?: "sm" | "md" | "lg"
```

---

### 4. **EnhancedModal** - Advanced Modal Component

**Location:** `components/ui/EnhancedModal.tsx`

**Features:**
- Beautiful glassmorphism design
- Multiple sizes (sm, md, lg, xl, full)
- 4 animation types
- Backdrop blur
- Close on backdrop click
- Close on Escape key
- Scroll lock when open
- Portal rendering

**Usage:**
```tsx
import { EnhancedModal, ConfirmDialog, Drawer } from "@/components/ui";
import { AlertTriangle, Settings } from "lucide-react";

// Standard modal
<EnhancedModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Upload Content"
  icon={Upload}
  size="lg"
  animation="scale"
  footer={
    <div className="flex gap-3 justify-end">
      <button onClick={onClose}>Cancel</button>
      <button onClick={onSubmit}>Upload</button>
    </div>
  }
>
  <form>{/* Your form here */}</form>
</EnhancedModal>

// Confirm dialog (specialized modal)
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Title"
  message="Are you sure you want to delete this title? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  isLoading={isDeleting}
/>

// Drawer (slide-in from side)
<Drawer
  isOpen={showDrawer}
  onClose={() => setShowDrawer(false)}
  position="right"
  width="400px"
>
  <div className="p-6">
    <h2>Settings</h2>
    {/* Settings content */}
  </div>
</Drawer>
```

**Props:**
```typescript
isOpen: boolean
onClose: () => void
title?: string
icon?: LucideIcon
size?: "sm" | "md" | "lg" | "xl" | "full"
animation?: "fade" | "scale" | "slideUp" | "slideDown"
showCloseButton?: boolean
closeOnBackdrop?: boolean
closeOnEscape?: boolean
footer?: ReactNode
```

---

### 5. **EnhancedLoading** - Loading States & Skeletons

**Location:** `components/ui/EnhancedLoading.tsx`

**Features:**
- 5 loading variants
- Multiple skeleton components
- Accessible loading states
- Customizable sizes
- Full-screen support

**Usage:**
```tsx
import {
  EnhancedLoading,
  Skeleton,
  ContentCardSkeleton,
  TableSkeleton,
  ProfileAvatarSkeleton,
  StatsGridSkeleton
} from "@/components/ui";

// Full page loading
{isLoading && (
  <EnhancedLoading
    variant="logo"
    fullScreen
    message="Loading your content..."
    size="lg"
  />
)}

// Loading variants
<EnhancedLoading variant="spinner" />  // Spinning loader
<EnhancedLoading variant="dots" />     // Animated dots
<EnhancedLoading variant="pulse" />    // Pulsing circle
<EnhancedLoading variant="logo" />     // Rotating logo

// Skeleton loaders
<ContentCardSkeleton />                 // For content cards
<TableSkeleton rows={5} columns={4} />  // For tables
<ProfileAvatarSkeleton />               // For profile avatars
<StatsGridSkeleton count={4} />         // For stats grids

// Base skeleton
<Skeleton className="h-8 w-64" />
<Skeleton className="h-48 w-full" variant="rectangular" />
<Skeleton className="w-12 h-12" variant="circular" />
```

**Variants:**
- `spinner` - Rotating spinner
- `dots` - Three animated dots
- `pulse` - Pulsing circle
- `logo` - Rotating film icon
- `skeleton` - Gray placeholder shapes

---

### 6. **ErrorBoundary** - Error Handling Component

**Location:** `components/ui/ErrorBoundary.tsx`

**Features:**
- Beautiful glassmorphism error UI
- Automatic error reporting hooks
- Retry, Home, and Reload buttons
- Error details in dev mode
- Smooth animations
- Accessible error states

**Usage:**
```tsx
import { ErrorBoundary, ErrorBoundaryWrapper } from "@/components/ui";

// Wrap individual components
<ErrorBoundary onError={(error) => logToSentry(error)}>
  <YourComponent />
</ErrorBoundary>

// Wrap entire app (in layout.tsx)
export default function Layout({ children }) {
  return (
    <ErrorBoundaryWrapper>
      {children}
    </ErrorBoundaryWrapper>
  );
}

// With custom fallback
<ErrorBoundary
  fallback={
    <div>Custom error UI</div>
  }
  onError={(error, errorInfo) => {
    // Send to error tracking
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } }
    });
  }}
>
  <RiskyComponent />
</ErrorBoundary>
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary (Emerald) */
--emerald-400: #34d399
--emerald-500: #10b981
--emerald-600: #059669

/* Slate (Backgrounds) */
--slate-700: #334155
--slate-800: #1e293b
--slate-900: #0f172a
--slate-950: #020617

/* Success (Green) */
--green-400: #4ade80
--green-500: #22c55e
--green-600: #16a34a

/* Danger (Red) */
--red-400: #f87171
--red-500: #ef4444
--red-600: #dc2626

/* Warning (Amber) */
--amber-400: #fbbf24
--amber-500: #f59e0b
--amber-600: #d97706
```

### Typography Scale

```css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
```

### Spacing Scale

```css
gap-1: 0.25rem (4px)
gap-2: 0.5rem (8px)
gap-3: 0.75rem (12px)
gap-4: 1rem (16px)
gap-6: 1.5rem (24px)
gap-8: 2rem (32px)
```

### Border Radius

```css
rounded-lg: 0.5rem (8px)
rounded-xl: 0.75rem (12px)
rounded-2xl: 1rem (16px)
rounded-full: 9999px
```

---

## ♿ Accessibility Features

All components include:

✅ **ARIA Labels** - Proper labeling for screen readers
✅ **Keyboard Navigation** - Full keyboard support (Tab, Enter, Escape)
✅ **Focus Indicators** - Visible focus states
✅ **Semantic HTML** - Correct HTML elements (`button`, `input`, etc.)
✅ **Role Attributes** - Proper ARIA roles (`dialog`, `status`, etc.)
✅ **Live Regions** - ARIA live regions for dynamic content
✅ **Color Contrast** - WCAG AA compliant contrast ratios

### Keyboard Shortcuts

| Component | Key | Action |
|-----------|-----|--------|
| Modal | Escape | Close modal |
| Button | Enter/Space | Trigger action |
| Input | Tab | Move to next field |
| Drawer | Escape | Close drawer |

---

## 🚀 Usage Best Practices

### 1. **Consistent Styling**
```tsx
// ✅ GOOD: Use component variants
<EnhancedButton variant="primary" size="lg">
  Click Me
</EnhancedButton>

// ❌ BAD: Custom inline styles
<button style={{ backgroundColor: "green" }}>
  Click Me
</button>
```

### 2. **Accessibility First**
```tsx
// ✅ GOOD: Include labels and ARIA
<EnhancedInput
  label="Email"
  type="email"
  required
  aria-describedby="email-helper"
/>

// ❌ BAD: No label or accessibility
<input type="email" placeholder="Email" />
```

### 3. **Loading States**
```tsx
// ✅ GOOD: Show skeleton while loading
{isLoading ? (
  <ContentCardSkeleton />
) : (
  <ContentCard data={data} />
)}

// ❌ BAD: Show nothing while loading
{!isLoading && <ContentCard data={data} />}
```

### 4. **Error Handling**
```tsx
// ✅ GOOD: Wrap components with error boundaries
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>

// ❌ BAD: No error handling
<ComplexComponent />
```

---

## 📦 Installation & Setup

These components are already integrated into the MoviesNow platform. To use them:

```tsx
// Import from the UI barrel export
import {
  EnhancedCard,
  EnhancedButton,
  EnhancedInput,
  EnhancedModal
} from "@/components/ui";

// Or import individually
import { EnhancedButton } from "@/components/ui/EnhancedButton";
```

### Dependencies

All components require:
- **React 18+**
- **Framer Motion** - For animations
- **Lucide React** - For icons
- **Tailwind CSS** - For styling
- **TypeScript** - For type safety

---

## 🎯 Component Combinations

### Example: User Profile Card

```tsx
import { EnhancedCard, CardHeader, CardContent, IconButton } from "@/components/ui";
import { User, Settings } from "lucide-react";

<EnhancedCard variant="glass" hoverEffect="lift">
  <CardHeader
    icon={<User className="w-5 h-5" />}
    action={
      <IconButton
        icon={Settings}
        label="Edit Profile"
        variant="ghost"
        size="sm"
      />
    }
  >
    John Doe
  </CardHeader>
  <CardContent>
    <p className="text-slate-400">Premium Member</p>
    <p className="text-sm text-slate-500">Joined Jan 2024</p>
  </CardContent>
</EnhancedCard>
```

### Example: Form with Validation

```tsx
import { EnhancedInput, EnhancedButton, EnhancedModal } from "@/components/ui";
import { Mail, Lock } from "lucide-react";

<EnhancedModal
  isOpen={isOpen}
  onClose={onClose}
  title="Sign In"
  size="sm"
>
  <form onSubmit={handleSubmit} className="space-y-4">
    <EnhancedInput
      label="Email"
      type="email"
      icon={Mail}
      error={errors.email}
      required
    />
    <EnhancedInput
      label="Password"
      type="password"
      icon={Lock}
      error={errors.password}
      required
    />
    <EnhancedButton
      type="submit"
      variant="primary"
      fullWidth
      isLoading={isSubmitting}
    >
      Sign In
    </EnhancedButton>
  </form>
</EnhancedModal>
```

---

## 🔧 Customization

### Extending Components

```tsx
// Create custom variants
import { EnhancedButton } from "@/components/ui";

function MyCustomButton(props) {
  return (
    <EnhancedButton
      variant="gradient"
      className="custom-shadow custom-hover"
      {...props}
    />
  );
}
```

### Theme Customization

All components use Tailwind CSS classes, so you can customize colors in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Customize primary color
        emerald: {
          400: '#yourColor',
          500: '#yourColor',
          600: '#yourColor',
        }
      }
    }
  }
}
```

---

## 📚 Related Documentation

- [AUDIT_REPORT.md](../AUDIT_REPORT.md) - Full platform audit
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Implementation details
- [CLAUDE.md](../CLAUDE.md) - Project overview

---

## ✅ Quality Checklist

Before using components in production, ensure:

- [ ] Component is imported from `@/components/ui`
- [ ] All required props are provided
- [ ] Accessibility labels are included
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] Responsive design is tested
- [ ] Keyboard navigation works
- [ ] Screen reader tested (if applicable)

---

**Last Updated:** December 27, 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready

---

**End of UI Components Guide**
