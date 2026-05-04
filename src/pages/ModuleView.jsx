import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';

import { useProductionData, DataTable, ErrorBoundary, DateRangePicker } from '../shared';
import { Pagination } from '../features/dashboard/components/common/Pagination/Pagination';
import { useModuleLogic } from '../features/factory/hooks/useModuleLogic';

import '../features/factory/styles/ModuleView.css';

/**
 * COMPONENTE PRINCIPAL: ModuleView
 * Refactorizado con Clean Code y Separación de Responsabilidades.
 */
export const ModuleView = () => {
  const { moduleId } = useParams();
  const { records, isLoading } = useProductionData();
  
  // Custom Hook con toda la lógica de filtrado y estadísticas
  const logic = useModuleLogic(records, moduleId);

  const moduleName = moduleId ? moduleId.charAt(0).toUpperCase() + moduleId.slice(1) : 'Módulo';

  // Configuración de columnas (Inyectada como configuración)
  const columns = useMemo(() => [
    { 
      key: 'fechaTimestamp', 
      label: 'Fecha', 
      render: (v) => <span className="mono-data" style={{ fontSize: '0.75rem' }}>{v ? new Date(v).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '---'}</span>
    },
    { key: 'trabajadorNombre', label: 'Operador', render: (v) => <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{v}</span> },
    { key: 'productoNombre', label: 'Producto', render: (v) => <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{v}</div> },
    { 
      key: 'cantidad', 
      label: 'Producción', 
      align: 'right',
      render: (v, row) => {
        const isResorte = (row.maquinaId || '').includes('MR') || (row.unidad || '').includes('mil');
        return (
          <div style={{ textAlign: 'right' }}>
            <span className="mono-data" style={{ fontWeight: 800, color: isResorte ? 'var(--secondary)' : 'var(--text-main)' }}>{v?.toLocaleString()}</span>
            <span style={{ fontSize: '0.6rem', marginLeft: '4px', opacity: 0.6, fontWeight: 700 }}>{isResorte ? 'mil.' : 'u.'}</span>
          </div>
        );
      }
    },
    { 
      key: 'outputMaquina', 
      label: 'Output Máq.', 
      align: 'right',
      render: (v) => <div style={{ textAlign: 'right', opacity: 0.6 }} className="mono-data">{v?.toLocaleString() || '0'}</div>
    },
    {
      key: 'diferencia',
      label: 'Dif.',
      align: 'right',
      render: (_, row) => {
        const diff = (row.outputMaquina || 0) - (row.cantidad || 0);
        const hasAlert = Math.abs(diff) > (row.cantidad * 0.1);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: hasAlert ? 'var(--error)' : 'var(--success)' }}>
            <span className="mono-data" style={{ fontWeight: 700, fontSize: '0.8rem' }}>{diff > 0 ? `+${diff}` : diff}</span>
            {hasAlert && <AlertTriangle size={10} />}
          </div>
        );
      }
    },
    { key: 'maquinaId', label: 'Máq.', align: 'center', render: (v) => <div className="machine-chip" style={{ scale: '0.85' }}>{v}</div> },
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
  <header style={{ marginBottom: '2rem' }}>
    <Link to="/dashboard" className="back-link-modern">
      <ArrowLeft size={14} /> Centro de Control
    </Link>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <h1 className="exec-title" style={{ fontSize: '2rem', margin: 0 }}>Área: <span className="highlight">{moduleName}</span></h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Análisis Dual: Unidades (MP) vs Millares (MR)</p>
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
      <div key={day.date} className="glass glow-card" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{day.date}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            <Users size={12} /> <span>{day.workers} ops.</span>
          </div>
        </div>
        <StatRow label="📦 PANELES (MP)" total={day.mp.total} diff={day.mp.machine - day.mp.total} unit="u." color="var(--text-muted)" />
        <StatRow label="🌀 RESORTES (MR)" total={day.mr.total} diff={day.mr.machine - day.mr.total} unit="mil." color="var(--secondary)" />
      </div>
    ))}
  </div>
);

const StatRow = ({ label, total, diff, unit, color }) => (
  <div style={{ paddingBottom: '12px', borderBottom: label.includes('MP') ? '1px solid var(--border)' : 'none', marginBottom: label.includes('MP') ? '12px' : '0' }}>
    <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: color, marginBottom: '4px' }}>{label}</span>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span className="mono-data" style={{ fontSize: '1.2rem', fontWeight: 900, color: color === 'var(--text-muted)' ? 'inherit' : color }}>
        {total.toLocaleString()} <small style={{ fontSize: '0.6rem', opacity: 0.5 }}>{unit}</small>
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Δ {Math.abs(diff).toLocaleString()}</span>
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
