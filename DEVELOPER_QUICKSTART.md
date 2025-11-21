# 🚀 Developer Quick Start Guide

## Setup (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local

# Edit .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_CDN_URL=https://your-cloudfront.cloudfront.net
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 3. Run dev server
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Auth pages (login, signup)
│   ├── (protected)/       # Main app pages
│   │   ├── home/          # Landing page
│   │   ├── browse/        # Catalog with filters
│   │   ├── search/        # Search results
│   │   ├── title/[slug]/  # Title details
│   │   ├── watch/         # Video player
│   │   ├── watchlist/     # User watchlist
│   │   ├── profiles/      # Profile management
│   │   └── admin/         # Admin dashboard
│   ├── not-found.tsx      # 404 page
│   └── error.tsx          # Error boundary
│
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Dialog.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TitleCard.tsx
│   │   ├── TitleGrid.tsx
│   │   └── ...
│   ├── player/            # Video player
│   │   └── VideoPlayer.tsx
│   └── Navigation.tsx     # Main navigation
│
└── lib/
    └── api/               # API integration
        ├── types.ts       # TypeScript types
        ├── endpoints.ts   # API endpoints
        ├── services.ts    # API services
        └── client.ts      # HTTP client
```

---

## Quick Reference

### Using API Services

```typescript
import { api } from "@/lib/api/services";

// Browsing
const titles = await api.discovery.browse({
  type: "MOVIE",
  genres: ["action"],
  page: 1,
  page_size: 24,
});

// Search
const results = await api.discovery.search("action movies");

// Start playback
const session = await api.playback.startSession({
  episode_id: "123",
  quality: "720p",
  protocol: "HLS",
});

// Add to watchlist
await api.watchlist.add(titleId);

// Admin analytics
const analytics = await api.admin.getAnalyticsSummary();
```

### Using Components

```typescript
import { Button } from "@/components/ui/Button";
import { TitleCard } from "@/components/ui/TitleCard";
import { VideoPlayer } from "@/components/player/VideoPlayer";

// Button
<Button variant="play" size="lg">
  Play
</Button>

// Title card
<TitleCard
  title={title}
  showMetadata
  onClick={() => router.push(`/title/${title.slug}`)}
/>

// Video player
<VideoPlayer
  titleId={titleId}
  episodeId={episodeId}
  quality="720p"
  autoPlay
/>
```

### Using React Query

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ["titles", "trending"],
  queryFn: () => api.discovery.getTrending(20),
});

// Mutate data
const addToWatchlist = useMutation({
  mutationFn: (titleId: string) => api.watchlist.add(titleId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["watchlist"] });
  },
});
```

---

## Common Tasks

### Add a New Page

1. Create file in `src/app/(protected)/your-page/page.tsx`
2. Export default async/client component
3. Use API services for data fetching
4. Add to navigation if needed

```typescript
// app/(protected)/your-page/page.tsx
export default async function YourPage() {
  const data = await api.someService.getData();

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8">
        {/* Your content */}
      </div>
    </div>
  );
}
```

### Add a New Component

1. Create in `src/components/ui/YourComponent.tsx`
2. Use existing components as reference
3. Export with proper TypeScript types

```typescript
// components/ui/YourComponent.tsx
import * as React from "react";

interface YourComponentProps {
  title: string;
  children?: React.ReactNode;
}

export function YourComponent({ title, children }: YourComponentProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}
```

### Add a New API Service

1. Add types to `src/lib/api/types.ts`
2. Add endpoints to `src/lib/api/endpoints.ts`
3. Add service methods to `src/lib/api/services.ts`

```typescript
// types.ts
export interface YourModel {
  id: string;
  name: string;
}

// endpoints.ts
export const ENDPOINTS = {
  YOUR_SERVICE: {
    LIST: "/your-service",
    DETAIL: (id: string) => `/your-service/${id}`,
  },
};

// services.ts
export const yourService = {
  async getAll(): Promise<YourModel[]> {
    return client.get(ENDPOINTS.YOUR_SERVICE.LIST);
  },
  async getById(id: string): Promise<YourModel> {
    return client.get(ENDPOINTS.YOUR_SERVICE.DETAIL(id));
  },
};
```

---

## Styling Guide

### Tailwind Classes (Common Patterns)

```tsx
// Layout
<div className="min-h-screen">                      // Full height
<div className="mx-auto max-w-screen-2xl">          // Max width container
<div className="space-y-8 px-4 py-8">               // Spacing

// Cards
<div className="rounded-lg border bg-card p-6">     // Card style
<div className="hover:border-primary">              // Hover effect

// Text
<h1 className="text-3xl font-bold">                 // Heading
<p className="text-muted-foreground">               // Secondary text

// Buttons (use Button component instead)
<button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">

// Grid
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
```

---

## Keyboard Shortcuts

### Video Player
- `Space` / `K` - Play/Pause
- `F` - Fullscreen
- `M` - Mute
- `←` - Seek -10s
- `→` - Seek +10s
- `↑` - Volume up
- `↓` - Volume down

---

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_CDN_URL=https://your-cloudfront.cloudfront.net
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional
NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXX-X
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Type errors
```bash
# Check TypeScript
npm run type-check
```

---

## Next Steps

1. **Connect Backend**: Update `NEXT_PUBLIC_API_URL` to your backend URL
2. **Add Analytics**: Integrate Google Analytics or similar
3. **Error Tracking**: Set up Sentry or similar service
4. **Testing**: Add tests with Jest/Vitest and Testing Library
5. **E2E Tests**: Add Playwright/Cypress tests
6. **CI/CD**: Set up GitHub Actions or similar
7. **Deploy**: Deploy to Vercel, AWS, or your platform

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [TypeScript](https://www.typescriptlang.org/docs)
- [HLS.js](https://github.com/video-dev/hls.js)

---

**Happy Coding! 🎉**
