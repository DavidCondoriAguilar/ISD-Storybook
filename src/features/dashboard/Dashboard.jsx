import { useState, useMemo, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { 
  Search, 
  Database,
  Trash2,
  Filter,
  Download,
  Calendar,
  Package,
  Factory,
  User as UserIcon,
  Cpu,
  Hash,
  TrendingUp,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { storageService } from '../../data/storageService'
import { db } from '../../data/db'
import { useNotification } from '../../context/NotificationContext'
import './Dashboard.css'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1,
      when: "beforeChildren"
    } 
  }
}

const headerVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20 } }
}

const kpiVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } }
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  hover: { 
    backgroundColor: 'var(--primary-light)',
    x: 5,
    transition: { duration: 0.2 } 
  },
  tap: { scale: 0.99 }
}

export const Dashboard = memo(function Dashboard() {
  const { notify } = useNotification()
  const [filterText, setFilterText] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  const records = useLiveQuery(
    () => db.records.toArray(),
    []
  ) || []

  const handleClear = useCallback(async () => {
    if (window.confirm('¿Eliminar toda la auditoría actual?')) {
      await storageService.clear()
      notify('Base de datos purgada.', 'info')
    }
  }, [notify])

  const toggleSort = useCallback(() => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }, [])

  const filteredRecords = useMemo(() => {
    const filtered = filterText
      ? records.filter(r => 
          (r.trabajadorNombre || '').toLowerCase().includes(filterText.toLowerCase()) ||
          (r.productoNombre || '').toLowerCase().includes(filterText.toLowerCase()) ||
          (r.moduloId || '').toLowerCase().includes(filterText.toLowerCase()) ||
          (r.maquinaId || '').toLowerCase().includes(filterText.toLowerCase())
        )
      : records
    
    return [...filtered].sort((a, b) => {
      const dateA = a.fechaTimestamp || 0
      const dateB = b.fechaTimestamp || 0
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })
  }, [records, filterText, sortOrder])

  const totalNeto = useMemo(() => filteredRecords.reduce((s, r) => s + (r.cantidad || 0), 0), [filteredRecords])

  const totalsByType = useMemo(() => {
    const isMillar = (r) => {
      const producto = (r.productoNombre || '').toLowerCase()
      const maquina = (r.maquinaId || '').toUpperCase()
      return producto.includes('millar') || 
             producto.includes('resorte') || 
             maquina.includes('RESORTERA') || 
             maquina.includes('MR')
    }
    
    const result = { unidades: 0, millares: 0 }
    
    filteredRecords.forEach(r => {
      const cantidad = r.cantidad || 0
      if (isMillar(r)) {
        result.millares += cantidad
      } else {
        result.unidades += cantidad
      }
    })
    
    return result
  }, [filteredRecords])

  const formatDate = useCallback((ts) => {
    if (!ts) return '-'
    const d = new Date(ts)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }, [])

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Reporte de Produccion - ISD', 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 30)
    doc.text(`Total registros: ${filteredRecords.length} | U: ${totalsByType.unidades.toLocaleString()} | M: ${totalsByType.millares.toLocaleString()}`, 14, 36)
    
    const isMillar = (r) => {
      const producto = (r.productoNombre || '').toLowerCase()
      const maquina = (r.maquinaId || '').toUpperCase()
      return producto.includes('millar') || 
             producto.includes('resorte') || 
             maquina.includes('RESORTERA') || 
             maquina.includes('MR')
    }
    
    const tableData = filteredRecords.map((r, i) => [
      i + 1,
      formatDate(r.fechaTimestamp),
      r.productoNombre || '-',
      r.moduloId || '-',
      r.trabajadorNombre || '-',
      r.lecturaMaquina ? r.lecturaMaquina.toLocaleString() : '-',
      r.cantidad ? `${r.cantidad.toLocaleString()} ${isMillar(r) ? 'mil.' : 'u.'}` : '-',
      r.maquinaId || '-'
    ])

    autoTable(doc, {
      startY: 42,
      head: [['#', 'FECHA', 'PRODUCTO', 'AREA', 'TRABAJADOR', 'LECTURA', 'TOTAL', 'MAQUINA']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 }
    })

    doc.save(`isd-report-${new Date().toISOString().split('T')[0]}.pdf`)
    notify('Reporte PDF exportado exitosamente', 'success')
  }, [filteredRecords, totalsByType, formatDate, notify])

  return (
    <motion.div 
      className="dashboard-elite-view" 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
    >
      <motion.header 
        className="elite-header"
        variants={headerVariants}
      >
        <div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="brand-badge"
          >
            <Database size={12} aria-hidden="true" />
            <span>SISTEMA DE AUDITORÍA ISD v2.0</span>
          </motion.div>
          <h1 className="main-title">Monitor de Producción <span className="highlight">Real-Time</span></h1>
          <p className="subtitle">Trazabilidad industrial de planta central y procesos externos.</p>
        </div>

        <div className="kpi-group">
          <motion.div className="kpi-card-premium" variants={kpiVariants} whileHover={{ y: -3 }}>
            <div className="icon-wrapper blue"><Hash size={16} aria-hidden="true" /></div>
            <div className="kpi-content">
              <span className="label">REGISTROS</span>
              <span className="value">{filteredRecords.length.toLocaleString()}</span>
            </div>
          </motion.div>
          
          <motion.div className="kpi-card-premium glow" variants={kpiVariants} whileHover={{ y: -3 }}>
            <div className="icon-wrapper green"><TrendingUp size={16} aria-hidden="true" /></div>
            <div className="kpi-content">
              <span className="label">UNIDADES NETAS</span>
              <span className="value">{totalsByType.unidades.toLocaleString()} <small>u.</small> / {totalsByType.millares.toLocaleString()} <small>mil.</small></span>
            </div>
            <motion.div 
              className="pulse-effect"
              animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </motion.header>

      <motion.div 
        className="control-surface glass"
        variants={headerVariants}
      >
        <div className="search-container-premium">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Filtrar por operario, producto o máquina..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            aria-label="Buscar registros"
          />
        </div>

        <div className="action-hub">
          <button className="btn-elite secondary" aria-label="Aplicar filtros">
            <Filter size={16} aria-hidden="true" /> Filtros
          </button>
          <button className="btn-elite secondary" onClick={handleExportPDF} aria-label="Exportar datos PDF">
            <Download size={16} aria-hidden="true" /> Exportar
          </button>
          <button className="btn-elite danger" onClick={handleClear} aria-label="Limpiar base de datos">
            <Trash2 size={16} aria-hidden="true" /> Limpiar
          </button>
        </div>
      </motion.div>

      <motion.div 
        className="table-viewport glass"
        variants={tableVariants}
      >
        <table className="elite-table" role="grid" aria-label="Registros de producción">
          <thead>
            <tr>
              <th 
                className="th-elite th-sortable" 
                scope="col"
                onClick={toggleSort}
                role="columnheader"
                aria-sort={sortOrder === 'desc' ? 'descending' : 'ascending'}
              >
                <Calendar size={12} /> FECHA
                <span className="sort-indicator">
                  {sortOrder === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </span>
              </th>
              <th className="th-elite" scope="col" style={{ width: '25%' }}><Package size={12} /> PRODUCTO</th>
              <th className="th-elite" scope="col"><Factory size={12} /> ÁREA</th>
              <th className="th-elite" scope="col"><UserIcon size={12} /> TRABAJADOR</th>
              <th className="th-elite text-right" scope="col"><Hash size={12} /> LECTURA (MÁQ)</th>
              <th className="th-elite text-right" scope="col"><TrendingUp size={12} /> TOTAL</th>
              <th className="th-elite" scope="col"><Cpu size={12} /> MÁQUINA</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode='popLayout'>
              {filteredRecords.length === 0 ? (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan={7} className="empty-state">
                    <Database size={40} style={{ marginBottom: '12px', opacity: 0.2 }} aria-hidden="true" />
                    <p>No hay registros activos en la bitácora.</p>
                  </td>
                </motion.tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <motion.tr 
                    key={r.idLocal || i} 
                    variants={rowVariants}
                    layout
                    whileHover="hover"
                    whileTap="tap"
                    className="audit-row"
                  >
                    <td className="td-elite date-cell">{formatDate(r.fechaTimestamp)}</td>
                    <td className="td-elite product-cell">{r.productoNombre}</td>
                    <td className="td-elite">
                      <span className="area-badge">{r.moduloId}</span>
                    </td>
                    <td className="td-elite worker-cell" style={{ textAlign: 'left' }}>{r.trabajadorNombre}</td>
                    <td className="td-elite text-right output-cell">{r.lecturaMaquina && r.lecturaMaquina !== 0 ? r.lecturaMaquina : ''}</td>
                    <td className="td-elite text-right total-cell">
                      {r.cantidad.toLocaleString()} 
                      <span className="unit-badge" style={{ 
                        marginLeft: '8px', 
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem', 
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        background: (
                          String(r.maquinaId || '').toUpperCase().includes('RESORTERA') || 
                          String(r.maquinaId || '').toUpperCase().includes('MR') ||
                          String(r.productoNombre || '').toUpperCase().includes('RESORTE')
                        ) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: (
                          String(r.maquinaId || '').toUpperCase().includes('RESORTERA') || 
                          String(r.maquinaId || '').toUpperCase().includes('MR') ||
                          String(r.productoNombre || '').toUpperCase().includes('RESORTE')
                        ) ? '#10b981' : '#3b82f6',
                      }}>
                        {(
                          String(r.maquinaId || '').toUpperCase().includes('RESORTERA') || 
                          String(r.maquinaId || '').toUpperCase().includes('MR') ||
                          String(r.productoNombre || '').toUpperCase().includes('RESORTE')
                        ) ? 'mil.' : 'u.'}
                      </span>
                    </td>
                    <td className="td-elite">
                      <span className="machine-chip" style={{ 
                        background: (
                          String(r.maquinaId || '').toUpperCase().includes('RESORTERA') || 
                          String(r.maquinaId || '').toUpperCase().includes('MR') ||
                          String(r.productoNombre || '').toUpperCase().includes('RESORTE')
                        ) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: (
                          String(r.maquinaId || '').toUpperCase().includes('RESORTERA') || 
                          String(r.maquinaId || '').toUpperCase().includes('MR') ||
                          String(r.productoNombre || '').toUpperCase().includes('RESORTE')
                        ) ? '#10b981' : '#3b82f6',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 900
                      }}>
                        {r.maquinaId || 'Sin Máquina'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  )
})