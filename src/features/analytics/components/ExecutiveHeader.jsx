import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown, Search } from 'lucide-react'

export const ExecutiveHeader = ({ 
  timeRange, 
  setTimeRange, 
  searchTerm, 
  setSearchTerm, 
  isFilterOpen, 
  setIsFilterOpen 
}) => (
  <header className="exec-header">
    <div className="header-left">
      <h1 className="exec-title">Dashboard <span className="highlight">Estratégico ISD</span></h1>
      <p className="exec-subtitle">Inteligencia ISD • Planta San Juan</p>
    </div>
    
    <div className="header-actions">
      {/* Global Search - Can be easily commented out if needed */}
      <div className="exec-search">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Filtrar analíticas..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="filter-dropdown">
        <button className="filter-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <Calendar size={18} />
          <span>{timeRange === 'all' ? 'Historial Completo' : `Últimos ${timeRange} días`}</span>
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
              <button onClick={() => { setTimeRange(1); setIsFilterOpen(false); }}>Hoy</button>
              <button onClick={() => { setTimeRange(7); setIsFilterOpen(false); }}>Últimos 7 días</button>
              <button onClick={() => { setTimeRange(30); setIsFilterOpen(false); }}>Últimos 30 días</button>
              <button onClick={() => { setTimeRange('all'); setIsFilterOpen(false); }}>Todo el tiempo</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="live-indicator">
        <span className="dot"></span> LIVE
      </div>
    </div>
  </header>
)
