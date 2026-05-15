import React from 'react';
import { Users, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './AuditFilters.module.css';

const AuditFilters = ({ logic }) => {
  return (
    <motion.div 
      className={styles.filtersBar}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className={styles.filtersContent}>
        <div className={styles.filterGroup}>
          <label htmlFor="worker-filter"><Users size={14} /> Trabajador</label>
          <select 
            id="worker-filter"
            value={logic.selectedWorker}
            onChange={(e) => logic.setSelectedWorker(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos los talentos</option>
            {logic.uniqueWorkers.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <button 
          className={styles.clearBtn}
          onClick={() => {
            logic.setSelectedWorker('all');
            logic.setSearchTerm('');
          }}
        >
          <X size={14} /> Limpiar
        </button>
      </div>
    </motion.div>
  );
};

export default AuditFilters;
