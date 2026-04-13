import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Trash2, X } from 'lucide-react'

export function ConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{ 
              position: 'relative', 
              background: 'white', 
              borderRadius: '28px', 
              padding: '32px', 
              maxWidth: '440px', 
              width: '100%', 
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
              border: '1px solid var(--border)',
              textAlign: 'center'
            }}
          >
            <div style={{ width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Trash2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              {title || '¿Confirmar Acción?'}
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>
              {message || 'Esta acción no se puede deshacer. ¿Deseas continuar?'}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={onCancel}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={onConfirm}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Sí, Borrar Todo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
