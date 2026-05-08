import React from 'react';
import { TableHead } from './components/TableHead';
import { TableBody } from './components/TableBody';
import { TablePagination } from './components/TablePagination';
import { TableSkeleton } from './components/TableSkeleton';
import './DataTable.css';

/**
 * DataTable Architect v5.0 - CLEAN CODE EDITION
 * Refactorizada por Seniors para máxima mantenibilidad y escalabilidad.
 */
export const DataTable = ({ 
  columns, 
  data, 
  isLoading, 
  sortConfig, 
  onSort,
  pagination = null 
}) => {
  if (isLoading) return <TableSkeleton />;

  return (
    <div className="dt-master-wrapper">
      <table className="dt-table">
        <colgroup>
          <col style={{ width: '4%' }} />
          {columns.map(col => (
            <col key={col.key} style={{ width: col.width || 'auto' }} />
          ))}
        </colgroup>
        
        <TableHead 
          columns={columns} 
          sortConfig={sortConfig} 
          onSort={onSort} 
        />
        
        <TableBody 
          data={data} 
          columns={columns} 
        />
      </table>

      <TablePagination 
        pagination={pagination} 
        dataLength={data.length} 
      />
    </div>
  );
};

export default DataTable;
