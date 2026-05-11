import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const TablePagination = ({ pagination, dataLength }) => {
  if (!pagination) return null;

  return (
    <div className="dt-footer">
      <div className="dt-footer-left">
        <span className="dt-results-count">
          Mostrando <strong>{dataLength}</strong> de <strong>{pagination.totalRecords}</strong> registros
        </span>
        <div className="dt-page-size-selector">
          <label htmlFor="page-size-select" className="dt-page-size-label">Ver:</label>
          <select 
            id="page-size-select"
            className="dt-select"
            value={pagination.itemsPerPage}
            onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
            aria-label="Registros por página"
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="dt-pagination" role="navigation" aria-label="Navegación de paginación">
        <button 
          className="dt-pg-btn" 
          onClick={() => pagination.onPageChange(1)}
          disabled={pagination.currentPage === 1}
          aria-label="Ir a la primera página"
          title="Primera página"
        >
          <ChevronsLeft size={16} />
        </button>
        <button 
          className="dt-pg-btn" 
          onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          aria-label="Ir a la página anterior"
          title="Anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="dt-pg-indicator" aria-live="polite">
          <span className="dt-pg-current" aria-label={`Página actual ${pagination.currentPage}`}>{pagination.currentPage}</span>
          <span className="dt-pg-sep">/</span>
          <span className="dt-pg-total" aria-label={`Total de páginas ${pagination.totalPages}`}>{pagination.totalPages}</span>
        </div>

        <button 
          className="dt-pg-btn" 
          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          aria-label="Ir a la siguiente página"
          title="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
        <button 
          className="dt-pg-btn" 
          onClick={() => pagination.onPageChange(pagination.totalPages)}
          disabled={pagination.currentPage === pagination.totalPages}
          aria-label="Ir a la última página"
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
