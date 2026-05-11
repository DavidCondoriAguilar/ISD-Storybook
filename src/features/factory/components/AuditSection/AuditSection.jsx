import React from 'react';
import { Search, Filter, Users, Calendar, X, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from '../../../../shared/components/DataTable/index';
import './AuditSection.css';

const AuditSection = ({ 
  displayRecords, 
  columns, 
  logic 
}) => {
  const totalPages = Math.ceil(logic.processedData.length / logic.itemsPerPage) || 1;

  return (
    <section className="audit-section-modern" style={{ minHeight: '600px' }}>
      <div className="audit-card glass">
        <header className="audit-card-header">
          <div className="header-left">
            <div className="title-group">
              <ListFilter className="title-icon" size={24} aria-hidden="true" />
              <div>
                <h2 className="card-title">Log de Auditoría Cruzada</h2>
                <p className="card-desc">Historial detallado de producción y operarios</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="search-box-modern">
              <label htmlFor="audit-search" className="sr-only">Buscar registros</label>
              <Search className="s-icon" size={18} aria-hidden="true" />
              <input 
                id="audit-search"
                type="text"
                placeholder="Buscar operario, producto..."
                value={logic.searchTerm}
                onChange={(e) => logic.setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button 
              className={`filter-toggle-btn ${logic.isFilterOpen ? 'active' : ''}`}
              onClick={() => logic.setIsFilterOpen(!logic.isFilterOpen)}
              aria-label="Abrir panel de filtros avanzados"
              aria-expanded={logic.isFilterOpen}
            >
              <Filter size={18} />
              <span>Filtros</span>
              { (logic.selectedWorker !== 'all' || logic.timeRange !== 'all') && (
                <span className="filter-badge"></span>
              )}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {logic.isFilterOpen && (
            <motion.div 
              className="audit-filters-bar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="filters-content">
                <div className="filter-group">
                  <label htmlFor="worker-filter"><Users size={14} /> Trabajador</label>
                  <select 
                    id="worker-filter"
                    value={logic.selectedWorker}
                    onChange={(e) => logic.setSelectedWorker(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todos los talentos</option>
                    {logic.uniqueWorkers.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="period-filter"><Calendar size={14} /> Periodo</label>
                  <select 
                    id="period-filter"
                    value={logic.timeRange}
                    onChange={(e) => logic.setTimeRange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Historial Completo</option>
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="day">Día específico</option>
                    <option value="custom">Rango personalizado</option>
                  </select>
                </div>

                { (logic.timeRange === 'custom' || logic.timeRange === 'day') && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="date-inputs-group"
                  >
                    <input 
                      type="date" 
                      value={logic.startDate} 
                      onChange={(e) => logic.setStartDate(e.target.value)}
                      className="filter-date-input"
                      aria-label="Fecha inicial"
                    />
                    { logic.timeRange === 'custom' && (
                      <input 
                        type="date" 
                        value={logic.endDate} 
                        onChange={(e) => logic.setEndDate(e.target.value)}
                        className="filter-date-input"
                        aria-label="Fecha final"
                      />
                    )}
                  </motion.div>
                )}

                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    logic.setSelectedWorker('all');
                    logic.setTimeRange('all');
                    logic.setSearchTerm('');
                  }}
                  aria-label="Limpiar todos los filtros aplicados"
                >
                  <X size={14} /> Limpiar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="table-wrapper-premium" style={{ minHeight: '400px' }}>
          <DataTable 
            columns={columns} 
            data={displayRecords} 
            sortConfig={logic.sortConfig}
            onSort={logic.handleSort}
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
