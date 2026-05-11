import React from 'react';

/**
 * TableSkeleton - Optimized for Performance.
 * Animates the whole container instead of each cell to prevent "Animation Overload".
 */
export const TableSkeleton = () => (
  <div className="dt-master-wrapper" style={{ border: 'none' }}>
    {/* Header Skeleton */}
    <div className="skeleton" style={{ height: '36px', marginBottom: '8px', borderRadius: '8px' }}></div>
    
    {/* Rows Container with a SINGLE animation */}
    <div className="dt-table-skeleton-animator skeleton-pulse-container">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="skeleton-row-static" style={{ 
          height: '42px', 
          marginBottom: '4px', 
          borderRadius: '4px', 
          background: 'var(--border-strong)',
          opacity: 1 - (i * 0.1) 
        }}></div>
      ))}
    </div>
  </div>
);
