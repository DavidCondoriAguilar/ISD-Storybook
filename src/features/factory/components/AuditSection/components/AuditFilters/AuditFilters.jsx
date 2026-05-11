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

        <div className={styles.filterGroup}>
          <label htmlFor="period-filter"><Calendar size={14} /> Periodo</label>
          <select 
            id="period-filter"
            value={logic.timeRange}
            onChange={(e) => logic.setTimeRange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Historial Completo</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="day">Día específico</option>
            <option value="custom">Rango personalizado</option>
          </select>
        </div>

        { (logic.timeRange === 'custom' || logic.timeRange === 'day') && (
          <div className={styles.dateInputs}>
            <div className={styles.filterGroup}>
              <label>Desde</label>
              <input 
                type="date" 
                value={logic.startDate} 
                onChange={(e) => logic.setStartDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            { logic.timeRange === 'custom' && (
              <div className={styles.filterGroup}>
                <label>Hasta</label>
                <input 
                  type="date" 
                  value={logic.endDate} 
                  onChange={(e) => logic.setEndDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
            )}
          </div>
        )}

        <button 
          className={styles.clearBtn}
          onClick={() => {
            logic.setSelectedWorker('all');
            logic.setTimeRange('all');
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
