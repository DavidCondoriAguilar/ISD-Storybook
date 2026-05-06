import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';

import { DataTable, ErrorBoundary, DateRangePicker } from '../shared';
import { Pagination } from '../features/dashboard/components/common/Pagination/Pagination';
import { useModuleLogic } from '../features/factory/hooks/useModuleLogic';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { isResorte, getUnitLabel } from '../domain/production/predicates';

import '../features/factory/styles/ModuleView.css';

/**
 * COMPONENTE PRINCIPAL: ModuleView
 * Refactorizado con Clean Code y Separación de Responsabilidades.
 */
export const ModuleView = () => {
  const { moduleId } = useParams();
  
  // Consulta optimizada: Usamos índices para no traer toda la DB a memoria
  const records = useLiveQuery(async () => {
    if (!moduleId) return [];
    
    // Normalización de búsqueda (Case-Insensitive Mock)
    // Buscamos la versión original y la versión capitalizada (Ej: paneles -> Paneles)
    const capitalized = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
    const lowercase = moduleId.toLowerCase();
    
    const searchTerms = Array.from(new Set([moduleId, capitalized, lowercase]));
    
    // Buscamos por moduloId o por area usando los índices de Dexie
    const byModulo = await db.records.where('moduloId').anyOf(searchTerms).toArray();
    const byArea = await db.records.where('area').anyOf(searchTerms).toArray();
    
    // Unimos y eliminamos duplicados por ID
    const merged = [...byModulo, ...byArea];
    const uniqueMap = new Map();
    merged.forEach(r => uniqueMap.set(r.id || r.idLocal, r));
    
    return Array.from(uniqueMap.values());
  }, [moduleId]) || [];

  const isLoading = !records.length;
  
  // Custom Hook con toda la lógica de filtrado y estadísticas
  const logic = useModuleLogic(records, moduleId);

  const moduleName = moduleId ? moduleId.charAt(0).toUpperCase() + moduleId.slice(1) : 'Módulo';

  // Configuración de columnas (Inyectada como configuración)
  const columns = useMemo(() => [
    { 
      key: 'fechaTimestamp', 
      label: 'Fecha', 
      render: (v) => <span className="mono-data-small">{v ? new Date(v).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '---'}</span>
    },
    { 
      key: 'trabajadorNombre', 
      label: 'Operador', 
      render: (v) => <span className="operator-name">{v}</span> 
    },
    { 
      key: 'productoNombre', 
      label: 'Producto', 
      render: (v) => <div className="product-name">{v}</div> 
    },
    { 
      key: 'cantidad', 
      label: 'Producción', 
      align: 'right',
      render: (v, row) => (
        <div className="production-cell">
          <span className={`production-value ${isResorte(row) ? 'resorte' : 'panel'}`}>{v?.toLocaleString()}</span>
          <span className="unit-label">{getUnitLabel(row)}</span>
        </div>
      )
    },
    { 
      key: 'outputMaquina', 
      label: 'Output Máq.', 
      align: 'right',
      render: (v) => <div className="output-cell mono-data">{v?.toLocaleString() || '0'}</div>
    },
    { 
      key: 'maquinaId', 
      label: 'Máq.', 
      align: 'center', 
      render: (v) => <div className="machine-chip small-scale">{v}</div> 
    },
  ], []);

  const totalPages = Math.ceil(logic.processedData.length / logic.itemsPerPage) || 1;
  const displayRecords = useMemo(() => {
    const start = (logic.currentPage - 1) * logic.itemsPerPage;
    return logic.processedData.slice(start, start + logic.itemsPerPage);
  }, [logic.processedData, logic.currentPage, logic.itemsPerPage]);

  return (
    <div className="module-view-page">
      <div className="module-content-container">
        
        <ModuleHeader 
          moduleName={moduleName} 
          logic={logic} 
        />

        <DailyStatsGrid 
          stats={logic.dailyStats} 
        />

        <AuditSection 
          logic={logic}
          columns={columns}
          displayRecords={displayRecords}
          isLoading={isLoading}
          totalPages={totalPages}
        />

      </div>
    </div>
  );
};

// --- SUB-COMPONENTES INTERNOS (Para Clean Code) ---

const ModuleHeader = ({ moduleName, logic }) => (
  <header className="module-view-header">
    <Link to="/dashboard" className="back-link-modern">
      <ArrowLeft size={14} /> Centro de Control
    </Link>
    <div className="header-main-row">
      <div>
        <h1 className="exec-title">Área: <span className="highlight">{moduleName}</span></h1>
        <p className="header-subtitle">Análisis Dual: Unidades (MP) vs Millares (MR)</p>
      </div>
      <DateRangePicker 
        timeRange={logic.timeRange} setTimeRange={logic.setTimeRange}
        startDate={logic.startDate} setStartDate={logic.setStartDate}
        endDate={logic.endDate} setEndDate={logic.setEndDate}
        isFilterOpen={logic.isFilterOpen} setIsFilterOpen={logic.setIsFilterOpen}
      />
    </div>
  </header>
);

const DailyStatsGrid = ({ stats }) => (
  <div className="daily-stats-grid">
    {stats.map(day => (
      <div key={day.date} className="glass glow-card stat-card">
        <div className="stat-card-header">
          <span className="stat-date">{day.date}</span>
          <div className="stat-ops-count">
            <Users size={12} /> <span>{day.workers} ops.</span>
          </div>
        </div>
        <StatRow label="📦 PANELES (MP)" total={day.mp.total} unit="u." type="panel" />
        <StatRow label="🌀 RESORTES (MR)" total={day.mr.total} unit="mil." type="resorte" />
      </div>
    ))}
  </div>
);

const StatRow = ({ label, total, unit, type }) => (
  <div className="stat-row">
    <span className="stat-label">{label}</span>
    <div className="stat-value-container">
      <span className={`stat-value ${type}`}>{total.toLocaleString()} {unit}</span>
    </div>
  </div>
);

const AuditSection = ({ logic, columns, displayRecords, isLoading, totalPages }) => (
  <div className="audit-container glass">
    <div className="audit-header">
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Log de Auditoría Cruzada</h2>
      <div className="search-wrapper">
        <Search size={14} className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar..." 
          value={logic.searchTerm} 
          onChange={(e) => logic.setSearchTerm(e.target.value)} 
          className="search-input-premium" 
        />
      </div>
    </div>
    
    <ErrorBoundary name="Auditoría">
      <div className="table-scroll-area">
        <DataTable 
          columns={columns} 
          data={displayRecords} 
          isLoading={isLoading} 
          sortConfig={logic.sortConfig}
          onSort={logic.handleSort}
        />
      </div>
    </ErrorBoundary>

    <div style={{ marginTop: '1.5rem' }}>
      <Pagination 
        currentPage={logic.currentPage} 
        totalPages={totalPages} 
        itemsPerPage={logic.itemsPerPage} 
        totalRecords={logic.processedData.length} 
        onPageChange={logic.setCurrentPage} 
        onItemsPerPageChange={logic.setItemsPerPage} 
      />
    </div>
  </div>
);

export default ModuleView;
