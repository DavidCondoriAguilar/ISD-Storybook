import React from 'react';
import { Search } from 'lucide-react';
import { DataTable } from '../../../../shared/components/DataTable/index';
import './AuditSection.css';

const AuditSection = ({ 
  displayRecords, 
  columns, 
  logic 
}) => {
  const totalPages = Math.ceil(logic.processedData.length / logic.itemsPerPage) || 1;

  return (
    <section className="audit-section-modern">
      <div className="audit-card glass">
        <header className="audit-card-header">
          <div className="header-left">
            <h3 className="card-title">Log de Auditoría Cruzada</h3>
            <p className="card-desc">Historial detallado de producción y operarios</p>
          </div>
          
          <div className="header-right">
            <div className="search-box-modern">
              <Search className="s-icon" size={18} />
              <input 
                type="text"
                placeholder="Buscar operario, producto o máquina..."
                value={logic.searchTerm}
                onChange={(e) => logic.setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </header>

        <div className="table-wrapper-premium">
          <DataTable 
            columns={columns} 
            data={displayRecords} 
            pagination={{
              currentPage: logic.currentPage,
              totalPages: totalPages,
              totalRecords: logic.processedData.length,
              onPageChange: logic.setCurrentPage,
              itemsPerPage: logic.itemsPerPage,
              onItemsPerPageChange: logic.setItemsPerPage
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default AuditSection;
