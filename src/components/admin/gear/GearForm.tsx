'use client';

import React, { useState, useEffect } from 'react';
import { GearItem, GEAR_CATEGORIES } from '@/lib/types';
import { useAdmin, getAdminHeaders } from '@/contexts/AdminContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from './ImageUpload';
import { ImageGallery, GearImageType } from './ImageGallery';

interface GearFormProps {
  gear?: GearItem;
  onSubmit: (data: Partial<GearItem>) => Promise<void>;
  onCancel: () => void;
}

export function GearForm({ gear, onSubmit, onCancel }: GearFormProps) {
  const { adminKey } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<GearItem>>({
    name: gear?.name || '',
    brand: gear?.brand || '',
    category: gear?.category || '',
    subcategory: gear?.subcategory || '',
    description: gear?.description || '',
    soundCharacteristics: gear?.soundCharacteristics || { tone: [], qualities: [] },
    tags: gear?.tags || [],
    notes: gear?.notes || '',
  });

  // Image management state
  const [images, setImages] = useState<GearImageType[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Temporary inputs for array fields
  const [toneInput, setToneInput] = useState('');
  const [qualityInput, setQualityInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Load images if editing existing gear
  useEffect(() => {
    if (gear?.id) {
      loadImages();
    }
  }, [gear?.id]);

  const loadImages = async () => {
    if (!gear?.id) return;
    
    setLoadingImages(true);
    try {
      const response = await fetch(`/api/gear/${gear.id}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      category,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  const addTone = () => {
    if (toneInput.trim()) {
      setFormData(prev => ({
        ...prev,
        soundCharacteristics: {
          ...prev.soundCharacteristics!,
          tone: [...(prev.soundCharacteristics?.tone || []), toneInput.trim()]
        }
      }));
      setToneInput('');
    }
  };

  const removeTone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      soundCharacteristics: {
        ...prev.soundCharacteristics!,
        tone: prev.soundCharacteristics?.tone.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addQuality = () => {
    if (qualityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        soundCharacteristics: {
          ...prev.soundCharacteristics!,
          qualities: [...(prev.soundCharacteristics?.qualities || []), qualityInput.trim()]
        }
      }));
      setQualityInput('');
    }
  };

  const removeQuality = (index: number) => {
    setFormData(prev => ({
      ...prev,
      soundCharacteristics: {
        ...prev.soundCharacteristics!,
        qualities: prev.soundCharacteristics?.qualities.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation - only require basic fields
    if (!formData.name || !formData.brand || !formData.category || !formData.subcategory) {
      setError('Please fill in name, brand, category, and subcategory');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gear');
      setLoading(false);
    }
  };

  const subcategories = formData.category ? GEAR_CATEGORIES[formData.category as keyof typeof GEAR_CATEGORIES] || [] : [];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">{gear ? 'Edit Gear' : 'Create New Gear'}</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {Object.keys(GEAR_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory *
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.category}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sound Characteristics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sound Characteristics</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone Characteristics
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={toneInput}
                  onChange={(e) => setToneInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTone())}
                  placeholder="Add a tone characteristic"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addTone}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.soundCharacteristics?.tone.map((tone, index) => (
                  <button key={index} type="button" onClick={() => removeTone(index)} className="inline-block">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-gray-300 transition-colors">
                      {tone} ×
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sound Qualities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={qualityInput}
                  onChange={(e) => setQualityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuality())}
                  placeholder="Add a sound quality"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addQuality}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.soundCharacteristics?.qualities.map((quality, index) => (
                  <button key={index} type="button" onClick={() => removeQuality(index)} className="inline-block">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-gray-300 transition-colors">
                      {quality} ×
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <button key={index} type="button" onClick={() => removeTag(index)} className="inline-block">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-gray-300 transition-colors">
                      {tag} ×
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image Management - Only for existing gear */}
          {gear?.id && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images</h3>
              
              {loadingImages ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading images...</p>
                </div>
              ) : (
                <>
                  <ImageGallery
                    gearId={gear.id}
                    images={images}
                    onImageUpdate={loadImages}
                    isAdmin={true}
                  />
                  
                  <div className="mt-6">
                    <ImageUpload
                      gearId={gear.id}
                      onUploadComplete={loadImages}
                      currentImageCount={images.length}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : gear ? 'Update Gear' : 'Create Gear'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
