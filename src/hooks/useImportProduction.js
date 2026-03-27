import { useState, useCallback } from 'react'
import { STEPS, FileStatus, ProcessingStatus, ImportResult } from '../types'
import { validateFile, processImport } from '../services/importService'
import { storageService } from '../services/storageService'

const initialFile = {
  name: 'production_2026-03-25_w5.json',
  size: '2.3 KB',
  worker: 'Juan Pérez',
  records: 3,
  units: 1430,
  raw: null
}

const initialSummary = {
  success: 0,
  failed: 0,
  total: 0,
  units: 0,
  errors: []
}

export function useImportProduction() {
  const [step, setStep] = useState(STEPS.IMPORT)
  const [file, setFile] = useState(initialFile)
  const [fileStatus, setFileStatus] = useState(FileStatus.READY)
  const [validateBeforeImport, setValidateBeforeImport] = useState(true)
  
  const [progress, setProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState(ProcessingStatus.IDLE)
  const [processingSteps, setProcessingSteps] = useState([])
  
  const [summary, setSummary] = useState(initialSummary)
  const [result, setResult] = useState(null)

  const addProcessingStep = useCallback((step) => {
    setProcessingSteps(prev => [...prev, step])
  }, [])

  const handleFileSelect = useCallback(async (fileData) => {
    setFileStatus(FileStatus.VALIDATING)
    const validation = validateFile(fileData)
    
    if (!validation.valid) {
      setSummary({
        success: 0, failed: 0, total: 0, units: 0,
        errors: [{ message: validation.error, record: 'file' }]
      })
      setStep(STEPS.ERROR)
      setResult(ImportResult.FAILED)
      return
    }

    setFile({
      name: fileData.name,
      size: (fileData.size / 1024).toFixed(1) + ' KB',
      worker: 'Usuario',
      records: validation.data?.records || 0,
      units: validation.data?.units || 0,
      raw: fileData
    })
    setFileStatus(FileStatus.READY)
  }, [])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    setFileStatus(FileStatus.IDLE)
    setResult(null)
  }, [])

  const startImport = useCallback(async () => {
    setStep(STEPS.PROCESSING)
    setProgress(0)
    setProcessingSteps([])
    setProcessingStatus(ProcessingStatus.VALIDATING)
    setResult(null)

    const statusConfig = [
      { status: ProcessingStatus.VALIDATING, text: 'Validando archivo', icon: '✅', delay: 800 },
      { status: ProcessingStatus.REGISTERING, text: 'Registrando producción', icon: '🔄', delay: 1500 },
      { status: ProcessingStatus.SAVING, text: 'Guardando registros', icon: '⏳', delay: 2000 }
    ]

    for (let i = 0; i < statusConfig.length; i++) {
      const config = statusConfig[i]
      await new Promise(resolve => setTimeout(resolve, config.delay - (i > 0 ? statusConfig[i-1].delay : 0)))
      setProcessingStatus(config.status)
      addProcessingStep({ id: config.status, text: config.text, icon: config.icon, done: true })
      setProgress((i + 1) * 33)
    }

    const importResult = await processImport(file.raw, validateBeforeImport)
    setProcessingStatus(ProcessingStatus.COMPLETED)
    setProgress(100)
    await new Promise(resolve => setTimeout(resolve, 500))

    const finalSummary = {
      success: importResult.success,
      failed: importResult.failed,
      total: importResult.total,
      units: importResult.units,
      errors: importResult.errors
    }

    // storageService.save removed from here as it is handled by Layout.onImportComplete
    setSummary(finalSummary)
    
    if (importResult.result === ImportResult.SUCCESS) {
      setResult(ImportResult.SUCCESS)
      setStep(STEPS.SUCCESS)
    } else {
      setResult(ImportResult.PARTIAL)
      setStep(STEPS.ERROR)
    }
  }, [file, validateBeforeImport, addProcessingStep])

  const retry = useCallback(() => startImport(), [startImport])

  const reset = useCallback(() => {
    setStep(STEPS.IMPORT)
    setFile(null)
    setFileStatus(FileStatus.IDLE)
    setProgress(0)
    setProcessingStatus(ProcessingStatus.IDLE)
    setProcessingSteps([])
    setSummary(initialSummary)
    setResult(null)
  }, [])

  return {
    step, file, fileStatus, validateBeforeImport,
    progress, processingStatus, processingSteps,
    summary, result, setValidateBeforeImport,
    handleFileSelect, handleRemoveFile, startImport, retry, reset
  }
}
