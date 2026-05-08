import React, { createContext, use } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import './DataTable.css';

const DataTableContext = createContext(null);

/**
 * DataTable Compound Component
 * Pattern: architecture-compound-components
 */
export const DataTable = ({ columns, data, isLoading, sortConfig, onSort, children }) => {
  if (isLoading) {
    return (
      <div className="table-skeleton-container">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton-row" />
        ))}
      </div>
    );
  }

  const value = { columns, data, sortConfig, onSort };

  return (
    <DataTableContext.Provider value={value}>
      <div className="premium-table-container glass">
        <table className="premium-table">
          <thead>
            <tr className="table-header-row">
              <th className="header-cell index-col">#</th>
              {columns.map(col => (
                <DataTable.HeaderCell key={col.key} column={col} />
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <DataTable.EmptyState colSpan={columns.length + 1} />
            ) : (
              data.map((row, i) => (
                <DataTable.Row key={row.idLocal || row.id || i} row={row} index={i} />
              ))
            )}
          </tbody>
        </table>
        {children}
      </div>
    </DataTableContext.Provider>
  );
};

DataTable.HeaderCell = function DataTableHeaderCell({ column }) {
  const { sortConfig, onSort } = use(DataTableContext);
  
  const renderSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronsUpDown size={12} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={12} className="sort-icon active" /> 
      : <ChevronDown size={12} className="sort-icon active" />;
  };

  return (
    <th 
      className="header-cell"
      style={{ textAlign: column.align || 'left' }}
      onClick={() => onSort && onSort(column.key)}
    >
      <div className={`header-cell-content align-${column.align || 'left'}`}>
        {column.label}
        {renderSortIcon(column.key)}
      </div>
    </th>
  );
};

DataTable.Row = function DataTableRow({ row, index }) {
  const { columns } = use(DataTableContext);
  return (
    <tr className="table-row">
      <td className="index-cell">{index + 1}</td>
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
  );
};

DataTable.EmptyState = function DataTableEmptyState({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="empty-state">
        No hay registros disponibles para los filtros seleccionados.
      </td>
    </tr>
  );
};
