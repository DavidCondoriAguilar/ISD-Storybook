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
import './ProcessingModal.css'

export function ProcessingModal({ progress, steps, onCancel }) {
  const getStepIcon = (step, index) => {
    if (step.status === 'completed') return <CheckCircle2 size={24} color="var(--success)" />
    
    // Active / Pending icons with specific colors
    const iconProps = { 
      size: 24, 
      className: step.status === 'active' ? 'pulse-icon' : '' 
    }

    if (index === 0) return <Search {...iconProps} color="#3b82f6" /> // Blue
    if (index === 1) return <Cpu {...iconProps} color="#a855f7" /> // Purple
    if (index === 2) return <Database {...iconProps} color="#f59e0b" /> // Amber
    return <CloudUpload {...iconProps} color="#10b981" /> // Emerald
  }

  return (
    <motion.div 
      className="processing-modal"
      initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      style={{ padding: '64px 48px', maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)' }}
    >
      <div className="processing-header" style={{ marginBottom: '56px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 32px' }}>
          <motion.div 
            animate={{ scale: [1, 1.4, 1], rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: -15, borderRadius: '35%', background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)', opacity: 0.4 }}
          />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 20px 40px var(--primary-glow)', zIndex: 1, position: 'relative' }}
          >
            <Zap size={44} fill="currentColor" />
          </motion.div>
        </div>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(90deg, var(--text-main), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Sincronizando Manufactura
        </motion.h2>
        <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem', marginTop: '12px' }}>
          Procesando módulos y validando órdenes de producción...
        </p>
      </div>

      <div className="progress-section" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 850, fontSize: '0.9rem' }}>
             <Layers size={18} /> PROGRESO TOTAL
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-outfit)' }}>{Math.round(progress)}%</span>
        </div>
        <div className="master-progress-track" style={{ height: '14px', background: 'var(--bg-app)', borderRadius: '20px', padding: '3px' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
            style={{ height: '100%', borderRadius: '20px', background: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
          />
        </div>
      </div>

      <div className="animated-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div 
              key={step.id || index} 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              style={{ padding: '24px', borderRadius: '24px', background: step.status === 'active' ? 'var(--primary-light)' : 'var(--bg-app)', border: step.status === 'active' ? '2px solid var(--primary)' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', position: 'relative' }}
            >
              <div 
                style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s'
                }}
              >
                {getStepIcon(step, index)}
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', textAlign: 'center', color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                {step.text}
              </span>
              {step.status === 'active' && (
                <motion.div 
                   layoutId="active-particle"
                   style={{ position: 'absolute', top: -5, right: -5, width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}
                   animate={{ scale: [1, 1.5, 1] }}
                   transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button 
        className="btn-abort-action" 
        onClick={onCancel}
        whileHover={{ x: [0, -2, 2, 0] }}
        style={{ width: '100%', marginTop: '48px', padding: '20px', borderRadius: '20px', fontWeight: 850, border: 'none', background: 'var(--bg-app)', color: 'var(--danger)', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
      >
        <XSquare size={20} /> DETENER SINCRONIZACIÓN
      </motion.button>
      
      <style>{`
        .pulse-icon { animation: pulseIcon 2s infinite ease-in-out; }
        @keyframes pulseIcon { 0%, 100% { transform: scale(1) rotate(0); } 50% { transform: scale(1.15) rotate(5deg); } }
      `}</style>
    </motion.div>
  )
}
