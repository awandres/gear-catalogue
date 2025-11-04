import { GearItem, GearFilters } from './types';

// Search functionality
export function searchGear(query: string, gearList: GearItem[]): GearItem[] {
  const lowerQuery = query.toLowerCase();
  
  return gearList.filter(item => {
    return (
      item.name.toLowerCase().includes(lowerQuery) ||
      item.brand.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

// Filter functionality
export function filterGear(filters: GearFilters, gearList: GearItem[]): GearItem[] {
  return gearList.filter(item => {
    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }
    
    // Status filter
    if (filters.status?.length && !filters.status.includes(item.status)) {
      return false;
    }
    
    // Tag filter (any match)
    if (filters.tags?.length) {
      const hasTag = filters.tags.some(tag => item.tags.includes(tag));
      if (!hasTag) return false;
    }
    
    // Tone filter
    if (filters.tone?.length) {
      const hasTone = filters.tone.some(tone => 
        item.soundCharacteristics.tone.includes(tone)
      );
      if (!hasTone) return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchResults = searchGear(filters.search, [item]);
      if (searchResults.length === 0) return false;
    }
    
    return true;
  });
}

// Pagination
export function paginateGear<T>(items: T[], page: number = 1, pageSize: number = 24) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    items: items.slice(start, end),
    page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pageSize)
  };
}

// Extract all unique tags with counts
export function getTagsWithCounts(gearList: GearItem[]) {
  const tagCounts = new Map<string, number>();
  
  gearList.forEach(item => {
    item.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// Validate gear item
export function validateGearItem(item: Partial<GearItem>): string[] {
  const errors: string[] = [];
  
  // Required fields
  if (!item.id) errors.push('ID is required');
  if (!item.name) errors.push('Name is required');
  if (!item.brand) errors.push('Brand is required');
  if (!item.category) errors.push('Category is required');
  if (!item.subcategory) errors.push('Subcategory is required');
  if (!item.description || item.description.length < 50) {
    errors.push('Description must be at least 50 characters');
  }
  if (!item.soundCharacteristics?.tone?.length || item.soundCharacteristics.tone.length < 2) {
    errors.push('At least 2 tone characteristics required');
  }
  if (!item.tags?.length || item.tags.length < 3) {
    errors.push('At least 3 tags required');
  }
  if (!item.status) errors.push('Status is required');
  
  // Status validation
  const validStatuses = ['available', 'in-use', 'archived', 'maintenance', 'broken'];
  if (item.status && !validStatuses.includes(item.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  return errors;
}

// CSS classes for Tailwind
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
