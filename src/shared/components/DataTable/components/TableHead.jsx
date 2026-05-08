import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export const TableHead = ({ columns, sortConfig, onSort }) => {
  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronsUpDown size={12} className="dt-sort-icon-off" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={12} className="dt-sort-icon-on" /> 
      : <ChevronDown size={12} className="dt-sort-icon-on" />;
  };

  return (
    <thead className="dt-thead">
      <tr>
        <th className="dt-th dt-col-idx" style={{ width: '4%' }}>#</th>
        {columns.map(col => (
          <th 
            key={col.key} 
            className={`dt-th dt-col-${col.key}`}
            style={{ textAlign: col.align || 'left' }}
            onClick={() => onSort && onSort(col.key)}
          >
            <div className="dt-th-content">
              <span>{col.label}</span>
              <span className="dt-sort-wrapper">{getSortIcon(col.key)}</span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};
