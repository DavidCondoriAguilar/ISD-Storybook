import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  AlertCircle
} from 'lucide-react'
import './ResultModal.css'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 120,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: { duration: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
}

export function ResultModal({ result, summary, onClose, onRetry, onDownload }) {
  const isSuccess = result === 'success'
  
  const formattedUnits = useMemo(() => {
    return summary.units?.toLocaleString() || 0
  }, [summary.units])

  return (
    <motion.div 
      className="result-modal"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
    >
      <div className="result-header">
        <motion.div 
          className="result-icon-wrapper"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          role="img"
          aria-label={isSuccess ? 'Éxito' : 'Error'}
        >
          {isSuccess ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
        </motion.div>
        
        <h2 id="result-modal-title">
          {isSuccess ? 'Sincronización Exitosa' : 'Reporte de Anomalías'}
        </h2>
        <p>
          {isSuccess ? 'Registros inyectados al Dashboard.' : 'Fallas críticas detectadas.'}
        </p>
      </div>

      <motion.div 
        className="result-summary-grid"
        variants={itemVariants}
        role="status"
        aria-live="polite"
      >
        <div className="summary-item">
          <span className="summary-value success">{summary.success}</span>
          <span className="summary-label">Validados</span>
        </div>
        <div className="summary-item">
          <span className="summary-value failed">{summary.failed}</span>
          <span className="summary-label">Fallidos</span>
        </div>
        <div className="summary-item full-width">
          <span className="summary-value">{formattedUnits}</span>
          <span className="summary-label">Unidades</span>
        </div>
      </motion.div>

      {summary.duplicatesDetected > 0 && (
        <div className="duplicates-warning" role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>
            Se omitieron {summary.duplicatesDetected} registros que ya existían en la base de datos.
          </span>
        </div>
      )}

      {summary.errors && summary.errors.length > 0 && (
        <motion.div 
          className="error-list"
          variants={itemVariants}
          role="alert"
          aria-live="assertive"
        >
          <h3>
            <AlertCircle size={16} aria-hidden="true" />
            Errores Detectados
          </h3>
          <div className="error-scroll">
            {summary.errors.map((error, idx) => (
              <div key={idx} className="error-item">
                <span aria-hidden="true">•</span> {error.message}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div 
        className="result-actions"
        variants={itemVariants}
      >
        <button 
          onClick={onClose}
          className="btn-primary"
        >
          Ir al Dashboard
        </button>
        {onDownload && (
          <button 
            onClick={onDownload}
            className="btn-secondary"
            aria-label="Descargar reporte"
          >
            <Download size={20} aria-hidden="true" />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}