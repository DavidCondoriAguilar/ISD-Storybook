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
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isFilterOpen, 
  setIsFilterOpen 
}) => {
  const value = {
    timeRange, setTimeRange,
    startDate, setStartDate,
    endDate, setEndDate,
    isFilterOpen, setIsFilterOpen
  };

  return (
    <DateRangeContext.Provider value={value}>
      <div className="filter-dropdown">
        <DateRangePicker.Trigger />
        <AnimatePresence>
          {isFilterOpen && (
            <DateRangePicker.Menu />
          )}
        </AnimatePresence>
      </div>
    </DateRangeContext.Provider>
  );
});

DateRangePicker.Trigger = function DateRangeTrigger() {
  const { timeRange, startDate, endDate, isFilterOpen, setIsFilterOpen } = use(DateRangeContext);
  
  const getRangeLabel = () => {
    if (timeRange === 'all') return 'Historial Completo';
    if (timeRange === 'day') return startDate ? `Día: ${startDate}` : 'Seleccionar Día';
    if (timeRange === 'custom') {
      if (startDate && endDate) return `${startDate} → ${endDate}`;
      return 'Rango Personalizado';
    }
    return `Últimos ${timeRange || '7'} días`;
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
  const { timeRange, startDate, setStartDate, endDate, setEndDate, setIsFilterOpen } = use(DateRangeContext);

  if (timeRange !== 'day' && timeRange !== 'custom') return null;

  return (
    <div className="custom-range-selector" onClick={(e) => e.stopPropagation()}>
      <div className="date-input-group">
        <label>{timeRange === 'day' ? 'Seleccionar Fecha:' : 'Desde:'}</label>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => {
            setStartDate(e.target.value);
            if (timeRange === 'day') setEndDate(e.target.value);
          }} 
        />
      </div>
      
      {timeRange === 'custom' && (
        <div className="date-input-group">
          <label>Hasta:</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>
      )}

      <button 
        className="apply-btn"
        onClick={() => setIsFilterOpen(false)}
        disabled={!startDate || (timeRange === 'custom' && !endDate)}
      >
        {timeRange === 'day' ? 'Ver este día' : 'Aplicar Rango'}
      </button>
    </div>
  );
};
