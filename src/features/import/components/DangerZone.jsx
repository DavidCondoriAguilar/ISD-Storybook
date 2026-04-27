import { motion as m } from 'framer-motion'
import { Trash2 } from 'lucide-react'

export const DangerZone = ({ onClearHistory }) => (
  <div className="danger-zone">
     <div className="danger-box">
        <div className="danger-text">
           <h4 className="danger-title">Zona Crítica</h4>
           <p className="danger-description">Borra permanentemente todos los registros, duplicados y auditorías del sistema.</p>
        </div>
        <m.button 
           className="btn-danger-outline"
           onClick={onClearHistory}
           whileHover={{ scale: 1.05, background: 'var(--danger)', color: 'white' }}
           whileTap={{ scale: 0.95 }}
        >
           <Trash2 size={16} /> Limpiar Base de Datos
        </m.button>
     </div>
  </div>
)
