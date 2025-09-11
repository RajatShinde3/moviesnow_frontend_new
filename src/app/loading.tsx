// app/loading.tsx
/**
 * =============================================================================
 * Route Loading Fallback (Best-of-best)
 * =============================================================================
 * Lightweight, accessible skeleton that mirrors common page layouts without
 * causing layout shift. Animations respect reduced-motion preferences.
 */

export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* SR-only announcement for screen readers */}
      <span className="sr-only">Loading…</span>

      {/* Title + subtitle skeletons */}
      <div
        className="h-7 w-44 rounded-md bg-muted motion-safe:animate-pulse motion-reduce:animate-none"
        aria-hidden="true"
      />
      <div
        className="mt-3 h-4 w-72 rounded-md bg-muted/70 motion-safe:animate-pulse motion-reduce:animate-none"
        aria-hidden="true"
      />

      {/* Primary content block with card/grid-like placeholders */}
      <div className="mt-6 rounded-xl border bg-card/50 p-4 shadow-sm" aria-hidden="true">
        <div className="h-5 w-32 rounded bg-muted motion-safe:animate-pulse motion-reduce:animate-none" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="h-4 w-3/5 rounded bg-muted motion-safe:animate-pulse motion-reduce:animate-none" />
              <div className="mt-3 h-24 w-full rounded-md bg-muted/60 motion-safe:animate-pulse motion-reduce:animate-none" />
              <div className="mt-3 h-8 w-24 rounded-md bg-muted motion-safe:animate-pulse motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
