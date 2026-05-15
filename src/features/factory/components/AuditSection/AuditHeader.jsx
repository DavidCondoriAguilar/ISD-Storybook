import React from 'react';
import { Search, Users, X } from 'lucide-react';
import { DateRangePicker } from '../../../../shared/components/DateRangePicker/DateRangePicker';
import { useAppStore } from '../../../../store/useAppStore';
import styles from './components/AuditHeader/AuditHeader.module.css';

const AuditHeader = ({ logic }) => {
  const { 
    globalTimeRange, setGlobalDateFilter, 
    globalStartDate, globalEndDate 
  } = useAppStore();

  const [isDateOpen, setIsDateOpen] = React.useState(false);

  return (
    <div className={styles.masterControlBar}>
      <div className={styles.controlGroup}>
        <div className={styles.searchBox}>
          <Search className={styles.icon} size={16} />
          <input 
            type="text"
            placeholder="Buscar operario, producto..."
            value={logic.searchTerm}
            onChange={(e) => logic.setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.controlGroup}>
        <div className={styles.selectWrapper}>
          <Users className={styles.icon} size={16} />
          <select 
            value={logic.selectedWorker}
            onChange={(e) => logic.setSelectedWorker(e.target.value)}
            className={styles.select}
          >
            <option value="all">Todos los Operarios</option>
            {logic.uniqueWorkers.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.controlGroup}>
        <DateRangePicker 
          timeRange={globalTimeRange}
          startDate={globalStartDate}
          endDate={globalEndDate}
          onApply={(range, start, end) => setGlobalDateFilter(range, start, end)}
          isFilterOpen={isDateOpen}
          setIsFilterOpen={setIsDateOpen}
        />
      </div>

      <button 
        className={styles.clearAllBtn}
        onClick={() => {
          logic.setSearchTerm('');
          logic.setSelectedWorker('all');
          setGlobalDateFilter('all', '', '');
        }}
        title="Limpiar todos los filtros"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AuditHeader;
