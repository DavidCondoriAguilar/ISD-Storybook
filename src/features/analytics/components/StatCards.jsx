import { motion } from 'framer-motion'

export const KPICard = ({ title, value, icon, color, subtitle }) => (
  <motion.div className="kpi-card-exec" whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)' }}>
    <div className={`kpi-icon ${color}`}>{icon}</div>
    <div className="kpi-info">
      <span className="label">{title}</span>
      <span className="value">{value}</span>
      {subtitle && <span className="subtitle" style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px', display: 'block' }}>{subtitle}</span>}
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
