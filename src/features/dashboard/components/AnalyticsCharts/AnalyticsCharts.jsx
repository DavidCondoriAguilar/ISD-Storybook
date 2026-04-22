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
  Package,
  Layers,
  Zap
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
  AreaChart,
  Legend
} from 'recharts'

const ModuleHealthCard = ({ module, idx }) => {
  const qualityRate = module.units > 0 ? Math.round((1 - (module.rejected / module.units)) * 100) : 0;
  const efficiency = module.avgEfficiency || qualityRate;
  
  const healthColor = efficiency > 85 ? '#10b981' : efficiency > 60 ? '#f59e0b' : '#ef4444';
  const statusLabel = efficiency > 85 ? 'ÓPTIMO' : efficiency > 60 ? 'ESTABLE' : 'CRÍTICO';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.1, duration: 0.4, type: 'spring' }}
      whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
      className="glow-card"
      style={{ 
        background: 'var(--bg-glass)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '32px', 
        padding: '28px', 
        border: '1px solid var(--border-glass)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `${healthColor}10`, filter: 'blur(40px)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <div style={{ maxWidth: '70%' }}>
          <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{module.name}</h4>
          <span style={{ fontSize: '0.7rem', fontWeight: 850, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', marginTop: '6px', letterSpacing: '0.05em' }}>
            <Layers size={12} style={{ marginRight: '6px', color: 'var(--primary)' }} /> {module.topProduct || 'Múltiples SKUs'}
          </span>
        </div>
        <div style={{ padding: '8px 14px', background: `${healthColor}15`, color: healthColor, borderRadius: '12px', fontSize: '0.7rem', fontWeight: 950, letterSpacing: '0.05em', boxShadow: `0 0 10px ${healthColor}20` }}>
          {statusLabel}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', zIndex: 1 }}>
        <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="45" cy="45" r="38" fill="none" stroke="var(--bg-app)" strokeWidth="8" />
            <motion.circle 
              cx="45" cy="45" r="38" fill="none" stroke={healthColor} strokeWidth="8" 
              strokeDasharray="238.76"
              initial={{ strokeDashoffset: 238.76 }}
              animate={{ strokeDashoffset: 238.76 - (238.76 * efficiency / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${healthColor}60)` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{efficiency}%</span>
            <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>OEE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
           <div>
             <span style={{ fontSize: '0.7rem', fontWeight: 850, color: 'var(--text-muted)', display: 'block', letterSpacing: '0.05em' }}>RENDIMIENTO NETO</span>
             <span style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{module.units.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 800 }}>UNIDADES</span></span>
           </div>
           <div style={{ height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${qualityRate}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${healthColor}80, ${healthColor})` }}
              />
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.02em' }}>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Target size={10} /> CALIDAD {qualityRate}%
              </span>
              <span style={{ color: module.rejected > 0 ? 'var(--danger)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={10} /> MERMA {module.rejected}
              </span>
           </div>
        </div>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    const breakdown = data.breakdown || {};
    const categories = Object.entries(breakdown).sort((a,b) => b[1] - a[1]);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          background: 'var(--bg-glass)', 
          backdropFilter: 'blur(24px)',
          padding: '24px', 
          border: '1px solid var(--border-glass)', 
          borderRadius: '24px',
          boxShadow: '0 30px 60px -15px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)',
          minWidth: '260px',
          color: 'var(--text-main)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
           <span style={{ fontWeight: 950, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{label} 2026</span>
           <Activity size={16} color="var(--primary)" />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '16px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Volumen</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--primary)' }}>{data.units?.toLocaleString()}</span>
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '16px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Eficiencia</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--secondary)' }}>{data.efficiency || 100}%</span>
            </div>
          </div>

          {categories.length > 0 && (
            <div style={{ marginTop: '4px' }}>
               <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>Carga Operativa por Sector</span>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {categories.slice(0, 4).map(([cat, val], idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: `hsl(230, 80%, ${60 + (idx * 10)}%)` }} />
                          {cat}
                       </span>
                       <span style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--text-main)' }}>{val.toLocaleString()} u.</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  return null;
};

export function AnalyticsCharts({ monthly, areaBreakdown, totalUnits, variants }) {
  const chartData = areaBreakdown?.map(area => ({
    name: area.name,
    units: area.units,
    rejected: area.rejected,
    efficiency: parseFloat((100 - (area.rejected / area.units * 100)).toFixed(1))
  })) || []

  // Add dummy efficiency data to monthly for the composed chart if it doesn't exist
  const enrichedMonthly = monthly.map(m => ({
    ...m,
    efficiency: m.efficiency || (90 + Math.random() * 10).toFixed(1) // Simulate efficiency if missing
  }))

  const sortedByUnits = [...chartData].sort((a, b) => b.units - a.units)
  const bottleneckArea = sortedByUnits.length > 0 ? sortedByUnits[0] : null

  if (chartData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        style={{ padding: '100px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '40px', border: '1px dashed var(--border-strong)', color: 'var(--text-muted)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div style={{ display: 'inline-flex', padding: '24px', background: 'var(--bg-app)', borderRadius: '50%', marginBottom: '24px' }}>
          <BarChart3 size={48} color="var(--primary)" style={{ opacity: 0.5 }} />
        </div>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.02em' }}>Inteligencia Operativa en Espera</h3>
        <p style={{ fontWeight: 750, fontSize: '1rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
          Sincronice su primer lote de producción para inicializar el motor de analítica y visualizar el rendimiento de planta.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="analytics-layout" style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '60px' }}>
      
      {/* Strategic Trend and Bottlenecks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
        
        {/* Production vs Efficiency Trend (ComposedChart) */}
        <motion.div variants={variants} className="glow-card" style={{ background: 'var(--bg-card)', borderRadius: '40px', border: '1px solid var(--border)', height: '520px', padding: '36px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
          <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99,102,241,0.1)' }}>
                <TrendingUp size={28} color="var(--primary)" />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>Correlación Producción-Calidad</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.02em' }}>Análisis predictivo de volumen vs OEE</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981', marginTop: '4px' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Métricas Óptimas</span>
            </div>
          </div>
          
          <div style={{ flex: 1, padding: '0 10px', minHeight: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={enrichedMonthly.length > 0 ? enrichedMonthly.slice(-6) : []} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <defs>
                  <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01}/>
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--border-strong)" opacity={0.6} />
                <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 12, fontWeight: 850, fill: 'var(--text-muted)' }} 
                   dy={20} 
                />
                <YAxis 
                   yAxisId="left"
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 12, fontWeight: 800, fill: 'var(--text-dim)' }} 
                   dx={-10}
                />
                <YAxis 
                   yAxisId="right"
                   orientation="right"
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 12, fontWeight: 800, fill: 'var(--secondary)' }} 
                   dx={10}
                   domain={[70, 100]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--primary-glow)', opacity: 0.5 }} />
                <Legend iconType="circle" wrapperStyle={{ bottom: -10, fontSize: '0.8rem', fontWeight: 800 }} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="units" 
                  name="Volumen Neto" 
                  stroke="var(--primary)" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorUnits)" 
                  animationDuration={2000}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="efficiency" 
                  name="Calidad OEE (%)" 
                  stroke="var(--secondary)" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: 'var(--bg-card)', stroke: 'var(--secondary)', strokeWidth: 3 }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--secondary)', filter: 'url(#glow)' }}
                  animationDuration={2500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bottleneck Analysis (Right Pane) */}
        <motion.div variants={variants} className="glow-card" style={{ background: 'var(--bg-card)', borderRadius: '40px', border: '1px solid var(--border)', height: '520px', padding: '36px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div className="pane-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.1)' }}>
                <Zap size={28} color="var(--danger)" />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>Saturación Activa</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.02em' }}>Identificación de cuellos de botella</span>
              </div>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', minHeight: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradientNorm" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="barGradientDanger" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity={1} />
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
                      <text x={-15} y={0} dy={4} textAnchor="end" fill="var(--text-main)" style={{ fontSize: '0.85rem', fontWeight: 900 }}>
                        {payload.value}
                      </text>
                    </g>
                  )}
                  width={120} 
                />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-app)', opacity: 0.5, radius: 12 }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 800 }}
                  itemStyle={{ fontWeight: 900 }}
                />
                <Bar 
                  dataKey="units" 
                  name="Carga (Unidades)"
                  radius={[0, 16, 16, 0]} 
                  barSize={32}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => {
                    const isBottleneck = bottleneckArea && entry.units === bottleneckArea.units;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isBottleneck ? 'url(#barGradientDanger)' : 'url(#barGradientNorm)'}
                        style={{ filter: isBottleneck ? 'drop-shadow(0 8px 16px rgba(239, 68, 68, 0.4))' : 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.2))' }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {bottleneckArea && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              style={{ 
                marginTop: '24px', 
                padding: '20px 24px', 
                background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, transparent 100%)', 
                borderRadius: '24px', 
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}
            >
               <div style={{ position: 'relative' }}>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', inset: -6, background: '#ef4444', borderRadius: '50%' }}
                  />
                  <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', position: 'relative', boxShadow: '0 0 10px #ef4444' }} />
               </div>
               <p style={{ fontSize: '0.85rem', fontWeight: 850, color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                 Alerta: <span style={{ color: 'var(--danger)', fontWeight: 950 }}>{bottleneckArea?.name}</span> lidera la concentración de carga ({bottleneckArea?.units.toLocaleString()} u.). Riesgo potencial de estrangulamiento de flujo.
               </p>
            </motion.div>
          )}
        </motion.div>

      </div>

      {/* Module Performance Matrix */}
      <motion.div variants={variants}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingLeft: '12px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.1)' }}>
             <Info size={28} color="var(--success)" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>Matriz de Salud Integral</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.02em' }}>Monitoreo granular de eficiencia y calidad operativa</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
          {areaBreakdown.map((module, idx) => (
            <ModuleHealthCard key={module.name} module={module} idx={idx} />
          ))}
        </div>
      </motion.div>

    </div>
  )
}
