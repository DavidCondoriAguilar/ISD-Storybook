import { useEffect, memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as m, AnimatePresence as AP } from 'framer-motion'

import { useImportProduction } from './hooks/useImportProduction'
import { STEPS } from './types/importTypes'
import { useNotification } from '../../context/NotificationContext'

import { Dropzone } from './components/Dropzone'
import { FileCard } from './components/FileCard'
import { ProcessingModal } from './components/ProcessingModal'
import { ResultModal } from './components/ResultModal'
import { ImportHero } from './components/ImportHero'
import { ImportOptions } from './components/ImportOptions'
import { ImportActions } from './components/ImportActions'
import { DangerZone } from './components/DangerZone'
import { backupService } from '../../data/backupService'

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

export const ImportProduction = memo(function ImportProduction({ onImportComplete }) {
  const navigate = useNavigate()
  const { notify } = useNotification()
  
  const {
    step, file, validateBeforeImport, progress, processingSteps, 
    summary, result, setValidateBeforeImport, handleFileSelect, 
    handleRemoveFile, startImport, retry, reset, clearAllHistory
  } = useImportProduction()

  const handleClearHistory = useCallback(async () => {
    if (window.confirm('¿Estás SEGURO de que deseas eliminar TODO el historial? Esta acción no se puede deshacer.')) {
      await clearAllHistory()
      notify('Historial eliminado por completo. Puedes empezar de cero. 🧹', 'info')
    }
  }, [clearAllHistory, notify])

  const handleFileSuccess = useCallback((f) => {
    handleFileSelect(f)
    notify(`Archivo capturado correctamente 📋`, 'success')
  }, [handleFileSelect, notify])

  useEffect(() => {
    if (step === STEPS.SUCCESS) {
      if (onImportComplete) {
        onImportComplete(summary, { fileName: file.name, worker: file.worker })
      }
      
      // Senior UX: Redireccionamiento automático tras éxito
      const timer = setTimeout(() => {
        navigate('/dashboard')
        notify('Datos sincronizados y actualizados. 📊', 'info')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [step, summary, onImportComplete, file, navigate, notify])

  const renderImportForm = () => (
    <m.div key="import-form" className="import-view-container" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <ImportHero />
      
      <Dropzone onFileSelect={handleFileSuccess} />

      <AP mode="wait">
        {file && (
          <m.div key={file.name} initial={{ height: 0, scale: 0.8 }} animate={{ height: 'auto', scale: 1 }} exit={{ height: 0, scale: 0.8 }} className="file-card-container">
            <FileCard file={file} onRemove={handleRemoveFile} />
          </m.div>
        )}
      </AP>

      <ImportOptions 
        validateBeforeImport={validateBeforeImport} 
        onToggleValidation={setValidateBeforeImport} 
      />

      <ImportActions 
        onReset={reset} 
        onStart={startImport} 
        isFileReady={!!file} 
      />

      <DangerZone onClearHistory={handleClearHistory} />
    </m.div>
  )

  return (
    <div className="import-production-wrapper" style={{ padding: '20px 0' }}>
      <AP mode="wait">
        {step === STEPS.IMPORT && renderImportForm()}
        
        {step === STEPS.PROCESSING && (
           <m.div key="proc-view" variants={pageVariants} initial="initial" animate="animate" exit="exit">
             <ProcessingModal progress={progress} steps={processingSteps} onCancel={reset} />
           </m.div>
        )}
        
        {(step === STEPS.SUCCESS || step === STEPS.ERROR) && (
           <m.div key="res-view" variants={pageVariants} initial="initial" animate="animate" exit="exit">
             <ResultModal 
               result={result} 
               summary={summary} 
               onClose={() => navigate('/dashboard')} 
               onRetry={step === STEPS.ERROR ? retry : undefined} 
               onDownload={backupService.exportDatabase}
             />
           </m.div>
         )}
      </AP>
    </div>
  )
})

export default ImportProduction
