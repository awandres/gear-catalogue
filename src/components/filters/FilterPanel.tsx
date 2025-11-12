'use client';

import { GearFilters, GearCategory, Project } from '@/lib/types';
import { CategoryFilter } from './CategoryFilter';
import { TagFilter } from './TagFilter';
import { ProjectFilter } from './ProjectFilter';
import { Badge } from '@/components/ui/Badge';

interface FilterPanelProps {
  filters: GearFilters;
  onFilterChange: (filters: GearFilters) => void;
  categoryCounts?: Record<string, number>;
  projects?: Project[];
}

export function FilterPanel({ filters, onFilterChange, categoryCounts, projects }: FilterPanelProps) {
  const activeFilterCount = 
    (filters.category ? 1 : 0) +
    (filters.tags?.length || 0) +
    (filters.tone?.length || 0) +
    (filters.projectId ? 1 : 0);

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
    <aside className="w-full lg:w-64 lg:sticky lg:top-4 lg:self-start">
      <div className="bg-white rounded-lg shadow p-6 space-y-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
              {filters.projectId && projects && (
                <button type="button" onClick={() => updateFilter('projectId', undefined)} className="inline-block">
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-300"
                    style={{ 
                      backgroundColor: `${projects.find(p => p.id === filters.projectId)?.primaryColor}20`,
                      color: projects.find(p => p.id === filters.projectId)?.primaryColor
                    }}
                  >
                    {projects.find(p => p.id === filters.projectId)?.name} ×
                  </Badge>
                </button>
              )}
              {filters.category && (
                <button type="button" onClick={() => updateFilter('category', undefined)} className="inline-block">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-gray-300">
                    {filters.category} ×
                  </Badge>
                </button>
              )}
              {filters.tags?.map((tag) => (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => updateFilter('tags', filters.tags?.filter(t => t !== tag))}
                  className="inline-block"
                >
                  <Badge variant="secondary" className="cursor-pointer hover:bg-gray-300">
                    {tag} ×
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="border-t pt-6">
            <ProjectFilter
              projects={projects}
              selected={filters.projectId}
              onChange={(projectId) => updateFilter('projectId', projectId)}
            />
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
          <TagFilter
            selected={filters.tags || []}
            onChange={(tags) => updateFilter('tags', tags)}
          />
        </div>
      </div>
    </aside>
  );
}
