import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Tarjeta de métrica premium para el dashboard ejecutivo.
 */
export const MetricCard = ({ title, value, unit, trend, icon: Icon, color = 'primary' }) => {
  const isPositive = trend > 0;

  return (
    <motion.div 
      className={`metric-card glass glow-card color-${color}`}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="metric-header">
        <div className="metric-icon-wrapper">
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={`metric-trend ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="metric-content">
        <h3 className="metric-value">
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span className="metric-unit">{unit}</span>
        </h3>
        <p className="metric-title">{title}</p>
      </div>
      
      <div className="metric-progress-bg">
        <motion.div 
          className="metric-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: '70%' }} // Simulado o basado en meta
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
};
