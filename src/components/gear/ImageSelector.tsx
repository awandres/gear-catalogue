'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { GearItem } from '@/lib/types';

interface ImageSelectorProps {
  gear: GearItem;
  currentImage: string;
  onImageUpdate: (newImageUrl: string) => void;
}

export function ImageSelector({ gear, currentImage, onImageUpdate }: ImageSelectorProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [candidateImages, setCandidateImages] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingCalls, setRemainingCalls] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState(1);

  const fetchNewImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/gear/${gear.id}/fetch-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: gear.name,
          brand: gear.brand,
          startIndex
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch images');
      }

      if (data.images.length === 0) {
        throw new Error('No more images found');
      }

      setCandidateImages(data.images);
      setRemainingCalls(data.remainingCalls);
      setSelectedIndex(0);
      if (data.nextStartIndex) {
        setStartIndex(data.nextStartIndex);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const saveSelectedImage = async () => {
    if (!candidateImages[selectedIndex]) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gear/${gear.id}/fetch-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: gear.name,
          brand: gear.brand,
          action: 'save',
          imageUrl: candidateImages[selectedIndex].url
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save image');
      }

      onImageUpdate(candidateImages[selectedIndex].url);
      setIsSelecting(false);
      setCandidateImages([]);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save image');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSelection = () => {
    setIsSelecting(true);
    fetchNewImages();
  };

  const handleCancel = () => {
    setIsSelecting(false);
    setCandidateImages([]);
    setSelectedIndex(0);
    setError(null);
  };

  const handleNext = () => {
    if (selectedIndex < candidateImages.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else {
      // Fetch more images
      fetchNewImages();
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  // Add useEffect to handle body scroll lock
  useEffect(() => {
    if (isSelecting) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSelecting]);

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full transform transition-all">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select New Image</h2>
              <p className="text-gray-600 mt-1">{gear.brand} {gear.name}</p>
            </div>
            <div className="flex items-center gap-4">
              {remainingCalls !== null && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{remainingCalls}</span> API calls remaining
                </div>
              )}
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading && candidateImages.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Searching for images...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">{error}</p>
                <button
                  onClick={fetchNewImages}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : candidateImages.length > 0 ? (
            <div className="space-y-3">
              <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={candidateImages[selectedIndex].url}
                  alt={`Option ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
                <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                  {selectedIndex + 1} of {candidateImages.length}
                </div>
              </div>

              {candidateImages[selectedIndex].displayLink && (
                <p className="text-xs text-gray-500 text-center">
                  Source: {candidateImages[selectedIndex].displayLink}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              disabled={loading}
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {candidateImages.length > 0 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={loading || selectedIndex === 0}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium disabled:opacity-50"
                  >
                    Skip
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={loading || (selectedIndex === candidateImages.length - 1 && !startIndex)}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <button
                onClick={saveSelectedImage}
                disabled={loading || candidateImages.length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-2"
              >
                {loading ? 'Saving...' : 'Use This Image'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={handleStartSelection}
        className="absolute top-2 left-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1 z-10"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Change Image
      </button>
      
      {/* Render modal through portal when selecting */}
      {isSelecting && typeof window !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
