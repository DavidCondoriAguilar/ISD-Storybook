import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown } from 'lucide-react'
import './DateRangePicker.css'

export const DateRangePicker = memo(({ 
  timeRange, 
  setTimeRange, 
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isFilterOpen, 
  setIsFilterOpen 
}) => {
  const getRangeLabel = () => {
    if (timeRange === 'all') return 'Historial Completo'
    if (timeRange === 'day') return startDate ? `Día: ${startDate}` : 'Seleccionar Día'
    if (timeRange === 'custom') {
      if (startDate && endDate) return `${startDate} → ${endDate}`
      return 'Rango Personalizado'
    }
    return `Últimos ${timeRange || '7'} días`
  }

  return (
    <div className="filter-dropdown">
      <button className="filter-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
        <Calendar size={18} />
        <span>{getRangeLabel()}</span>
        <ChevronDown size={16} />
      </button>
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            className="filter-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="filter-options">
              <button 
                className={timeRange === 'day' ? 'active' : ''} 
                onClick={() => setTimeRange('day')}
              >
                Un día específico...
              </button>
              <button 
                className={timeRange === 'custom' ? 'active' : ''} 
                onClick={() => setTimeRange('custom')}
              >
                Rango personalizado...
              </button>
              <button 
                className={timeRange === '7' ? 'active' : ''} 
                onClick={() => { setTimeRange('7'); setIsFilterOpen(false); }}
              >
                Últimos 7 días
              </button>
              <button 
                className={timeRange === '30' ? 'active' : ''} 
                onClick={() => { setTimeRange('30'); setIsFilterOpen(false); }}
              >
                Últimos 30 días
              </button>
              <button 
                className={timeRange === 'all' ? 'active' : ''} 
                onClick={() => { setTimeRange('all'); setIsFilterOpen(false); }}
              >
                Todo el tiempo
              </button>
            </div>

            {timeRange === 'day' && (
              <div className="custom-range-selector" onClick={(e) => e.stopPropagation()}>
                <div className="date-input-group">
                  <label>Seleccionar Fecha:</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setEndDate(e.target.value); // Para el día único, inicio = fin
                    }} 
                  />
                </div>
                <button 
                  className="apply-btn"
                  onClick={() => setIsFilterOpen(false)}
                  disabled={!startDate}
                >
                  Ver este día
                </button>
              </div>
            )}

            {timeRange === 'custom' && (
              <div className="custom-range-selector" onClick={(e) => e.stopPropagation()}>
                <div className="date-input-group">
                  <label>Desde:</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                </div>
                <div className="date-input-group">
                  <label>Hasta:</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                </div>
                <button 
                  className="apply-btn"
                  onClick={() => setIsFilterOpen(false)}
                  disabled={!startDate || !endDate}
                >
                  Aplicar Rango
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
