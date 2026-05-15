import React, { createContext, use, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import './DateRangePicker.css';

const DateRangeContext = createContext(null);

/**
 * DateRangePicker Compound Component
 * Pattern: architecture-compound-components
 */
export const DateRangePicker = memo(({ 
  timeRange, 
  setTimeRange, 
  startDate: initialStartDate,
  endDate: initialEndDate,
  onApply,
  isFilterOpen, 
  setIsFilterOpen 
}) => {
  // Estado local para "borrador" de selección
  const [localRange, setLocalRange] = React.useState(timeRange);
  const [localStart, setLocalStart] = React.useState(initialStartDate);
  const [localEnd, setLocalEnd] = React.useState(initialEndDate);

  // Sincronizar cuando se abre
  React.useEffect(() => {
    if (isFilterOpen) {
      setLocalRange(timeRange);
      setLocalStart(initialStartDate);
      setLocalEnd(initialEndDate);
    }
  }, [isFilterOpen, timeRange, initialStartDate, initialEndDate]);

  const value = {
    timeRange: localRange, 
    setTimeRange: setLocalRange,
    startDate: localStart, 
    setStartDate: setLocalStart,
    endDate: localEnd, 
    setEndDate: setLocalEnd,
    executeApply: () => {
      if (typeof onApply === 'function') {
        onApply(localRange, localStart, localEnd);
      }
      setIsFilterOpen(false);
    },
    isFilterOpen, 
    setIsFilterOpen
  };

  return (
    <DateRangeContext.Provider value={value}>
      <div className="filter-dropdown">
        <DateRangePicker.Trigger initialRange={timeRange} initialStart={initialStartDate} />
        <AnimatePresence>
          {isFilterOpen && (
            <DateRangePicker.Menu />
          )}
        </AnimatePresence>
      </div>
    </DateRangeContext.Provider>
  );
});

DateRangePicker.Trigger = function DateRangeTrigger({ initialRange, initialStart }) {
  const { isFilterOpen, setIsFilterOpen } = use(DateRangeContext);
  
  const getRangeLabel = () => {
    if (initialRange === 'all') return 'Historial Completo';
    if (initialRange === 'day') return initialStart ? `Día: ${initialStart}` : 'Seleccionar Día';
    if (initialRange === 'custom') return 'Rango Personalizado';
    return `Últimos ${initialRange || '7'} días`;
  };

  return (
    <button className="filter-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
      <Calendar size={18} />
      <span>{getRangeLabel()}</span>
      <ChevronDown size={16} className={isFilterOpen ? 'rotate-180' : ''} />
    </button>
  );
};

DateRangePicker.Menu = function DateRangeMenu() {
  const { timeRange, setTimeRange, setIsFilterOpen } = use(DateRangeContext);

  const options = [
    { id: 'day', label: 'Un día específico...' },
    { id: 'custom', label: 'Rango personalizado...' },
    { id: '7', label: 'Últimos 7 días' },
    { id: '30', label: 'Últimos 30 días' },
    { id: 'all', label: 'Todo el tiempo' },
  ];

  return (
    <motion.div 
      className="filter-menu glass"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
    >
      <div className="filter-options">
        {options.map(opt => (
          <button 
            key={opt.id}
            className={timeRange === opt.id ? 'active' : ''} 
            onClick={() => {
              setTimeRange(opt.id);
              if (opt.id !== 'day' && opt.id !== 'custom') setIsFilterOpen(false);
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <DateRangePicker.CustomSelectors />
    </motion.div>
  );
};

DateRangePicker.CustomSelectors = function DateRangeCustomSelectors() {
  const { timeRange, setTimeRange, startDate, setStartDate, endDate, setEndDate, executeApply } = use(DateRangeContext);

  if (timeRange !== 'day' && timeRange !== 'custom') return null;

  return (
    <div className="custom-range-selector" onClick={(e) => e.stopPropagation()}>
      <div className="date-input-group">
        <label>{timeRange === 'day' ? 'Seleccionar Fecha:' : 'Desde:'}</label>
        <div className="input-with-icon">
          <Calendar size={14} className="input-icon" />
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => {
              const val = e.target.value;
              setStartDate(val);
              if (timeRange === 'day') setEndDate(val);
            }} 
          />
        </div>
      </div>
      
      {timeRange === 'custom' && (
        <div className="date-input-group">
          <label>Hasta:</label>
          <div className="input-with-icon">
            <Calendar size={14} className="input-icon" />
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
        </div>
      )}

      <button 
        className="apply-btn"
        onClick={executeApply}
        style={{ opacity: 1 }}
      >
        {timeRange === 'day' ? 'Ver este día' : 'Aplicar Rango'}
      </button>
    </div>
  );
};
