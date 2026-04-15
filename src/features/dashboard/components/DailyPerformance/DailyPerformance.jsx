import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Layers, Trophy } from 'lucide-react'

export function DailyPerformance({ stats, variants }) {
  const { dailyStats = {} } = stats || {}
  
  // Get available dates and default to the latest one
  const availableDates = Object.keys(dailyStats).sort((a, b) => new Date(b) - new Date(a))
  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '')

  const currentDayData = useMemo(() => {
    return dailyStats[selectedDate] || { total: 0, workers: {}, modules: {} }
  }, [selectedDate, dailyStats])

  const sortedDayWorkers = Object.entries(currentDayData.workers).sort((a, b) => b[1] - a[1])
  const sortedDayModules = Object.entries(currentDayData.modules).sort((a, b) => b[1] - a[1])

  return (
    <motion.div variants={variants} style={{ marginBottom: '40px' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Header with Date Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--bg-app)', paddingBottom: '20px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Calendar size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950 }}>Cierre de Producción</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Explora resultados exactos por jornada</p>
              </div>
           </div>

           <select 
             value={selectedDate} 
             onChange={(e) => setSelectedDate(e.target.value)}
             style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: 800, background: 'var(--bg-app)', outline: 'none', cursor: 'pointer' }}
           >
             {availableDates.map(date => (
               <option key={date} value={date}>{new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</option>
             ))}
           </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* Daily Worker Leaderboard */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
               <Users size={18} color="var(--primary)" />
               <span style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Top Empleados del Día</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {sortedDayWorkers.length === 0 ? (
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', padding: '20px' }}>SIN ACTIVIDAD REGISTRADA</p>
               ) : sortedDayWorkers.slice(0, 5).map(([name, units], idx) => (
                 <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 16px', background: 'var(--bg-app)', borderRadius: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? '#fcd34d' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 950 }}>
                       {idx === 0 ? <Trophy size={14} color="#b45309" /> : idx + 1}
                    </div>
                    <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 850 }}>{name}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 950, color: 'var(--primary)' }}>{units.toLocaleString()} <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>UNIDADES</span></span>
                 </div>
               ))}
            </div>
          </div>

          {/* Daily Module Breakdown */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
               <Layers size={18} color="var(--primary)" />
               <span style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Producción por Módulo</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {sortedDayModules.map(([module, units]) => (
                 <div key={module} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800 }}>
                       <span>{module}</span>
                       <span>{units.toLocaleString()} u. ({Math.round((units / currentDayData.total) * 100)}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                       <div style={{ width: `${(units / currentDayData.total) * 100}%`, height: '100%', background: 'var(--primary)' }} />
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
