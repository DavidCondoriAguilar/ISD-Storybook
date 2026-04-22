import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { AlertCircle, Target, Zap, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const Gauge = ({ value, color, status, trend }) => {
  const data = [
    { value: value },
    { value: Math.max(0, 100 - value) }
  ]
  
  return (
    <div style={{ height: '160px', width: '100%', position: 'relative', marginTop: '10px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={85}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} style={{ filter: `drop-shadow(0 0 8px ${color}44)` }} />
            <Cell fill="var(--bg-app)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ 
        position: 'absolute', 
        bottom: '15px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        textAlign: 'center' 
      }}>
         <div style={{ fontSize: '2.2rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.05em' }}>
           {value}%
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '2px' }}>
            {trend === 'up' ? <ArrowUpRight size={14} color="#10b981" /> : <ArrowDownRight size={14} color="#ef4444" />}
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{status}</span>
         </div>
      </div>
    </div>
  )
}

export function StatCards({ stats, variants }) {
  const { successRate = 0, totalUnits = 0, totalFailed = 0, totalImports = 0, dailyStats = {} } = stats || {}
  
  const oee = parseFloat(successRate) || 0
  const scrapRate = totalUnits > 0 ? Number(((totalFailed / totalUnits) * 100).toFixed(1)) : 0
  const totalDays = Object.keys(dailyStats).length || 1
  const avgDaily = Math.round(totalUnits / totalDays)

  const cards = [
    { 
      label: 'Calidad OEE', 
      value: oee, 
      icon: Target, 
      color: oee > 90 ? '#10b981' : oee > 75 ? '#f59e0b' : '#ef4444',
      status: oee > 90 ? 'ÓPTIMO' : 'ALERTA',
      trend: 'up',
      type: 'gauge'
    },
    { 
      label: 'Tasa de Mermas', 
      value: scrapRate, 
      icon: AlertCircle, 
      color: scrapRate < 2 ? '#10b981' : '#f59e0b',
      status: scrapRate < 2 ? 'CONTROLADO' : 'EXCEDIDO',
      trend: scrapRate < 2 ? 'up' : 'down',
      type: 'gauge'
    },
    { 
      label: 'Volumen Total', 
      value: totalUnits.toLocaleString(), 
      unitLabel: `${totalDays} jornada${totalDays > 1 ? 's' : ''} registrada${totalDays > 1 ? 's' : ''}`,
      icon: TrendingUp, 
      color: 'var(--primary)',
      status: 'VERIFICADO',
      type: 'value'
    },
    { 
      label: 'Promedio Diario', 
      value: avgDaily.toLocaleString(), 
      unitLabel: 'unidades / jornada',
      icon: Zap, 
      color: 'var(--primary)',
      status: `${totalImports} import${totalImports !== 1 ? 's' : ''}`,
      type: 'value'
    }
  ]

  return (
    <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
      {cards.map((card, i) => (
        <motion.div 
          key={i} 
          variants={variants} 
          whileHover={{ translateY: -4, boxShadow: 'var(--shadow-purple)' }}
          style={{ 
            background: 'var(--bg-card)', 
            padding: '20px 24px', 
            borderRadius: '24px', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            height: '120px',
            transition: 'var(--transition-smooth)'
          }}
        >
          <div style={{ flex: '0 0 100px', height: '100px', position: 'relative' }}>
             {card.type === 'gauge' ? (
               <div style={{ height: '100px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: card.value }, { value: Math.max(0, 100 - card.value) }]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={card.color} stroke="none" />
                        <Cell fill="var(--bg-app)" stroke="none" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
                    {card.value}{card.type === 'gauge' ? '%' : ''}
                  </div>
               </div>
             ) : (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-glow)', borderRadius: '16px' }}>
                  <card.icon size={32} color="var(--primary)" />
               </div>
             )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
             <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: card.type === 'value' ? '1.4rem' : '1.1rem', fontWeight: 950, color: 'var(--text-main)' }}>
                  {card.type === 'value' ? card.value : card.status}
                </span>
                {card.trend === 'up' ? <ArrowUpRight size={14} color="#10b981" /> : card.trend === 'down' ? <ArrowDownRight size={14} color="#ef4444" /> : null}
             </div>
             {card.unitLabel && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)' }}>{card.unitLabel}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

