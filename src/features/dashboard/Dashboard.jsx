import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, History, ChevronRight, ClipboardList } from 'lucide-react'
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

  const displayedRecords = useMemo(() => {
    let base = showHistory ? data.records : (data.stats.lastImport?.rawRecords || []);
    return base.filter(r => {
      const nameMatch = !filterText || 
        r.trabajadorNombre?.toLowerCase().includes(filterText.toLowerCase()) ||
        (r.productoNombre || getProductName(r.productoId)).toLowerCase().includes(filterText.toLowerCase());
      const moduleMatch = filterModule === 'all' || getModuleName(r.moduloId) === filterModule;
      return nameMatch && moduleMatch;
    });
  }, [showHistory, data.records, data.stats.lastImport, filterText, filterModule])

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="visible">
      
      {/* 1. Audit Table with Filter Bar (HEART OF THE OPERATION) */}
      <motion.div variants={itemVariants} className="master-table-pane" style={{ marginBottom: '40px', padding: '32px', background: 'white', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList size={22} color="var(--primary)" />
             </div>
             <div>
                <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 950, letterSpacing: '-0.02em' }}>Auditoría de Planta</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{showHistory ? 'Historial Completo de Producción' : (data.stats.lastImport?.fileName || 'Esperando Datos')}</span>
             </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                  type="text" 
                  placeholder="Buscar trabajador o producto..." 
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  style={{ padding: '12px 16px 12px 45px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 700, minWidth: '320px', outline: 'none', background: 'var(--bg-app)' }}
              />
            </div>
            <select 
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 800, background: 'white', cursor: 'pointer', outline: 'none' }}
            >
              <option value="all">Todos los Módulos</option>
              {data.stats.areaBreakdown?.map(area => (
                <option key={area.name} value={area.name}>{area.name}</option>
              ))}
            </select>
            <button 
                onClick={() => setShowHistory(!showHistory)} 
                style={{ padding: '12px 24px', background: showHistory ? 'var(--primary)' : 'white', color: showHistory ? 'white' : 'var(--text-main)', border: '1px solid var(--border-strong)', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                {showHistory ? <ChevronRight size={16} /> : <History size={16} />}
                {showHistory ? 'Lote Actual' : 'Ver Historial'}
            </button>
          </div>
        </div>

        <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>MÓDULO</th>
                <th style={{ padding: '16px 20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>PRODUCTO</th>
                <th style={{ padding: '16px 20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>TRABAJADOR</th>
                <th style={{ padding: '16px 20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textAlign: 'center' }}>CANTIDAD</th>
                <th style={{ padding: '16px 20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>UNIDAD</th>
                <th style={{ padding: '16px 20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>FECHA</th>
                <th style={{ padding: '16px 20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>HORAS</th>
                <th style={{ padding: '16px 20px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>TIPO</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>No hay registros para mostrar en esta auditoría.</td></tr>
              ) : displayedRecords.map((r, i) => (
                <tr key={r.id || i} style={{ borderBottom: '1px solid var(--border-light)', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}>{getModuleName(r.moduloId)}</td>
                  <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 850 }}>{r.productoNombre || getProductName(r.productoId)}</td>
                  <td style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 800 }}>{r.trabajadorNombre}</td>
                  <td style={{ padding: '14px 20px', fontSize: '1rem', fontWeight: 950, textAlign: 'center' }}>{r.cantidad}</td>
                  <td style={{ padding: '14px 20px', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{r.unidad}</td>
                  <td style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 700 }}>{formatDate(r.fechaTimestamp)}</td>
                  <td style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 800 }}>{formatHours(r.jornadaTotalHoras)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, background: r.tipoJornada === 'Estándar' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.05)', color: r.tipoJornada === 'Estándar' ? 'var(--success)' : 'var(--danger)' }}>{r.tipoJornada}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 2. Tactical Daily Closure (Daily results by Worker & Module) */}
      <DailyPerformance stats={data.stats} variants={itemVariants} />

      {/* 3. Strategic Vision (OEE & MERMA - Business Impact) */}
      <StrategicVision stats={data.stats} variants={itemVariants} />

      {/* 3. Macro Statistics (Summary) */}
      <StatCards stats={data.stats} variants={itemVariants} />

      {/* 4. Advanced Operational Intelligence (Machines & Overtime) */}
      <OperationalInsights stats={data.stats} variants={itemVariants} />

      {/* 5. Visual Analytics Section */}
      <AnalyticsCharts monthly={data.monthly} areaBreakdown={data.stats.areaBreakdown} totalUnits={data.stats.totalUnits} variants={itemVariants} />
    </motion.div>
  )
}
