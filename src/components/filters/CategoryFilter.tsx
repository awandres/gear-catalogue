'use client';

import { GEAR_CATEGORIES, GearCategory } from '@/lib/types';
import { useAdmin } from '@/contexts/AdminContext';

interface CategoryFilterProps {
  selected?: GearCategory;
  onChange: (category?: GearCategory) => void;
  counts?: Record<string, number>;
}

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  const { isAdmin } = useAdmin();
  const allCategories = Object.keys(GEAR_CATEGORIES) as GearCategory[];
  
  // Filter out needs-review for non-admin users
  const categories = isAdmin 
    ? allCategories 
    : allCategories.filter(cat => cat !== 'needs-review');

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900">Category</h3>
      <div className="space-y-1">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="category"
            checked={!selected}
            onChange={() => onChange(undefined)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">All Categories</span>
          {counts && (
            <span className="text-xs text-gray-500">
              ({Object.values(counts).reduce((a, b) => a + b, 0)})
            </span>
          )}
        </label>
        {categories.map((category) => (
          <label key={category} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={selected === category}
              onChange={() => onChange(category)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 capitalize">
              {category.replace('-', ' ')}
            </span>
            {counts?.[category] !== undefined && (
              <span className="text-xs text-gray-500">({counts[category]})</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
