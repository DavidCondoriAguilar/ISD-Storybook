import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

/**
 * Enterprise Elite Pagination
 * Designed for maximum clarity and managerial efficiency.
 */
export const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalRecords,
  onPageChange, 
  onItemsPerPageChange 
}) => {
  
  const getPaginationRange = () => {
    const delta = 1; // More compact range for professional look
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  if (totalRecords === 0) return null;

  return (
    <div className="pagination-wrapper">
      <div className="pagination-inner">
        {/* Left Section: Information Context */}
        <div className="pagination-segment info-segment">
          <span className="info-text">
            Mostrando <span className="highlight">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="highlight">{Math.min(currentPage * itemsPerPage, totalRecords)}</span> de <span className="highlight">{totalRecords}</span> registros
          </span>
        </div>

        {/* Right Section: Interactive Controls */}
        <div className="pagination-segment control-segment">
          <div className="page-size-control">
            <span className="label">Filas:</span>
            <select 
              id="pagination-rows-select"
              value={itemsPerPage} 
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="elite-select"
              aria-label="Registros por página"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={totalRecords}>Todos</option>
            </select>
          </div>

          <div className="navigation-group">
            <button
              disabled={currentPage === 1}
              className="elite-nav-btn"
              onClick={() => onPageChange(1)}
              title="Primero"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              disabled={currentPage === 1}
              className="elite-nav-btn"
              onClick={() => onPageChange(currentPage - 1)}
              title="Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="page-numbers-group">
              {getPaginationRange().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  className={`elite-page-btn ${currentPage === page ? 'active' : ''} ${typeof page !== 'number' ? 'dots' : ''}`}
                  disabled={typeof page !== 'number'}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              className="elite-nav-btn"
              onClick={() => onPageChange(currentPage + 1)}
              title="Siguiente"
            >
              <ChevronRight size={16} />
            </button>

            <button
              disabled={currentPage === totalPages}
              className="elite-nav-btn"
              onClick={() => onPageChange(totalPages)}
              title="Último"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
