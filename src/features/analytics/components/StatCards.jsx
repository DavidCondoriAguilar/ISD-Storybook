import { motion } from 'framer-motion'

export const KPICard = ({ title, value, icon, color, subtitle, progress, trend }) => (
  <motion.div className="kpi-card-exec" whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)' }}>
    <div className={`kpi-icon ${color}`}>{icon}</div>
    <div className="kpi-info">
      <span className="label">{title}</span>
      <span className="value">{value}</span>
      {progress !== undefined && (
        <div className="kpi-progress-wrapper" style={{ marginTop: '8px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '4px', fontWeight: '800' }}>
            <span style={{ color: progress >= 100 ? '#10b981' : progress >= 80 ? '#f59e0b' : '#ef4444' }}>
              {progress.toFixed(0)}% Meta
            </span>
          </div>
          <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              style={{ 
                height: '100%', 
                background: progress >= 100 ? '#10b981' : progress >= 80 ? '#f59e0b' : '#ef4444',
                boxShadow: `0 0 10px ${progress >= 100 ? '#10b98144' : progress >= 80 ? '#f59e0b44' : '#ef444444'}`
              }} 
            />
          </div>
        </div>
      )}
      {trend !== undefined && trend !== 0 && (
        <div className={`kpi-trend ${trend >= 0 ? 'up' : 'down'}`} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          fontSize: '0.65rem', 
          fontWeight: '800', 
          marginTop: '8px',
          color: trend >= 0 ? '#10b981' : '#ef4444'
        }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs ayer
        </div>
      )}
      {subtitle && <span className="subtitle" style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '6px', display: 'block' }}>{subtitle}</span>}
    </div>
  </motion.div>
)

export const AdvMetricCard = ({ label, value, icon, sub, isHighlight }) => (
  <motion.div className={`adv-card ${isHighlight ? 'highlight' : ''}`} whileHover={{ scale: 1.02 }}>
    <div className="adv-icon-box">{icon}</div>
    <div className="adv-content">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      <div className="sub">{sub}</div>
    </div>
  </motion.div>
)
