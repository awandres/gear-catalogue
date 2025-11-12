'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GearItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useGearImage } from '@/hooks/useGearImage';
import { ImageSelector } from './ImageSelector';
import { useAdmin } from '@/contexts/AdminContext';
import { getCategoryColor } from '@/lib/categoryColors';
import { getContrastTextColor } from '@/lib/colorUtils';

interface GearCardProps {
  gear: GearItem;
  onEdit?: (gear: GearItem) => void;
  onDelete?: (gear: GearItem) => void;
  onAddToProject?: (gearId: string) => void;
}

export function GearCard({ gear, onEdit, onDelete, onAddToProject }: GearCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const { isAdmin } = useAdmin();
  
  const { imageUrl, isLoading } = useGearImage({
    id: gear.id,
    name: gear.name,
    brand: gear.brand,
    existingImageUrl: currentImageUrl || gear.media?.photos?.[0]
  });

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleImageUpdate = (newImageUrl: string) => {
    setCurrentImageUrl(newImageUrl);
    // Force refresh the router to update any cached data
    router.refresh();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.image-selector') || target.closest('.admin-actions')) {
      return;
    }
    router.push(`/gear/${gear.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(gear);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(gear);
  };

  const handleAddToProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToProject?.(gear.id);
  };
  
  return (
    <div onClick={handleCardClick} className="h-full w-full">
      <Card className="h-full w-full min-h-[420px] hover:scale-[1.02] transition-transform cursor-pointer flex flex-col relative">
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
        
        <div className="aspect-w-16 aspect-h-12 relative bg-gray-100 image-selector shrink-0">
          <ImageSelector 
            gear={gear} 
            currentImage={imageUrl} 
            onImageUpdate={handleImageUpdate} 
          />
          {isLoading ? (
            <div className="w-full h-48 flex items-center justify-center bg-gray-200 animate-pulse">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={gear.name}
              width={400}
              height={300}
              className="object-contain w-full h-48 bg-white"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-gear.svg';
              }}
              unoptimized={imageUrl.startsWith('http')}
            />
          )}
        </div>
        
        <CardContent className="space-y-3 flex-1 flex flex-col">
          <div className="flex justify-between items-start shrink-0">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{gear.name}</h3>
              <p className="text-sm text-gray-600">{gear.brand}</p>
            </div>
            
            {isAdmin && (onEdit || onDelete) && (
              <div className="flex gap-2 admin-actions">
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit gear"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete gear"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-700 flex-1 shrink-0">
            <p className={`${isExpanded ? '' : 'line-clamp-3'} transition-all duration-300`}>
              {gear.description}
            </p>
            {gear.description.length > 150 && (
              <button
                onClick={handleExpandClick}
                className="text-blue-600 hover:text-blue-800 font-medium mt-1 focus:outline-none"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 shrink-0 mt-auto">
            {gear.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {gear.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{gear.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Associated Projects */}
          {gear.projectGear && gear.projectGear.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">In Projects:</p>
              <div className="flex flex-wrap gap-1">
                {gear.projectGear.map(({ project }) => (
                  <span 
                    key={project.id} 
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-semibold"
                    style={{ 
                      backgroundColor: project.primaryColor,
                      color: getContrastTextColor(project.primaryColor),
                      borderColor: project.primaryColor
                    }}
                  >
                    {project.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add to Project Button */}
          {isAdmin && onAddToProject && (
            <button
              onClick={handleAddToProject}
              className="mt-3 w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to Project
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
