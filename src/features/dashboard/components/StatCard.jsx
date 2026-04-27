import { motion } from 'framer-motion'

export const StatCard = ({ title, value, icon, color, subValue }) => (
  <motion.div 
    className="kpi-card-premium"
    whileHover={{ y: -5, borderColor: 'var(--primary)' }}
  >
    <div className={`icon-wrapper ${color}`}>{icon}</div>
    <div className="kpi-content">
      <span className="label">{title}</span>
      <span className="value">
        {value} {subValue && <small className="unit">{subValue}</small>}
      </span>
    </div>
    <motion.div className="pulse-effect" />
  </motion.div>
)
