import { Search } from 'lucide-react'

export const ExecutiveHeader = ({
  searchTerm,
  setSearchTerm,
  children
}) => {
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

        {/* Aquí es donde se inyectan el Selector de Módulo y el DateRangePicker */}
        {children}

        <div className="live-indicator">
          <span className="dot"></span> EN VIVO
        </div>
      </div>
    </header>
  )
}
