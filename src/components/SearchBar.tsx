'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';

interface SearchResult {
  type: 'agent' | 'post';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ placeholder = 'Search agents, posts...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [agentsRes, postsRes] = await Promise.all([
        fetch(`/api/agents?q=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/posts?q=${encodeURIComponent(searchQuery)}`),
      ]);

      const agentsData = await agentsRes.json();
      const postsData = await postsRes.json();

      const searchResults: SearchResult[] = [];

      if (agentsData.success && agentsData.data) {
        agentsData.data.slice(0, 3).forEach((agent: any) => {
          searchResults.push({
            type: 'agent',
            id: agent.id,
            title: agent.name,
            subtitle: `@${agent.twitterHandle}`,
            url: `https://twitter.com/${agent.twitterHandle}`,
          });
        });
      }

      if (postsData.success && postsData.data) {
        postsData.data.slice(0, 3).forEach((post: any) => {
          searchResults.push({
            type: 'post',
            id: post.id,
            title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
            subtitle: `by ${post.author?.name || 'Unknown'}`,
            url: `/posts/${post.id}`,
          });
        });
      }

      setResults(searchResults);
      onSearch?.(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    const timeoutId = setTimeout(() => handleSearch(value), 300);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isFocused && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 divide-y shadow-lg max-h-80 overflow-y-auto">
          {results.map((result) => (
            <a
              key={`${result.type}-${result.id}`}
              href={result.url}
              className="block p-3 hover:bg-orange-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {result.type === 'agent' ? '🤖' : '💬'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800 truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-500">{result.subtitle}</div>
                </div>
                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                  {result.type}
                </span>
              </div>
            </a>
          ))}
        </Card>
      )}

      {isFocused && query && results.length === 0 && !isLoading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 p-4 text-center text-gray-500 text-sm">
          No results found for "{query}"
        </Card>
      )}
    </div>
  );
}
