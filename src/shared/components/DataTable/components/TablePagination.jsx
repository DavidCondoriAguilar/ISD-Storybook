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
          <span className="dt-page-size-label">Ver:</span>
          <select 
            className="dt-select"
            value={pagination.itemsPerPage}
            onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="dt-pagination">
        <button 
          className="dt-pg-btn" 
          onClick={() => pagination.onPageChange(1)}
          disabled={pagination.currentPage === 1}
          title="Primera página"
        >
          <ChevronsLeft size={16} />
        </button>
        <button 
          className="dt-pg-btn" 
          onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          title="Anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="dt-pg-indicator">
          <span className="dt-pg-current">{pagination.currentPage}</span>
          <span className="dt-pg-sep">/</span>
          <span className="dt-pg-total">{pagination.totalPages}</span>
        </div>

        <button 
          className="dt-pg-btn" 
          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          title="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
        <button 
          className="dt-pg-btn" 
          onClick={() => pagination.onPageChange(pagination.totalPages)}
          disabled={pagination.currentPage === pagination.totalPages}
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
