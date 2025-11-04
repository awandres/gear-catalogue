'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { TagWithCount } from '@/lib/types';

interface TagFilterProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  availableTags?: TagWithCount[];
}

export function TagFilter({ selected, onChange, availableTags }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch tags if not provided
    if (!availableTags) {
      fetch('/api/gear/tags')
        .then(res => res.json())
        .then(data => setTags(data.all || []))
        .catch(console.error);
    } else {
      setTags(availableTags);
    }
  }, [availableTags]);

  const handleToggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  const filteredTags = tags.filter(tag => 
    tag.tag.toLowerCase().includes(search.toLowerCase())
  );

  const displayTags = expanded ? filteredTags : filteredTags.slice(0, 10);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900">Tags</h3>
      
      {selected.length > 0 && (
        <div className="mb-2">
          <button
            onClick={() => onChange([])}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear all ({selected.length})
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Search tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {displayTags.map((tag) => (
          <label key={tag.tag} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(tag.tag)}
              onChange={() => handleToggle(tag.tag)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{tag.tag}</span>
            <span className="text-xs text-gray-500">({tag.count})</span>
          </label>
        ))}
      </div>

      {filteredTags.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:underline"
        >
          {expanded ? 'Show less' : `Show ${filteredTags.length - 10} more`}
        </button>
      )}
    </div>
  );
}
