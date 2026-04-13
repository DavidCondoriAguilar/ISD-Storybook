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
      style={{ 
        padding: '32px 32px 24px', 
        maxWidth: '440px', 
        margin: '0 auto', 
        background: 'var(--bg-card)', 
        borderRadius: '28px', 
        border: '1px solid var(--border)', 
        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.15)' 
      }}
    >
      <div className="result-header" style={{ textAlign: 'center' }}>
        <motion.div 
          className="result-icon-wrapper"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ 
            width: '60px', 
            height: '60px', 
            margin: '0 auto 16px', 
            background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            color: isSuccess ? 'var(--success)' : 'var(--danger)', 
            borderRadius: '18px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          {isSuccess ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
        </motion.div>
        
        <h2 style={{ fontSize: '1.3rem', fontWeight: 950, letterSpacing: '-0.02em', margin: 0 }}>
          {isSuccess ? 'Sincronización Exitosa' : 'Reporte de Anomalías'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', marginTop: '4px' }}>
          {isSuccess ? 'Registros inyectados al Dashboard.' : 'Fallas críticas detectadas.'}
        </p>
      </div>

      <motion.div 
        className="result-summary-grid"
        variants={itemVariants}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px', 
          padding: '16px', 
          background: 'var(--bg-app)', 
          borderRadius: '20px', 
          margin: '24px 0' 
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 950, color: 'var(--success)' }}>{summary.success}</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Validados</span>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
          <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 950, color: 'var(--danger)' }}>{summary.failed}</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fallidos</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 950 }}>{summary.units?.toLocaleString() || 0}</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unidades</span>
        </div>
      </motion.div>

      {summary.duplicatesDetected > 0 && (
         <div style={{ padding: '12px 20px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.1)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={16} color="var(--warning)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--warning-dark)' }}>
               Se omitieron {summary.duplicatesDetected} registros que ya existían en la base de datos.
            </span>
         </div>
      )}

      {summary.errors && summary.errors.length > 0 && (
        <motion.div 
          variants={itemVariants}
          style={{ background: '#fef2f2', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}
        >
          <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '8px' }}>
            {summary.errors.map((error, idx) => (
              <div key={idx} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ opacity: 0.5 }}>•</span> {error.message}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div 
        className="result-actions"
        variants={itemVariants}
        style={{ display: 'flex', gap: '12px' }}
      >
        <button 
          onClick={onClose}
          style={{ 
            flex: 1, padding: '14px', background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer'
          }}
        >
          Ir al Dashboard
        </button>
        {onDownload && (
          <button 
            onClick={onDownload}
            style={{ 
              padding: '14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px', color: 'var(--text-main)', cursor: 'pointer'
            }}
          >
            <Download size={20} />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
