import { motion } from 'framer-motion'

export const ChartCard = ({ title, icon, children, span = 1, height = 300 }) => (
  <motion.div 
    className="chart-container glass" 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ gridColumn: span > 1 ? `span ${span}` : 'auto' }}
  >
    <div className="chart-header">
      {icon}
      <h3>{title}</h3>
    </div>
    <div className="chart-content" style={{ height }}>
      {children}
    </div>
  </motion.div>
)
