import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  CheckCircle2, 
  XSquare, 
  RotateCw, 
  Database,
  Search,
  CloudUpload,
  Zap,
  Layers,
  Cpu
} from 'lucide-react'

export function ProcessingModal({ progress, steps, onCancel }) {
  const getStepIcon = (step, index) => {
    if (step.status === 'completed') return <CheckCircle2 size={18} color="var(--success)" />
    
    // Active / Pending icons
    const iconProps = { 
      size: 18, 
      className: step.status === 'active' ? 'pulse-icon' : '' 
    }

    if (index === 0) return <Search {...iconProps} color="#3b82f6" />
    if (index === 1) return <Cpu {...iconProps} color="#a855f7" />
    if (index === 2) return <Database {...iconProps} color="#f59e0b" />
    return <CloudUpload {...iconProps} color="#10b981" />
  }

  return (
    <motion.div 
      className="processing-modal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ 
        padding: '24px 24px 16px', 
        maxWidth: '400px', 
        margin: '0 auto', 
        background: 'white', 
        borderRadius: '24px', 
        border: '1px solid var(--border)', 
        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="processing-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', inset: -4, borderRadius: '12px', background: 'var(--primary)', opacity: 0.1 }}
          />
          <div style={{ width: '100%', height: '100%', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative' }}>
            <Zap size={20} fill="currentColor" />
          </div>
        </div>
        
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Sincronizando</h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', marginTop: '1px' }}>
            Auditoría de planta activa...
          </p>
        </div>
      </div>

      <div className="progress-section" style={{ marginBottom: '20px', background: 'var(--bg-app)', padding: '12px 16px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase' }}>Progreso</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 950 }}>{Math.round(progress)}%</span>
        </div>
        <div className="master-progress-track" style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', borderRadius: '10px', background: 'var(--primary)' }}
          />
        </div>
      </div>

      <div className="animated-steps" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {steps.map((step, index) => (
          <motion.div 
            key={step.id || index} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ 
              padding: '10px 14px', 
              borderRadius: '12px', 
              background: step.status === 'active' ? 'rgba(37, 99, 235, 0.03)' : 'transparent', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: step.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              {getStepIcon(step, index)}
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-main)', flex: 1 }}>
              {step.text}
            </span>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onCancel}
        style={{ 
          width: '100%', marginTop: '20px', padding: '10px', borderRadius: '12px', fontWeight: 850, border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.65rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}
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
