import { motion } from 'framer-motion'
import { Cpu, Clock, AlertTriangle, TrendingUp, Zap } from 'lucide-react'

export function OperationalInsights({ stats, variants }) {
  const { machineStats = [], totalOvertimeHours = 0 } = stats || {}
  
  // Risk assessment for overtime (Managerial Decision)
  const overtimeRisk = totalOvertimeHours > 40 ? 'CRÍTICO' : totalOvertimeHours > 10 ? 'PRECAUCIÓN' : 'BAJO'
  const riskColor = overtimeRisk === 'CRÍTICO' ? '#ef4444' : overtimeRisk === 'PRECAUCIÓN' ? '#f59e0b' : '#10b981'

  return (
    <motion.div 
      variants={variants}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '40px' }}
    >
      {/* 1. Machine Performance Monitor */}
      <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950 }}>Rendimiento de Maquinaria</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Distribución de carga por unidad mecánica</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {machineStats.slice(0, 5).map((m, idx) => (
            <div key={m.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)' }}>{m.name}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--primary)' }}>{m.units.toLocaleString()} <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>u.</span></span>
               </div>
               <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.units / (machineStats[0]?.units || 1)) * 100}%` }}
                    style={{ height: '100%', background: 'var(--primary)', opacity: 1 - (idx * 0.15) }}
                  />
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Overtime & Labor Cost Guard */}
      <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '32px', border: '2px solid transparent', borderColor: totalOvertimeHours > 20 ? `${riskColor}20` : 'var(--border)', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', background: `${riskColor}10`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: riskColor }}>
            <Clock size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950 }}>Control de Horas Extra</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Monitoreo de sobrecostos laborales</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
           <span style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.05em' }}>
             {totalOvertimeHours} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>hrs</span>
           </span>
           <div style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '12px', background: `${riskColor}15`, color: riskColor, fontSize: '0.75rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} /> RIESGO {overtimeRisk}
           </div>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-app)', borderRadius: '20px' }}>
           <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4 }}>
             {overtimeRisk === 'CRÍTICO' 
               ? "Se recomienda redistribuir turnos inmediatamente para evitar agotamiento y sobrecostos." 
               : "La carga de horas extra se mantiene dentro de los márgenes previstos."}
           </p>
        </div>
      </div>
    </motion.div>
  )
}
