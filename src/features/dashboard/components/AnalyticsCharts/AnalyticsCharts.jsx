import { motion } from 'framer-motion'
import { BarChart3, Target, Info } from 'lucide-react'

export function AnalyticsCharts({ monthly, areaBreakdown, totalUnits, variants }) {
  const maxVal = Math.max(...monthly.map(m => m.units), 500)

  return (
    <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', marginBottom: '32px' }}>
      <motion.div variants={variants} className="analysis-pane" style={{ background: 'white', borderRadius: '32px', border: '1px solid var(--border)', height: '520px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
        <div className="pane-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={20} color="var(--primary)" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 900 }}>Tendencia de Producción (Unidades)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Comparativo Mensual 2026</span>
          </div>
        </div>
        
        <div className="chart-body" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', padding: '20px 0' }}>
          {monthly.length > 0 ? monthly.slice(-6).map((m, i) => (
            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(m.units / maxVal) * 100}%` }}
                transition={{ duration: 1.5, type: 'spring', delay: i * 0.1 }}
                style={{ 
                  width: '100%', 
                  maxWidth: '54px', 
                  background: 'linear-gradient(to top, var(--primary), var(--secondary))', 
                  borderRadius: '16px 16px 6px 6px',
                  position: 'relative',
                  boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.2)'
                }}
              >
                <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{m.units}</div>
              </motion.div>
              <span style={{ marginTop: '16px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.name}</span>
            </div>
          )) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pendiente de datos históricos...</div>}
        </div>
      </motion.div>

      <motion.div variants={variants} className="analysis-pane" style={{ background: 'white', borderRadius: '32px', border: '1px solid var(--border)', height: '520px', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
        <div className="pane-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={20} color="var(--secondary)" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 900 }}>Distribución por Área de Manufactura</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Carga por Etapas de Producción</span>
          </div>
        </div>
        
        <div className="area-list" style={{ overflowY: 'auto', maxHeight: '420px', paddingRight: '12px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {areaBreakdown?.map((area, i) => (
            <div key={i} style={{ padding: '0 0 20px 0', borderBottom: '1px solid var(--bg-app)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)', transform: 'rotate(45deg)' }}></div>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{area.name}</span>
                 </div>
                 <span style={{ fontWeight: 800 }}>{area.units.toLocaleString()} <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>unid.</span></span>
              </div>
              <div style={{ height: '12px', background: 'var(--bg-app)', borderRadius: '20px', overflow: 'hidden', marginBottom: '12px' }}>
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(area.units / totalUnits) * 100}%` }} 
                    transition={{ duration: 1.2, delay: i * 0.1 }}
                    style={{ height: '100%', background: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)', borderRadius: '20px' }} 
                  />
              </div>
              {area.rejected > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 800 }}>
                   <Info size={14} /> {area.rejected} unidades rechazadas en este sector
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
