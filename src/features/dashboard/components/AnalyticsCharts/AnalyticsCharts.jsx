import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  ChevronUp, 
  ChevronDown,
  Maximize2,
  Activity,
  Flame,
  Info,
  Package
} from 'lucide-react'
import { 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  ComposedChart, 
  Line,
  Cell,
  BarChart,
  AreaChart
} from 'recharts'

const ModuleHealthCard = ({ module, idx }) => {
  const efficiency = module.avgEfficiency || 0;
  const healthColor = efficiency > 85 ? '#10b981' : efficiency > 60 ? '#f59e0b' : '#ef4444';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      style={{ 
        background: 'white', 
        borderRadius: '28px', 
        padding: '24px', 
        border: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: '70%' }}>
          <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{module.name}</h4>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
            <Package size={10} style={{ marginRight: '4px' }} /> {module.topProduct}
          </span>
        </div>
        <div style={{ padding: '6px 12px', background: `${healthColor}15`, color: healthColor, borderRadius: '10px', fontSize: '0.65rem', fontWeight: 900 }}>
          {efficiency > 85 ? 'ÓPTIMO' : efficiency > 60 ? 'ESTABLE' : 'CRÍTICO'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-app)" strokeWidth="8" />
            <motion.circle 
              cx="40" cy="40" r="34" fill="none" stroke={healthColor} strokeWidth="8" 
              strokeDasharray="213.6"
              initial={{ strokeDashoffset: 213.6 }}
              animate={{ strokeDashoffset: 213.6 - (213.6 * efficiency / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--text-main)' }}>{efficiency}%</span>
            <span style={{ fontSize: '0.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>EFI</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <div>
             <span style={{ fontSize: '0.65rem', fontWeight: 850, color: 'var(--text-muted)', display: 'block' }}>PRODUCCIÓN TOTAL</span>
             <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-main)' }}>{module.units.toLocaleString()} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>u.</span></span>
           </div>
           <div style={{ height: '4px', background: 'var(--bg-app)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(1 - (module.rejected / module.units)) * 100}%` }}
                style={{ height: '100%', background: 'var(--primary)' }}
              />
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 900 }}>
              <span style={{ color: 'var(--success)' }}>CALIDAD: {Math.round((1 - (module.rejected / module.units)) * 100)}%</span>
              <span style={{ color: 'var(--danger)' }}>RECHAZOS: {module.rejected}</span>
           </div>
        </div>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Access raw data for the month
    const breakdown = data.breakdown || {};
    const categories = Object.entries(breakdown).sort((a,b) => b[1] - a[1]);

    return (
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(12px)',
        padding: '24px', 
        border: '1px solid var(--border-strong)', 
        borderRadius: '24px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
        minWidth: '220px'
      }}>
        <p style={{ margin: '0 0 16px', fontWeight: 950, color: 'var(--text-main)', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>{label} 2026</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main Metric */}
          <div style={{ paddingBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Producción Total</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--primary)' }}>{data.units?.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>u.</span></span>
          </div>

          {/* Granular Breakdown */}
          {categories.length > 0 && (
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
               <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Detalle por Módulo:</span>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categories.slice(0, 4).map(([cat, val], idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{cat}</span>
                       <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--secondary)' }}>{val.toLocaleString()}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};



export function AnalyticsCharts({ monthly, areaBreakdown, totalUnits, variants }) {
  const chartData = areaBreakdown?.map(area => ({
    name: area.name,
    units: area.units,
    rejected: area.rejected,
    efficiency: (100 - (area.rejected / area.units * 100)).toFixed(1)
  })) || []

  // Bottleneck logic
  const sortedByUnits = [...chartData].sort((a, b) => b.units - a.units)
  const bottleneckArea = sortedByUnits.length > 0 ? sortedByUnits[0] : null

  if (chartData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '40px', border: '1px dashed var(--border-strong)', color: 'var(--text-muted)' }}
      >
        <BarChart3 size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px' }}>Métricas en espera de datos</h3>
        <p style={{ fontWeight: 700 }}>Realiza tu primera importación para activar los análisis ejecutivos.</p>
      </motion.div>
    )
  }

  return (
    <div className="analytics-layout" style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '40px' }}>
      
      {/* Middle Row: Trend and Bottlenecks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        
        {/* Production Trend (Centro) */}
        <motion.div variants={variants} className="analysis-pane" style={{ background: 'white', borderRadius: '40px', border: '1px solid var(--border)', height: '480px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.05)' }}>
          <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={24} color="var(--primary)" />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.02em' }}>Flujo de Tendencia 2026</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Sincronización mensual de unidades procesadas</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--success)', textTransform: 'uppercase' }}>Optimized</span>
            </div>
          </div>
          
          <div style={{ flex: 1, padding: '0 10px', minHeight: '320px' }}>
            <ResponsiveContainer width="99%" aspect={2.5} debounce={50}>
              <AreaChart data={monthly.length > 0 ? monthly.slice(-6) : []}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01}/>
                  </linearGradient>
                  <filter id="shadow" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                    <feOffset in="blur" dx="0" dy="8" result="offsetBlur" />
                    <feFlood floodColor="var(--primary)" floodOpacity="0.3" result="offsetColor" />
                    <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="0" stroke="var(--border)" opacity={0.4} />
                <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 11, fontWeight: 850, fill: 'var(--text-muted)' }} 
                   dy={15} 
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 11, fontWeight: 750, fill: 'var(--text-muted)' }} 
                   dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="units" 
                  name="Producción" 
                  stroke="var(--primary)" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                  animationDuration={2500}
                  filter="url(#shadow)"
                  style={{ filter: 'drop-shadow(0px 8px 12px rgba(99, 102, 241, 0.2))' }}
                  dot={{ r: 6, fill: '#fff', stroke: 'var(--primary)', strokeWidth: 3, fillOpacity: 1 }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--secondary)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bottleneck Analysis (Right Pane) */}
        <motion.div variants={variants} className="analysis-pane" style={{ background: 'white', borderRadius: '40px', border: '1px solid var(--border)', height: '480px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div className="pane-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={24} color="var(--danger)" />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.02em' }}>Identificación de Cuellos</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Carga por etapa de producción</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)' }}>{totalUnits.toLocaleString()} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>u.</span></span>
               <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Producción Total</span>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', minHeight: '320px' }}>
            <ResponsiveContainer width="99%" aspect={2.5} debounce={50}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="dangerGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-10} y={0} dy={4} textAnchor="end" fill="var(--text-main)" style={{ fontSize: '0.75rem', fontWeight: 900 }}>
                        {payload.value}
                      </text>
                    </g>
                  )}
                  width={110} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar 
                  dataKey="units" 
                  radius={[0, 12, 12, 0]} 
                  barSize={24}
                >
                  {chartData.map((entry, index) => {
                    const isBottleneck = bottleneckArea && entry.units === bottleneckArea.units;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isBottleneck ? 'url(#dangerGradient)' : 'url(#barGradient)'}
                        style={{ filter: isBottleneck ? 'drop-shadow(0 4px 10px rgba(239, 68, 68, 0.3))' : 'none' }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {bottleneckArea && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                marginTop: '16px', 
                padding: '16px 20px', 
                background: 'rgba(15, 23, 42, 0.03)', 
                borderRadius: '24px', 
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
               <div style={{ position: 'relative' }}>
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: 'absolute', inset: -4, background: '#ef4444', borderRadius: '50%' }}
                  />
                  <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', position: 'relative' }} />
               </div>
               <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                 <span style={{ color: 'var(--danger)', fontWeight: 950 }}>{bottleneckArea?.name}</span> presenta la mayor concentración de carga operativa.
               </p>
            </motion.div>
          )}
        </motion.div>

      </div>

      {/* Module Performance Matrix */}
      <motion.div variants={variants}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingLeft: '8px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Info size={24} color="var(--success)" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.02em' }}>Matriz de Salud por Módulo</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Distribución de eficiencia y calidad en tiempo real</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {areaBreakdown.map((module, idx) => (
            <ModuleHealthCard key={module.name} module={module} idx={idx} />
          ))}
        </div>
      </motion.div>

    </div>
  )
}

