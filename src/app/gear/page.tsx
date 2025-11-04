'use client';

import { useEffect, useState, useCallback } from 'react';
import { GearGrid } from '@/components/gear/GearGrid';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { GearItem, PaginatedResponse, GearFilters } from '@/lib/types';

export default function GearPage() {
  const [gear, setGear] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [filters, setFilters] = useState<GearFilters>({});
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<GearItem>, 'items'>>({
    page: 1,
    pageSize: 24,
    totalItems: 0,
    totalPages: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const fetchGear = useCallback(async (page: number = 1, currentFilters: GearFilters = filters) => {
    try {
      // Only show loading skeleton on initial load
      if (gear.length === 0) {
        setLoading(true);
      } else {
        setTransitioning(true);
      }
      
      const params = new URLSearchParams();
      
      // Add filters to params
      if (currentFilters.category) params.set('category', currentFilters.category);
      if (currentFilters.status?.length) params.set('status', currentFilters.status.join(','));
      if (currentFilters.tags?.length) params.set('tags', currentFilters.tags.join(','));
      if (currentFilters.search) params.set('search', currentFilters.search);
      params.set('page', page.toString());

      const response = await fetch(`/api/gear?${params}`);
      const data: PaginatedResponse<GearItem> = await response.json();
      
      setGear(data.items);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        totalItems: data.totalItems,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error('Error fetching gear:', error);
    } finally {
      setLoading(false);
      setTransitioning(false);
    }
  }, [filters, gear.length]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/gear/categories');
      const categories = await response.json();
      const counts: Record<string, number> = {};
      categories.forEach((cat: any) => {
        counts[cat.name] = cat.count;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchGear();
    fetchCategories();
  }, [fetchGear]);

  const handleSearch = (search: string) => {
    const newFilters = { ...filters, search: search || undefined };
    setFilters(newFilters);
    fetchGear(1, newFilters);
  };

  const handleFilterChange = (newFilters: GearFilters) => {
    setFilters(newFilters);
    fetchGear(1, newFilters);
  };

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Studio Gear Catalog</h1>
          <p className="text-gray-600">
            Browse our collection of professional recording equipment
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-white px-4 py-2 rounded-lg shadow text-gray-700 flex items-center justify-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Filters</span>
          </button>

          {/* Filters - Desktop always visible, mobile toggleable */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <FilterPanel 
              filters={filters} 
              onFilterChange={handleFilterChange}
              categoryCounts={categoryCounts}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="mb-4 bg-white p-4 rounded-lg shadow flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {gear.length} of {pagination.totalItems} items
              </p>
              {transitioning && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <GearGrid gear={gear} loading={loading} />
              {transitioning && (
                <div className="absolute inset-0 bg-white bg-opacity-50 pointer-events-none rounded-lg transition-opacity duration-300" />
              )}
            </div>

            {pagination.totalPages > 1 && !loading && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => fetchGear(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-white rounded-lg shadow">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchGear(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}