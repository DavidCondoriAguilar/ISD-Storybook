import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Zap, Activity } from 'lucide-react';
import { MetricCard } from '../../../shared';
import '../styles/StatCards.css';

/**
 * KPICard - Refactored using MetricCard Composition Pattern.
 * Pattern: architecture-compound-components
 */
export const KPICard = ({ title, value, color, progress, trend, periodLabel, icon: Icon }) => {
  const getStatus = () => {
    if (progress === undefined || progress === null) return { label: 'Sincronizando', color: 'var(--text-dim)', icon: <Clock size={12} /> };
    if (progress >= 100) return { label: 'Meta Superada', color: 'var(--success)', icon: <CheckCircle size={12} /> };
    if (progress >= 85) return { label: 'Buen Ritmo', color: 'var(--primary)', icon: <Activity size={12} /> };
    if (progress >= 60) return { label: 'En Riesgo', color: 'var(--warning)', icon: <AlertCircle size={12} /> };
    return { label: 'Crítico', color: 'var(--danger)', icon: <AlertCircle size={12} /> };
  };

  const status = getStatus();

  return (
    <MetricCard color={color} className="kpi-card-exec">
      <MetricCard.Header>
        <div className="kpi-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icon && <Icon size={16} color={color === 'blue' ? 'var(--primary)' : color === 'green' ? 'var(--success)' : 'var(--primary)'} />}
            <span className="kpi-label">{title}</span>
          </div>
          {periodLabel && <span className="kpi-period">{periodLabel}</span>}
        </div>
      </MetricCard.Header>

      <MetricCard.Content>
        <MetricCard.Value value={value} />
      </MetricCard.Content>

      {progress !== undefined && (
        <MetricCard.Progress value={progress} />
      )}

      {trend !== undefined && (
        <div className="kpi-footer-composed">
          <MetricCard.Trend value={trend} />
          <span className="kpi-trend-label">vs ayer</span>
        </div>
      )}
    </MetricCard>
  );
};

/**
 * SuccessScoreCard - Master metric using composition.
 */
export const SuccessScoreCard = ({ score }) => {
  const color = score >= 90 ? 'var(--success)' : score >= 75 ? 'var(--primary)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  
  return (
    <MetricCard color="primary" className="highlight-success" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div>
          <MetricCard.Title>Índice de Éxito Global</MetricCard.Title>
          <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--text-main)', marginTop: '4px', letterSpacing: '-0.04em' }}>
            {score}%
          </div>
        </div>
        <div className="success-icon-box" style={{ background: `${color}15` }}>
          <Zap size={32} color={color} fill={color} style={{ opacity: 0.8 }} />
        </div>
      </div>
      <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, lineHeight: 1.4 }}>
        Promedio de cumplimiento basado en metas de Paneles y Resortes.
      </p>
    </MetricCard>
  );
};

/**
 * AdvMetricCard - Secondary metrics.
 */
export const AdvMetricCard = ({ label, value, icon, sub, isHighlight }) => (
  <MetricCard className={`adv-card ${isHighlight ? 'highlight' : ''}`} whileHover={{ scale: 1.02 }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div className="adv-icon-box">{icon}</div>
      <div className="adv-content">
        <MetricCard.Title>{label}</MetricCard.Title>
        <div className="adv-value">{value}</div>
        <div className="adv-sub">{sub}</div>
      </div>
    </div>
  </MetricCard>
);
