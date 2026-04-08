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
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.8 }}
          className={`notification ${notification.type}`}
          style={{
            position: 'fixed',
            bottom: '40px',
            right: '40px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 24px',
            background: notification.type === 'success' ? 'var(--success)' : (notification.type === 'error' ? 'var(--danger)' : 'var(--text-main)'),
            color: 'white',
            borderRadius: '20px',
            fontWeight: 700,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}
        >
          {getIcon(notification.type)}
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
