import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { DataTable } from '../../shared/components/DataTable'
import { useState } from 'react'

import './Dashboard.css'

const Dashboard = memo(function Dashboard() {
  const navigate = useNavigate()
  const [selectedModule, setSelectedModule] = useState('Todos')
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

      {/* Filtro de Módulos Estratégico */}
      <div className="filter-container-executive glass" style={{ marginTop: '2rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="filter-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Filtrar Vista:</span>
        {['Todos', 'Paneles', 'Telas', 'Pegado', 'Sellado'].map(mod => (
          <button 
            key={mod}
            className={`filter-chip ${selectedModule === mod ? 'active' : ''}`}
            onClick={() => setSelectedModule(mod)}
          >
            {mod}
          </button>
        ))}
      </div>

      <div className="audit-preview-section" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Vista Consolidada: {selectedModule}</h2>
        <p className="section-subtitle">Movimientos más recientes registrados en el sistema.</p>
        
        <DataTable 
          columns={[
            { 
              key: 'fechaTimestamp', 
              label: 'Fecha', 
              render: (v) => v ? new Date(v).toLocaleDateString('es-ES') : 'N/A' 
            },
            { key: 'trabajadorNombre', label: 'Operador' },
            { key: 'area', label: 'Área' },
            { 
              key: 'cantidad', 
              label: 'Total',
              render: (v, row) => `${v?.toLocaleString() ?? 0} ${row.unidad ?? 'u.'}`
            }
          ]}
          data={records
            .filter(r => selectedModule === 'Todos' || r.area?.toLowerCase() === selectedModule.toLowerCase())
            .slice(0, 20)
          } 
          isLoading={false}
        />
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