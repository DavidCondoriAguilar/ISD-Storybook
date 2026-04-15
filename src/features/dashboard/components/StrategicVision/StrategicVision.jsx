import { motion } from 'framer-motion'
import { Activity, Trash2, TrendingUp, DollarSign } from 'lucide-react'

export function StrategicVision({ stats, variants }) {
  const { successRate = 0, totalUnits = 0, totalFailed = 0 } = stats || {}
  
  // OEE Simplified for Manager View (Quality focus as we don't have availability yet)
  const oeeValue = successRate;
  const mermaRate = totalUnits > 0 ? ((totalFailed / totalUnits) * 100).toFixed(1) : 0;

  return (
    <motion.div 
      variants={variants}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}
    >
      {/* OEE STRATEGIC CARD */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '32px', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
           <Activity size={120} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Activity size={20} color="#6366f1" />
          <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>SALUD DE PLANTA (OEE)</span>
        </div>
        <div style={{ fontSize: '3.5rem', fontWeight: 950, marginBottom: '10px', letterSpacing: '-0.05em' }}>
          {oeeValue}%
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, lineHeight: 1.4 }}>
          Mide la eficiencia real contra la teórica. <br />
          <span style={{ color: '#818cf8', fontWeight: 800 }}>
            {oeeValue > 85 ? 'Clase Mundial: Operación de alta rentabilidad.' : 'Oportunidad: Hay margen de mejora en procesos.'}
          </span>
        </p>
      </div>

      {/* MERMA STRATEGIC CARD */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Trash2 size={20} color="#ef4444" />
          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>TASA DE MERMA (DESPERDICIO)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
           <span style={{ fontSize: '3.5rem', fontWeight: 950, color: '#ef4444', letterSpacing: '-0.05em' }}>{mermaRate}%</span>
           <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>Mermas</span>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div style={{ flex: 1, height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${mermaRate}%`, height: '100%', background: '#ef4444' }}></div>
           </div>
           <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>Costo de Calidad</span>
        </div>
        <p style={{ marginTop: '16px', margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
          Pérdida neta de materiales por unidades defectuosas. <br />
          <span style={{ color: 'var(--text-main)', fontWeight: 900 }}>Límite de Control: {'<'} 2.0%</span>
        </p>
      </div>
    </motion.div>
  )
}
