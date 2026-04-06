import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Layers, History, Search, User, FileCheck2, AlertCircle } from 'lucide-react'
import { storageService } from '../../../services/storageService'

// Sub-components
import { StatCards } from './components/StatCards'
import { AnalyticsCharts } from './components/AnalyticsCharts'
import { AuditModal } from './components/AuditModal'
import { SyncHistoryLog } from './components/SyncHistoryLog'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
}

export function Dashboard() {
  const [data, setData] = useState({
    stats: { totalImports: 0, totalUnits: 0, successRate: 0, avgUnitsPerImport: 0, totalFailed: 0, lastImport: null, topWorker: 'N/A' },
    records: [],
    monthly: []
  })
  const [filter, setFilter] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState(null)

  const refresh = useCallback(() => {
    const stats = storageService.getStats()
    const records = storageService.getAll()
    const monthly = storageService.getMonthlyData()
    setData({ stats, records, monthly })
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const filteredRecords = data.records.filter(r => {
    if (filter === 'all') return true
    if (filter === 'success') return r.failed === 0
    if (filter === 'partial') return r.failed > 0
    return true
  })

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="visible">
      <AuditModal selectedRecord={selectedRecord} onClose={() => setSelectedRecord(null)} />

      {/* Executive Header */}
      <motion.header variants={itemVariants} style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.05em', background: 'linear-gradient(90deg, var(--text-main), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
            Dashboard General
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>Reporte de Manufactura • Planta Central - Unidad Lima</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'capitalize', color: 'var(--primary)' }}>
            {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800 }}>Actualización en tiempo real</div>
        </div>
      </motion.header>

      {/* Key Stats Cards */}
      <StatCards stats={data.stats} variants={itemVariants} />

      {/* Analytics Row */}
      <AnalyticsCharts 
        monthly={data.monthly} 
        areaBreakdown={data.stats.areaBreakdown} 
        totalUnits={data.stats.totalUnits} 
        variants={itemVariants} 
      />

      {/* Auditoria Detallada Cards */}
      <motion.div variants={itemVariants} className="analysis-pane" style={{ marginBottom: '32px', padding: '32px' }}>
        <div className="pane-title" style={{ marginBottom: '32px' }}>
          <Layers size={22} color="var(--warning)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>Auditoría Detallada de Sincronización</span>
             <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Último archivo: {data.stats.lastImport?.fileName || 'Ninguno'}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', maxHeight: '450px', overflowY: 'auto', paddingRight: '12px' }}>
          {data.stats.lastImport?.rawRecords?.map((rec, i) => {
            const quantity = Number(rec.cantidad ?? rec.quantity ?? 0);
            const quantityRejected = Number(rec.cantidadRechazada ?? rec.quantityRejected ?? 0);
            const stage = rec.modulo ?? rec.stageName ?? 'Manufactura';
            const order = rec.idLocal ?? rec.orderNumber ?? 'SIN ORDEN';
            const worker = rec.trabajadorNombre ?? rec.workerName ?? 'Sin asignar';

            return (
              <motion.div key={i} whileHover={{ translateY: -4 }} style={{ background: 'var(--bg-app)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                     <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1rem', textTransform: 'uppercase' }}>{stage}</span>
                     <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{order}</span>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>
                        <User size={12} /> {worker}
                     </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 950 }}>{quantity} <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>u.</span></div>
                    {quantityRejected > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 900 }}>-{quantityRejected} RECHAZOS</div>}
                  </div>
                </div>
              </motion.div>
            )
          })}
          {!data.stats.lastImport?.rawRecords && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No hay datos de auditoría disponibles.</div>}
        </div>
      </motion.div>

      {/* Bitacora Log Table */}
      <SyncHistoryLog 
        records={filteredRecords} 
        filter={filter} 
        setFilter={setFilter} 
        onSelectRecord={setSelectedRecord}
        variants={itemVariants}
      />
    </motion.div>
  )
}
