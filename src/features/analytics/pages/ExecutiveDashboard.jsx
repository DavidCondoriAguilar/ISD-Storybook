import { lazy, Suspense, memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, Star, Activity, Layers, Calendar } from 'lucide-react'

// Hooks & Formatters
import { useExecutiveData } from '../hooks/useExecutiveData'
import { formatMetric } from '../../../utils/formatters'

// Components
import { ExecutiveHeader } from '../components/ExecutiveHeader'
import { KPICard, AdvMetricCard, SuccessScoreCard } from '../components/StatCards'
import { EmployeeMatrix } from '../components/EmployeeMatrix'
import { DateRangePicker } from '../../../shared'

// Lazy loaded heavy component
const DashboardCharts = lazy(() => import('../components/DashboardCharts').then(m => ({ default: m.DashboardCharts })))

// Styles
import '../styles/ExecutiveDashboard.css'

/**
 * Dashboard Estratégico ISD - Centro de Control Ejecutivo v2
 */
const ExecutiveDashboard = memo(() => {
  const {
    timeRange, setTimeRange,
    startDate, setStartDate,
    endDate, setEndDate,
    setGlobalDateFilter,
    searchTerm, setSearchTerm,
    selectedArea, setSelectedArea,
    isFilterOpen, setIsFilterOpen,
    stats, advStats, trendData,
    topPaneleros, topResorteros, allWorkers,
    machineStatsMP, machineStatsMR, productMix
  } = useExecutiveData();

  // Etiqueta de periodo dinámica
  const periodLabel = useMemo(() => {
    if (timeRange === 'day') return `Día: ${startDate || 'Hoy'}`;
    if (timeRange === '7') return 'Últimos 7 días';
    if (timeRange === '30') return 'Últimos 30 días';
    if (timeRange === 'custom') return `${startDate} al ${endDate}`;
    if (timeRange === 'all') return 'Historial Completo';
    return `Periodo: ${timeRange} días`;
  }, [timeRange, startDate, endDate]);

  return (
<motion.div
        className="exec-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
      <ExecutiveHeader
        analyticsData={{
          stats,
          topPaneleros,
          topResorteros,
          machineStats: [...(machineStatsMP || []), ...(machineStatsMR || [])],
          productMix: productMix
        }}
        dateRange={startDate ? { start: startDate, end: endDate || startDate } : null}
      >
        {/* Los filtros ahora se inyectan en una sola línea horizontal */}
        <select 
          id="area-filter-select"
          className="exec-select-v2"
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          aria-label="Filtrar por área de producción"
        >
          <option value="all">Todas las Áreas</option>
          <option value="paneles_resortes">Paneles & Resortes (Planta)</option>
          <option value="paneles">Módulo Paneles</option>
          <option value="resortes">Módulo Resortes</option>
          <option value="telas">Módulo Telas</option>
          <option value="pegado">Pegado</option>
        </select>

        <DateRangePicker 
          timeRange={timeRange} 
          startDate={startDate} 
          endDate={endDate} 
          onApply={(range, start, end) => setGlobalDateFilter(range, start, end)}
          isFilterOpen={isFilterOpen} 
          setIsFilterOpen={setIsFilterOpen}
        />
      </ExecutiveHeader>

      <div className="period-banner">
        <Calendar size={18} />
        <span>Lectura de Producción: <strong>{periodLabel}</strong></span>
      </div>

      {/* Métrica Maestra de Éxito - Comentada temporalmente por feedback gerente */}
      {/* 
      <section style={{ marginBottom: '24px' }}>
        <SuccessScoreCard score={stats.cumplimiento?.global || 0} />
      </section> 
      */}

      <h2 className="sr-only">Indicadores de Producción</h2>
      <section className="stats-grid">
        <KPICard 
          title="Producción Paneles (MP)" 
          description="MÁQUINA PANELERA • UNIDADES"
          value={`${formatMetric(stats.totalPaneles)} u.`} 
          color="blue" 
          icon={Layers}
          progress={stats.cumplimiento?.paneles}
          goalUnits={stats.metas?.paneles}
          periodLabel={periodLabel}
        />
        <KPICard 
          title="Producción Resortes (MR)" 
          description="MÁQUINA RESORTERA • MILLARES"
          value={`${formatMetric(stats.totalResortes)} mill.`} 
          color="green" 
          icon={Activity}
          progress={stats.cumplimiento?.resortes}
          goalUnits={stats.metas?.resortes}
          periodLabel={periodLabel}
        />
        {/* Ocultando Procesos temporalmente para enfoque neta en Producción */}
        {/* 
        <KPICard 
          title="Tareas Proceso" 
          value={`${formatMetric(stats.totalProcesos)} u.`} 
          color="purple" 
          icon={Activity}
          trend={stats.variations?.procesos}
          progress={stats.cumplimiento?.procesos}
          goalUnits={stats.metas?.procesos}
          periodLabel={periodLabel}
        /> 
        */}
        <KPICard title="Fuerza Laboral" value={stats.uniqueWorkers} color="cyan" icon={Users} periodLabel={periodLabel} />
        <KPICard title="Registros Auditados" value={stats.totalRecords} color="purple" icon={Activity} periodLabel={periodLabel} />
      </section>

      <section className="advanced-stats-row">
        <AdvMetricCard 
          label="Líder Paneles" 
          value={advStats.topPanelero?.name || 'N/A'} 
          icon={<Award size={18} />} 
          sub={advStats.topPanelero?.reason || 'Sin Datos'} 
          isHighlight 
        />
        <AdvMetricCard 
          label="Líder Resortes" 
          value={advStats.topResortero?.name || 'N/A'} 
          icon={<Star size={18} />} 
          sub={advStats.topResortero?.reason || 'Sin Datos'} 
          isHighlight 
        />
      </section>

      <h2 className="section-title-v2">Análisis de Desempeño y Tendencias</h2>
      <Suspense fallback={<div className="charts-placeholder">Cargando visualizaciones...</div>}>
        <DashboardCharts 
          trendData={trendData}
          topPaneleros={topPaneleros}
          topResorteros={topResorteros}
          machineStatsMP={machineStatsMP}
          machineStatsMR={machineStatsMR}
        />
      </Suspense>

      <EmployeeMatrix workers={allWorkers} />

      {/* PROTOCOLO DE INTEGRIDAD DE DATOS (Senior Audit Section) */}
      <section className="data-integrity-section glass">
        <div className="integrity-header">
          <Activity size={20} className="blue-text" />
          <h3>Protocolo de Veracidad e Integridad de Datos</h3>
        </div>
        <div className="integrity-grid">
          <div className="integrity-item">
            <Layers size={16} />
            <div>
              <strong>Deduplicación Inteligente</strong>
              <p>Cada registro genera un hash único para evitar doble conteo por re-importación.</p>
            </div>
          </div>
          <div className="integrity-item">
            <Activity size={16} />
            <div>
              <strong>Lógica de Conteo Neta</strong>
              <p>Fórmula: <code>MAX(Manual_Total, Machine_Output)</code>. Garantiza veracidad ante fallos de registro.</p>
            </div>
          </div>
          <div className="integrity-item">
            <Star size={16} />
            <div>
              <strong>Normalización de Unidades</strong>
              <p>Detección automática de escala (Millares vs Unidades) basada en el ID del Activo (MP/MR).</p>
            </div>
          </div>
        </div>
      </section>
      
    </motion.div>
  )
});

export default ExecutiveDashboard;
