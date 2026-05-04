import { Search, Download, Trash2 } from 'lucide-react'
import { DateRangePicker } from '../../../shared/components/DateRangePicker/DateRangePicker'

export const DashboardHeader = ({ 
  filterText, onFilterChange, onExport, onClear,
  dateRangeProps 
}) => (
  <div className="control-surface">
    <div className="search-container-premium">
      <Search className="search-icon" size={18} />
      <input 
        type="text" 
        placeholder="Buscar por operario, producto..." 
        value={filterText}
        onChange={(e) => onFilterChange(e.target.value)}
      />
    </div>
    
    <div className="action-hub">
      <DateRangePicker {...dateRangeProps} />
      
      <button className="btn-elite secondary" onClick={onExport}>
        <Download size={16} /> Exportar
      </button>
      <button className="btn-elite danger" onClick={onClear}>
        <Trash2 size={16} /> Limpiar
      </button>
    </div>
  </div>
)
