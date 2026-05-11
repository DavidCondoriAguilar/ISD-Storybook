import React, { createContext, use } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCardContext = createContext(null);

/**
 * MetricCard Compound Component
 * Pattern: architecture-compound-components
 */
export function MetricCard({ children, color = 'primary', className = '', ...props }) {
  const value = { color };
  
  return (
    <MetricCardContext.Provider value={value}>
      <motion.div 
        className={`metric-card glass glow-card color-${color} ${className}`}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        {...props}
      >
        {children}
      </motion.div>
    </MetricCardContext.Provider>
  );
}

// Sub-components

MetricCard.Header = function MetricCardHeader({ children, className = '' }) {
  return (
    <div className={`metric-header ${className}`}>
      {children}
    </div>
  );
};

MetricCard.Icon = function MetricCardIcon({ icon: Icon, size = 24, className = '' }) {
  return (
    <div className={`metric-icon-wrapper ${className}`}>
      <Icon size={size} />
    </div>
  );
};

MetricCard.Trend = function MetricCardTrend({ value, className = '' }) {
  const isPositive = value > 0;
  return (
    <div className={`metric-trend ${isPositive ? 'positive' : 'negative'} ${className}`}>
      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span>{Math.abs(value)}%</span>
    </div>
  );
};

MetricCard.Content = function MetricCardContent({ children, className = '' }) {
  return (
    <div className={`metric-content ${className}`}>
      {children}
    </div>
  );
};

MetricCard.Value = function MetricCardValue({ value, unit, className = '' }) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <div className={`metric-value ${className}`}>
      {displayValue}
      {unit && <span className="metric-unit">{unit}</span>}
    </div>
  );
};

MetricCard.Title = function MetricCardTitle({ children, className = '' }) {
  return (
    <p className={`metric-title ${className}`}>
      {children}
    </p>
  );
};

MetricCard.Progress = function MetricCardProgress({ value = 0, delay = 0.5, className = '' }) {
  return (
    <div className={`metric-progress-bg ${className}`}>
      <motion.div 
        className="metric-progress-fill"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: Math.min(100, Math.max(0, value)) / 100 }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        style={{ width: '100%' }}
      />
    </div>
  );
};
