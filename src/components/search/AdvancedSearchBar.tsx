/**
 * =============================================================================
 * AdvancedSearchBar Component
 * =============================================================================
 * Search bar with autocomplete, history, and suggestions
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, Sparkles } from 'lucide-react';
import {
  useAutocomplete,
  useSearchSuggestions,
  useSearchHistory,
  useDeleteHistoryItem,
} from '@/lib/api/hooks/useSearch';
import { AutocompleteResult, SearchHistory } from '@/lib/api/services/search';

interface AdvancedSearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function AdvancedSearchBar({
  placeholder = 'Search movies, series, anime...',
  autoFocus = false,
  onSearch,
  className = '',
}: AdvancedSearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { data: autocompleteData } = useAutocomplete(query, {
    enabled: query.length >= 1 && isFocused,
  });
  const { data: suggestionsData } = useSearchSuggestions({
    enabled: query.length === 0 && isFocused,
  });
  const { data: historyData } = useSearchHistory({
    limit: 5,
    enabled: query.length === 0 && isFocused,
  });
  const deleteHistoryItem = useDeleteHistoryItem();

  const suggestions = autocompleteData?.suggestions || [];
  const trendingSuggestions = suggestionsData?.trending || [];
  const history = historyData?.history || [];

  const showDropdown = isFocused && (suggestions.length > 0 || trendingSuggestions.length > 0 || history.length > 0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return;

      const maxIndex = suggestions.length - 1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          } else if (query.trim()) {
            handleSearch(query);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, selectedIndex, suggestions, query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsFocused(false);
    setQuery('');

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSelectSuggestion = (suggestion: AutocompleteResult | SearchHistory | { query: string }) => {
    const searchQuery = 'query' in suggestion ? suggestion.query : suggestion.name;
    handleSearch(searchQuery);
  };

  const handleDeleteHistory = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    deleteHistoryItem.mutate(itemId);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return '🎬';
      case 'series':
        return '📺';
      case 'anime':
        return '🎌';
      case 'documentary':
        return '🎥';
      case 'person':
        return '👤';
      case 'genre':
        return '🏷️';
      default:
        return '🔍';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              handleSearch(query);
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-gray-900 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto"
        >
          {/* Autocomplete Results */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}-${index}`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                    index === selectedIndex
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  {suggestion.poster_url ? (
                    <img
                      src={suggestion.poster_url}
                      alt={suggestion.name}
                      className="h-12 w-8 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-8 bg-gray-800 rounded flex items-center justify-center text-xl">
                      {getTypeIcon(suggestion.type)}
                    </div>
                  )}

                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{suggestion.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="capitalize">{suggestion.type}</span>
                      {suggestion.metadata?.year && (
                        <>
                          <span>•</span>
                          <span>{suggestion.metadata.year}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {query.length === 0 && history.length > 0 && (
            <div className="p-2 border-t border-gray-800">
              <div className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold flex items-center justify-between">
                <span>Recent Searches</span>
              </div>
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="flex-1 text-left text-white">{item.query}</span>
                  <span className="text-xs text-gray-500">{item.result_count} results</span>
                  <button
                    onClick={(e) => handleDeleteHistory(e, item.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-all"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Trending Suggestions */}
          {query.length === 0 && trendingSuggestions.length > 0 && (
            <div className="p-2 border-t border-gray-800">
              <div className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Trending Searches
              </div>
              {trendingSuggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <span className="flex-1 text-left text-white">{suggestion.query}</span>
                  {suggestion.count && (
                    <span className="text-xs text-gray-500">{suggestion.count} searches</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No results found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
