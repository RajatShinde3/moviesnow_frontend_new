"use client";

/**
 * =============================================================================
 * MOVIESNOW - Ultra-Modern Landing Page Components
 * =============================================================================
 *
 * World-class UI/UX with:
 * - Glassmorphism & Neumorphism effects
 * - Smooth scroll-triggered animations
 * - Interactive hover states
 * - Modern gradient aesthetics
 * - Mobile-first responsive design
 * - Accessibility optimized (WCAG 2.1 AA)
 */

import * as React from "react";
import { Play, Check, Star, TrendingUp, Users, Globe, Zap, Shield, Smartphone } from "lucide-react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. HERO SECTION - Full-Screen Impact
// ═══════════════════════════════════════════════════════════════════════════

export function ModernHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-red-900/20" />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full filter blur-[128px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/20 rounded-full filter blur-[128px] animate-pulse [animation-delay:2s]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 animate-fade-in">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">Now Streaming in 4K Ultra HD</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 animate-fade-in-up [animation-delay:100ms]">
          <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Unlimited Movies,
          </span>
          <br />
          <span className="bg-gradient-to-r from-pink-200 via-red-200 to-yellow-200 bg-clip-text text-transparent">
            TV Shows & More
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto animate-fade-in-up [animation-delay:200ms] font-light">
          Stream premium content on any device. Cancel anytime.
        </p>

        <p className="text-lg text-gray-400 mb-12 animate-fade-in-up [animation-delay:300ms]">
          Start your 30-day free trial — no credit card required
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up [animation-delay:400ms]">
          <a
            href="/signup"
            className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-full font-bold text-lg text-white shadow-[0_0_50px_rgba(239,68,68,0.5)] hover:shadow-[0_0_80px_rgba(239,68,68,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              Start Free Trial
            </span>
          </a>

          <a
            href="#features"
            className="px-8 py-4 rounded-full font-bold text-lg text-white border-2 border-white/20 hover:border-white/40 hover:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Explore Features
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-gray-400 animate-fade-in-up [animation-delay:500ms]">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span>10M+ Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span>50K+ Titles</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span>190+ Countries</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
          <div className="w-1 h-3 bg-white/50 rounded-full mx-auto animate-scroll-down" />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. FEATURES SECTION - Benefits Showcase
// ═══════════════════════════════════════════════════════════════════════════

const features = [
  {
    icon: Smartphone,
    title: "Watch Anywhere",
    description: "Stream on your phone, tablet, laptop, and TV. Pick up where you left off on any device.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: TrendingUp,
    title: "Unlimited Content",
    description: "Access 50,000+ movies and TV shows. New titles added weekly.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "4K Ultra HD",
    description: "Enjoy stunning 4K HDR quality with Dolby Atmos surround sound.",
    gradient: "from-red-500 to-orange-500"
  },
  {
    icon: Users,
    title: "Multiple Profiles",
    description: "Create up to 5 profiles with personalized recommendations for everyone.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Globe,
    title: "Offline Viewing",
    description: "Download your favorites to watch offline. Perfect for travel.",
    gradient: "from-yellow-500 to-amber-500"
  },
  {
    icon: Zap,
    title: "No Commitments",
    description: "Cancel online anytime. No hidden fees or long-term contracts.",
    gradient: "from-indigo-500 to-purple-500"
  }
];

export function ModernFeatures() {
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <section ref={setRef} id="features" className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className={cn(
            "inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <span className="text-sm font-semibold text-purple-300">Why Choose MoviesNow</span>
          </div>

          <h2 className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-black mb-6 transition-all duration-700 delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>

          <p className={cn(
            "text-xl text-gray-400 max-w-2xl mx-auto transition-all duration-700 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Premium streaming experience with industry-leading features
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              {/* Gradient glow on hover */}
              <div className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                feature.gradient,
                "blur-xl -z-10"
              )} />

              {/* Icon */}
              <div className={cn(
                "inline-flex p-3 rounded-xl bg-gradient-to-br mb-6 transition-transform duration-500 group-hover:scale-110",
                feature.gradient
              )}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. PRICING SECTION - Simple & Clear
// ═══════════════════════════════════════════════════════════════════════════

const plans = [
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    description: "Perfect for individuals",
    features: [
      "HD Quality (720p)",
      "Watch on 1 device",
      "Unlimited content",
      "Cancel anytime"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Premium",
    price: "$14.99",
    period: "/month",
    description: "Best for families",
    features: [
      "4K Ultra HD + HDR",
      "Watch on 4 devices",
      "Download offline",
      "5 profiles",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Ultimate",
    price: "$19.99",
    period: "/month",
    description: "Premium experience",
    features: [
      "8K Quality (where available)",
      "Watch on 6 devices",
      "Download on all devices",
      "10 profiles",
      "24/7 Premium support",
      "Early access to new releases"
    ],
    cta: "Start Free Trial",
    popular: false
  }
];

export function ModernPricing() {
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <section ref={setRef} id="pricing" className="relative py-32 bg-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className={cn(
            "inline-block px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-4 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <span className="text-sm font-semibold text-red-300">Simple Pricing</span>
          </div>

          <h2 className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-black mb-6 transition-all duration-700 delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>

          <p className={cn(
            "text-xl text-gray-400 transition-all duration-700 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            All plans include 30-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative p-8 rounded-2xl border transition-all duration-700",
                plan.popular
                  ? "bg-gradient-to-b from-red-500/10 to-transparent border-red-500/50 scale-105 shadow-2xl shadow-red-500/20"
                  : "bg-white/5 border-white/10 hover:border-white/20",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-sm font-bold text-white shadow-lg">
                  MOST POPULAR
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="/signup"
                className={cn(
                  "block w-full py-4 rounded-xl font-bold text-center transition-all duration-300 hover:scale-105 active:scale-95",
                  plan.popular
                    ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                )}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <div className={cn(
          "mt-16 text-center transition-all duration-700 delay-600",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. FAQ SECTION - Common Questions
// ═══════════════════════════════════════════════════════════════════════════

const faqs = [
  {
    question: "What can I watch on MoviesNow?",
    answer: "MoviesNow has an extensive library of feature films, documentaries, TV shows, anime, award-winning MoviesNow originals, and more. Watch as much as you want, anytime you want."
  },
  {
    question: "How much does MoviesNow cost?",
    answer: "Watch MoviesNow on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from $9.99 to $19.99 a month. No extra costs, no contracts."
  },
  {
    question: "Where can I watch?",
    answer: "Watch anywhere, anytime. Sign in with your MoviesNow account to watch instantly on the web at moviesnow.com from your personal computer or on any internet-connected device."
  },
  {
    question: "How do I cancel?",
    answer: "MoviesNow is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime."
  },
  {
    question: "What is the free trial?",
    answer: "Get 30 days free when you sign up. No credit card required during the trial period. Cancel anytime before the trial ends and you won't be charged."
  },
  {
    question: "Is MoviesNow good for kids?",
    answer: "The MoviesNow Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space. Kids profiles come with PIN-protected parental controls."
  }
];

export function ModernFAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <section ref={setRef} id="faq" className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className={cn(
            "text-4xl md:text-5xl font-black mb-4 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
        </div>

        {/* FAQ accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors duration-200"
              >
                <span className="text-xl font-bold text-white pr-8">{faq.question}</span>
                <svg
                  className={cn(
                    "w-6 h-6 text-white transition-transform duration-300 flex-shrink-0",
                    openIndex === index ? "rotate-45" : ""
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="px-8 pb-6 text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className={cn(
          "mt-16 text-center transition-all duration-700 delay-600",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
