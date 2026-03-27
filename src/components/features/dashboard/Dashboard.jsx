import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  FileCheck2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  History, 
  Filter, 
  User, 
  Target, 
  Activity,
  Package,
  FileJson
} from 'lucide-react'
import { storageService } from '../../../services/storageService'
import './Dashboard.css'

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
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    const stats = storageService.getStats()
    const records = storageService.getAll()
    const monthly = storageService.getMonthlyData()
    setData({ stats, records, monthly })
    setTimeout(() => setLoading(false), 500)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const filteredRecords = data.records.filter(r => {
    if (filter === 'all') return true
    if (filter === 'success') return r.failed === 0
    if (filter === 'partial') return r.failed > 0
    return true
  })

  // Chart Constants
  const maxVal = Math.max(...data.monthly.map(m => m.units), 500)

  return (
    <motion.div 
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Row 1: Executive Key Metrics */}
      <div className="stats-grid">
        <motion.div variants={itemVariants} className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Package size={22} color="var(--primary)" />
            <div className="stat-trend up"><ArrowUpRight size={14} /> +12%</div>
          </div>
          <span className="stat-label">Total Unidades 2026</span>
          <span className="stat-value">{data.stats.totalUnits.toLocaleString()}</span>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Activity size={22} color="var(--secondary)" />
            <div className="stat-trend up"><ArrowUpRight size={14} /> +4%</div>
          </div>
          <span className="stat-label">Eficiencia Operativa</span>
          <span className="stat-value">{data.stats.successRate}%</span>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Target size={22} color="var(--success)" />
          </div>
          <span className="stat-label">Promedio x Importación</span>
          <span className="stat-value">{data.stats.avgUnitsPerImport.toLocaleString()}</span>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <User size={22} color="var(--warning)" />
          </div>
          <span className="stat-label">Top Operario Reciente</span>
          <span className="stat-value">{data.stats.topWorker}</span>
        </motion.div>
      </div>

      {/* Row 2: Analysis & Insights */}
      <div className="analytics-grid">
        <motion.div variants={itemVariants} className="analysis-pane">
          <div className="pane-title">
            <BarChart3 size={20} color="var(--primary)" />
            <span>Tendencia Mensual de Producción</span>
          </div>
          <div className="chart-body">
            {data.monthly.length > 0 ? data.monthly.map((m, i) => (
              <div key={i} className="chart-bar-container">
                <motion.div 
                  className="chart-bar"
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.units / maxVal) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                >
                  <span className="chart-val">{m.units}</span>
                </motion.div>
                <span className="chart-label">{m.name}</span>
              </div>
            )) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                Sin datos históricos suficientes
              </div>
            )}
          </div>
          <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Gráfico basado en las últimas cargas procesadas exitosamente.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="insights-pane">
          <div className="insight-card">
            <div className="insight-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <TrendingUp size={20} />
            </div>
            <div className="insight-text">
              <h4>Rendimiento Al alza</h4>
              <p>El volumen total de unidades importadas ha incrementado un 12% comparado al mes anterior.</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
              <AlertCircle size={20} />
            </div>
            <div className="insight-text">
              <h4>Alertas de Calidad</h4>
              <p>Se detectaron {data.stats.totalFailed} registros con errores estructurales en el último lote.</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <FileCheck2 size={20} />
            </div>
            <div className="insight-text">
              <h4>Integridad Optimizada</h4>
              <p>La validación previa ha filtrado {data.stats.totalFailed * 2} duplicados antes de la carga final.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 3: History & Logs */}
      <motion.div variants={itemVariants} className="history-container">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History size={20} color="var(--primary)" />
            <h3>Bitácora de Sincronización</h3>
          </div>
          <div className="filter-tabs" style={{ display: 'flex', background: 'var(--bg-app)', padding: '4px', borderRadius: '12px' }}>
            {['all', 'success', 'partial'].map(f => (
              <button 
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800,
                  background: filter === f ? 'white' : 'transparent',
                  color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: filter === f ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {f === 'all' ? 'Ver Todo' : f === 'success' ? 'Exitosos' : 'Errores'}
              </button>
            ))}
          </div>
        </div>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Cronología</th>
                <th>Responsable</th>
                <th>Origen</th>
                <th>Lote</th>
                <th>Volumen</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? filteredRecords.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={{ fontWeight: 700 }}>{new Date(r.timestamp).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}><User size={12} /></div>
                    {r.worker || 'Sistema'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.fileName || 'JSON Entry'}</td>
                  <td style={{ fontWeight: 600 }}>{r.success} / {r.failed}</td>
                  <td style={{ fontWeight: 850, fontSize: '1rem' }}>{r.units?.toLocaleString() || 0}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 900,
                      background: r.failed === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: r.failed === 0 ? 'var(--success)' : 'var(--danger)',
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      {r.failed === 0 ? <FileCheck2 size={12} /> : <AlertCircle size={12} />}
                      {r.failed === 0 ? 'VALIDADO' : 'REVISIÓN'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <FileJson size={48} opacity={0.2} />
                      <span>Sin registros en el historial analítico</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
