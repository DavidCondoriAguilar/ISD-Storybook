import { motion } from 'framer-motion'
import { Package, Activity, AlertCircle, User, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function StatCards({ stats, variants }) {
  const cards = [
    { 
      label: 'Producción Total 2026', 
      value: stats.totalUnits.toLocaleString(), 
      icon: Package, 
      color: 'var(--primary)', 
      trend: '+12.5%',
      trendIcon: ArrowUpRight,
      bg: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 100%)'
    },
    { 
      label: 'Eficiencia de Planta', 
      value: `${stats.successRate}%`, 
      icon: Activity, 
      color: 'var(--secondary)', 
      trend: stats.successRate > 90 ? 'Óptimo' : 'Revisión',
      trendIcon: stats.successRate > 90 ? ArrowUpRight : ArrowDownRight,
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 100%)'
    },
    { 
      label: 'Mermas / Rechazos', 
      value: stats.totalFailed.toLocaleString(), 
      icon: AlertCircle, 
      color: 'var(--danger)', 
      isDanger: true,
      trend: stats.totalFailed > 0 ? `-${stats.totalFailed}` : '0',
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0) 100%)'
    },
    { 
      label: 'Máximo Operario', 
      value: stats.topWorker, 
      icon: User, 
      color: 'var(--warning)',
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0) 100%)'
    }
  ]

  return (
    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
      {cards.map((card, i) => (
        <motion.div 
          key={i} 
          variants={variants} 
          className="stat-card"
          whileHover={{ translateY: -5, boxShadow: 'var(--shadow-md)' }}
          style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '24px', 
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: card.bg, borderRadius: '0 0 0 100%' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg-app)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <card.icon size={24} color={card.color} />
            </div>
            {card.trend && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '10px', 
                background: card.isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: card.isDanger ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.75rem', fontWeight: 900
              }}>
                {card.trendIcon && <card.trendIcon size={12} />}
                {card.trend}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.label}
            </span>
            <span style={{ fontSize: '2rem', fontWeight: 950, color: card.isDanger ? 'var(--danger)' : 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {card.value}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
