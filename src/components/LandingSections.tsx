"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * =============================================================================
 * Stats Section - Build Trust with Numbers
 * =============================================================================
 */

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const defaultStats: Stat[] = [
  {
    value: "10M+",
    label: "Active Users",
    icon: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    value: "50K+",
    label: "Movies & Shows",
    icon: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
      </svg>
    ),
  },
  {
    value: "4.8/5",
    label: "User Rating",
    icon: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
  },
  {
    value: "190+",
    label: "Countries",
    icon: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
];

export function StatsSection() {
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const currentRef = sectionRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-b from-black via-gray-900 to-black py-20 text-white overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.3),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Join Millions of Happy Viewers
          </h2>
          <p className="text-lg text-gray-400 sm:text-xl">
            Trusted by entertainment lovers worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          {defaultStats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] p-6 text-center backdrop-blur-xl border border-white/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20",
                isVisible && "animate-fade-up"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

              {/* Icon */}
              <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 text-purple-400 transition-transform group-hover:scale-110 group-hover:rotate-6">
                {stat.icon}
              </div>

              {/* Value */}
              <div className="mb-2 text-4xl font-black bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent sm:text-5xl">
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-sm font-medium text-gray-400 sm:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * =============================================================================
 * Testimonials Section - Social Proof
 * =============================================================================
 */

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Premium Member",
    content: "The best streaming service I've ever used! The 4K quality is stunning and the content library is incredible. Worth every penny!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "Michael Chen",
    role: "Family Plan User",
    content: "My whole family loves MoviesNow. The kid profiles are perfect and we can all watch what we want on different devices. Amazing!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
  },
  {
    name: "Emily Rodriguez",
    role: "Annual Subscriber",
    content: "I switched from other services and never looked back. The offline downloads are a lifesaver for my commute. Highly recommend!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative bg-gradient-to-b from-black via-purple-950/10 to-black py-20 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-2 text-sm font-semibold text-purple-300 border border-purple-500/30 backdrop-blur-sm">
            Testimonials
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-400 sm:text-xl">
            Real experiences from real people
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {defaultTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] p-8 backdrop-blur-xl border border-white/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

              {/* Rating Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="mb-6 text-base text-gray-300 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                  <div className="h-full w-full overflow-hidden rounded-full bg-gray-900">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * =============================================================================
 * Pricing Preview - Show Value
 * =============================================================================
 */

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const defaultPricingTiers: PricingTier[] = [
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    description: "Perfect for individuals",
    features: [
      "HD streaming",
      "1 device at a time",
      "Unlimited movies & shows",
      "Cancel anytime",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Premium",
    price: "$14.99",
    period: "/month",
    description: "Best for families",
    features: [
      "4K Ultra HD streaming",
      "4 devices at a time",
      "Unlimited movies & shows",
      "Download for offline",
      "Cancel anytime",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Ultimate",
    price: "$19.99",
    period: "/month",
    description: "Premium experience",
    features: [
      "4K Ultra HD + HDR",
      "6 devices at a time",
      "Unlimited movies & shows",
      "Download for offline",
      "Early access to new releases",
      "Cancel anytime",
    ],
    cta: "Start Free Trial",
  },
];

export function PricingPreview() {
  return (
    <section className="relative bg-gradient-to-b from-black via-gray-900 to-black py-20 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-6 py-2 text-sm font-semibold text-green-300 border border-green-500/30 backdrop-blur-sm">
            30-Day Free Trial
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-400 sm:text-xl">
            Flexible pricing for everyone. No credit card required to start.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {defaultPricingTiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-8 backdrop-blur-xl border transition-all duration-500 hover:scale-105",
                tier.popular
                  ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-2xl shadow-purple-500/20 scale-105"
                  : "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10"
              )}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -right-12 top-8 rotate-45 bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-1 text-xs font-bold shadow-lg">
                  POPULAR
                </div>
              )}

              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

              <div className="relative">
                {/* Tier Name */}
                <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>
                <p className="mb-6 text-sm text-gray-400">{tier.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-black bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                    {tier.price}
                  </span>
                  <span className="text-lg text-gray-400">{tier.period}</span>
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href="/signup"
                  className={cn(
                    "block w-full rounded-lg px-6 py-4 text-center font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
                    tier.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/50 hover:shadow-purple-500/70"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40"
                  )}
                >
                  {tier.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            All plans include a 30-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
