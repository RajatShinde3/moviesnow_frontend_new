// components/LandingHero.tsx
/**
 * =============================================================================
 * Netflix-Style Landing Hero
 * =============================================================================
 * Features:
 * - Full-screen hero with background video/image
 * - Gradient overlays for text readability
 * - Prominent CTAs
 * - Auto-playing background content
 * - Mobile-optimized
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Play, Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface LandingHeroProps {
  title?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  showScrollIndicator?: boolean;
}

export function LandingHero({
  title = "Unlimited movies, TV shows, and more",
  description = "Watch anywhere. Cancel anytime.",
  backgroundImage = "/hero-bg.jpg",
  backgroundVideo,
  showScrollIndicator = true,
}: LandingHeroProps) {
  const router = useRouter();
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, video won't play
        setVideoLoaded(false);
      });
    }
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        {/* Video Background */}
        {backgroundVideo && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-1000",
              videoLoaded ? "opacity-100" : "opacity-0"
            )}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}

        {/* Fallback Image */}
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000",
            videoLoaded && backgroundVideo ? "opacity-0" : "opacity-100"
          )}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-start justify-center px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-2xl space-y-6 animate-fadeIn">
          {/* Title */}
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-white/90 sm:text-xl md:text-2xl">
            {description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <button
              onClick={() => router.push("/signup")}
              className="group flex items-center justify-center gap-2 rounded-md bg-white px-8 py-3 text-lg font-semibold text-black transition-all hover:bg-white/90"
            >
              <Play className="h-6 w-6 transition-transform group-hover:scale-110" />
              Get Started
            </button>

            <button
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 rounded-md bg-white/20 px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
            >
              Sign In
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-white/70 sm:text-base">
            Ready to watch? Enter your email to create or restart your membership.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce text-white transition-opacity hover:opacity-80"
          aria-label="Scroll to content"
        >
          <ChevronDown className="h-10 w-10" />
        </button>
      )}
    </div>
  );
}

/**
 * =============================================================================
 * Feature Section - Why Choose MoviesNow
 * =============================================================================
 */

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
}

interface FeatureSectionProps {
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    title: "Enjoy on your TV",
    description: "Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.",
    icon: (
      <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
      </svg>
    ),
  },
  {
    title: "Download your shows to watch offline",
    description: "Save your favorites easily and always have something to watch.",
    icon: (
      <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
      </svg>
    ),
  },
  {
    title: "Watch everywhere",
    description: "Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.",
    icon: (
      <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z" />
      </svg>
    ),
  },
  {
    title: "Create profiles for kids",
    description: "Send kids on adventures with their favorite characters in a space made just for them—free with your membership.",
    icon: (
      <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
];

export function FeatureSection({ features = defaultFeatures }: FeatureSectionProps) {
  return (
    <section className="bg-black py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-16",
                index % 2 === 1 && "md:grid-flow-dense"
              )}
              style={{
                animation: `fadeIn 0.8s ease-out ${index * 0.2}s both`,
              }}
            >
              {/* Content */}
              <div className={cn(index % 2 === 1 && "md:col-start-2")}>
                <div className="mb-6 text-red-600">{feature.icon}</div>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {feature.title}
                </h2>
                <p className="text-lg text-gray-300 sm:text-xl">
                  {feature.description}
                </p>
              </div>

              {/* Visual */}
              <div className={cn("relative", index % 2 === 1 && "md:col-start-1")}>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-red-900/20 to-purple-900/20">
                  {feature.image ? (
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-6xl opacity-20">{feature.icon}</div>
                    </div>
                  )}
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
 * FAQ Section
 * =============================================================================
 */

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs?: FAQItem[];
}

const defaultFAQs: FAQItem[] = [
  {
    question: "What is MoviesNow?",
    answer: "MoviesNow is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices.",
  },
  {
    question: "How much does MoviesNow cost?",
    answer: "Watch MoviesNow on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from $9.99 to $19.99 a month. No extra costs, no contracts.",
  },
  {
    question: "Where can I watch?",
    answer: "Watch anywhere, anytime. Sign in with your MoviesNow account to watch instantly on the web at moviesnow.com from your personal computer or on any internet-connected device.",
  },
  {
    question: "How do I cancel?",
    answer: "MoviesNow is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime.",
  },
  {
    question: "What can I watch on MoviesNow?",
    answer: "MoviesNow has an extensive library of feature films, documentaries, TV shows, anime, award-winning MoviesNow originals, and more. Watch as much as you want, anytime you want.",
  },
];

export function FAQSection({ faqs = defaultFAQs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="bg-black py-16 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl lg:text-5xl">
          Frequently Asked Questions
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-900">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left text-xl font-medium transition-colors hover:bg-gray-800 sm:text-2xl"
              >
                <span>{faq.question}</span>
                <svg
                  className={cn(
                    "h-6 w-6 flex-shrink-0 transition-transform",
                    openIndex === index && "rotate-45"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="border-t border-gray-800 p-6 text-lg text-gray-300">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
