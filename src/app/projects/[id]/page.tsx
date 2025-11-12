'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, GearItem } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdmin, getAdminHeaders } from '@/contexts/AdminContext';
import { ConfirmModal } from '@/components/admin/gear/ConfirmModal';
import { getCategoryColor } from '@/lib/categoryColors';
import toast from 'react-hot-toast';
import { MasonryGrid } from '@/components/projects/MasonryGrid';

const statusStyles: Record<string, { bgColor: string; textColor: string }> = {
  PLANNING: { bgColor: '#fef3c7', textColor: '#92400e' }, // yellow-100 bg, yellow-900 text
  CONFIRMED: { bgColor: '#d1fae5', textColor: '#14532d' }, // green-100 bg, green-900 text
  IN_SESSION: { bgColor: '#dbeafe', textColor: '#1e3a8a' }, // blue-100 bg, blue-900 text
  COMPLETED: { bgColor: '#f3f4f6', textColor: '#1f2937' }, // gray-100 bg, gray-800 text
  ARCHIVED: { bgColor: '#e5e7eb', textColor: '#374151' }, // gray-200 bg, gray-700 text
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isAdmin, adminKey } = useAdmin();
  const [project, setProject] = useState<Project | null>(null);
  const [availableGear, setAvailableGear] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params;
        
        // Load project details
        const projectRes = await fetch(`/api/projects/${id}`);
        if (!projectRes.ok) throw new Error('Failed to load project');
        const projectData = await projectRes.json();
        setProject(projectData);

        // Load available gear
        const gearRes = await fetch('/api/gear');
        if (!gearRes.ok) throw new Error('Failed to load gear');
        const gearData = await gearRes.json();
        setAvailableGear(gearData.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const handleAddGear = async (gearId: string) => {
    if (!project) return;

    const toastId = toast.loading('Adding gear...');
    try {
      const response = await fetch(`/api/projects/${project.id}/gear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(adminKey),
        },
        body: JSON.stringify({ gearId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add gear');
      }

      toast.success('Gear added to project', { id: toastId });

      // Reload project to get updated loadout
      const projectRes = await fetch(`/api/projects/${project.id}`);
      const updatedProject = await projectRes.json();
      setProject(updatedProject);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add gear', { id: toastId });
    }
  };

  const handleRemoveGear = async (gearId: string) => {
    if (!project) return;

    const toastId = toast.loading('Removing gear...');
    try {
      const response = await fetch(`/api/projects/${project.id}/gear/${gearId}`, {
        method: 'DELETE',
        headers: getAdminHeaders(adminKey),
      });

      if (!response.ok) throw new Error('Failed to remove gear');

      toast.success('Gear removed', { id: toastId });

      // Reload project
      const projectRes = await fetch(`/api/projects/${project.id}`);
      const updatedProject = await projectRes.json();
      setProject(updatedProject);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove gear', { id: toastId });
    }
  };

  const copyShareLink = () => {
    if (!project) return;
    const shareUrl = `${window.location.origin}/client/project/${project.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const handleClearLoadout = () => {
    setShowClearModal(true);
  };

  const handleRemoveCategory = async (category: string) => {
    if (!project) return;

    try {
      // Get all gear IDs in this category
      const gearIds = groupedLoadout[category]
        .filter(item => item.gear)
        .map(item => item.gear!.id);
      
      // Remove each item
      const removePromises = gearIds.map(gearId => 
        fetch(`/api/projects/${project.id}/gear/${gearId}`, {
          method: 'DELETE',
          headers: getAdminHeaders(adminKey)
        })
      );
      
      await Promise.all(removePromises);
      
      // Update local state
      setProject(prev => {
        if (!prev || !prev.gearLoadout) return prev;
        return {
          ...prev,
          gearLoadout: prev.gearLoadout.filter(item => item.gear?.category !== category)
        };
      });
      
      toast.success(`Removed all ${category} items from project`);
    } catch (error) {
      console.error('Failed to remove category:', error);
      toast.error(`Failed to remove ${category} items`);
    }
  };

  const confirmClearLoadout = async () => {
    if (!project) return;

    const toastId = toast.loading('Clearing loadout...');
    try {
      const response = await fetch(`/api/projects/${project.id}/gear`, {
        method: 'DELETE',
        headers: getAdminHeaders(adminKey),
      });

      if (!response.ok) throw new Error('Failed to clear loadout');

      toast.success('Project loadout cleared', { id: toastId });

      // Reload project
      const projectRes = await fetch(`/api/projects/${project.id}`);
      const updatedProject = await projectRes.json();
      setProject(updatedProject);
      setShowClearModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear loadout', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  // Filter available gear by category
  const filteredGear = selectedCategory
    ? availableGear.filter(gear => gear.category === selectedCategory)
    : availableGear;

  // Check if gear is already in project
  const isGearInProject = (gearId: string) => {
    return project.gearLoadout?.some(item => item.gearId === gearId) || false;
  };

  // Get unique categories
  const categories = Array.from(new Set(availableGear.map(g => g.category)));

  // Group gear loadout by category
  const groupedLoadout = project.gearLoadout?.reduce((acc, item) => {
    if (!item.gear) return acc;
    const category = item.gear.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof project.gearLoadout>) || {};

  const sortedCategories = Object.keys(groupedLoadout).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/projects" className="text-blue-600 hover:underline">
              Projects
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900 font-medium">{project.name}</li>
        </ol>
      </nav>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-8" style={{ borderLeftColor: project.primaryColor }}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <div 
              className="w-4 h-4 rounded-full mt-1 shrink-0"
              style={{ backgroundColor: project.primaryColor }}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-lg text-gray-600">{project.clientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              className="text-sm px-3 py-1"
              style={{
                backgroundColor: statusStyles[project.status]?.bgColor || '#f3f4f6',
                color: statusStyles[project.status]?.textColor || '#1f2937'
              }}
            >
              {project.status.split('_').join(' ')}
            </Badge>
            <button
              onClick={copyShareLink}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.658C18.114 15.062 18 14.606 18 14.124c0-.482.114-.938.316-1.342M9.316 10.658a3 3 0 105.368 2.684m0 0a3 3 0 10-5.368-2.684" />
              </svg>
              Share with Client
            </button>
          </div>
        </div>

        {project.description && (
          <p className="text-gray-700 mb-4">{project.description}</p>
        )}

        <div className="flex gap-6 text-sm text-gray-600">
          {project.startDate && (
            <div>
              <span className="font-medium">Start:</span> {new Date(project.startDate).toLocaleDateString()}
            </div>
          )}
          {project.endDate && (
            <div>
              <span className="font-medium">End:</span> {new Date(project.endDate).toLocaleDateString()}
            </div>
          )}
          {project.clientEmail && (
            <div>
              <span className="font-medium">Contact:</span> {project.clientEmail}
            </div>
          )}
        </div>
      </div>

      {/* Selected Gear Loadout */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Selected Gear ({project.gearLoadout?.length || 0} items)
          </h2>
          {isAdmin && project.gearLoadout && project.gearLoadout.length > 0 && (
            <button
              onClick={handleClearLoadout}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Gear
            </button>
          )}
        </div>

        {project.gearLoadout && project.gearLoadout.length > 0 ? (
          <MasonryGrid columnWidth={280} gap={24}>
            {sortedCategories.map(category => (
              <div key={category} className="group">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="inline-block px-3 py-1.5 rounded-full text-white font-bold text-sm shadow-md"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    >
                      {category.replace(/-/g, ' ')}s
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveCategory(category)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        title={`Remove all ${category} items`}
                      >
                        Remove All
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1" style={{ backgroundColor: getCategoryColor(category) }}></div>
                    <span className="text-xs font-semibold text-gray-600">
                      {groupedLoadout[category].length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {groupedLoadout[category].map(({ gear, notes }) => {
                    if (!gear) return null;
                    return (
                    <Card 
                      key={gear.id} 
                      className="transition-all relative group h-full border-l-4"
                      style={{ 
                        borderLeftColor: project.primaryColor,
                        boxShadow: `0 1px 3px 0 ${project.primaryColor}20, 0 1px 2px -1px ${project.primaryColor}20`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 10px 15px -3px ${project.primaryColor}30, 0 4px 6px -4px ${project.primaryColor}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 1px 3px 0 ${project.primaryColor}20, 0 1px 2px -1px ${project.primaryColor}20`;
                      }}
                    >
                      {/* Category Badge - Upper Right */}
                      <div 
                        className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold shadow-md z-20"
                        style={{ 
                          backgroundColor: getCategoryColor(gear.category),
                          color: 'white'
                        }}
                      >
                        {gear.category}
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveGear(gear.id)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                          title="Remove from project"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-16">
                            <h4 className="font-semibold">{gear.name}</h4>
                            <p className="text-sm text-gray-600">{gear.brand}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{gear.description}</p>
                        {notes && (
                          <p className="text-sm mt-2" style={{ color: project.primaryColor }}>Note: {notes}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {gear.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag} 
                              className="text-xs px-2 py-0.5 rounded-full border font-medium"
                              style={{ 
                                backgroundColor: `${project.primaryColor}15`,
                                color: project.primaryColor,
                                borderColor: `${project.primaryColor}40`
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                  })}
                </div>
              </div>
            ))}
          </MasonryGrid>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No gear selected yet. Add items from the catalog below.</p>
          </div>
        )}
      </div>

      {/* Available Gear Catalog */}
      {isAdmin && (
        <>
          <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Available Gear</h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {filteredGear.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Gear in Catalogue</h3>
                <p className="text-gray-600 mb-4">Add gear items to get started</p>
                <Link 
                  href="/kenny"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bulk Upload with Kenny Kloud
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredGear.map(gear => {
                  const inProject = isGearInProject(gear.id);
                  const categoryColor = getCategoryColor(gear.category);
                  
                  return (
                    <Card 
                      key={gear.id}
                      className={`transition-all border-2 ${inProject ? 'opacity-50' : ''}`}
                      style={{
                        borderColor: inProject ? '#d1d5db' : categoryColor,
                        boxShadow: inProject 
                          ? 'none' 
                          : `0 1px 3px 0 ${categoryColor}20, 0 1px 2px -1px ${categoryColor}20`,
                      }}
                      onMouseEnter={(e) => {
                        if (!inProject) {
                          e.currentTarget.style.boxShadow = `0 4px 6px -1px ${categoryColor}30, 0 2px 4px -2px ${categoryColor}30`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!inProject) {
                          e.currentTarget.style.boxShadow = `0 1px 3px 0 ${categoryColor}20, 0 1px 2px -1px ${categoryColor}20`;
                        }
                      }}
                    >
                      <div className="p-4">
                        <h4 className="font-semibold text-sm">{gear.name}</h4>
                        <p className="text-xs text-gray-600">{gear.brand}</p>
                        <p className="text-xs text-gray-700 line-clamp-2 mt-1">{gear.description}</p>
                        <button
                          onClick={() => handleAddGear(gear.id)}
                          disabled={inProject}
                          className={`mt-3 w-full py-1.5 px-3 text-xs rounded transition-colors text-white ${
                            inProject
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'hover:brightness-110'
                          }`}
                          style={
                            inProject
                              ? {}
                              : { backgroundColor: categoryColor }
                          }
                        >
                          {inProject ? 'Already Added' : 'Add to Project'}
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Clear Loadout Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Clear Project Loadout"
        message={`Remove all gear from "${project?.name}"? The gear items will remain in the catalog.`}
        confirmText="Clear All Gear"
        cancelText="Cancel"
        onConfirm={confirmClearLoadout}
        onCancel={() => setShowClearModal(false)}
        variant="danger"
      />
    </div>
  );
}
