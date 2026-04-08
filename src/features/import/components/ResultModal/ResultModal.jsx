import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RotateCw, 
  Download, 
  FileCheck,
  Package,
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

  return (
    <motion.div 
      className="result-modal"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ padding: '64px 48px', maxWidth: '700px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
    >
      <div className="result-header">
        <motion.div 
          className="result-icon-wrapper"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }}
          style={{ 
            width: '100px', 
            height: '100px', 
            margin: '0 auto 24px', 
            background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            color: isSuccess ? 'var(--success)' : 'var(--danger)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          {isSuccess ? <CheckCircle2 size={48} /> : <AlertTriangle size={48} />}
        </motion.div>
        <motion.h2 variants={itemVariants} style={{ fontSize: '2.5rem', fontWeight: 850 }}>
          {isSuccess ? '¡Proceso Completado!' : 'Sincronización Interrumpida'}
        </motion.h2>
        <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem', marginTop: '12px' }}>
          {isSuccess ? 'Los registros han sido validados e integrados al sistema' : 'Se encontraron inconsistencias en el origen de datos'}
        </motion.p>
      </div>

      <motion.div 
        className="result-summary-grid"
        variants={itemVariants}
        style={{ padding: '32px', background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', margin: '40px 0' }}
      >
        <div className="summary-item" style={{ textAlign: 'center' }}>
          <FileCheck size={20} color="var(--success)" style={{ margin: '0 auto 12px' }} />
          <span className="summary-value" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{summary.success}</span>
          <span className="summary-label" style={{ fontWeight: 800 }}>Validados</span>
        </div>
        <div className="summary-item" style={{ textAlign: 'center' }}>
          <AlertCircle size={20} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
          <span className="summary-value" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>{summary.failed}</span>
          <span className="summary-label" style={{ fontWeight: 800 }}>Fallidos</span>
        </div>
        <div className="summary-item" style={{ textAlign: 'center' }}>
          <Package size={20} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <span className="summary-value" style={{ fontSize: '2rem', fontWeight: 800 }}>{summary.units?.toLocaleString() || 0}</span>
          <span className="summary-label" style={{ fontWeight: 800 }}>Unidades</span>
        </div>
      </motion.div>

      {summary.errors && summary.errors.length > 0 && (
        <motion.div 
          className="error-list"
          variants={itemVariants}
          style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '32px' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#991b1b', fontWeight: 800, fontSize: '1rem', marginBottom: '16px' }}>
            <AlertCircle size={18} /> Detalle de Rechazos
          </h3>
          <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '12px' }}>
            {summary.errors.map((error, idx) => (
              <div key={idx} className="error-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid #fee2e2' }}>
                <span style={{ minWidth: '80px', fontSize: '0.75rem', fontWeight: 800, color: 'white', background: '#dc2626', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
                  FILA {error.row || '?'}
                </span>
                <span className="error-text" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#991b1b' }}>{error.message}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div 
        className="result-actions"
        variants={itemVariants}
        style={{ display: 'flex', gap: '16px', marginTop: '16px' }}
      >
        {onRetry && (
          <motion.button 
            className="btn-retry" 
            onClick={onRetry}
            whileHover={{ scale: 1.05, y: -2, background: 'var(--warning-dark)' }}
            whileTap={{ scale: 0.98 }}
            style={{ flex: 1, padding: '16px', background: 'var(--warning)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <RotateCw size={18} /> Reintentar Carga
          </motion.button>
        )}
        {onDownload && (
          <motion.button 
            className="btn-download" 
            onClick={onDownload}
            whileHover={{ scale: 1.05, y: -2, background: 'var(--bg-app)' }}
            whileTap={{ scale: 0.98 }}
            style={{ flex: 1, padding: '16px', background: 'white', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={18} /> Exportar Reporte
          </motion.button>
        )}
        <motion.button 
          className="btn-close" 
          onClick={onClose}
          whileHover={{ scale: 1.05, y: -2, background: 'var(--text-main)' }}
          whileTap={{ scale: 0.98 }}
          style={{ flex: 1, padding: '16px', background: '#0f172a', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <X size={18} /> Salir al Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
