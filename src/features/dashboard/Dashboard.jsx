import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, History, ChevronRight, ClipboardList, TrendingUp } from 'lucide-react'
import { storageService } from '../../services/storageService'
import { useNotification } from '../../context/NotificationContext'
import { getModuleName, setModuleMapCache, getProductName, setProductMapCache, formatDate, formatHours } from '../../utils/formatters'
import { db } from '../../services/db'

// Sub-components
import { StatCards } from './components/StatCards'
import { AnalyticsCharts } from './components/AnalyticsCharts'
import { OperationalInsights } from './components/OperationalInsights/OperationalInsights'
import { StrategicVision } from './components/StrategicVision/StrategicVision'
import { DailyPerformance } from './components/DailyPerformance/DailyPerformance'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
}

export function Dashboard({ forceHistory = false }) {
  const { notify } = useNotification()
  const [data, setData] = useState({
    stats: { totalImports: 0, totalUnits: 0, successRate: 0, avgUnitsPerImport: 0, totalFailed: 0, lastImport: null },
    records: [], monthly: []
  })
  const [showHistory, setShowHistory] = useState(forceHistory)
  const [filterText, setFilterText] = useState('')
  const [filterModule, setFilterModule] = useState('all')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const refresh = useCallback(async () => {
    const metadata = await db.metadata.toArray()
    const modMap = {}
    const prodMap = {}
    metadata.forEach(m => {
      if (m.id.startsWith('module_')) modMap[m.id.replace('module_', '')] = m.value
      if (m.id.startsWith('product_')) prodMap[m.id.replace('product_', '')] = m.value
    })
    setModuleMapCache(modMap)
    setProductMapCache(prodMap)

    const [stats, allRecords, monthly] = await Promise.all([
      storageService.getStats(),
      storageService.getAllRecords(),
      storageService.getMonthlyData()
    ])

    setData({ stats, records: allRecords, monthly })
  }, [])

  useEffect(() => {
    refresh()
    const handleGlobalRefresh = () => refresh()
    window.addEventListener('refresh_production_data', handleGlobalRefresh)
    return () => window.removeEventListener('refresh_production_data', handleGlobalRefresh)
  }, [refresh])

  const filteredRecords = useMemo(() => {
    let base = showHistory ? data.records : (data.stats.lastImport?.rawRecords || []);
    return base.filter(r => {
      const nameMatch = !filterText ||
        r.trabajadorNombre?.toLowerCase().includes(filterText.toLowerCase()) ||
        (r.productoNombre || getProductName(r.productoId)).toLowerCase().includes(filterText.toLowerCase());
      const moduleMatch = filterModule === 'all' || getModuleName(r.moduloId) === filterModule;
      return nameMatch && moduleMatch;
    });
  }, [showHistory, data.records, data.stats.lastImport, filterText, filterModule])

  // Senior Logic: Pagination slice
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const displayedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRecords.slice(start, start + itemsPerPage)
  }, [filteredRecords, currentPage])

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1) }, [filterText, filterModule, showHistory])

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="visible">

      {/* 1. Master Audit Journal (Senior Decision Surface) */}
      <motion.div variants={itemVariants} className="master-table-pane" style={{ padding: '0', marginBottom: '40px' }}>
        <div className="table-header-custom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--primary-gradient)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-purple)' }}>
                <ClipboardList size={28} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>Diario de Auditoría Maestro</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>
                  {showHistory ? `Archivo Corporativo: ${filteredRecords.length} registros validados` : `Lote en Línea: ${data.stats.lastImport?.fileName || 'Sincronizado'}`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)', zIndex: 5 }} />
                <input
                  type="text"
                  className="glass"
                  placeholder="Filtrar operador "
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  style={{ padding: '12px 16px 12px 45px', borderRadius: '16px', border: '1px solid var(--border-strong)', fontSize: '0.85rem', fontWeight: 750, minWidth: '320px', outline: 'none', color: 'var(--text-main)' }}
                />
              </div>

              <select
                value={filterModule}
                className="glass"
                onChange={(e) => setFilterModule(e.target.value)}
                style={{ padding: '0 24px', borderRadius: '16px', border: '1px solid var(--border-strong)', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', outline: 'none', color: 'var(--text-main)', appearance: 'none', background: 'var(--bg-card)' }}
              >
                <option value="all">Filtro Planta: Todo</option>
                {data.stats.areaBreakdown?.map(area => (
                  <option key={area.name} value={area.name}>{area.name}</option>
                ))}
              </select>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="icon-btn-ghost glass"
                style={{ width: 'auto', padding: '0 28px', height: '48px', gap: '12px', fontSize: '0.85rem', fontWeight: 900, border: '1px solid var(--border-strong)' }}
              >
                {showHistory ? <ChevronRight size={18} /> : <History size={18} />}
                {showHistory ? 'Lote Actual' : 'Histórico'}
              </button>
            </div>
          </div>
        </div>

        <div className="table-scrollable glass" style={{ borderRadius: '0', border: 'none' }}>
          <table className="history-table">
            <thead>
              <tr>
                <th>Centro de Operación</th>
                <th>Producto & Identificador SKU</th>
                <th>Operador Especialista</th>
                <th style={{ textAlign: 'center' }}>Producción Bruta</th>
                <th style={{ textAlign: 'center' }}>Eficiencia Operativa</th>
                <th>Registro Cronológico</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '120px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Sincronización pendiente: Esperando datos del sistema central.</td></tr>
              ) : displayedRecords.map((r, i) => {
                const uph = (r.cantidad / (parseFloat(r.jornadaTotalHoras) || 8)).toFixed(1);
                return (
                  <tr key={r.idLocal || i}>
                    <td style={{ width: '18%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>{getModuleName(r.moduloId)}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>{r.maquinaId || 'Proceso Manual'}</span>
                      </div>
                    </td>
                    <td style={{ width: '22%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{r.productoNombre || getProductName(r.productoId)}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'monospace', marginTop: '3px', opacity: 0.6 }}>{r.productoId}</span>
                      </div>
                    </td>
                    <td style={{ width: '18%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                          {(r.trabajadorNombre || 'S').charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>{r.trabajadorNombre}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{uph} U/H</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ width: '12%', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{r.cantidad.toLocaleString()}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>UNIDADES</span>
                      </div>
                    </td>
                    <td style={{ width: '10%', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{uph}</span>
                        {parseFloat(uph) > 10 && <TrendingUp size={12} color="var(--success)" />}
                      </div>
                    </td>
                    <td style={{ width: '10%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>{formatHours(r.jornadaTotalHoras)}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{formatDate(r.fechaTimestamp)}</span>
                      </div>
                    </td>
                    <td style={{ width: '10%', textAlign: 'right' }}>
                      <span className={r.tipoJornada === 'Estándar' ? 'badge badge-success' : 'badge'} style={{
                        background: r.tipoJornada !== 'Estándar' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: r.tipoJornada !== 'Estándar' ? '#f87171' : '#34d399',
                        border: `1px solid ${r.tipoJornada !== 'Estándar' ? '#f87171' : '#34d399'}40`,
                        padding: '4px 10px'
                      }}>
                        {r.tipoJornada}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Expert Pagination Section */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 48px' }}>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 800 }}>
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRecords.length)} de {filteredRecords.length} entradas validadas
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={currentPage === 1}
                className="icon-btn-ghost glass"
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{ width: 'auto', padding: '0 20px', fontSize: '0.8rem', height: '44px' }}
              >
                Anterior
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className="glass"
                      style={{ width: '44px', height: '44px', background: currentPage === pageNum ? 'var(--primary-gradient)' : 'transparent', color: currentPage === pageNum ? 'white' : 'var(--text-main)', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 900, border: '1px solid var(--border-strong)', boxShadow: currentPage === pageNum ? 'var(--shadow-purple)' : 'none' }}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                disabled={currentPage === totalPages}
                className="icon-btn-ghost glass"
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{ width: 'auto', padding: '0 20px', fontSize: '0.8rem', height: '44px' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Daily Performance Strategic Analysis */}
      <DailyPerformance stats={data.stats} variants={itemVariants} />

      {/* Strategic Efficiency Targets */}
      <StrategicVision stats={data.stats} variants={itemVariants} />

      {/* Compact KPI Control Bar */}
      <StatCards stats={data.stats} variants={itemVariants} />

      {/* Machine Analytics & Overtime Operational Intel */}
      <OperationalInsights stats={data.stats} variants={itemVariants} />

      {/* Analytics Visualization Core */}
      <AnalyticsCharts monthly={data.monthly} areaBreakdown={data.stats.areaBreakdown} totalUnits={data.stats.totalUnits} variants={itemVariants} />
    </motion.div>
  )
}
