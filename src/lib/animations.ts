// lib/animations.ts
/**
 * =============================================================================
 * Advanced Animations & Transitions
 * =============================================================================
 * Reusable animation utilities for Netflix-like polish
 */

/**
 * Staggered animation for lists
 * Usage: Apply to parent, children will animate sequentially
 */
export const staggeredFadeIn = {
  container: {
    className: "space-y-4",
  },
  item: (index: number) => ({
    className: "animate-fadeIn",
    style: {
      animationDelay: `${index * 100}ms`,
      animationFillMode: "both",
    },
  }),
};

/**
 * Page transition animations
 */
export const pageTransitions = {
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  slideDown: "animate-slideDown",
  scaleIn: "animate-scaleIn",
};

/**
 * Card hover animations
 */
export const cardHoverEffects = {
  scale: "transition-transform duration-300 hover:scale-105",
  scaleSubtle: "transition-transform duration-300 hover:scale-102",
  lift: "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
  glow: "transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
};

/**
 * Smooth scroll configuration
 */
export const smoothScroll = {
  behavior: "smooth" as const,
  block: "start" as const,
};

/**
 * Parallax scroll effect
 * Returns transform value based on scroll position
 */
export function getParallaxTransform(scrollY: number, speed: number = 0.5): string {
  return `translateY(${scrollY * speed}px)`;
}

/**
 * Intersection Observer hook for scroll animations
 */
export function useScrollAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Debounce utility for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Smooth momentum scrolling for horizontal lists
 */
export class MomentumScroller {
  private element: HTMLElement;
  private startX: number = 0;
  private scrollLeft: number = 0;
  private isDown: boolean = false;
  private velocity: number = 0;
  private rafId: number | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.init();
  }

  private init() {
    this.element.addEventListener("mousedown", this.handleMouseDown);
    this.element.addEventListener("mousemove", this.handleMouseMove);
    this.element.addEventListener("mouseup", this.handleMouseUp);
    this.element.addEventListener("mouseleave", this.handleMouseUp);
  }

  private handleMouseDown = (e: MouseEvent) => {
    this.isDown = true;
    this.startX = e.pageX - this.element.offsetLeft;
    this.scrollLeft = this.element.scrollLeft;
    this.velocity = 0;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDown) return;
    e.preventDefault();
    const x = e.pageX - this.element.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.element.scrollLeft = this.scrollLeft - walk;
    this.velocity = walk;
  };

  private handleMouseUp = () => {
    this.isDown = false;
    this.applyMomentum();
  };

  private applyMomentum() {
    if (Math.abs(this.velocity) < 0.5) return;

    const friction = 0.95;
    const step = () => {
      this.velocity *= friction;
      this.element.scrollLeft -= this.velocity;

      if (Math.abs(this.velocity) > 0.5) {
        this.rafId = requestAnimationFrame(step);
      }
    };

    step();
  }

  destroy() {
    this.element.removeEventListener("mousedown", this.handleMouseDown);
    this.element.removeEventListener("mousemove", this.handleMouseMove);
    this.element.removeEventListener("mouseup", this.handleMouseUp);
    this.element.removeEventListener("mouseleave", this.handleMouseUp);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

// Import React for hooks
import * as React from "react";
