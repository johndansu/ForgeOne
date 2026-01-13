"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Clock, FileText, Users, Calendar, Hash, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowLedger } from '@/lib/flowledger';
import { useRecall } from '@/lib/recall';
import { useMicroCRM } from '@/lib/microcrm';

interface SearchResult {
  id: string;
  type: 'workLog' | 'memoryAnchor' | 'person' | 'goal';
  title: string;
  content: string;
  category?: string;
  date: Date;
  relevanceScore: number;
  highlights?: string[];
}

interface UniversalSearchProps {
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export function UniversalSearch({ 
  placeholder = "Search everything...", 
  onResultClick, 
  className 
}: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const { workLogs } = useFlowLedger();
  const { memoryAnchors } = useRecall();
  const { people } = useMicroCRM();

  // Search across all content types
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search work logs
    workLogs.forEach(log => {
      const score = calculateRelevance(searchLower, log.what + ' ' + log.why + ' ' + log.category);
      if (score > 0) {
        results.push({
          id: log.id,
          type: 'workLog',
          title: log.what,
          content: log.why,
          category: log.category,
          date: log.timestamp,
          relevanceScore: score,
          highlights: getHighlights(searchLower, log.what + ' ' + log.why)
        });
      }
    });

    // Search memory anchors
    memoryAnchors.forEach(anchor => {
      const score = calculateRelevance(searchLower, anchor.content);
      if (score > 0) {
        results.push({
          id: anchor.id,
          type: 'memoryAnchor',
          title: anchor.type,
          content: anchor.content,
          date: anchor.timestamp,
          relevanceScore: score,
          highlights: getHighlights(searchLower, anchor.content)
        });
      }
    });

    // Search people
    people.forEach(person => {
      const score = calculateRelevance(searchLower, person.name + ' ' + person.context);
      if (score > 0) {
        results.push({
          id: person.id,
          type: 'person',
          title: person.name,
          content: person.context,
          date: person.lastInteraction,
          relevanceScore: score,
          highlights: getHighlights(searchLower, person.name + ' ' + person.context)
        });
      }
    });

    // Sort by relevance score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);
  }, [query, workLogs, memoryAnchors, people]);

  const calculateRelevance = (query: string, content: string): number => {
    const lowerQuery = query.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    // Exact match gets highest score
    if (lowerContent === lowerQuery) return 100;
    
    // Contains query gets high score
    if (lowerContent.includes(lowerQuery)) return 80;
    
    // Partial match gets medium score
    const words = lowerQuery.split(' ').filter(word => word.length > 0);
    let score = 0;
    words.forEach(word => {
      if (lowerContent.includes(word)) score += 20;
    });
    
    return score;
  };

  const getHighlights = (query: string, content: string): string[] => {
    const words = query.toLowerCase().split(' ').filter(word => word.length > 0);
    const highlights: string[] = [];
    
    words.forEach(word => {
      const index = content.toLowerCase().indexOf(word);
      if (index !== -1) {
        highlights.push(
          content.substring(0, index) + 
          '**' + 
          content.substring(index, index + word.length) + 
          '**' + 
          content.substring(index + word.length)
        );
      }
    });
    
    return highlights;
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'workLog': return <FileText className="h-4 w-4" />;
      case 'memoryAnchor': return <Star className="h-4 w-4" />;
      case 'person': return <Users className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'workLog': return 'text-blue-600';
      case 'memoryAnchor': return 'text-purple-600';
      case 'person': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault();
      onResultClick?.(searchResults[selectedIndex]);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => handleClickOutside(e);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-auto z-50">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Found {searchResults.length} results</span>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={result.id}
                className={cn(
                  "flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors",
                  index === selectedIndex && "bg-blue-50"
                )}
                onClick={() => {
                  onResultClick?.(result);
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                <div className={cn("flex-shrink-0", getTypeColor(result.type))}>
                  {getTypeIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {result.title}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                      {result.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {result.highlights && result.highlights.length > 0 ? (
                      <div dangerouslySetInnerHTML={{ __html: result.highlights.join(' ') }} />
                    ) : (
                      result.content
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{result.date.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
