import { Search, Download, Trash2 } from 'lucide-react'

export const DashboardHeader = ({ filterText, onFilterChange, onExport, onClear }) => (
  <div className="control-surface">
    {/* Main Search hidden for now
    <div className="search-container-premium">
      <Search className="search-icon" size={18} />
      <input 
        type="text" 
        placeholder="Buscar por operario, producto o área..." 
        value={filterText}
        onChange={(e) => onFilterChange(e.target.value)}
      />
    </div>
    */}
    <div className="action-hub">
      {/* Export button hidden for now
      <button className="btn-elite secondary" onClick={onExport}>
        <Download size={16} /> Exportar
      </button>
      */}
      <button className="btn-elite danger" onClick={onClear}>
        <Trash2 size={16} /> Limpiar
      </button>
    </div>
  </div>
)
