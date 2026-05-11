import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { DataTable } from '../../../../shared/components/DataTable/index';

// Sub-componentes Atómicos para Arquitectura Senior
import AuditHeader from './components/AuditHeader/AuditHeader';
import AuditFilters from './components/AuditFilters/AuditFilters';

import styles from './AuditSection.module.css';

const AuditSection = ({ 
  displayRecords, 
  columns, 
  logic 
}) => {
  const totalPages = Math.ceil(logic.processedData.length / logic.itemsPerPage) || 1;

  return (
    <section className={styles.auditSection}>
      <div className={styles.auditCard}>
        {/* 1. Header Modularizado */}
        <AuditHeader 
          searchTerm={logic.searchTerm}
          setSearchTerm={logic.setSearchTerm}
          isFilterOpen={logic.isFilterOpen}
          setIsFilterOpen={logic.setIsFilterOpen}
        />

        {/* 2. Panel de Filtros Modularizado */}
        <AnimatePresence>
          {logic.isFilterOpen && <AuditFilters logic={logic} />}
        </AnimatePresence>

        {/* 3. Tabla de Datos (Contenedor Orchestrator) */}
        <div className={styles.tableWrapper}>
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
