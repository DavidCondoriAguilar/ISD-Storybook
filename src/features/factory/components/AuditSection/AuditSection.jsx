import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { DataTable } from '../../../../shared/components/DataTable/index';

// Sub-componentes Atómicos para Arquitectura Senior
import AuditHeader from './AuditHeader';

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
        {/* 1. Barra Maestra de Control Unificada */}
        <AuditHeader logic={logic} />

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
