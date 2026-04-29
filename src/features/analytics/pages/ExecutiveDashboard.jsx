import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts'
import { 
  TrendingUp, Users, Cpu, Activity, Award, Layers, 
  PieChart as PieIcon, Settings, Zap, Clock, Star, 
  ArrowUpRight, ArrowDownRight 
} from 'lucide-react'

import { formatMetric } from '../../../utils/formatters'
import { useExecutiveData } from '../hooks/useExecutiveData'
import { renderActiveShape } from '../components/ActiveShapePie'
import { ExecutiveHeader } from '../components/ExecutiveHeader'
import { ChartCard } from '../components/ChartCard'
import { KPICard, AdvMetricCard } from '../components/StatCards'
import { EmployeeMatrix } from '../components/EmployeeMatrix'

import '../styles/ExecutiveDashboard.css'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ExecutiveDashboard = memo(() => {
  const [activeIndex, setActiveIndex] = useState(0);
  const {
    timeRange, setTimeRange,
    startDate, setStartDate,
    endDate, setEndDate,
    searchTerm, setSearchTerm,
    isFilterOpen, setIsFilterOpen,
    stats, advStats, trendData,
    topPaneleros, topResorteros, allWorkers,
    productMix, machineStats
  } = useExecutiveData();

  const onPieEnter = (_, index) => setActiveIndex(index);

  return (
    <motion.div 
      className="exec-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ExecutiveHeader 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      {/* Primary KPI Grid */}
      <div className="stats-grid">
        <KPICard 
          title="Producción Paneles" 
          value={`${formatMetric(stats.totalPaneles)} u.`} 
          icon={<Activity />} 
          color="blue" 
          trend={stats.variations?.paneles}
        />
        <KPICard 
          title="Producción Resortes" 
          value={`${formatMetric(stats.totalResortes)} mil.`} 
          icon={<Layers />} 
          color="green" 
          trend={stats.variations?.resortes}
        />
        <KPICard title="Fuerza Laboral" value={stats.uniqueWorkers} icon={<Users />} color="cyan" />
        <KPICard title="Registros Auditados" value={stats.totalRecords} icon={<TrendingUp />} color="purple" />
      </div>

      {/* Advanced Metrics (Restored as per request) */}
      <div className="advanced-stats-row">
        {/* 
        <AdvMetricCard 
          label="Cierre Hoy (Día)" 
          value={formatMetric(advStats.todayTotal)} 
          icon={<Zap size={18} />} 
          sub={
            <span className={advStats.variationVsYesterday >= 0 ? 'up' : 'down'}>
              {advStats.variationVsYesterday >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(advStats.variationVsYesterday)}% vs ayer
            </span>
          }
        />
        <AdvMetricCard label="Promedio U/H" value={`${advStats.avgUnitsPerHour} u.`} icon={<Clock size={18} />} sub="Eficiencia General de Planta" />
        */}
        <AdvMetricCard label="Líder Paneles" value={advStats.topPanelero?.name || 'N/A'} icon={<Award size={18} />} sub={advStats.topPanelero?.reason || 'Sin Datos'} isHighlight />
        <AdvMetricCard label="Líder Resortes" value={advStats.topResortero?.name || 'N/A'} icon={<Star size={18} />} sub={advStats.topResortero?.reason || 'Sin Datos'} isHighlight />
      </div>

      <div className="charts-main-grid">
        <ChartCard title="Dinámica de Planta (MP vs MR)" icon={<Layers size={20} />} span={2}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorPaneles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResortes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis 
                yAxisId="left"
                stroke="#3b82f6" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val}u`} 
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#10b981" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => formatMetric(val)} 
              />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="paneles" 
                name="Paneles (u.)" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorPaneles)" 
                strokeWidth={2} 
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="resortes" 
                name="Resortes (mil.)" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorResortes)" 
                strokeWidth={2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top MP - Paneleras (u.)" icon={<Award size={18} style={{ color: '#3b82f6' }} />} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topPaneleros} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '11px' }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top MR - Resorteras (mil.)" icon={<Award size={18} style={{ color: '#10b981' }} />} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topResorteros} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '11px' }} />
              <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mix de Productos" icon={<PieIcon size={18} />} height={550}>
          <div className="pro-chart-layout" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Zona Visual: Círculo Compacto */}
            <div className="visual-zone" style={{ height: '350px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={productMix.map(item => ({
                      ...item,
                      visualValue: Math.log10(item.value + 10) 
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    dataKey="visualValue"
                    onMouseEnter={onPieEnter}
                    stroke="none"
                  >
                    {productMix.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Zona de Datos: Densidad Máxima */}
            <div className="data-zone" style={{ flex: 1, width: '100%', padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 15px' }}>
                {productMix.map((item, index) => {
                  const isSpring = item.name.toLowerCase().includes('resorte') || item.name.toLowerCase().includes('millar');
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '2px 0',
                        opacity: activeIndex === index ? 1 : 0.6,
                        transition: '0.2s',
                        cursor: 'pointer'
                      }} 
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '1px', background: COLORS[index % COLORS.length] }}></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#f1f5f9', fontSize: '10px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ color: COLORS[index % COLORS.length], fontSize: '10px', fontWeight: '700' }}>
                          {isSpring ? formatMetric(item.value / 1000) : formatMetric(item.value)} 
                          <span style={{ color: '#475569', fontWeight: '400', fontSize: '8px', marginLeft: '3px' }}>
                            {isSpring ? 'mil.' : 'u.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Rendimiento de Máquinas" icon={<Settings size={18} />} height={550}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={machineStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => formatMetric(val)} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }} />
              <Bar dataKey="total" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <EmployeeMatrix workers={allWorkers} />
    </motion.div>
  );
});

export default ExecutiveDashboard;
