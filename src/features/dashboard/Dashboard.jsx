import { memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layers, Hash, TrendingUp, Calendar, Package, Factory, User as UserIcon, Cpu
} from 'lucide-react'

import { db } from '../../data/db'
import { useDashboardRecords } from './hooks/useDashboardRecords'
import { dashboardService } from './services/dashboardService'
import { useNotification } from '../../context/NotificationContext'

import { StatCard } from './components/StatCard'
import { DashboardHeader } from './components/DashboardHeader'
import { Pagination } from './components/common/Pagination/Pagination'

import './Dashboard.css'

const Dashboard = memo(function Dashboard() {
  const { notify } = useNotification()
  const {
    records,
    allFilteredRecords,
    totalCount,
    filterText,
    setFilterText,
    sortOrder,
    toggleSort,
    pagination
  } = useDashboardRecords()

  const totals = useMemo(() => 
    dashboardService.calculateTotals(allFilteredRecords), 
  [allFilteredRecords])

  const handleExport = useCallback(() => {
    dashboardService.exportToPDF(allFilteredRecords, totals, notify)
  }, [allFilteredRecords, totals, notify])

  const handleClear = useCallback(async () => {
    if (window.confirm('¿Eliminar todos los registros?')) {
      await db.records.clear()
      notify('Base de datos limpiada', 'info')
    }
  }, [notify])

  return (
    <motion.div 
      className="dashboard-elite-view" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <header className="elite-header">
        <div>
          <div className="brand-badge">PLANTA CENTRAL</div>
          <h1 className="main-title">Monitor <span className="highlight">Planta</span></h1>
          <p className="subtitle">Auditoría y control de registros de producción.</p>
        </div>
        
        <div className="kpi-group">
          <StatCard title="REGISTROS" value={totalCount} icon={<Hash size={16} />} color="blue" />
          <StatCard 
            title="PRODUCCIÓN NETA" 
            value={totals.unidades.toLocaleString()} 
            subValue="u."
            icon={<TrendingUp size={16} />} 
            color="green" 
          />
          <StatCard 
            title="VOLUMEN RESORTES" 
            value={totals.millares.toLocaleString()} 
            subValue="mil."
            icon={<Layers size={16} />} 
            color="purple" 
          />
        </div>
      </header>

      <DashboardHeader 
        filterText={filterText}
        onFilterChange={setFilterText}
        onExport={handleExport}
        onClear={handleClear}
      />

      <div className="table-viewport">
        <table className="elite-table">
          <thead>
            <tr>
              <th onClick={toggleSort} className="th-elite th-sortable">
                <Calendar size={12} /> FECHA {sortOrder === 'desc' ? '▼' : '▲'}
              </th>
              <th className="th-elite"><Package size={12} /> PRODUCTO</th>
              <th className="th-elite"><Factory size={12} /> ÁREA</th>
              <th className="th-elite"><UserIcon size={12} /> TRABAJADOR</th>
              <th className="th-elite text-right"><TrendingUp size={12} /> TOTAL</th>
              <th className="th-elite"><Cpu size={12} /> MÁQUINA</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No se encontraron registros</td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <motion.tr 
                    key={r.idLocal || i}
                    className="audit-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="td-elite date-cell">
                      {new Date(r.fechaTimestamp).toLocaleDateString('es-ES')}
                    </td>
                    <td className="td-elite product-cell">{r.productoNombre}</td>
                    <td className="td-elite"><span className="area-badge">{r.area || 'General'}</span></td>
                    <td className="td-elite worker-cell">{r.trabajadorNombre}</td>
                    <td className="td-elite text-right total-cell">
                      {r.cantidad?.toLocaleString()} <span className="unit">{r.unidad || 'u.'}</span>
                    </td>
                    <td className="td-elite"><code className="machine-chip">{r.maquinaId}</code></td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination hidden for now
      <div className="pagination-wrapper">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.itemsPerPage}
          totalRecords={totalCount}
          onPageChange={pagination.setCurrentPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
        />
      </div>
      */}
    </motion.div>
  )
})

export { Dashboard }