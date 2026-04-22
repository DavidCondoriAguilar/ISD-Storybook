import { motion } from 'framer-motion'
import { Activity, Trash2, TrendingUp, ShieldAlert, CheckCircle2, Users, Gauge } from 'lucide-react'

export function StrategicVision({ stats, variants }) {
  const { successRate = 0, totalUnits = 0, totalFailed = 0, machineStats = [], totalOvertimeHours = 0, dailyStats = {} } = stats || {}
  
  const oeeValue = successRate;
  const mermaRate = totalUnits > 0 ? ((totalFailed / totalUnits) * 100).toFixed(1) : 0;
  
  // Real calculations — NO hardcoded values
  const totalDays = Object.keys(dailyStats).length || 1;
  const avgDailyOutput = Math.round(totalUnits / totalDays);
  const activeMachines = machineStats.length;
  const qualityRate = totalUnits > 0 ? ((totalUnits - totalFailed) / totalUnits * 100).toFixed(1) : 0;
  // Count unique workers across all daily stats
  const allWorkers = new Set();
  Object.values(dailyStats).forEach(day => {
    Object.keys(day.workers || {}).forEach(w => allWorkers.add(w));
  });

  return (
    <motion.div 
      variants={variants}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}
    >
      {/* OEE STRATEGIC CARD */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '32px', borderRadius: 'var(--radius-xl)', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
           <Activity size={160} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} color="#818cf8" />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em', color: '#a5b4fc' }}>SALUD GLOBAL (OEE)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
           <div style={{ fontSize: '4.2rem', fontWeight: 950, marginBottom: '5px', letterSpacing: '-0.06em', background: 'linear-gradient(to bottom, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
             {oeeValue}%
           </div>
           {oeeValue > 85 ? <CheckCircle2 size={24} color="#10b981" /> : <ShieldAlert size={24} color="#f59e0b" />}
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, lineHeight: 1.6 }}>
          Rendimiento operativo vs. capacidad teórica. <br />
          <span style={{ color: '#818cf8', fontWeight: 900, fontSize: '0.75rem' }}>
            ESTATUS: {oeeValue > 85 ? 'CLASE MUNDIAL (EXCELENCIA)' : 'OPTIMIZACIÓN REQUERIDA'}
          </span>
        </p>
      </div>

      {/* MERMA STRATEGIC CARD */}
      <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={18} color="#ef4444" />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CONTROL DE DESPERDICIO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
           <span style={{ fontSize: '4.2rem', fontWeight: 950, color: parseFloat(mermaRate) > 2 ? '#ef4444' : 'var(--success)', letterSpacing: '-0.06em' }}>{mermaRate}%</span>
           <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-dim)' }}>INDEX</span>
        </div>
        <div style={{ marginTop: '24px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>LÍMITE DE TOLERANCIA</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-main)' }}>2.0% MAX</span>
           </div>
           <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (mermaRate / 2) * 100)}%` }}
                style={{ height: '100%', background: parseFloat(mermaRate) > 2 ? '#ef4444' : '#10b981' }} 
              />
           </div>
        </div>
      </div>

      {/* OPERATIONAL INTELLIGENCE CARD — ALL REAL DATA */}
      <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="var(--primary)" />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>INTELIGENCIA OPERATIVA</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '5px' }}>PROMEDIO DIARIO</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--text-main)' }}>{avgDailyOutput}<span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '4px' }}>u.</span></div>
             </div>
             <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', marginBottom: '5px' }}>OPERADORES</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--primary)' }}>{allWorkers.size}</div>
             </div>
          </div>
        </div>
        <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '20px', marginTop: '20px', border: '1px solid var(--border)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                 <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px' }}>CALIDAD VERIFICADA</div>
                 <span style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--success)' }}>{qualityRate}%</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px' }}>MÁQUINAS</div>
                 <span style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--text-main)' }}>{activeMachines}</span>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  )
}
