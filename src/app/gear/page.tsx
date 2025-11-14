'use client';

import { useEffect, useState, useCallback } from 'react';
import { GearGrid } from '@/components/gear/GearGrid';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { GearItem, PaginatedResponse, GearFilters } from '@/lib/types';
import { GearForm } from '@/components/admin/gear/GearForm';
import { GearModal } from '@/components/admin/gear/GearModal';
import { ConfirmModal } from '@/components/admin/gear/ConfirmModal';
import { useAdmin, getAdminHeaders } from '@/contexts/AdminContext';
import { Project } from '@/lib/types';
import Link from 'next/link';
import { StickyProjectBar } from '@/components/projects/StickyProjectBar';
import { getCategoryColor } from '@/lib/categoryColors';
import { getContrastTextColor } from '@/lib/colorUtils';
import toast from 'react-hot-toast';

export default function GearPage() {
  const { adminKey, isAdmin, activeProjectId, setActiveProjectId } = useAdmin();
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
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingGear, setEditingGear] = useState<GearItem | undefined>(undefined);
  const [deletingGear, setDeletingGear] = useState<GearItem | undefined>(undefined);

  // Project states
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [needsReviewCount, setNeedsReviewCount] = useState(0);
  const [skipTransition, setSkipTransition] = useState(false);

  const fetchGear = useCallback(async (page: number = 1, currentFilters: GearFilters = filters, isInitialLoad = false) => {
    try {
      // Show loading skeleton on initial load, transition effect on subsequent loads
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setTransitioning(true);
      }
      
      const params = new URLSearchParams();
      
      // Add filters to params
      if (currentFilters.category) params.set('category', currentFilters.category);
      if (currentFilters.tags?.length) params.set('tags', currentFilters.tags.join(','));
      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.projectId) params.set('projectId', currentFilters.projectId);
      params.set('page', page.toString());

      const response = await fetch(`/api/gear?${params}`);
      const data: PaginatedResponse<GearItem> = await response.json();
      
      setGear(data.items || []);
      setPagination({
        page: data.page || 1,
        pageSize: data.pageSize || 24,
        totalItems: data.totalItems || 0,
        totalPages: data.totalPages || 0,
      });
    } catch (error) {
      console.error('Error fetching gear:', error);
    } finally {
      setLoading(false);
      setTransitioning(false);
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/gear/categories');
      const categories = await response.json();
      const counts: Record<string, number> = {};
      categories.forEach((cat: { name: string; count: number }) => {
        counts[cat.name] = cat.count;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchGear(1, filters, true); // Initial load
    fetchCategories();
    if (isAdmin) {
      fetchRecentProjects();
      fetchNeedsReviewCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]); // Only run on mount and when isAdmin changes

  // Separate effect for active project - doesn't refresh gear list
  useEffect(() => {
    if (isAdmin && activeProjectId) {
      fetchActiveProjectDetails(activeProjectId);
    } else {
      setActiveProject(null);
    }
  }, [activeProjectId, isAdmin]);

  const fetchNeedsReviewCount = async () => {
    try {
      const response = await fetch('/api/gear?category=needs-review&pageSize=1');
      const data = await response.json();
      setNeedsReviewCount(data.totalItems || 0);
    } catch (error) {
      console.error('Error fetching needs review count:', error);
    }
  };

  const fetchRecentProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await fetch('/api/projects?limit=5&status=PLANNING,CONFIRMED,IN_SESSION');
      const data = await response.json();
      setRecentProjects(data.items || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchActiveProjectDetails = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      setActiveProject(data);
    } catch (error) {
      console.error('Error fetching active project:', error);
    }
  };

  const handleProjectSelect = (projectId: string | null) => {
    setActiveProjectId(projectId);
    if (projectId) {
      fetchActiveProjectDetails(projectId);
    } else {
      setActiveProject(null);
    }
  };

  const handleAddToProject = async (gearId: string) => {
    if (!activeProjectId) {
      toast.error('Please select a project first');
      return;
    }

    const toastId = toast.loading('Adding gear to project...');
    try {
      const response = await fetch(`/api/projects/${activeProjectId}/gear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(adminKey),
        },
        body: JSON.stringify({ gearId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add gear to project');
      }

      toast.success('Gear added to project!', { id: toastId });
      
      // Fetch just the updated gear item
      const gearResponse = await fetch(`/api/gear/${gearId}`);
      if (gearResponse.ok) {
        const updatedGearItem = await gearResponse.json();
        // Update only this item in the gear array without transition
        setSkipTransition(true);
        setGear(prevGear => 
          prevGear.map(item => item.id === gearId ? updatedGearItem : item)
        );
        setTimeout(() => setSkipTransition(false), 100);
      }
      
      // Refresh the active project to update the gear list
      await fetchActiveProjectDetails(activeProjectId);
      await fetchRecentProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add gear to project', { id: toastId });
    }
  };

  const handleRemoveFromProject = async (projectId: string, gearId: string) => {
    const toastId = toast.loading('Removing from project...');
    try {
      const response = await fetch(`/api/projects/${projectId}/gear/${gearId}`, {
        method: 'DELETE',
        headers: getAdminHeaders(adminKey),
      });

      if (!response.ok) throw new Error('Failed to remove gear from project');

      toast.success('Removed from project', { id: toastId });

      // Fetch just the updated gear item
      const gearResponse = await fetch(`/api/gear/${gearId}`);
      if (gearResponse.ok) {
        const updatedGearItem = await gearResponse.json();
        // Update only this item in the gear array without transition
        setSkipTransition(true);
        setGear(prevGear => 
          prevGear.map(item => item.id === gearId ? updatedGearItem : item)
        );
        setTimeout(() => setSkipTransition(false), 100);
      }
      
      // Refresh the active project and recent projects
      if (activeProjectId === projectId) {
        await fetchActiveProjectDetails(projectId);
      }
      await fetchRecentProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove gear from project', { id: toastId });
    }
  };

  const handleClearProjectLoadout = (projectId: string) => {
    setClearingProjectId(projectId);
  };

  const confirmClearLoadout = async () => {
    if (!clearingProjectId) return;

    const toastId = toast.loading('Clearing project loadout...');
    try {
      const response = await fetch(`/api/projects/${clearingProjectId}/gear`, {
        method: 'DELETE',
        headers: getAdminHeaders(adminKey),
      });

      if (!response.ok) throw new Error('Failed to clear project loadout');

      toast.success('Project loadout cleared', { id: toastId });

      // Refresh everything
      await fetchGear(pagination.page, filters, false);
      if (activeProjectId === clearingProjectId) {
        await fetchActiveProjectDetails(clearingProjectId);
      }
      await fetchRecentProjects();
      setClearingProjectId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear loadout', { id: toastId });
    }
  };

  const handleSearch = (search: string) => {
    const newFilters = { ...filters, search: search || undefined };
    setFilters(newFilters);
    fetchGear(1, newFilters, false);
  };

  const handleFilterChange = (newFilters: GearFilters) => {
    setFilters(newFilters);
    fetchGear(1, newFilters, false);
  };

  const [showFilters, setShowFilters] = useState(false);
  const [clearingProjectId, setClearingProjectId] = useState<string | null>(null);

  // CRUD Handlers
  const handleCreateNew = () => {
    setEditingGear(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (gearItem: GearItem) => {
    setEditingGear(gearItem);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (gearItem: GearItem) => {
    setDeletingGear(gearItem);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (data: Partial<GearItem>) => {
    try {
      const url = editingGear ? `/api/gear/${editingGear.id}` : '/api/gear';
      const method = editingGear ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(adminKey),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save gear');
      }

      // Success! Close modal and refresh
      setIsFormModalOpen(false);
      setEditingGear(undefined);
      await fetchGear(pagination.page, filters, false);
      await fetchCategories();
    } catch (error) {
      throw error; // Let the form handle the error
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGear) return;

    try {
      const response = await fetch(`/api/gear/${deletingGear.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(adminKey),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete gear');
      }

      // Success! Close modal and refresh
      setIsDeleteModalOpen(false);
      setDeletingGear(undefined);
      await fetchGear(pagination.page, filters, false);
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting gear:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete gear');
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingGear(undefined);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingGear(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Project Bar - appears when scrolling past static version */}
      {isAdmin && recentProjects.length > 0 && (
        <StickyProjectBar
          projects={recentProjects}
          activeProjectId={activeProjectId}
          onProjectSelect={handleProjectSelect}
          activeProject={activeProject}
          triggerElementId="static-project-selector"
          onRemoveGear={handleRemoveFromProject}
          onClearLoadout={handleClearProjectLoadout}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Studio Gear Catalog</h1>
              <p className="text-gray-600">
                Browse our collection of professional recording equipment. Select the gear you want to use for your project.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Projects Selector (Admin Only) - Static version */}
        {isAdmin && (
          <div id="static-project-selector" className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Active Project</h3>
              <Link href="/projects" className="text-sm text-blue-600 hover:underline">
                View All Projects →
              </Link>
            </div>
            {loadingProjects ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : recentProjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleProjectSelect(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !activeProjectId
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  None
                </button>
                {recentProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md ${
                      activeProjectId === project.id
                        ? ''
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                    style={activeProjectId === project.id ? { 
                      backgroundColor: project.primaryColor,
                      color: getContrastTextColor(project.primaryColor)
                    } : undefined}
                  >
                    {project.name}
                    {project.gearLoadout && (
                      <span className="ml-1 text-xs opacity-75">
                        ({project.gearLoadout.length} items)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No active projects. <Link href="/projects" className="text-blue-600 hover:underline">Create one</Link> to start adding gear.
              </p>
            )}

            {/* Active Project Gear Display */}
            {activeProject && activeProject.gearLoadout && activeProject.gearLoadout.length > 0 && (
              <div className="mt-4 p-4 rounded-lg border-2" style={{ backgroundColor: `${activeProject.primaryColor}10`, borderColor: activeProject.primaryColor }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold" style={{ color: activeProject.primaryColor }}>
                    {activeProject.name} Loadout ({activeProject.gearLoadout.length} items)
                  </h4>
                  <button
                    onClick={() => handleClearProjectLoadout(activeProject.id)}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {activeProject.gearLoadout.filter(item => item.gear).map(({ gear }) => {
                    if (!gear) return null;
                    return (
                      <div
                        key={gear.id}
                        className="bg-white p-2 rounded border-2 hover:shadow-md transition-all relative group"
                        style={{ borderColor: `${activeProject.primaryColor}40` }}
                      >
                        {/* Category Badge - Upper Right */}
                        <div 
                          className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shadow-sm z-20"
                          style={{ 
                            backgroundColor: getCategoryColor(gear.category),
                            color: 'white'
                          }}
                        >
                          {gear.category}
                        </div>

                        <button
                          onClick={() => handleRemoveFromProject(activeProject.id, gear.id)}
                          className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30"
                          title="Remove from project"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0 pr-12">
                            <p className="text-xs font-medium text-gray-900 truncate">{gear.name}</p>
                            <p className="text-xs text-gray-500 truncate">{gear.brand}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Needs Review Alert */}
        {isAdmin && needsReviewCount > 0 && (
          <div className="mb-6 bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-orange-900">
                    {needsReviewCount} gear item{needsReviewCount !== 1 ? 's' : ''} need{needsReviewCount === 1 ? 's' : ''} review
                  </p>
                  <p className="text-sm text-orange-700">
                    These items are missing category or description information
                  </p>
                </div>
              </div>
              <Link
                href="/reviewer"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                Review Now →
              </Link>
            </div>
          </div>
        )}

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
              projects={recentProjects}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="mb-4 bg-white p-4 rounded-lg shadow flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {gear?.length || 0} of {pagination.totalItems} items
              </p>
              
              <div className="flex items-center gap-3">
                {transitioning && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </div>
                )}
                
                {isAdmin && (
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Gear
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <GearGrid 
                gear={gear || []} 
                loading={loading}
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onAddToProject={activeProjectId ? handleAddToProject : undefined}
                skipTransition={skipTransition}
              />
              {transitioning && (
                <div className="absolute inset-0 bg-white bg-opacity-50 pointer-events-none rounded-lg transition-opacity duration-300" />
              )}
            </div>

            {pagination.totalPages > 1 && !loading && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => fetchGear(pagination.page - 1, filters, false)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-white rounded-lg shadow">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchGear(pagination.page + 1, filters, false)}
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

      {/* CRUD Modals */}
      <GearModal isOpen={isFormModalOpen} onClose={handleFormCancel}>
        <GearForm
          gear={editingGear}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </GearModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Gear Item"
        message={`Are you sure you want to delete "${deletingGear?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />

      {/* Clear Loadout Confirmation Modal */}
      <ConfirmModal
        isOpen={clearingProjectId !== null}
        title="Clear Project Loadout"
        message={`Remove all gear from ${recentProjects.find(p => p.id === clearingProjectId)?.name || activeProject?.name || 'this project'}? The gear items will remain in the catalog.`}
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={confirmClearLoadout}
        onCancel={() => setClearingProjectId(null)}
        variant="danger"
      />
    </div>
  );
}