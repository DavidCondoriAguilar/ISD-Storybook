import React from 'react';

export const TableSkeleton = () => (
  <div className="dt-skeleton-container">
    {[1, 2, 3, 4].map(i => <div key={i} className="dt-skeleton-line" />)}
  </div>
);
