import { motion, AnimatePresence } from 'framer-motion'
import { Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNotification } from '../../../context/NotificationContext'

export function Notification() {
  const { notification } = useNotification()

  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={20} />
    if (type === 'error') return <AlertCircle size={20} />
    return <Info size={20} />
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
            gap: '10px',
            padding: '10px 16px',
            maxWidth: '280px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 850,
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            lineHeight: 1.3
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
