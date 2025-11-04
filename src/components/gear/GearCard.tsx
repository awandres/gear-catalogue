'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GearItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { useGearImage } from '@/hooks/useGearImage';

interface GearCardProps {
  gear: GearItem;
}

export function GearCard({ gear }: GearCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { imageUrl, isLoading } = useGearImage({
    id: gear.id,
    name: gear.name,
    brand: gear.brand,
    existingImageUrl: gear.media?.photos?.[0]
  });

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  return (
    <Link href={`/gear/${gear.id}`}>
      <Card className="h-full hover:scale-[1.02] transition-transform">
        <div className="aspect-w-16 aspect-h-12 relative bg-gray-100">
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
              className="object-cover w-full h-48"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-gear.svg';
              }}
            />
          )}
          <div className="absolute top-2 right-2">
            <StatusBadge status={gear.status} />
          </div>
        </div>
        
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{gear.name}</h3>
            <p className="text-sm text-gray-600">{gear.brand}</p>
          </div>
          
          <div className="text-sm text-gray-700">
            <p className={`${isExpanded ? '' : 'line-clamp-4'} transition-all duration-300`}>
              {gear.description}
            </p>
            {gear.description.length > 200 && (
              <button
                onClick={handleExpandClick}
                className="text-blue-600 hover:text-blue-800 font-medium mt-1 focus:outline-none"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
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
        </CardContent>
      </Card>
    </Link>
  );
}
