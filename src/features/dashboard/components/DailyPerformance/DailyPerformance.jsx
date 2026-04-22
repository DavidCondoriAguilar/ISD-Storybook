import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Layers, Trophy, ShieldCheck, Zap } from 'lucide-react'

export function DailyPerformance({ stats, variants }) {
  const { dailyStats = {} } = stats || {}
  
  // Get available dates and default to the latest one
  const availableDates = Object.keys(dailyStats).sort((a, b) => new Date(b) - new Date(a))
  const [selectedDate, setSelectedDate] = useState('')

  // Senior Logic: Sync selectedDate when stats change or on mount
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0])
    }
  }, [availableDates, selectedDate])

  const currentDayData = useMemo(() => {
    return dailyStats[selectedDate] || { total: 0, workers: {}, modules: {} }
  }, [selectedDate, dailyStats])

  const sortedDayWorkers = Object.entries(currentDayData.workers).sort((a, b) => b[1] - a[1])
  const sortedDayModules = Object.entries(currentDayData.modules).sort((a, b) => b[1] - a[1])

  if (availableDates.length === 0) return null;

  return (
    <motion.div variants={variants} style={{ marginBottom: '40px' }}>
      <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Header with Date Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--primary-glow)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Calendar size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, color: 'var(--text-main)' }}>Cierre de Operaciones</h3>
                   <div style={{ padding: '4px 10px', background: '#10b98115', color: '#10b981', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></div>
                      PULSO ACTIVO
                   </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Inteligencia comparativa por jornada laboral</p>
              </div>
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 850, color: 'var(--text-dim)' }}>PERIODO:</span>
              <select 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '12px 24px', borderRadius: '14px', border: '1px solid var(--border-strong)', fontSize: '0.9rem', fontWeight: 800, background: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: '220px', textAlign: 'center' }}
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>{new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</option>
                ))}
              </select>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px' }}>
          
          {/* Daily Worker Leaderboard */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
               <Trophy size={20} color="#f59e0b" />
               <span style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Ranking de Productividad Diaria</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
               {sortedDayWorkers.length === 0 ? (
                 <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-app)', borderRadius: '24px', border: '1px dashed var(--border-strong)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 750 }}>PENDIENTE DE SINCRONIZACIÓN</p>
                 </div>
               ) : sortedDayWorkers.slice(0, 5).map(([name, units], idx) => (
                 <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={name} 
                    style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', background: 'var(--bg-app)', borderRadius: '20px', border: '1px solid var(--border-glass)' }}
                 >
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: idx === 0 ? 'var(--primary-gradient)' : 'var(--bg-card)', color: idx === 0 ? 'white' : 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 950, boxShadow: 'var(--shadow-sm)', border: idx !== 0 ? '1px solid var(--border)' : 'none' }}>
                       {idx === 0 ? <Zap size={18} fill="currentColor" /> : idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>{name}</div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={12} color="var(--success)" />
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800 }}>MÉTRICA VALIDADA</span>
                       </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{units.toLocaleString()}</div>
                       <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase' }}>unidades</div>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Daily Module Breakdown */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
               <Layers size={20} color="var(--primary)" />
               <span style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Carga por Sector</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '30px', background: 'var(--bg-app)', borderRadius: '32px', border: '1px solid var(--border-glass)' }}>
               {sortedDayModules.map(([module, units]) => (
                 <div key={module} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)' }}>{module}</span>
                       <span style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--primary)' }}>{Math.round((units / currentDayData.total) * 100)}%</span>
                    </div>
                    <div style={{ height: '10px', background: 'var(--bg-card)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${(units / currentDayData.total) * 100}%` }}
                         transition={{ duration: 1, ease: 'easeOut' }}
                         style={{ height: '100%', background: 'var(--primary-gradient)' }} 
                       />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textAlign: 'right' }}>
                       {units.toLocaleString()} Unidades Netas
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
