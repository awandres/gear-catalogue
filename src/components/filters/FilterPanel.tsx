'use client';

import { GearFilters, GearCategory, GearStatus } from '@/lib/types';
import { CategoryFilter } from './CategoryFilter';
import { StatusFilter } from './StatusFilter';
import { TagFilter } from './TagFilter';
import { Badge } from '@/components/ui/Badge';

interface FilterPanelProps {
  filters: GearFilters;
  onFilterChange: (filters: GearFilters) => void;
  categoryCounts?: Record<string, number>;
}

export function FilterPanel({ filters, onFilterChange, categoryCounts }: FilterPanelProps) {
  const activeFilterCount = 
    (filters.category ? 1 : 0) +
    (filters.status?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.tone?.length || 0);

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const updateFilter = <K extends keyof GearFilters>(
    key: K,
    value: GearFilters[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <aside className="w-full lg:w-64 space-y-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Active filters:</p>
            <div className="flex flex-wrap gap-1">
              {filters.category && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-300"
                  onClick={() => updateFilter('category', undefined)}
                >
                  {filters.category} ×
                </Badge>
              )}
              {filters.status?.map((status) => (
                <Badge
                  key={status}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-300"
                  onClick={() => 
                    updateFilter('status', filters.status?.filter(s => s !== status))
                  }
                >
                  {status} ×
                </Badge>
              ))}
              {filters.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-300"
                  onClick={() => 
                    updateFilter('tags', filters.tags?.filter(t => t !== tag))
                  }
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-6">
          <CategoryFilter
            selected={filters.category}
            onChange={(category) => updateFilter('category', category)}
            counts={categoryCounts}
          />
        </div>

        <div className="border-t pt-6">
          <StatusFilter
            selected={filters.status || []}
            onChange={(statuses) => updateFilter('status', statuses)}
          />
        </div>

        <div className="border-t pt-6">
          <TagFilter
            selected={filters.tags || []}
            onChange={(tags) => updateFilter('tags', tags)}
          />
        </div>
      </div>
    </aside>
  );
}
