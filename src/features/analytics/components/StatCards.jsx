import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'

export const KPICard = ({ title, value, icon, color, progress, trend, subtitle }) => {
  // Lógica de estado ejecutivo
  const getStatus = () => {
    if (progress === undefined) return { label: 'Informativo', color: 'var(--text-dim)', icon: <Clock size={10} /> };
    if (progress >= 100) return { label: 'Sobremeta', color: 'var(--success)', icon: <CheckCircle size={10} /> };
    if (progress >= 85) return { label: 'Estable', color: '#3b82f6', icon: <Clock size={10} /> };
    if (progress >= 60) return { label: 'Bajo Meta', color: 'var(--warning)', icon: <AlertCircle size={10} /> };
    return { label: 'Crítico', color: 'var(--danger)', icon: <AlertCircle size={10} /> };
  };

  const status = getStatus();

  return (
    <motion.div 
      className="kpi-card-exec glass" 
      whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Indicador de Estado Superior */}
      <div style={{ 
        position: 'absolute', top: '12px', right: '12px', 
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '2px 8px', borderRadius: '8px', fontSize: '0.6rem',
        fontWeight: '900', background: `${status.color}15`, color: status.color,
        textTransform: 'uppercase', border: `1px solid ${status.color}30`
      }}>
        {status.icon} {status.label}
      </div>

      <div className={`kpi-icon ${color}`}>{icon}</div>
      
      <div className="kpi-info" style={{ marginTop: '12px' }}>
        <span className="label" style={{ marginBottom: '4px' }}>{title}</span>
        <span className="value" style={{ fontSize: '1.6rem' }}>{value}</span>
        
        {/* Barra de Meta con Animación (Solo si hay progreso definido) */}
        {progress !== undefined && progress > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800, marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-dim)' }}>PROGRESO META</span>
              <span style={{ color: status.color }}>{(progress || 0).toFixed(1)}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: '100%', background: status.color, boxShadow: `0 0 10px ${status.color}40` }}
              />
            </div>
          </div>
        )}

        {/* Comparativa con Tendencia (Solo si existe data previa real) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', minHeight: '16px' }}>
          {trend !== undefined && trend !== null && trend !== 0 ? (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '4px', 
              color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.7rem', fontWeight: 800 
            }}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend).toFixed(1)}% <span style={{ opacity: 0.6, fontSize: '0.6rem' }}>vs día anterior</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600, opacity: 0.8 }}>
              {trend === 0 ? 'Sin cambios' : 'Sin datos previos'}
            </div>
          )}
          {subtitle && (
            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              {subtitle}
            </span>
          )}
        </div>
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
)
