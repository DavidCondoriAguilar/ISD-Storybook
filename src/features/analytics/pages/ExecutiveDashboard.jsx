import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, Star, Activity, Layers, Calendar } from 'lucide-react'

// Hooks & Formatters
import { useExecutiveData } from '../hooks/useExecutiveData'
import { formatMetric } from '../../../utils/formatters'

// Components
import { ExecutiveHeader } from '../components/ExecutiveHeader'
import { KPICard, AdvMetricCard, SuccessScoreCard } from '../components/StatCards'
import { EmployeeMatrix } from '../components/EmployeeMatrix'
import { DashboardCharts } from '../components/DashboardCharts'
import { DateRangePicker } from '../../../shared'

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
        dateRange={startDate && endDate ? { start: startDate, end: endDate } : null}
      >
        {/* Los filtros ahora se inyectan en una sola línea horizontal */}
        <select 
          className="exec-select-v2"
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
        >
          <option value="all">Todas las Áreas</option>
          <option value="paneles">Paneles</option>
          <option value="telas">Telas</option>
          <option value="pegado">Pegado</option>
          <option value="sellado">Sellado</option>
          <option value="quimicos">Químicos</option>
        </select>

        <DateRangePicker 
          timeRange={timeRange} 
          setTimeRange={setTimeRange}
          startDate={startDate} 
          setStartDate={setStartDate}
          endDate={endDate} 
          setEndDate={setEndDate}
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

      <section className="stats-grid">
        <KPICard 
          title="Producción Paneles" 
          value={`${formatMetric(stats.totalPaneles)} u.`} 
          color="blue" 
          icon={Layers}
          trend={stats.variations?.paneles}
          progress={stats.cumplimiento?.paneles}
          goalUnits={stats.metas?.paneles}
          periodLabel={periodLabel}
        />
        <KPICard 
          title="Producción Resortes" 
          value={`${formatMetric(stats.totalResortes)} mil.`} 
          color="green" 
          icon={Activity}
          trend={stats.variations?.resortes}
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

      <DashboardCharts 
        trendData={trendData}
        topPaneleros={topPaneleros}
        topResorteros={topResorteros}
        machineStatsMP={machineStatsMP}
        machineStatsMR={machineStatsMR}
      />

      <EmployeeMatrix workers={allWorkers} />
      
    </motion.div>
  )
});

export default ExecutiveDashboard;
