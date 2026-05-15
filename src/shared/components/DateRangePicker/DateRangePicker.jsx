import React, { createContext, use, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import './DateRangePicker.css';

const DateRangeContext = createContext(null);

const PRESETS = [
  { id: 'day', label: 'Hoy' },
  { id: '7', label: 'Últimos 7 días' },
  { id: '30', label: 'Últimos 30 días' },
  { id: 'all', label: 'Todo' },
];

export const DateRangePicker = memo(({
  timeRange,
  startDate: initialStartDate,
  endDate: initialEndDate,
  onApply,
  isFilterOpen,
  setIsFilterOpen
}) => {
  const value = {
    timeRange, startDate: initialStartDate, endDate: initialEndDate,
    onApply, isFilterOpen, setIsFilterOpen
  };

  return (
    <DateRangeContext.Provider value={value}>
      <div className="filter-dropdown">
        <DateRangePicker.Trigger />
        <AnimatePresence>
          {isFilterOpen && <DateRangePicker.Menu />}
        </AnimatePresence>
      </div>
    </DateRangeContext.Provider>
  );
});

DateRangePicker.Trigger = function DateRangeTrigger() {
  const { timeRange, startDate, isFilterOpen, setIsFilterOpen } = use(DateRangeContext);

  const getRangeLabel = () => {
    if (timeRange === 'all') return 'Todo el tiempo';
    if (timeRange === 'day') return startDate || 'Hoy';
    if (timeRange === '7') return 'Últimos 7 días';
    if (timeRange === '30') return 'Últimos 30 días';
    return 'Filtrar fecha';
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
  const { timeRange, onApply, setIsFilterOpen } = use(DateRangeContext);
  const [localDate, setLocalDate] = React.useState('');

  const apply = (range, start, end) => {
    if (typeof onApply === 'function') onApply(range, start, end);
    setIsFilterOpen(false);
  };

  return (
    <motion.div
      className="filter-menu glass"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
    >
      <div className="filter-options">
        {PRESETS.map(opt => (
          <button
            key={opt.id}
            className={timeRange === opt.id ? 'active' : ''}
            onClick={() => {
              if (opt.id === 'day') {
                const today = format(new Date(), 'yyyy-MM-dd');
                setLocalDate(today);
                apply('day', today, today);
              } else {
                apply(opt.id, '', '');
              }
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="custom-range-selector">
        <div className="date-input-group">
          <label>Fecha específica</label>
          <div className="input-with-icon">
            <Calendar size={14} className="input-icon" />
            <input
              type="date"
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
            />
          </div>
        </div>
        {localDate && (
          <button className="apply-btn" onClick={() => apply('day', localDate, localDate)}>
            Ver día
          </button>
        )}
      </div>
    </motion.div>
  );
};
