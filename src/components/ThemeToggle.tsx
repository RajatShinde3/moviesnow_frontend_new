// components/ThemeToggle.tsx
/**
 * =============================================================================
 * Theme Toggle Component - Dark/Light Mode
 * =============================================================================
 * Features:
 * - Toggle between dark and light modes
 * - Persist preference in localStorage
 * - Smooth transitions
 * - System preference detection
 * - Icon animation on toggle
 */

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

/**
 * =============================================================================
 * Theme Provider - Wrap app with this
 * =============================================================================
 */

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "moviesnow-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">("dark");

  // Initialize theme from localStorage or system preference
  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
  }, [storageKey]);

  // Update resolved theme based on theme setting
  React.useEffect(() => {
    const root = window.document.documentElement;

    let resolved: "dark" | "light" = "dark";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      resolved = systemTheme;
    } else {
      resolved = theme;
    }

    setResolvedTheme(resolved);

    // Remove both classes first
    root.classList.remove("light", "dark");

    // Add the resolved theme class
    root.classList.add(resolved);
  }, [theme]);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    },
    [storageKey]
  );

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * =============================================================================
 * useTheme Hook
 * =============================================================================
 */

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * =============================================================================
 * Theme Toggle Button - Simple Icon Button
 * =============================================================================
 */

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div className={cn("h-10 w-10 rounded-full bg-gray-800", className)} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative flex items-center gap-2 rounded-full p-2 transition-all hover:bg-gray-800",
        className
      )}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Icon Container */}
      <div className="relative h-6 w-6">
        {/* Sun Icon */}
        <Sun
          className={cn(
            "absolute inset-0 h-6 w-6 text-yellow-400 transition-all duration-300",
            resolvedTheme === "dark"
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />

        {/* Moon Icon */}
        <Moon
          className={cn(
            "absolute inset-0 h-6 w-6 text-blue-300 transition-all duration-300",
            resolvedTheme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-sm font-medium text-white">
          {resolvedTheme === "dark" ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}

/**
 * =============================================================================
 * Theme Toggle - Dropdown Menu Version
 * =============================================================================
 */

export function ThemeToggleMenu() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="capitalize">{theme}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg bg-gray-900 py-2 shadow-xl ring-1 ring-white/10">
            <button
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-800",
                theme === "light" ? "text-white" : "text-gray-400"
              )}
            >
              <Sun className="h-4 w-4" />
              Light
              {theme === "light" && <span className="ml-auto text-xs">✓</span>}
            </button>

            <button
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-800",
                theme === "dark" ? "text-white" : "text-gray-400"
              )}
            >
              <Moon className="h-4 w-4" />
              Dark
              {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
            </button>

            <button
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-800",
                theme === "system" ? "text-white" : "text-gray-400"
              )}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              System
              {theme === "system" && <span className="ml-auto text-xs">✓</span>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * =============================================================================
 * Theme Toggle - Card Version for Settings
 * =============================================================================
 */

export function ThemeToggleCard() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-purple-500/20 p-2">
          {resolvedTheme === "dark" ? (
            <Moon className="h-6 w-6 text-purple-400" />
          ) : (
            <Sun className="h-6 w-6 text-yellow-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Theme</h3>
          <p className="text-sm text-gray-400">
            Choose how MoviesNow looks to you
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* Light */}
        <button
          onClick={() => setTheme("light")}
          className={cn(
            "group relative overflow-hidden rounded-lg border-2 p-4 transition-all",
            theme === "light"
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-gray-800 hover:border-gray-600"
          )}
        >
          <div className="mb-3 flex h-20 items-center justify-center rounded bg-white">
            <Sun className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-sm font-medium text-white">Light</p>
          {theme === "light" && (
            <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>

        {/* Dark */}
        <button
          onClick={() => setTheme("dark")}
          className={cn(
            "group relative overflow-hidden rounded-lg border-2 p-4 transition-all",
            theme === "dark"
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-gray-800 hover:border-gray-600"
          )}
        >
          <div className="mb-3 flex h-20 items-center justify-center rounded bg-gray-950">
            <Moon className="h-8 w-8 text-blue-300" />
          </div>
          <p className="text-sm font-medium text-white">Dark</p>
          {theme === "dark" && (
            <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>

        {/* System */}
        <button
          onClick={() => setTheme("system")}
          className={cn(
            "group relative overflow-hidden rounded-lg border-2 p-4 transition-all",
            theme === "system"
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-gray-800 hover:border-gray-600"
          )}
        >
          <div className="mb-3 flex h-20 items-center justify-center rounded bg-gradient-to-br from-white to-gray-950">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">System</p>
          {theme === "system" && (
            <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
