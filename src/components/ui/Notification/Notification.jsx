import { motion, AnimatePresence } from 'framer-motion'
import { Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNotification } from '../../../context/NotificationContext'

export function Notification() {
  const { notification } = useNotification()

  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={14} />
    if (type === 'error') return <AlertCircle size={14} />
    return <Info size={14} />
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
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            maxWidth: '220px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            borderRadius: '10px',
            fontSize: '0.68rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px -10px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            lineHeight: 1.1
          }}
        >
          <div style={{ color: notification.type === 'success' ? '#10b981' : (notification.type === 'warning' ? '#f59e0b' : '#3b82f6'), display: 'flex' }}>
            {getIcon(notification.type)}
          </div>
          <span>{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
