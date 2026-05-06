import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import './DataTable.css';

/**
 * Tabla de datos premium con soporte de ordenamiento dinámico.
 */
export const DataTable = ({ columns, data, isLoading, sortConfig, onSort }) => {
  if (isLoading) {
    return (
      <div className="table-skeleton-container">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton-row" />
        ))}
      </div>
    );
  }

  const renderSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronsUpDown size={12} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={12} className="sort-icon active" /> 
      : <ChevronDown size={12} className="sort-icon active" />;
  };

  return (
    <div className="premium-table-container glass">
      <table className="premium-table">
        <thead>
          <tr className="table-header-row">
            <th className="header-cell index-col">#</th>
            {columns.map(col => (
              <th 
                key={col.key} 
                className="header-cell"
                style={{ textAlign: col.align || 'left' }}
                onClick={() => onSort && onSort(col.key)}
              >
                <div className={`header-cell-content align-${col.align || 'left'}`}>
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
              <td colSpan={columns.length + 1} className="empty-state">
                No hay registros disponibles para los filtros seleccionados.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.idLocal || row.id || i} className="table-row">
                <td className="index-cell">{i + 1}</td>
                {columns.map(col => (
                  <td 
                    key={col.key} 
                    className="data-cell"
                    style={{ textAlign: col.align || 'left' }}
                  >
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

