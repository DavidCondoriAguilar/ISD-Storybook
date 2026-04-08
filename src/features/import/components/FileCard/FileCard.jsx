import { motion } from 'framer-motion'
import { FileJson, Trash2 } from 'lucide-react'
import './FileCard.css'

export function FileCard({ file, onRemove }) {
  const formatSize = (bytes) => {
    const b = Number(bytes)
    if (!b || isNaN(b) || b === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(b) / Math.log(k))
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <motion.div 
      className="file-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, borderColor: 'var(--border-strong)' }}
      style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}
    >
      <div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div 
          className="file-icon" 
          style={{ 
            width: '56px', 
            height: '56px', 
            background: 'white', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--secondary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <FileJson size={24} />
        </div>
        <div className="file-details">
          <span className="file-name" title={file.name} style={{ fontSize: '1.25rem', fontWeight: 800 }}>{file.name}</span>
          <span className="file-size" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{formatSize(file.size)}</span>
        </div>
      </div>
      <motion.button 
        className="btn-remove" 
        onClick={onRemove}
        title="Eliminar archivo"
        whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
        whileTap={{ scale: 0.9 }}
        style={{ width: '44px', height: '44px', color: 'var(--danger)', background: 'transparent' }}
      >
        <Trash2 size={20} />
      </motion.button>
    </motion.div>
  )
}
