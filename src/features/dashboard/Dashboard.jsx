import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, User, AlertTriangle, TrendingDown, DollarSign, CheckCircle2, Info, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { storageService } from '../../services/storageService'
import { useNotification } from '../../context/NotificationContext'

// Sub-components
import { StatCards } from './components/StatCards'
import { AnalyticsCharts } from './components/AnalyticsCharts'
import { AuditModal } from './components/AuditModal'
import { SyncHistoryLog } from './components/SyncHistoryLog'
import { ConfirmModal } from '../../components/ui/ConfirmModal'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
}

export function Dashboard() {
  const { notify } = useNotification()
  const [data, setData] = useState({
    stats: { totalImports: 0, totalUnits: 0, successRate: 0, avgUnitsPerImport: 0, totalFailed: 0, lastImport: null, topWorker: 'N/A' },
    records: [], monthly: []
  })
  const [showAllAudit, setShowAllAudit] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const refresh = useCallback(() => {
    setData({
      stats: storageService.getStats(),
      records: storageService.getAll(),
      monthly: storageService.getMonthlyData()
    })
  }, [])

  const handleConfirmClear = () => {
    storageService.clear()
    refresh()
    setIsConfirmOpen(false)
    notify('Base de datos reiniciada correctamente 🧹', 'info')
  }

  useEffect(() => { refresh() }, [refresh])

  // Senior Logic: Exceptions & Financial Impact
  const COST_PER_SCRAP = 3.50; // Mock cost per unit
  const financialLost = useMemo(() => (data.stats.totalFailed * COST_PER_SCRAP).toLocaleString(), [data.stats.totalFailed])
  
  const auditRecords = data.stats.lastImport?.rawRecords || []
  const auditExceptions = useMemo(() => auditRecords.filter(r => (r.cantidadRechazada || r.quantityRejected) > 0), [auditRecords])
  const displayedAudit = showAllAudit ? auditRecords : auditExceptions

  const insights = useMemo(() => {
    const alerts = []
    if (data.stats.successRate < 98) alerts.push({ text: `Eficiencia debajo del objetivo (98%). Impacto financiero: -$${financialLost}`, type: 'danger' })
    if (auditExceptions.length > 0) alerts.push({ text: `Detectadas ${auditExceptions.length} fallas críticas en el último lote. Requiere revisión técnica.`, type: 'warning' })
    if (data.stats.totalUnits > 2000) alerts.push({ text: "Rendimiento proyectado sobre la meta trimestral.", type: 'success' })
    return alerts
  }, [data.stats, auditExceptions, financialLost])

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="visible">
      <AuditModal selectedRecord={selectedRecord} onClose={() => setSelectedRecord(null)} />
      
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onConfirm={handleConfirmClear} 
        onCancel={() => setIsConfirmOpen(false)} 
        title="¿Expurgar Historial?"
        message="Esta acción eliminará permanentemente todos los registros de producción y auditoría. No se puede revertir."
      />

      {/* Senior Header & Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', marginBottom: '40px' }}>
        <motion.header variants={itemVariants}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '4px' }}>
            Control <span style={{ color: 'var(--primary)' }}>Ejecutivo</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Planta Central • 24/7 Monitoreo</span>
             </div>
             
             <button 
               onClick={() => setIsConfirmOpen(true)}
               style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, transition: 'opacity 0.2s' }}
               onMouseEnter={e => e.currentTarget.style.opacity = 1}
               onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
             >
                <Trash2 size={14} /> BORRAR TODO
             </button>
          </div>
        </motion.header>

        <motion.div variants={itemVariants} style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '24px', border: '1px solid var(--border-strong)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             <TrendingDown size={16} /> Insights de Gestión Proactiva
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 750, color: ins.type === 'danger' ? 'var(--danger)' : ins.type === 'warning' ? 'var(--warning)' : 'var(--success)' }}>
                 {ins.type === 'danger' ? <AlertTriangle size={14} /> : ins.type === 'warning' ? <Info size={14} /> : <CheckCircle2 size={14} />}
                 {ins.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <StatCards stats={data.stats} variants={itemVariants} />
      
      <AnalyticsCharts monthly={data.monthly} areaBreakdown={data.stats.areaBreakdown} totalUnits={data.stats.totalUnits} variants={itemVariants} />

      {/* Exception Management Panel */}
      <motion.div variants={itemVariants} className="analysis-pane" style={{ marginBottom: '32px', padding: '40px', background: 'white', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <AlertTriangle size={24} color="var(--danger)" />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.02em' }}>Gestión de Excepciones</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{showAllAudit ? 'Vista Total' : `Mostrando ${auditExceptions.length} Irregularidades Críticas`}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
             <div style={{ textAlign: 'right', paddingRight: '16px', borderRight: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 950, color: 'var(--danger)' }}>-${financialLost}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pérdida por Mermas</span>
             </div>
             <button onClick={() => setShowAllAudit(!showAllAudit)} style={{ padding: '10px 20px', background: 'var(--bg-app)', border: '1px solid var(--border-strong)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {showAllAudit ? 'Solo Excepciones' : 'Ver Todos'} {showAllAudit ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
             </button>
          </div>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayedAudit.map((rec, i) => {
            const quantity = Number(rec.cantidad ?? rec.quantity ?? 0);
            const rejected = Number(rec.cantidadRechazada ?? rec.quantityRejected ?? 0);
            const product = rec.productoTipo 
                     ? `${rec.productoTipo}${rec.productoTamano ? ` (${rec.productoTamano})` : ''}`
                     : (rec.producto ?? rec.productName ?? rec.modulo ?? 'Resorte Estándar');

            return (
              <motion.div key={i} whileHover={{ x: 6 }} style={{ padding: '20px 28px', borderRadius: '20px', border: '1px solid var(--border)', background: rejected > 0 ? 'rgba(239, 68, 68, 0.02)' : 'white', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr', gap: '20px', alignItems: 'center' }}>
                   <div>
                      <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)' }}>{rec.idLocal || 'EXT-ORD'}</span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{rec.modulo || rec.productName || 'Fase'}</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} /></div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800 }}>{rec.trabajadorNombre || 'Anónimo'}</span>
                        {rec.trabajadorDni && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>DNI: {rec.trabajadorDni}</span>}
                      </div>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 950 }}>{quantity}</span>
                      <span style={{ fontSize: '0.65rem', display: 'block', fontWeight: 900, color: 'var(--success)' }}>{rec.unidad || 'EXITOSO'}</span>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      {rejected > 0 ? (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '10px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--danger)' }}>{rejected}</span>
                          <span style={{ fontSize: '0.6rem', display: 'block', fontWeight: 950, color: 'var(--danger)' }}>RECHAZOS</span>
                        </div>
                      ) : <span style={{ color: 'var(--success)', fontWeight: 900, fontSize: '0.75rem' }}>{rec.esHoraExtra ? 'EXTRAS ✅' : 'SIN ALERTAS'}</span>}
                   </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <SyncHistoryLog records={data.records} onSelectRecord={setSelectedRecord} variants={itemVariants} />
    </motion.div>
  )
}

