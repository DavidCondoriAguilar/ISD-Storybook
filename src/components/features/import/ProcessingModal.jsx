import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  CheckCircle2, 
  XSquare, 
  RotateCw, 
  Database,
  Search,
  CloudUpload
} from 'lucide-react'
import './ProcessingModal.css'

export function ProcessingModal({ progress, steps, onCancel }) {
  const getStepIcon = (step, index) => {
    if (step.status === 'completed') return <CheckCircle2 size={16} />
    if (step.status === 'active') return <RotateCw size={16} className="spinning" />
    
    // Default icons by index
    if (index === 0) return <Search size={16} />
    if (index === 1) return <Database size={16} />
    if (index === 2) return <CloudUpload size={16} />
    return <Settings size={16} />
  }

  return (
    <motion.div 
      className="processing-modal"
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      style={{ padding: '64px 48px', maxWidth: '600px', margin: '0 auto' }}
    >
      <div className="processing-header">
        <motion.div 
          className="processing-top-icon" 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ width: '64px', height: '64px', margin: '0 auto 24px', background: 'var(--primary-light)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}
        >
          <Settings size={32} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Procesando Registros de Producción
        </motion.h2>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>
          Por favor mantén la ventana abierta hasta completar la sincronización
        </p>
      </div>

      <div className="processing-progress" style={{ height: '16px', borderRadius: 'var(--radius-full)' }}>
        <motion.div 
          className="progress-bar-fill" 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)' }}
        />
        <div className="progress-percentage" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 800, color: progress > 50 ? 'white' : 'var(--text-muted)' }}>
          {progress}%
        </div>
      </div>

      <div className="processing-steps" style={{ gap: '20px' }}>
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div 
              key={step.id} 
              className={`step-item ${step.status}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <div 
                className="step-status-icon-wrapper" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  background: step.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : step.status === 'active' ? 'var(--primary-light)' : 'var(--bg-app)', 
                  color: step.status === 'completed' ? 'var(--success)' : step.status === 'active' ? 'var(--primary)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                {getStepIcon(step, index)}
              </div>
              <span className="step-label" style={{ fontWeight: step.status === 'active' ? 800 : 600, fontSize: '1rem', color: step.status === 'active' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {step.label}
              </span>
              {step.status === 'active' && (
                <motion.div 
                  className="active-indicator"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', marginLeft: 'auto' }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button 
        className="btn-processing-cancel" 
        onClick={onCancel}
        whileHover={{ x: -2, background: '#fecaca', color: '#991b1b' }}
        whileTap={{ scale: 0.98 }}
        style={{ marginTop: '24px', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--border)' }}
      >
        <XSquare size={18} /> Detener Proceso
      </motion.button>
      
      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
