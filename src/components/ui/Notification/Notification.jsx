import { motion, AnimatePresence } from 'framer-motion'
import { Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNotification } from '../../../context/NotificationContext'

export function Notification() {
  const { notification } = useNotification()

  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={18} />
    if (type === 'error') return <AlertCircle size={18} />
    return <Info size={18} />
  }

  return (
    <AnimatePresence>
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`notification ${notification.type}`}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            minWidth: '280px',
            maxWidth: '450px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(16px)',
            color: 'white',
            borderRadius: '16px',
            fontSize: '0.85rem',
            fontWeight: 700,
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            lineHeight: 1.4
          }}
        >
          <div style={{ 
            color: notification.type === 'success' ? '#10b981' : (notification.type === 'error' ? '#ef4444' : '#3b82f6'), 
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '8px',
            borderRadius: '10px'
          }}>
            {getIcon(notification.type)}
          </div>
          <span style={{ flex: 1 }}>{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
