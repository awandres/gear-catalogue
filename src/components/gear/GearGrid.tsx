'use client';

import { useEffect, useState } from 'react';
import { GearItem } from '@/lib/types';
import { GearCard } from './GearCard';

interface GearGridProps {
  gear: GearItem[];
  loading?: boolean;
}

export function GearGrid({ gear, loading }: GearGridProps) {
  const [displayedGear, setDisplayedGear] = useState<GearItem[]>(gear);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!loading && gear !== displayedGear) {
      setIsTransitioning(true);
      
      // Small delay to trigger exit animation
      const timer = setTimeout(() => {
        setDisplayedGear(gear);
        // Reset transitioning state after animation completes
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [gear, loading, displayedGear]);
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={`skeleton-${i}`} 
            className="animate-pulse"
            style={{
              animationDelay: `${i * 100}ms`
            }}
          >
            <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedGear.length === 0 && !loading) {
    return (
      <div className="text-center py-12 transition-opacity duration-300">
        <p className="text-gray-500 text-lg">No gear found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {displayedGear.map((item, index) => (
          <div
            key={item.id}
            className="transition-all duration-300 ease-out"
            style={{
              animationName: isTransitioning ? 'none' : 'fadeInUp',
              animationDuration: isTransitioning ? '0s' : '0.5s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
              animationDelay: isTransitioning ? '0s' : `${index * 50}ms`,
              opacity: isTransitioning ? 0 : 1
            }}
          >
            <GearCard gear={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
