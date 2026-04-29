import { Search } from 'lucide-react'
import { DateRangePicker } from '../../../components/ui/DateRangePicker/DateRangePicker'

export const ExecutiveHeader = ({
  timeRange,
  setTimeRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchTerm,
  setSearchTerm,
  isFilterOpen,
  setIsFilterOpen
}) => {
  const dateRangeProps = {
    timeRange, setTimeRange,
    startDate, setStartDate,
    endDate, setEndDate,
    isFilterOpen, setIsFilterOpen
  }

  return (
    <header className="exec-header">
      <div className="header-left">
        <h1 className="exec-title">Dashboard <span className="highlight">Estratégico ISD</span></h1>
        <p className="exec-subtitle">Inteligencia Operativa • {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="header-actions">
        {/* Global Search */}
        <div className="exec-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Filtrar por trabajador, producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DateRangePicker {...dateRangeProps} />

        <div className="live-indicator">
          <span className="dot"></span> EN VIVO
        </div>
      </div>
    </header>
  )
}
