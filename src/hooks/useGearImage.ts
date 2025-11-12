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

    // Fetch primary image from database first, then fall back to other sources
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        
        // First, try to get the primary image from the database
        const imagesResponse = await fetch(`/api/gear/${id}/images`);
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          const primaryImage = imagesData.images?.find((img: any) => img.isPrimary);
          
          if (primaryImage?.url) {
            setImageUrl(primaryImage.url);
            setIsLoading(false);
            return;
          }
          
          // If no primary but there are images, use the first one
          if (imagesData.images?.length > 0) {
            setImageUrl(imagesData.images[0].url);
            setIsLoading(false);
            return;
          }
        }

        // If no images in database, fall back to the old image endpoint
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

