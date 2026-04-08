import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, FileType } from 'lucide-react'
import './Dropzone.css'

export function Dropzone({ onFileSelect }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0])
    }
  }

  const onButtonClick = () => {
    inputRef.current.click()
  }

  return (
    <motion.div 
      className={`dropzone ${isDragActive ? 'active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      style={{ padding: '64px 32px' }}
    >
      <input 
        ref={inputRef}
        type="file" 
        id="input-file-upload" 
        multiple={false} 
        onChange={handleChange}
        accept=".json"
        style={{ display: 'none' }}
      />
      <motion.div 
        className="dropzone-content"
        animate={isDragActive ? { y: -5 } : { y: 0 }}
      >
        <div 
          className="dropzone-icon-wrapper" 
          style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 24px', 
            background: 'var(--primary-light)', 
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            boxShadow: '0 8px 16px var(--primary-glow)'
          }}
        >
          {isDragActive ? <FileType size={36} /> : <UploadCloud size={36} />}
        </div>
        <p className="dropzone-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
          {isDragActive ? 'Suelta el archivo para cargar' : 'Arrastra un archivo JSON'}
        </p>
        <p className="dropzone-hint" style={{ marginTop: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>
          o selecciona desde tu dispositivo (máx. 10MB)
        </p>
      </motion.div>
    </motion.div>
  )
}
