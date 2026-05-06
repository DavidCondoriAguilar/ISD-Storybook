import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import '../styles/StatCards.css'

/**
 * KPICard - Optimizada para lectura rápida y estabilidad visual.
 */
export const KPICard = ({ title, value, color, progress, trend, goalUnits = 1500, periodLabel }) => {
  const getStatus = () => {
    if (progress === undefined || progress === null) return { label: 'Info Planta', color: 'var(--text-dim)', icon: <Clock size={10} /> };
    if (progress >= 100) return { label: 'Meta Lograda', color: 'var(--success)', icon: <CheckCircle size={10} /> };
    if (progress >= 85) return { label: 'Rendimiento Óptimo', color: '#3b82f6', icon: <Clock size={10} /> };
    if (progress >= 60) return { label: 'En Progreso', color: 'var(--warning)', icon: <AlertCircle size={10} /> };
    return { label: 'Bajo Objetivo', color: 'var(--danger)', icon: <AlertCircle size={10} /> };
  };

  const status = getStatus();
  
  const safeValue = String(value || '0');
  const cleanValue = safeValue.replace(/[^\d.]/g, '');
  const currentVal = parseFloat(cleanValue) || 0;
  const remaining = goalUnits - currentVal;
  const isGoalMet = remaining <= 0;

  return (
    <motion.div 
      className="kpi-card-exec glass" 
      whileHover={{ y: -5 }}
    >
      <div className="kpi-header">
        <div className="kpi-title-box">
          <span className="kpi-label">{title}</span>
          {periodLabel && <span className="kpi-period">{periodLabel}</span>}
        </div>
        <div 
          className="kpi-status-badge"
          style={{ 
            background: `${status.color}15`, 
            color: status.color, 
            border: `1px solid ${status.color}30` 
          }}
        >
          {status.label}
        </div>
      </div>

      <div className="kpi-main-content">
        <div className="kpi-value-display">{value}</div>
        {progress !== undefined && (
          <div className="kpi-progress-container">
            <div 
              className="kpi-goal-text"
              style={{ color: isGoalMet ? 'var(--success)' : 'var(--text-dim)' }}
            >
              {isGoalMet ? '✔ Objetivo diario alcanzado' : `Faltan ${remaining.toLocaleString('es-ES')} u. para la meta`}
            </div>
            <div className="kpi-progress-bar-bg">
              <div 
                className="kpi-progress-bar-fill" 
                style={{ background: status.color, width: `${Math.min(progress, 100)}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      <div className="kpi-footer">
        {trend !== undefined && (
          <div 
            className="kpi-trend"
            style={{ color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}
          >
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(1)}% vs ayer
          </div>
        )}
        {progress !== undefined && <div className="kpi-efficiency">EFIC: {progress.toFixed(1)}%</div>}
      </div>
    </motion.div>
  );
};

export const AdvMetricCard = ({ label, value, icon, sub, isHighlight }) => (
  <motion.div className={`adv-card ${isHighlight ? 'highlight' : ''}`} whileHover={{ scale: 1.02 }}>
    <div className="adv-icon-box">{icon}</div>
    <div className="adv-content">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      <div className="sub">{sub}</div>
    </div>
  </motion.div>
);

