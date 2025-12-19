'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🔍 INSTANT SEARCH BAR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Modern search bar with instant suggestions and keyboard navigation.
 *
 * Features:
 * • Debounced instant search
 * • Keyboard navigation (↑/↓/Enter/Esc)
 * • Click-outside to close
 * • Loading states
 * • Empty states
 * • Mobile-optimized
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { colors, shadows, animation } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'MOVIE' | 'SERIES';
  slug: string;
  year?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function SearchBar({ onSearch, placeholder = 'Search movies, series, anime...', autoFocus }: SearchBarProps) {
  const router = useRouter();
  const searchRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [query, setQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [recentSearches] = React.useState<string[]>([
    'Attack on Titan',
    'Stranger Things',
    'The Matrix',
  ]); // Mock recent searches

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when query changes
  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const results = await api.discovery.getSuggestions(debouncedQuery);

        // Mock suggestions for demo
        const mockSuggestions: SearchSuggestion[] = [
          { id: '1', name: 'Attack on Titan', type: 'SERIES', slug: 'attack-on-titan', year: 2013 },
          { id: '2', name: 'One Piece', type: 'SERIES', slug: 'one-piece', year: 1999 },
          { id: '3', name: 'Demon Slayer', type: 'SERIES', slug: 'demon-slayer', year: 2019 },
        ].filter(s => s.name.toLowerCase().includes(debouncedQuery.toLowerCase()));

        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useClickOutside(searchRef, () => {
    setIsFocused(false);
    setSelectedIndex(-1);
  });

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length || recentSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = suggestions[selectedIndex] || recentSearches[selectedIndex];
          if (typeof selected === 'string') {
            handleSearch(selected);
          } else {
            router.push(`/title/${selected.slug}`);
          }
        } else if (query) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery) return;

    onSearch?.(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsFocused(false);
    setQuery('');
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const showSuggestions = isFocused && (suggestions.length > 0 || query.length < 2);

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <motion.div
        className="relative flex items-center rounded-lg overflow-hidden transition-all"
        style={{
          background: colors.bg.glass,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${isFocused ? colors.accent.primary : colors.border.default}`,
          boxShadow: isFocused ? shadows.glow.pink : shadows.md,
        }}
        initial={false}
        animate={{
          borderColor: isFocused ? colors.accent.primary : colors.border.default,
        }}
      >
        {/* Search Icon */}
        <div className="pl-4">
          <Search size={20} style={{ color: colors.text.secondary }} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-gray-500"
          style={{ color: colors.text.primary }}
        />

        {/* Clear Button */}
        {query && (
          <motion.button
            onClick={handleClear}
            className="pr-4 transition-colors"
            style={{ color: colors.text.secondary }}
            whileHover={{ color: colors.text.primary }}
            aria-label="Clear search"
          >
            <X size={20} />
          </motion.button>
        )}
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg"
            style={{
              background: colors.bg.secondary,
              border: `1px solid ${colors.border.default}`,
              boxShadow: shadows.xl,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.accent.primary }} />
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && suggestions.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => router.push(`/title/${suggestion.slug}`)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      background: selectedIndex === index ? colors.bg.elevated : 'transparent',
                      color: colors.text.primary,
                    }}
                    whileHover={{ background: colors.bg.elevated }}
                  >
                    <TrendingUp size={16} style={{ color: colors.accent.secondary }} />
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-xs" style={{ color: colors.text.tertiary }}>
                        {suggestion.type} {suggestion.year && `• ${suggestion.year}`}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!isLoading && query.length < 2 && recentSearches.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>
                  Recent Searches
                </div>
                {recentSearches.map((recent, index) => (
                  <motion.button
                    key={recent}
                    onClick={() => handleSearch(recent)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      background: selectedIndex === index ? colors.bg.elevated : 'transparent',
                      color: colors.text.primary,
                    }}
                    whileHover={{ background: colors.bg.elevated }}
                  >
                    <Clock size={16} style={{ color: colors.text.tertiary }} />
                    <span className="font-medium">{recent}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && query.length >= 2 && suggestions.length === 0 && (
              <div className="px-4 py-8 text-center" style={{ color: colors.text.tertiary }}>
                <p>No results found for "{query}"</p>
                <p className="mt-1 text-sm">Try different keywords</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
