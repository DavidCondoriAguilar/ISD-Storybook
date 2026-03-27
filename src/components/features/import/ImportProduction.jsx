import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUp, ShieldCheck, XCircle, CheckCircle } from 'lucide-react'
import { useImportProduction } from '../../../hooks/useImportProduction'
import { STEPS } from '../../../types'
import { Dropzone } from './Dropzone'
import { FileCard } from './FileCard'
import { ProcessingModal } from './ProcessingModal'
import { ResultModal } from './ResultModal'
import './ImportProduction.css'

const stepVariants = {
  initial: { opacity: 0, scale: 0.98, y: 15 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', duration: 0.5, bounce: 0.2 }
  },
  exit: { 
    opacity: 0, 
    scale: 1.02, 
    y: -10,
    transition: { duration: 0.3 }
  }
}

export function ImportProduction({ onImportComplete }) {
  const {
    step,
    file,
    validateBeforeImport,
    progress,
    processingSteps,
    summary,
    result,
    setValidateBeforeImport,
    handleFileSelect,
    handleRemoveFile,
    startImport,
    retry,
    reset
  } = useImportProduction()

  useEffect(() => {
    if (step === STEPS.SUCCESS && onImportComplete) {
      onImportComplete(summary, { fileName: file.name, worker: file.worker })
    }
  }, [step, summary, onImportComplete])

  const renderImportStep = () => (
    <motion.div 
      className="modal"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      <div className="modal-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="icon-badge" style={{ display: 'inline-flex', padding: '16px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
          <FileUp size={32} />
        </div>
        <h2 className="modal-title" style={{ margin: 0 }}>Cargar Archivo de Producción</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
          Sube tu archivo JSON para procesar y sincronizar con el historial
        </p>
      </div>
      
      <Dropzone onFileSelect={handleFileSelect} />

      <AnimatePresence mode="wait">
        {file && (
          <motion.div
            key={file.name}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ marginBottom: '24px' }}
          >
            <FileCard file={file} onRemove={handleRemoveFile} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="import-options" style={{ padding: '24px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', marginBottom: '40px' }}>
        <label className="checkbox-label" style={{ margin: 0 }}>
          <input 
            type="checkbox" 
            checked={validateBeforeImport}
            onChange={(e) => setValidateBeforeImport(e.target.checked)}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Validación de Integridad</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Comprobar esquemas y duplicados antes de guardar</span>
          </div>
        </label>
      </div>

      <div className="actions">
        <motion.button 
          className="btn-cancel" 
          onClick={reset}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <XCircle size={18} /> Cancelar
        </motion.button>
        <motion.button 
          className="btn-import" 
          onClick={startImport}
          disabled={!file}
          whileHover={file ? { scale: 1.02 } : {}}
          whileTap={file ? { scale: 0.98 } : {}}
        >
          <CheckCircle size={18} /> Iniciar Importación
        </motion.button>
      </div>
    </motion.div>
  )

  return (
    <div className="import-production" style={{ maxWidth: '100%' }}>
      <AnimatePresence mode="wait">
        {step === STEPS.IMPORT && renderImportStep()}
        
        {step === STEPS.PROCESSING && (
          <ProcessingModal 
            key="processing"
            progress={progress}
            steps={processingSteps}
            onCancel={reset}
          />
        )}
        
        {(step === STEPS.SUCCESS || step === STEPS.ERROR) && (
          <ResultModal
            key="result"
            result={result}
            summary={summary}
            onClose={reset}
            onRetry={step === STEPS.ERROR ? retry : undefined}
            onDownload={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
