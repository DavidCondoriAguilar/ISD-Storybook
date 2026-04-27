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
import { Pagination } from './components/common/Pagination/Pagination'
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

const isMillarRecord = (r) => {
  const producto = (r.productoNombre || '').toLowerCase()
  const maquina = (r.maquinaId || '').toUpperCase()
  return producto.includes('millar') || 
         producto.includes('resorte') || 
         maquina.includes('RESORTERA') || 
         maquina.includes('MR')
}

const COLORS = {
  primary: [99, 102, 241],
  secondary: [16, 185, 129],
  dark: [30, 41, 59],
  light: [241, 245, 249],
  text: [100, 116, 139],
  white: [255, 255, 255]
}

const exportPDF = (filteredRecords, totalsByType, formatDate, notify) => {
  const doc = new jsPDF()
  
  const today = new Date()
  const fileName = `isd-report-${today.toISOString().split('T')[0]}`
  const headerHeight = 45

  doc.addImage('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMkwyIDdMMTIgMTJMMjIgN0wxMCAyWiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMiAxN0wxMiAyMkwxNiA3IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yIDEyTDEyIDE3TDIyIDEyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==', 'PNG', 14, 14, 18, 18)

  doc.setFillColor(...COLORS.dark)
  doc.rect(0, 0, 210, headerHeight, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ISD - SISTEMA DE AUDITORÍA INDUSTRIAL', 40, 18)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Reporte de Producción', 40, 26)

  doc.setFontSize(8)
  doc.text(`Planta Central | ${today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} | ${today.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 40, 34)

  const summaryY = headerHeight + 12

  doc.setFillColor(...COLORS.light)
  doc.roundedRect(14, summaryY, 182, 28, 3, 3, 'F')

  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN EJECUTIVO', 20, summaryY + 8)

  const summaryItems = [
    { label: 'Registros', value: filteredRecords.length.toLocaleString(), color: COLORS.primary },
    { label: 'Paneles', value: `${totalsByType.unidades.toLocaleString()} u.`, color: COLORS.primary },
    { label: 'Resortes', value: `${totalsByType.millares.toLocaleString()} mil.`, color: COLORS.secondary },
    { label: 'Total', value: (totalsByType.unidades + totalsByType.millares).toLocaleString(), color: COLORS.dark }
  ]

  const boxWidth = 42
  const boxStartX = 20
  const boxGap = 45

  summaryItems.forEach((item, i) => {
    const x = boxStartX + (i * boxGap)

    doc.setFillColor(...item.color)
    doc.roundedRect(x, summaryY + 12, boxWidth, 12, 2, 2, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(item.label.toUpperCase(), x + 4, summaryY + 18)

    doc.setFontSize(9)
    doc.text(item.value, x + 4, summaryY + 23)
  })

  const tableData = filteredRecords.map((r, i) => [
    i + 1,
    formatDate(r.fechaTimestamp),
    r.productoNombre || '-',
    r.moduloId || '-',
    r.trabajadorNombre || '-',
    r.lecturaMaquina ? r.lecturaMaquina.toLocaleString() : '-',
    r.cantidad ? `${r.cantidad.toLocaleString()} ${isMillarRecord(r) ? 'mil.' : 'u.'}` : '-',
    r.maquinaId || '-'
  ])

  autoTable(doc, {
    startY: summaryY + 36,
    head: [['#', 'FECHA', 'PRODUCTO', 'ÁREA', 'TRABAJADOR', 'LECTURA', 'TOTAL', 'MÁQUINA']],
    body: tableData,
    styles: {
      fontSize: 7,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.white,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      textColor: COLORS.dark,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: COLORS.light
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 22 },
      2: { cellWidth: 40 },
      3: { cellWidth: 20 },
      4: { cellWidth: 30 },
      5: { halign: 'right', cellWidth: 18 },
      6: { halign: 'right', cellWidth: 22 },
      7: { cellWidth: 28 }
    },
    margin: { left: 14, right: 14 }
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...COLORS.dark)
    doc.rect(0, 287, 210, 10, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`ISD v2.0 | Producción Industrial`, 14, 293)
    doc.text(`Página ${i} de ${pageCount}`, 160, 293)
    doc.text('CONFIDENCIAL', 95, 293, { align: 'center' })
  }

  doc.save(`${fileName}.pdf`)
  notify('Reporte PDF exportado exitosamente', 'success')
}

export const Dashboard = memo(function Dashboard() {
  const { notify } = useNotification()
  const [filterText, setFilterText] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const records = useLiveQuery(() => db.records.toArray(), []) || []

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

  const totalsByType = useMemo(() => {
    const result = { unidades: 0, millares: 0 }
    filteredRecords.forEach(r => {
      const cantidad = r.cantidad || 0
      if (isMillarRecord(r)) {
        result.millares += cantidad
      } else {
        result.unidades += cantidad
      }
    })
    return result
  }, [filteredRecords])

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRecords.slice(start, start + itemsPerPage)
  }, [filteredRecords, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  const handleItemsPerPageChange = useCallback((size) => {
    setItemsPerPage(size)
    setCurrentPage(1)
  }, [])

  const formatDate = useCallback((ts) => {
    if (!ts) return '-'
    const d = new Date(ts)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }, [])

  const handleExportPDF = useCallback(() => {
    exportPDF(filteredRecords, totalsByType, formatDate, notify)
  }, [filteredRecords, totalsByType, formatDate, notify])

  return (
    <motion.div className="dashboard-elite-view" variants={containerVariants} initial="hidden" animate="visible">
      <motion.header className="elite-header" variants={headerVariants}>
        <div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="brand-badge">
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
              <span className="value">
                {totalsByType.unidades.toLocaleString()} <small>u.</small> / {totalsByType.millares.toLocaleString()} <small>mil.</small>
              </span>
            </div>
            <motion.div className="pulse-effect" animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }} aria-hidden="true" />
          </motion.div>
        </div>
      </motion.header>

      <motion.div className="control-surface glass" variants={headerVariants}>
        <div className="search-container-premium">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input type="text" placeholder="Filtrar por operario, producto o máquina..." value={filterText} onChange={(e) => setFilterText(e.target.value)} aria-label="Buscar registros" />
        </div>

        <div className="action-hub">
          <button className="btn-elite secondary" aria-label="Aplicar filtros"><Filter size={16} aria-hidden="true" /> Filtros</button>
          <button className="btn-elite secondary" onClick={handleExportPDF} aria-label="Exportar datos PDF"><Download size={16} aria-hidden="true" /> Exportar</button>
          <button className="btn-elite danger" onClick={handleClear} aria-label="Limpiar base de datos"><Trash2 size={16} aria-hidden="true" /> Limpiar</button>
        </div>
      </motion.div>

      <motion.div className="table-viewport glass" variants={tableVariants}>
        <table className="elite-table" role="grid" aria-label="Registros de producción">
          <thead>
            <tr>
              <th className="th-elite th-sortable" scope="col" onClick={toggleSort} role="columnheader" aria-sort={sortOrder === 'desc' ? 'descending' : 'ascending'}>
                <Calendar size={12} /> FECHA
                <span className="sort-indicator">{sortOrder === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</span>
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
                paginatedRecords.map((r, i) => {
                  const isResorte = isMillarRecord(r)
                  return (
                    <motion.tr key={r.idLocal || i} variants={rowVariants} layout whileHover="hover" whileTap="tap" className="audit-row">
                      <td className="td-elite date-cell">{formatDate(r.fechaTimestamp)}</td>
                      <td className="td-elite product-cell">{r.productoNombre}</td>
                      <td className="td-elite"><span className="area-badge">{r.moduloId}</span></td>
                      <td className="td-elite worker-cell" style={{ textAlign: 'left' }}>{r.trabajadorNombre}</td>
                      <td className="td-elite text-right output-cell">{r.lecturaMaquina && r.lecturaMaquina !== 0 ? r.lecturaMaquina : ''}</td>
                      <td className="td-elite text-right total-cell">
                        {r.cantidad.toLocaleString()} 
                        <span className="unit-badge" style={{ marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', background: isResorte ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: isResorte ? '#10b981' : '#3b82f6' }}>
                          {isResorte ? 'mil.' : 'u.'}
                        </span>
                      </td>
                      <td className="td-elite">
                        <span className="machine-chip" style={{ background: isResorte ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: isResorte ? '#10b981' : '#3b82f6', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>
                          {r.maquinaId || 'Sin Máquina'}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalRecords={filteredRecords.length}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </motion.div>
  )
})