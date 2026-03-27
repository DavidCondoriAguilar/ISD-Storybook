import { useEffect } from 'react'
import { motion as m, AnimatePresence as AP } from 'framer-motion'
import { FileUp, ShieldCheck, XCircle, CheckCircle, Upload, ArrowRight } from 'lucide-react'
import { useImportProduction } from '../../../hooks/useImportProduction'
import { STEPS } from '../../../types'
import { Dropzone } from './Dropzone'
import { FileCard } from './FileCard'
import { ProcessingModal } from './ProcessingModal'
import { ResultModal } from './ResultModal'
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

export function ImportProduction({ onImportComplete, onNotify }) {
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

  const onFileLoadSuccess = (f) => {
    handleFileSelect(f)
    if (onNotify) onNotify(`¡Archivo "${f.name}" capturado correctamente! 📋`)
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
      style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}
    >
      <div className="import-hero">
        <m.div 
          className="hero-icon-bg"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 32px' }}
        >
          <Upload size={36} />
        </m.div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textAlign: 'center', letterSpacing: '-0.03em' }}>Portal de Carga</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '8px' }}>
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
            style={{ marginBottom: '24px' }}
          >
            <FileCard file={file} onRemove={handleRemoveFile} />
          </m.div>
        )}
      </AP>

      <div className="import-options-card" style={{ padding: '32px', background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <m.label className="checkbox-label" whileHover={{ x: 5 }} style={{ cursor: 'pointer', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <m.input 
            type="checkbox" 
            checked={validateBeforeImport}
            onChange={(e) => setValidateBeforeImport(e.target.checked)}
            style={{ width: '24px', height: '24px', borderRadius: '8px', border: '2px solid var(--primary)', accentColor: 'var(--primary)', flexShrink: 0 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontWeight: 850, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="var(--success)" /> Validación de Integridad Estricta
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5 }}>
              Comprueba duplicados, esquemas relacionales y formatos de operarios antes de la carga final al ERP.
            </span>
          </div>
        </m.label>
      </div>

      <div className="import-actions" style={{ display: 'flex', gap: '20px' }}>
        <m.button 
          className="btn-cancel-large" 
          onClick={reset}
          whileHover={{ x: -2, background: '#f8fafc' }}
          whileTap={{ scale: 0.98 }}
          style={{ flex: 1, padding: '20px', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', fontWeight: 800, color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
        >
          <XCircle size={20} /> Cancelar Trámite
        </m.button>
        <m.button 
          className="btn-start-large" 
          onClick={startImport}
          disabled={!file}
          whileHover={file ? { scale: 1.02, background: 'var(--primary-dark)' } : {}}
          whileTap={file ? { scale: 0.98 } : {}}
          style={{ 
            flex: 2, padding: '20px', background: file ? 'var(--primary)' : 'var(--border)', 
            color: 'white', borderRadius: 'var(--radius-lg)', fontWeight: 800, fontSize: '1.1rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', box_shadow: file ? '0 12px 24px var(--primary-glow)' : 'none', transition: 'all 0.3s ease' 
          }}
        >
          <CheckCircle size={22} /> Iniciar Sincronización <ArrowRight size={20} />
        </m.button>
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
            <ResultModal result={result} summary={summary} onClose={reset} onRetry={step === STEPS.ERROR ? retry : undefined} onDownload={() => {}} />
          </m.div>
        )}
      </AP>
    </div>
  )
}
