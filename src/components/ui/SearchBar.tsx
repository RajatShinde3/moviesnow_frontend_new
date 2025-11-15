// components/ui/SearchBar.tsx
/**
 * =============================================================================
 * Search Bar - Advanced search with suggestions
 * =============================================================================
 */

"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import type { SearchSuggestion } from "@/lib/api/types";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ className, placeholder = "Search movies, series...", autoFocus }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debounced suggestions fetch
  React.useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await api.discovery.getSuggestions(query.trim());
        setSuggestions(results || []);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close suggestions
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-11 w-full rounded-full border bg-background/95 pl-10 pr-10 text-sm backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.trim().length >= 2) && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-background/95 shadow-lg backdrop-blur-sm">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.type}-${suggestion.id}-${index}`}>
                  <button
                    onClick={() => {
                      if (suggestion.type === "title") {
                        router.push(`/title/${suggestion.id}`);
                      } else if (suggestion.type === "person") {
                        router.push(`/person/${suggestion.id}`);
                      } else if (suggestion.type === "genre") {
                        router.push(`/genre/${suggestion.id}`);
                      }
                      setShowSuggestions(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                  >
                    {suggestion.image_url ? (
                      <img
                        src={suggestion.image_url}
                        alt={suggestion.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-lg">
                        {suggestion.type === "title" ? "🎬" : suggestion.type === "person" ? "👤" : "🏷️"}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{suggestion.title}</p>
                      <p className="truncate text-xs text-muted-foreground capitalize">
                        {suggestion.type}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
