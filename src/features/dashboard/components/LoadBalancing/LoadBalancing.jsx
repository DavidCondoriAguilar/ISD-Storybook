import { motion } from 'framer-motion'
import { Scale, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import { formatMetric } from '../../../../utils/formatters'
import { PRODUCTION_TARGETS } from '../../../../config/productionTargets'

export function LoadBalancing({ stats, variants }) {
  const { areaBreakdown = [] } = stats || {}

  // Senior Logic: Analysis of bottlenecks and load distribution
  const analysis = areaBreakdown.map(area => {
    const config = PRODUCTION_TARGETS.modules[area.name] || PRODUCTION_TARGETS.modules.Default;
    // Total hours is an approximation or we can sum it from records
    // For this visualization, we use 8h as a standard shift reference
    const capacityTarget = config.targetPerHour * 8; 
    const loadPercentage = capacityTarget > 0 ? (area.units / capacityTarget) * 100 : 0;
    
    return {
      ...area,
      loadPercentage,
      isOverloaded: loadPercentage > 100,
      isUnderutilized: loadPercentage < 40 && area.units > 0
    }
  });

  if (areaBreakdown.length === 0) return null;

  return (
    <motion.div variants={variants} style={{ marginBottom: '40px' }}>
      <div style={{ background: 'var(--bg-card)', padding: '24px 32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
           <div style={{ width: '48px', height: '48px', background: 'var(--primary-glow)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
             <Scale size={24} />
           </div>
           <div>
             <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>Balanceo de Carga Estructural</h3>
             <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>Optimización de recursos y detección de cuellos de botella</p>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {analysis.map((item, idx) => (
            <motion.div 
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{ 
                padding: '24px', 
                background: 'var(--bg-app)', 
                borderRadius: '20px', 
                border: `1px solid ${item.isOverloaded ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-glass)'}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Alert Status for Overload */}
              {item.isOverloaded && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 900, background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                   <AlertTriangle size={12} /> SATURACIÓN CRÍTICA
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                 <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MÓDULO DE OPERACIÓN</span>
                 <h4 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>{item.name}</h4>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)' }}>PRODUCCIÓN NETA</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)' }}>{formatMetric(item.units)}</span>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)' }}>EFICIENCIA DE CARGA</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 950, color: item.isOverloaded ? '#ef4444' : 'var(--primary)' }}>
                      {Math.round(item.loadPercentage)}%
                    </div>
                 </div>
              </div>

              {/* Load Bar */}
              <div style={{ height: '12px', background: 'var(--bg-card)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '16px' }}>
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(100, item.loadPercentage)}%` }}
                   style={{ 
                     height: '100%', 
                     background: item.isOverloaded ? 'linear-gradient(90deg, var(--primary), #ef4444)' : 'var(--primary-gradient)' 
                   }} 
                 />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ flex: 1, padding: '12px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '4px' }}>TOP PRODUCTO</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.topProduct.split('(')[0]}</div>
                 </div>
                 <div style={{ flex: 1, padding: '12px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '4px' }}>ESTADO OEE</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <CheckCircle2 size={12} color={item.avgEfficiency > 80 ? 'var(--success)' : 'var(--text-dim)'} />
                       <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{item.avgEfficiency}%</span>
                    </div>
                 </div>
              </div>

            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: '24px', padding: '16px 24px', background: 'rgba(59, 130, 246, 0.03)', borderRadius: '16px', border: '1px dashed rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
           <TrendingUp size={16} color="var(--primary)" />
           <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 900 }}>RECOMENDACIÓN SENIOR:</span> 
              {analysis.some(a => a.isOverloaded) 
                ? ' Se detecta sobrecarga en sectores clave. Considere redistribuir operarios de áreas subutilizadas para evitar fatiga de maquinaria.' 
                : ' El balanceo de carga actual es óptimo. Mantenga el ritmo de producción actual para asegurar el cumplimiento de metas.'}
           </p>
        </div>

      </div>
    </motion.div>
  )
}
