import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Database,
  Search,
  CloudUpload,
  Zap,
  Cpu
} from 'lucide-react'
import './ProcessingModal.css'

const stepIcons = [Search, Cpu, Database, CloudUpload]

export function ProcessingModal({ progress, steps, onCancel }) {
  const roundedProgress = useMemo(() => Math.round(progress), [progress])

  const getStepIcon = (step, index) => {
    if (step.status === 'completed') {
      return <CheckCircle2 size={18} color="var(--success)" aria-hidden="true" />
    }
    
    const IconComponent = stepIcons[index] || CloudUpload
    return (
      <IconComponent 
        size={18} 
        color="var(--primary)"
        className={step.status === 'active' ? 'pulse-icon' : ''}
        aria-hidden="true"
      />
    )
  }

  return (
    <motion.div 
      className="processing-modal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="processing-title"
    >
      <div className="processing-header">
        <div className="processing-icon-wrapper">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="processing-icon-bg"
            aria-hidden="true"
          />
          <div className="processing-icon" aria-hidden="true">
            <Zap size={20} fill="currentColor" />
          </div>
        </div>
        
        <div>
          <h2 id="processing-title">Sincronizando</h2>
          <p>Auditoría de planta activa...</p>
        </div>
      </div>

      <div className="progress-section" role="status" aria-live="polite" aria-label="Progreso de sincronización">
        <div className="progress-header">
          <span className="progress-label">Progreso</span>
          <span className="progress-value">{roundedProgress}%</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={roundedProgress} aria-valuemin="0" aria-valuemax="100">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            className="progress-fill"
          />
        </div>
      </div>

      <div className="animated-steps" aria-label="Pasos de sincronización">
        {steps.map((step, index) => (
          <motion.div 
            key={step.id || index} 
            className={`step-item ${step.status}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="step-icon-container">
              {getStepIcon(step, index)}
            </div>
            <span className="step-text">{step.text}</span>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onCancel}
        className="btn-cancel"
        aria-label="Interrumpir operación de sincronización"
      >
        Interrumpir Operación
      </button>
      
      <style>{`
        .pulse-icon { animation: pulseIcon 2.5s infinite ease-in-out; }
        @keyframes pulseIcon { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </motion.div>
  )
}