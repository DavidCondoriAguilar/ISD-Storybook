import { motion } from 'framer-motion';
import { isResorte } from '../../../domain/production/predicates';
import { CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown, Target, Zap, Activity } from 'lucide-react';
import '../styles/StatCards.css';

/**
 * KPICard - Optimizada para lectura rápida y estabilidad visual.
 * Ahora incluye iconos dinámicos y lógica de estado senior.
 */
export const KPICard = ({ title, value, color, progress, trend, goalUnits = 1500, periodLabel, icon: Icon }) => {
  const getStatus = () => {
    if (progress === undefined || progress === null) return { label: 'Sincronizando', color: 'var(--text-dim)', icon: <Clock size={10} /> };
    if (progress >= 100) return { label: 'Meta Superada', color: '#10b981', icon: <CheckCircle size={10} /> };
    if (progress >= 85) return { label: 'Buen Ritmo', color: '#3b82f6', icon: <Activity size={10} /> };
    if (progress >= 60) return { label: 'En Riesgo', color: '#f59e0b', icon: <AlertCircle size={10} /> };
    return { label: 'Crítico', color: '#ef4444', icon: <AlertCircle size={10} /> };
  };

  const status = getStatus();
  
  // Limpiar valor para cálculos internos
  const safeValue = String(value || '0');
  const cleanValue = safeValue.replace(/[^\d.]/g, '');
  const currentVal = parseFloat(cleanValue) || 0;
  const remaining = Math.max(0, goalUnits - currentVal);
  const isGoalMet = remaining <= 0;

  return (
    <motion.div 
      className="kpi-card-exec glass" 
      whileHover={{ y: -5, boxShadow: '0 12px 20px -10px rgba(0,0,0,0.3)' }}
    >
      <div className="kpi-header">
        <div className="kpi-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icon && <Icon size={16} color={color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : 'var(--primary)'} />}
            <span className="kpi-label">{title}</span>
          </div>
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
        {/* Comentado para simplificar según feedback: Progreso y Metas */}
        {/* 
        {progress !== undefined && (
          <div className="kpi-progress-container">
            <div 
              className="kpi-goal-text"
              style={{ color: isGoalMet ? '#10b981' : 'var(--text-dim)' }}
            >
              {isGoalMet ? '✔ Meta cumplida' : `Faltan ${remaining.toLocaleString('es-ES')} para el objetivo`}
            </div>
            <div className="kpi-progress-bar-bg">
              <div 
                className="kpi-progress-bar-fill" 
                style={{ background: status.color, width: `${Math.min(progress, 100)}%` }} 
              />
            </div>
          </div>
        )} 
        */}
      </div>

      <div className="kpi-footer">
        {/* Comentado para simplificar según feedback: Tendencias vs ayer */}
        {/* 
        {trend !== undefined && (
          <div 
            className="kpi-trend"
            style={{ color: trend >= 0 ? '#10b981' : '#ef4444' }}
          >
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span style={{ fontWeight: 900 }}>{Math.abs(trend).toFixed(1)}%</span>
            <span style={{ opacity: 0.7, fontWeight: 600 }}> vs ayer</span>
          </div>
        )} 
        */}
        {/* {progress !== undefined && <div className="kpi-efficiency">Eficiencia: {progress.toFixed(1)}%</div>} */}
      </div>
    </motion.div>
  );
};

/**
 * SuccessScoreCard - El "Número de Oro" para el gerente.
 */
export const SuccessScoreCard = ({ score }) => {
  const color = score >= 90 ? '#10b981' : score >= 75 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';
  
  return (
    <motion.div 
      className="kpi-card-exec glass highlight-success"
      style={{ borderLeft: `4px solid ${color}` }}
      whileHover={{ scale: 1.02 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="kpi-label">Indice de Éxito Global</span>
          <div style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--text-main)', marginTop: '4px' }}>
            {score}%
          </div>
        </div>
        <div style={{ width: '60px', height: '60px', background: `${color}15`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={30} color={color} fill={color} style={{ opacity: 0.8 }} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
        Promedio de cumplimiento basado en metas de Paneles y Resortes.
      </p>
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

