'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface GearImageType {
  id: string;
  url: string;
  source: string;
  isPrimary: boolean;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  size?: number | null;
}

interface ImageGalleryProps {
  gearId: string;
  images: GearImageType[];
  onImageUpdate: () => void;
  isAdmin?: boolean;
}

export function ImageGallery({ 
  gearId, 
  images, 
  onImageUpdate,
  isAdmin = false 
}: ImageGalleryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  const handleSetPrimary = async (imageId: string) => {
    setSettingPrimaryId(imageId);
    
    try {
      const response = await fetch(`/api/gear/${gearId}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': localStorage.getItem('adminKey') || '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set primary image');
      }

      onImageUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to set primary image');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDelete = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    
    if (!confirm(`Delete this image${image?.isPrimary ? ' (currently primary)' : ''}?`)) {
      return;
    }

    setDeletingId(imageId);
    
    try {
      const response = await fetch(`/api/gear/${gearId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': localStorage.getItem('adminKey') || '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete image');
      }

      onImageUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No images yet. Upload some images to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => (
        <div 
          key={image.id} 
          className={`
            relative border-2 rounded-lg overflow-hidden bg-white
            ${image.isPrimary ? 'border-blue-500 shadow-md' : 'border-gray-200'}
          `}
        >
          {/* Primary Badge */}
          {image.isPrimary && (
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Primary
              </span>
            </div>
          )}

          {/* Image */}
          <div className="aspect-video relative bg-gray-100">
            <Image
              src={image.url}
              alt="Gear image"
              fill
              className="object-contain"
              unoptimized
            />

            {/* Loading Overlay */}
            {(deletingId === image.id || settingPrimaryId === image.id) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Image Info */}
          <div className="p-2 bg-white border-t">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 capitalize">{image.source}</span>
              {image.format && (
                <span className="text-xs text-gray-400 uppercase">{image.format}</span>
              )}
            </div>

            {image.width && image.height && (
              <p className="text-xs text-gray-400">
                {image.width} × {image.height}
                {image.size && ` • ${(image.size / 1024 / 1024).toFixed(2)} MB`}
              </p>
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-2 mt-2">
                {!image.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    disabled={settingPrimaryId === image.id}
                    className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1.5 rounded transition-colors disabled:opacity-50"
                  >
                    Set as Primary
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

