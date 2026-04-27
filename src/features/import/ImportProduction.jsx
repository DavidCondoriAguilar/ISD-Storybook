import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as m, AnimatePresence as AP } from 'framer-motion'
import { FileUp, ShieldCheck, XCircle, CheckCircle, Upload, ArrowRight, Trash2 } from 'lucide-react'
import { useImportProduction } from './hooks/useImportProduction'
import { STEPS } from './types/importTypes'
import { Dropzone } from './components/Dropzone'
import { FileCard } from './components/FileCard'
import { ProcessingModal } from './components/ProcessingModal'
import { ResultModal } from './components/ResultModal'
import { useNotification } from '../../context/NotificationContext'
import './ImportProduction.css'

const pageVariants = {
  initial: { opacity: 0, scale: 0.94, y: 30, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  },
  exit: { 
    opacity: 0, scale: 1.05, y: -20, filter: 'blur(10px)',
    transition: { duration: 0.4, ease: 'easeInOut' }
  }
}

export function ImportProduction({ onImportComplete }) {
  const navigate = useNavigate()
  const { notify } = useNotification()
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
    reset,
    clearAllHistory
  } = useImportProduction()

  const handleClearHistory = async () => {
    const confirm = window.confirm('¿Estás SEGURO de que deseas eliminar TODO el historial? Esta acción no se puede deshacer.')
    if (confirm) {
      await clearAllHistory()
      notify('Historial eliminado por completo. Puedes empezar de cero. 🧹', 'info')
    }
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  const onFileLoadSuccess = (f) => {
    handleFileSelect(f)
    notify(`JSON Capturado correctamente 📋`, 'success')
  }

  useEffect(() => {
    if (step === STEPS.SUCCESS && onImportComplete) {
      onImportComplete(summary, { fileName: file.name, worker: file.worker })
    }
  }, [step, summary, onImportComplete, file])

  const renderImportStep = () => (
    <m.div 
      key="import-view"
      className="import-view-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="import-hero">
        <m.div 
          className="hero-icon-bg"
          whileHover={{ rotate: [0, -10, 10, 0] }}
        >
          <Upload size={36} />
        </m.div>
        <h2 className="hero-title">Portal de Carga</h2>
        <p className="hero-subtitle">
          Sincroniza tus registros de producción con el historial ejecutivo de la planta.
        </p>
      </div>
      
      <Dropzone onFileSelect={onFileLoadSuccess} />

      <AP mode="wait">
        {file && (
          <m.div
            key={file.name}
            initial={{ height: 0, scale: 0.8 }}
            animate={{ height: 'auto', scale: 1 }}
            exit={{ height: 0, scale: 0.8 }}
            className="file-card-container"
          >
            <FileCard file={file} onRemove={handleRemoveFile} />
          </m.div>
        )}
      </AP>

      <div className="import-options-card">
        <m.label className="checkbox-label" whileHover={{ x: 5 }}>
          <m.input 
            type="checkbox" 
            checked={validateBeforeImport}
            onChange={(e) => setValidateBeforeImport(e.target.checked)}
            className="custom-checkbox"
          />
          <div className="checkbox-text-group">
            <span className="checkbox-title">
              <ShieldCheck size={20} color="var(--success)" /> Validación de Integridad Estricta
            </span>
            <span className="checkbox-description">
              Comprueba duplicados, esquemas relacionales y formatos de operarios antes de la carga final al ERP.
            </span>
          </div>
        </m.label>
      </div>

      <div className="import-actions">
        <m.button 
          className="btn-cancel-large" 
          onClick={reset}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <XCircle size={20} /> Cancelar Trámite
        </m.button>
        <m.button 
          className="btn-start-large" 
          onClick={startImport}
          disabled={!file}
          whileHover={file ? { scale: 1.02 } : {}}
          whileTap={file ? { scale: 0.98 } : {}}
        >
          <CheckCircle size={22} /> Iniciar Sincronización <ArrowRight size={20} />
        </m.button>
      </div>

      <div className="danger-zone">
         <div className="danger-box">
            <div className="danger-text">
               <h4 className="danger-title">Zona Crítica</h4>
               <p className="danger-description">Borra permanentemente todos los registros, duplicados y auditorías del sistema.</p>
            </div>
            <m.button 
               className="btn-danger-outline"
               onClick={handleClearHistory}
               whileHover={{ scale: 1.05, background: 'var(--danger)', color: 'white' }}
               whileTap={{ scale: 0.95 }}
            >
               <Trash2 size={16} /> Limpiar Base de Datos
            </m.button>
         </div>
      </div>
    </m.div>
  )

  return (
    <div className="import-production-wrapper" style={{ padding: '20px 0' }}>
      <AP mode="wait">
        {step === STEPS.IMPORT && renderImportStep()}
        
        {step === STEPS.PROCESSING && (
           <m.div key="proc-view" variants={pageVariants} initial="initial" animate="animate" exit="exit">
             <ProcessingModal progress={progress} steps={processingSteps} onCancel={reset} />
           </m.div>
        )}
        
{(step === STEPS.SUCCESS || step === STEPS.ERROR) && (
           <m.div key="res-view" variants={pageVariants} initial="initial" animate="animate" exit="exit">
             <ResultModal result={result} summary={summary} onClose={handleGoToDashboard} onRetry={step === STEPS.ERROR ? retry : undefined} onDownload={() => {}} />
           </m.div>
         )}
      </AP>
    </div>
  )
}
