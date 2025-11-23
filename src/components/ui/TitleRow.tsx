// components/ui/TitleRow.tsx
/**
 * =============================================================================
 * Title Row - Netflix-style Horizontal Scrollable Row (Enterprise-Grade)
 * =============================================================================
 * Premium scrollable row featuring:
 * - Smooth scroll with navigation arrows
 * - Gradient fade edges
 * - Staggered animation on load
 * - Responsive sizing
 * - Keyboard navigation support
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Title } from "@/lib/api/types";
import { TitleCard } from "./TitleCard";

export interface TitleRowProps {
  title?: string;
  titles: Title[];
  size?: "sm" | "md" | "lg" | "xl";
  showMetadata?: boolean;
  showQuickActions?: boolean;
  viewAllHref?: string;
  className?: string;
}

export function TitleRow({
  title,
  titles,
  size = "md",
  showMetadata = true,
  showQuickActions = true,
  viewAllHref,
  className,
}: TitleRowProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);

  // Check scroll position
  const checkScrollPosition = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Initialize scroll check
  React.useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition, titles]);

  // Scroll handlers
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (titles.length === 0) return null;

  return (
    <section
      className={cn("relative space-y-4", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-1">
          <h2
            className={cn(
              "text-xl font-bold tracking-tight sm:text-2xl",
              "text-foreground"
            )}
          >
            {title}
          </h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className={cn(
                "group flex items-center gap-1",
                "text-sm font-medium text-muted-foreground",
                "transition-colors hover:text-foreground"
              )}
            >
              <span>Explore All</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  "group-hover:translate-x-0.5"
                )}
              />
            </Link>
          )}
        </div>
      )}

      {/* Scrollable Container with Navigation */}
      <div className="relative -mx-4 px-4">
        {/* Left Navigation Arrow */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            "absolute left-0 top-1/2 z-20 -translate-y-1/2",
            "flex h-full w-12 items-center justify-start pl-2",
            "bg-gradient-to-r from-background via-background/80 to-transparent",
            "text-white transition-all duration-300",
            "focus-visible:outline-none",
            canScrollLeft && isHovered
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          )}
          aria-label="Scroll left"
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-white/10 backdrop-blur-sm",
              "transition-all hover:bg-white/20 hover:scale-110"
            )}
          >
            <ChevronLeft className="h-6 w-6" />
          </div>
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={() => scroll("right")}
          className={cn(
            "absolute right-0 top-1/2 z-20 -translate-y-1/2",
            "flex h-full w-12 items-center justify-end pr-2",
            "bg-gradient-to-l from-background via-background/80 to-transparent",
            "text-white transition-all duration-300",
            "focus-visible:outline-none",
            canScrollRight && isHovered
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          )}
          aria-label="Scroll right"
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-white/10 backdrop-blur-sm",
              "transition-all hover:bg-white/20 hover:scale-110"
            )}
          >
            <ChevronRight className="h-6 w-6" />
          </div>
        </button>

        {/* Scrollable Row */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-3 overflow-x-auto pb-4 pt-1",
            "scrollbar-hide",
            "-mx-4 px-4"
          )}
          style={{ scrollSnapType: "x mandatory" }}
        >
          {titles.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex-shrink-0",
                "animate-fadeIn opacity-0"
              )}
              style={{
                scrollSnapAlign: "start",
                animationDelay: `${index * 50}ms`,
                animationFillMode: "forwards",
              }}
            >
              <TitleCard
                title={item}
                size={size}
                showMetadata={showMetadata}
                showQuickActions={showQuickActions}
                index={index}
              />
            </div>
          ))}
        </div>

        {/* Edge Fades */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-8",
            "bg-gradient-to-r from-background to-transparent",
            canScrollLeft ? "opacity-100" : "opacity-0",
            "transition-opacity duration-300"
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-8",
            "bg-gradient-to-l from-background to-transparent",
            canScrollRight ? "opacity-100" : "opacity-0",
            "transition-opacity duration-300"
          )}
        />
      </div>
    </section>
  );
}
