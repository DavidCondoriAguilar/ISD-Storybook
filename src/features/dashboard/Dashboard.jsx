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
    timeRange, setTimeRange,
    startDate, setStartDate,
    endDate, setEndDate,
    isFilterOpen, setIsFilterOpen,
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

  const dateRangeProps = {
    timeRange, setTimeRange,
    startDate, setStartDate,
    endDate, setEndDate,
    isFilterOpen, setIsFilterOpen
  }

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
          <StatCard 
            title="AUDITORÍA" 
            value={totalCount} 
            icon={<Hash size={16} />} 
            color="blue" 
            subValue="Registros"
          />
          <StatCard 
            title="PRODUCCIÓN NETA" 
            value={totals.unidades.toLocaleString()} 
            subValue="unidades"
            icon={<TrendingUp size={16} />} 
            color="green" 
          />
          <StatCard 
            title="VOLUMEN RESORTES" 
            value={totals.millares.toLocaleString()} 
            subValue="millares"
            icon={<Layers size={16} />} 
            color="purple" 
          />
          <StatCard 
            title="EFICIENCIA" 
            value={`${totals.efficiency}%`} 
            icon={<Cpu size={16} />} 
            color={Number(totals.efficiency) > 80 ? 'green' : Number(totals.efficiency) > 50 ? 'orange' : 'red'}
            subValue="Promedio Global"
          />
          <StatCard 
            title="FUERZA LABORAL" 
            value={totals.workerCount} 
            icon={<UserIcon size={16} />} 
            color="blue"
            subValue="Operarios"
          />
        </div>
      </header>

      <div className="manager-info-bar">
        <p><strong>Info Gerencial:</strong> El <strong>Total</strong> es la producción final reportada por el trabajador. La <strong>Prod. Máquina</strong> es el valor directo del contador de la máquina. La eficiencia se mide comparando ambos valores.</p>
      </div>

      <DashboardHeader 
        filterText={filterText}
        onFilterChange={setFilterText}
        onExport={handleExport}
        onClear={handleClear}
        dateRangeProps={dateRangeProps}
      />

      <div className="table-viewport">
        <table className="elite-table">
          <thead>
            <tr>
              <th className="th-elite" style={{ width: '40px' }}>#</th>
              <th onClick={toggleSort} className="th-elite th-sortable">
                <Calendar size={12} /> FECHA {sortOrder === 'desc' ? '▼' : '▲'}
              </th>
              <th className="th-elite"><Package size={12} /> PRODUCTO</th>
              <th className="th-elite"><Factory size={12} /> ÁREA</th>
              <th className="th-elite"><UserIcon size={12} /> TRABAJADOR</th>
              <th className="th-elite text-right"><TrendingUp size={12} /> TOTAL (TRA)</th>
              <th className="th-elite text-right"><Cpu size={12} /> PROD. MÁQUINA</th>
              <th className="th-elite"><Factory size={12} /> MÁQUINA</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">No se encontraron registros</td>
                </tr>
              ) : (
                records.map((r, i) => {
                  return (
                    <motion.tr 
                      key={r.idLocal || i}
                      className={`audit-row ${(!r.outputMaquina && r.cantidad > 0) ? 'row-alert' : ''}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      title={(!r.outputMaquina && r.cantidad > 0) ? 'Alerta: Sin lectura de máquina' : ''}
                    >
                      <td className="td-elite row-num-cell" style={{ opacity: 0.5, fontSize: '10px', fontWeight: 'bold' }}>
                        {i + 1}
                        {(!r.outputMaquina && r.cantidad > 0) && <span className="alert-dot">!</span>}
                      </td>
                      <td className="td-elite date-cell">
                        {new Date(r.fechaTimestamp).toLocaleDateString('es-ES')}
                      </td>
                      <td className="td-elite product-cell">{r.productoNombre}</td>
                      <td className="td-elite"><span className="area-badge">{r.area || 'General'}</span></td>
                      <td className="td-elite worker-cell">{r.trabajadorNombre}</td>
                      <td className="td-elite text-right total-cell">
                        {r.cantidad?.toLocaleString()} <span className="unit">{r.unidad || 'u.'}</span>
                      </td>
                      <td className="td-elite text-right machine-output-cell">
                        <div className="output-container">
                          {r.outputMaquina !== null && r.outputMaquina !== undefined ? (
                            <span className="output-val">{r.outputMaquina}</span>
                          ) : (
                            <span className="empty-val">-</span>
                          )}
                        </div>
                      </td>
                      <td className="td-elite"><code className="machine-chip">{r.maquinaId}</code></td>
                    </motion.tr>
                  )
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

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
    </motion.div>
  )
})

export { Dashboard }