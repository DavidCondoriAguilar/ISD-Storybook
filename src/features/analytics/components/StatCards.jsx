import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

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
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>{title}</span>
          {periodLabel && <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600 }}>{periodLabel}</span>}
        </div>
        <div style={{ 
          padding: '4px 10px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: '900',
          background: `${status.color}15`, color: status.color, border: `1px solid ${status.color}30`
        }}>
          {status.label}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
        {progress !== undefined && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: isGoalMet ? 'var(--success)' : 'var(--text-dim)', fontWeight: 700, marginBottom: '6px' }}>
              {isGoalMet ? '✔ Objetivo diario alcanzado' : `Faltan ${remaining.toLocaleString('es-ES')} u. para la meta`}
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: status.color, width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700, color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(1)}% vs ayer
          </div>
        )}
        {progress !== undefined && <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)' }}>EFIC: {progress.toFixed(1)}%</div>}
      </div>
    </motion.div>
  );
};

export const AdvMetricCard = ({ label, value, icon, sub, isHighlight }) => (
  <motion.div className={`adv-card ${isHighlight ? 'highlight' : ''}`} whileHover={{ scale: 1.02 }}>
    <div className="adv-icon-box">{icon}</div>
    <div className="adv-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span className="label" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
      <span className="value" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{value}</span>
      <div className="sub" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub}</div>
    </div>
  </motion.div>
)
