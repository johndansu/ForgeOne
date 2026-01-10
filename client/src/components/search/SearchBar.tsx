import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchBarProps {
  onSearch: (query: string, category?: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()) {
        onSearch(query, category === 'all' ? undefined : category);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, category, onSearch]);

  const handleClear = () => {
    setQuery('');
    setCategory('all');
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your work memories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="project">Project</SelectItem>
          <SelectItem value="study">Study</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="client">Client</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
