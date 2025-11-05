import { useState, useEffect } from 'react';

interface UseGearImageOptions {
  id: string;
  name: string;
  brand: string;
  existingImageUrl?: string;
}

export function useGearImage({ id, name, brand, existingImageUrl }: UseGearImageOptions) {
  const [imageUrl, setImageUrl] = useState(existingImageUrl || '/placeholder-gear.svg');
  const [isLoading, setIsLoading] = useState(!existingImageUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have an image URL from the database, use it
    if (existingImageUrl && existingImageUrl !== '/placeholder-gear.svg') {
      setImageUrl(existingImageUrl);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch an image (from Google or generate placeholder)
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/gear/${id}/image?q=${encodeURIComponent(name)}&brand=${encodeURIComponent(brand)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }
        
        const data = await response.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('Error fetching gear image:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch image');
        // Keep the placeholder image on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [id, name, brand, existingImageUrl]);

  return { imageUrl, isLoading, error };
}

