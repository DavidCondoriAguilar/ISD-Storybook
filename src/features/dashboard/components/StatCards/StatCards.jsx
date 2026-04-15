import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts'
import { AlertCircle, Target, Zap, TrendingUp } from 'lucide-react'

const Gauge = ({ value, color, label, status }) => {
  const data = [
    { value: value },
    { value: 100 - value }
  ]
  
  const statusColors = {
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981'
  }

  return (
    <div style={{ height: '140px', width: '100%', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={50}
            outerRadius={75}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="var(--bg-app)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        textAlign: 'center' 
      }}>
         <div style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)', lineHeight: 1 }}>
           {value}%
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[status] }}></div>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{status}</span>
         </div>
      </div>
    </div>
  )
}

export function StatCards({ stats, variants }) {
  const oee = parseFloat(stats.successRate) || 0;
  const yield_pct = oee; // Now using real data instead of mock
  const scrap_rate = stats.totalUnits > 0 ? Number(((stats.totalFailed / stats.totalUnits) * 100).toFixed(1)) : 0;

  const cards = [
    { 
      label: 'Eficiencia de Calidad', 
      value: oee, 
      icon: Target, 
      color: oee > 90 ? '#10b981' : oee > 75 ? '#f59e0b' : '#ef4444',
      status: oee > 90 ? 'ÓPTIMO' : oee > 75 ? 'ALERTA' : 'CRÍTICO',
      type: 'gauge'
    },
    { 
      label: 'Rendimiento de Planta', 
      value: yield_pct, 
      icon: Zap, 
      color: '#0284c7',
      status: 'ESTABLE',
      type: 'gauge'
    },
    { 
      label: 'Tasa de Mermas', 
      value: scrap_rate, 
      icon: AlertCircle, 
      color: '#ef4444',
      status: scrap_rate < 2 ? 'ÓPTIMO' : 'CRÍTICO',
      type: 'gauge'
    },
    { 
      label: 'Volumen Operativo Consolidado', 
      value: stats.totalUnits.toLocaleString(), 
      unitLabel: stats.areaBreakdown?.[0]?.units > 0 ? `u. de ${stats.areaBreakdown[0].name}` : 'unidades',
      icon: TrendingUp, 
      color: 'var(--primary)',
      status: 'VERIFICADO',
      type: 'value'
    }
  ]

  return (
    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
      {cards.map((card, i) => (
        <motion.div 
          key={i} 
          variants={variants} 
          whileHover={{ translateY: -6 }}
          style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '32px', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
             <card.icon size={18} color={card.color} strokeWidth={2.5} />
          </div>

          {card.type === 'gauge' ? (
            <Gauge value={card.value} color={card.color} status={card.status} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '140px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>{card.value}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginTop: '-5px' }}>{card.unitLabel}</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

