import React from 'react';
import { Search, Filter } from 'lucide-react';
import styles from './AuditHeader.module.css';

const AuditHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  isFilterOpen, 
  setIsFilterOpen 
}) => {
  return (
    <header className={styles.auditCardHeader}>
      <div className={styles.headerLeft}>
        <h2 className={styles.cardTitle}>Log de Auditoría Cruzada</h2>
        <p className={styles.cardDesc}>Historial de producción y operarios</p>
      </div>
      
      <div className={styles.headerCenter}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text"
            placeholder="Buscar operario, producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <button 
          className={`${styles.filterBtn} ${isFilterOpen ? styles.active : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          aria-expanded={isFilterOpen}
        >
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </div>
    </header>
  );
};

export default AuditHeader;
