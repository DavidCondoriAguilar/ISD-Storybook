import { motion as m } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

export const ImportOptions = ({ validateBeforeImport, onToggleValidation }) => (
  <div className="import-options-card">
    <m.label className="checkbox-label" whileHover={{ x: 5 }}>
      <m.input 
        type="checkbox" 
        checked={validateBeforeImport}
        onChange={(e) => onToggleValidation(e.target.checked)}
        className="custom-checkbox"
      />
      <div className="checkbox-text-group">
        <span className="checkbox-title">
          <ShieldCheck size={20} color="var(--success)" /> Validación de Integridad Estricta
        </span>
        <span className="checkbox-description">
          Comprueba duplicados, esquemas relacionales y formatos de operarios antes de la carga final al ERP.
        </span>
      </div>
    </m.label>
  </div>
)
