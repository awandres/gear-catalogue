'use client';

import { useState, useEffect } from 'react';
import { useAdmin, getAdminHeaders } from '@/contexts/AdminContext';
import { GearItem, GEAR_CATEGORIES } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function GearReviewerPage() {
  const { isAdmin, adminKey } = useAdmin();
  const [needsReview, setNeedsReview] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Record<string, Partial<GearItem>>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [fetchingDescriptionIds, setFetchingDescriptionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAdmin) {
      fetchNeedsReview();
    }
  }, [isAdmin]);

  const fetchNeedsReview = async () => {
    try {
      const response = await fetch('/api/gear?category=needs-review&pageSize=100');
      const data = await response.json();
      const items = data.items || [];
      setNeedsReview(items);
      
      // Initialize edit data for all items
      const initialEditData: Record<string, Partial<GearItem>> = {};
      items.forEach((item: GearItem) => {
        initialEditData[item.id] = {
          category: item.category !== 'needs-review' ? item.category : '',
          subcategory: item.subcategory !== 'uncategorized' ? item.subcategory : '',
          description: item.description,
          tags: item.tags,
        };
      });
      setEditData(initialEditData);
    } catch (error) {
      console.error('Error fetching gear:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEditData = async (id: string, updates: Partial<GearItem>) => {
    setEditData(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
    
    // If category changed and no description yet, auto-fetch from Google
    if (updates.category && updates.category !== 'needs-review') {
      const currentData = editData[id] || {};
      const item = needsReview.find(g => g.id === id);
      
      // Only fetch if description is empty or generic
      const hasDescription = currentData.description && 
                           currentData.description.length > 50 &&
                           !currentData.description.includes('requires categorization');
      
      if (!hasDescription && item) {
        setFetchingDescriptionIds(prev => new Set(prev).add(id));
        try {
          // Call our backend to fetch description
          const response = await fetch(`/api/gear/${id}/fetch-description`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAdminHeaders(adminKey),
            },
            body: JSON.stringify({
              brand: item.brand,
              name: item.name,
              category: updates.category,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.description) {
              setEditData(prev => ({
                ...prev,
                [id]: { ...prev[id], description: data.description }
              }));
              toast.success(`AI description generated for ${item.name}`, { duration: 2000 });
            }
          }
        } catch (error) {
          console.error('Failed to fetch description:', error);
        } finally {
          setFetchingDescriptionIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      }
    }
  };

  const handleSave = async (item: GearItem) => {
    setSavingIds(prev => new Set(prev).add(item.id));
    try {
      const response = await fetch(`/api/gear/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(adminKey),
        },
        body: JSON.stringify(editData[item.id]),
      });

      if (!response.ok) {
        throw new Error('Failed to update gear');
      }

      // Remove from needs review list
      setNeedsReview(prev => prev.filter(g => g.id !== item.id));
      
      // Clean up edit data
      setEditData(prev => {
        const newData = { ...prev };
        delete newData[item.id];
        return newData;
      });
      
      toast.success(`${item.name} updated and removed from review!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update gear');
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (item: GearItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;

    try {
      const response = await fetch(`/api/gear/${item.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(adminKey),
      });

      if (!response.ok) throw new Error('Failed to delete');

      setNeedsReview(prev => prev.filter(g => g.id !== item.id));
      
      // Clean up edit data
      setEditData(prev => {
        const newData = { ...prev };
        delete newData[item.id];
        return newData;
      });
      
      toast.success(`${item.name} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-600">You need admin access to use this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Gear Reviewer</h1>
              <p className="text-gray-600">Review and categorize incomplete gear items</p>
            </div>
            <Link 
              href="/gear"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ← Back to Catalog
            </Link>
          </div>
        </div>

        {needsReview.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
              <p className="text-gray-600">No gear items need review at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg">
              <p className="font-semibold">{needsReview.length} item{needsReview.length !== 1 ? 's' : ''} need{needsReview.length === 1 ? 's' : ''} review</p>
              <p className="text-sm mt-1">Complete the missing information to move these items to the main catalog.</p>
            </div>

            <div className="space-y-4">
              {needsReview.map((item) => {
                const categories = Object.keys(GEAR_CATEGORIES).filter(c => c !== 'needs-review');
                const itemData = editData[item.id] || {};
                const isSaving = savingIds.has(item.id);

                return (
                  <Card key={item.id} className="bg-white">
                    <CardContent className="p-6">
                      {/* Header with Item Info */}
                      <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.brand}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                          disabled={isSaving}
                        >
                          Delete
                        </button>
                      </div>

                      {/* Always-On Edit Form */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Category *
                            </label>
                            <select
                              value={itemData.category || ''}
                              onChange={(e) => updateEditData(item.id, { 
                                category: e.target.value,
                                subcategory: '' 
                              })}
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                            >
                              <option value="">→ Select category</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>
                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Subcategory *
                            </label>
                            <select
                              value={itemData.subcategory || ''}
                              onChange={(e) => updateEditData(item.id, { subcategory: e.target.value })}
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                              disabled={!itemData.category}
                            >
                              <option value="">→ Select subcategory</option>
                              {itemData.category && (GEAR_CATEGORIES as any)[itemData.category]?.map((sub: string) => (
                                <option key={sub} value={sub}>
                                  {sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            Description
                            {fetchingDescriptionIds.has(item.id) && (
                              <span className="text-xs text-blue-600 flex items-center gap-1">
                                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                              </span>
                            )}
                          </label>
                          <textarea
                            value={itemData.description || ''}
                            onChange={(e) => updateEditData(item.id, { description: e.target.value })}
                            rows={3}
                            placeholder="Enter a description for this gear item..."
                            disabled={fetchingDescriptionIds.has(item.id)}
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-50 disabled:cursor-wait"
                          />
                        </div>

                        {/* Tags Display */}
                        {item.tags.length > 0 && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Current Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-sm px-3 py-1">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleSave(item)}
                            disabled={isSaving || !itemData.category || !itemData.subcategory}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base shadow-sm"
                          >
                            {isSaving ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </span>
                            ) : (
                              '✓ Save & Remove from Review'
                            )}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

