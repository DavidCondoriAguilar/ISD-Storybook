import { motion as m } from 'framer-motion'
import { XCircle, CheckCircle, ArrowRight } from 'lucide-react'

export const ImportActions = ({ onReset, onStart, isFileReady }) => (
  <div className="import-actions">
    <m.button 
      className="btn-cancel-large" 
      onClick={onReset}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <XCircle size={20} /> Cancelar Trámite
    </m.button>
    <m.button 
      className="btn-start-large" 
      onClick={onStart}
      disabled={!isFileReady}
      whileHover={isFileReady ? { scale: 1.02 } : {}}
      whileTap={isFileReady ? { scale: 0.98 } : {}}
    >
      <CheckCircle size={22} /> Iniciar Sincronización <ArrowRight size={20} />
    </m.button>
  </div>
)
