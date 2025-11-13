'use client';

import { useState, useCallback, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';

interface ImageUploadProps {
  gearId: string;
  onUploadComplete: () => void;
  maxImages?: number;
  currentImageCount?: number;
}

interface UploadingImage {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export function ImageUpload({ 
  gearId, 
  onUploadComplete,
  maxImages = 10,
  currentImageCount = 0
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = maxImages - currentImageCount;

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original if compression fails
    }
  };

  const uploadImage = async (file: File, index: number) => {
    setUploadingImages(prev => prev.map((img, i) => 
      i === index ? { ...img, status: 'uploading', progress: 0 } : img
    ));

    try {
      // Compress the image first
      const compressedFile = await compressImage(file);

      // Create form data
      const formData = new FormData();
      formData.append('image', compressedFile);

      // Upload to API
      const response = await fetch(`/api/gear/${gearId}/images/upload`, {
        method: 'POST',
        headers: {
          'x-admin-key': localStorage.getItem('adminKey') || '',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      setUploadingImages(prev => prev.map((img, i) => 
        i === index ? { ...img, status: 'success', progress: 100 } : img
      ));

      // Remove successful upload after 1 second
      setTimeout(() => {
        setUploadingImages(prev => prev.filter((_, i) => i !== index));
        onUploadComplete();
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadingImages(prev => prev.map((img, i) => 
        i === index ? { ...img, status: 'error', error: errorMessage } : img
      ));
    }
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }

      // Validate file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }

      return true;
    });

    // Check if we're exceeding the max images limit
    const totalNewImages = uploadingImages.length + validFiles.length;
    if (currentImageCount + totalNewImages > maxImages) {
      alert(`Cannot upload more than ${maxImages} images per gear item`);
      return;
    }

    // Create preview URLs and add to uploading list
    const newUploads: UploadingImage[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));

    setUploadingImages(prev => [...prev, ...newUploads]);

    // Start uploading each file
    const startIndex = uploadingImages.length;
    newUploads.forEach((_, i) => {
      uploadImage(validFiles[i], startIndex + i);
    });
  }, [uploadingImages.length, currentImageCount, maxImages, gearId, onUploadComplete]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveUpload = (index: number) => {
    setUploadingImages(prev => {
      const newUploads = [...prev];
      URL.revokeObjectURL(newUploads[index].preview);
      newUploads.splice(index, 1);
      return newUploads;
    });
  };

  if (remainingSlots <= 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Maximum number of images ({maxImages}) reached
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <svg 
          className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>

        <p className="text-lg font-medium text-gray-700 mb-1">
          {isDragging ? 'Drop images here' : 'Drag & drop images here'}
        </p>
        <p className="text-sm text-gray-500">
          or click to browse • Max {remainingSlots} image{remainingSlots !== 1 ? 's' : ''} • 5MB max per file
        </p>
      </div>

      {/* Uploading Images Preview */}
      {uploadingImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {uploadingImages.map((upload, index) => (
            <div key={index} className="relative border rounded-lg overflow-hidden bg-white">
              <div className="aspect-video relative bg-gray-100">
                <Image
                  src={upload.preview}
                  alt={upload.file.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Status Overlay */}
              {upload.status !== 'pending' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  {upload.status === 'uploading' && (
                    <div className="text-center">
                      <svg className="animate-spin h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-white text-sm">Uploading...</p>
                    </div>
                  )}

                  {upload.status === 'success' && (
                    <div className="text-center">
                      <svg className="w-12 h-12 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-white text-sm mt-2">Uploaded!</p>
                    </div>
                  )}

                  {upload.status === 'error' && (
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-white text-sm mt-2">{upload.error}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveUpload(index);
                        }}
                        className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* File Info */}
              <div className="p-2 bg-white">
                <p className="text-xs text-gray-600 truncate">{upload.file.name}</p>
                <p className="text-xs text-gray-400">
                  {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Remove button for pending uploads */}
              {upload.status === 'pending' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveUpload(index);
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



