'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MasonryGridProps {
  children: React.ReactNode[];
  columnWidth?: number;
  gap?: number;
}

export function MasonryGrid({ 
  children, 
  columnWidth = 300,
  gap = 24 
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateColumns = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const cols = Math.max(1, Math.floor(containerWidth / (columnWidth + gap)));
      setColumns(cols);
    };

    const positionItems = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const items = Array.from(container.children) as HTMLElement[];
      
      // Initialize column heights array
      const columnHeights = new Array(columns).fill(0);
      
      // Calculate actual column width
      const containerWidth = container.offsetWidth;
      const actualColumnWidth = (containerWidth - (gap * (columns - 1))) / columns;
      
      items.forEach((item, index) => {
        // Find the shortest column, preferring leftmost when heights are equal
        let shortestColumn = 0;
        let minHeight = columnHeights[0];
        
        for (let i = 1; i < columns; i++) {
          // Use < instead of <= to prefer leftmost columns when heights are equal
          if (columnHeights[i] < minHeight) {
            minHeight = columnHeights[i];
            shortestColumn = i;
          }
        }
        
        // Position the item
        const x = shortestColumn * (actualColumnWidth + gap);
        const y = columnHeights[shortestColumn];
        
        item.style.position = 'absolute';
        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
        item.style.width = `${actualColumnWidth}px`;
        
        // Update the column height
        columnHeights[shortestColumn] += item.offsetHeight + gap;
      });
      
      // Set container height to the tallest column
      const maxHeight = Math.max(...columnHeights) - gap;
      container.style.height = `${maxHeight}px`;
    };

    // Calculate columns on mount and resize
    calculateColumns();
    positionItems();

    const handleResize = () => {
      calculateColumns();
      // Re-position after columns change
      setTimeout(positionItems, 0);
    };

    window.addEventListener('resize', handleResize);
    
    // Re-position when children change
    const observer = new ResizeObserver(positionItems);
    const container = containerRef.current;
    if (container) {
      const items = Array.from(container.children);
      items.forEach(item => observer.observe(item as Element));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [children, columns, columnWidth, gap]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: '100px' }}>
      {React.Children.map(children, (child, index) => (
        <div key={index}>
          {child}
        </div>
      ))}
    </div>
  );
}
