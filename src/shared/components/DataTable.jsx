import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/**
 * Tabla de datos premium con soporte de ordenamiento dinámico.
 */
export const DataTable = ({ columns, data, isLoading, sortConfig, onSort }) => {
  if (isLoading) {
    return (
      <div className="table-skeleton-container" style={{ padding: '1rem' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton" style={{ height: '50px', marginBottom: '8px', width: '100%' }} />
        ))}
      </div>
    );
  }

  const renderSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronsUpDown size={12} style={{ marginLeft: '6px', opacity: 0.3 }} />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={12} style={{ marginLeft: '6px', color: 'var(--primary)' }} /> 
      : <ChevronDown size={12} style={{ marginLeft: '6px', color: 'var(--primary)' }} />;
  };

  return (
    <div className="premium-table-container glass" style={{ width: '100%', overflowX: 'auto' }}>
      <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ width: '50px', textAlign: 'center', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>#</th>
            {columns.map(col => (
              <th 
                key={col.key} 
                style={{ 
                  textAlign: col.align || 'left', 
                  padding: '1rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => onSort && onSort(col.key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}>
                  {col.label}
                  {renderSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="empty-state" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                No hay registros disponibles para los filtros seleccionados.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.idLocal || i} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ opacity: 0.5, fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'center', padding: '1rem' }}>{i + 1}</td>
                {columns.map(col => (
                  <td key={col.key} style={{ textAlign: col.align || 'left', padding: '1rem' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
