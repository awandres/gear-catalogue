// This hook now returns a static placeholder image for all gear items
// In the future, this can be updated to fetch real images

interface UseGearImageOptions {
  id: string;
  name: string;
  brand: string;
  existingImageUrl?: string;
}

export function useGearImage({ id, name, brand, existingImageUrl }: UseGearImageOptions) {
  // Always use the placeholder SVG for now
  const imageUrl = '/placeholder-gear.svg';
  const isLoading = false;
  const error = null;

  return { imageUrl, isLoading, error };
}

