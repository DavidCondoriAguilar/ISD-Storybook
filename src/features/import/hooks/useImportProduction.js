import { useState, useCallback } from 'react'
import { STEPS, FileStatus, ProcessingStatus, ImportResult } from '../types/importTypes'
import { validateFile } from '../services/importService'
import { storageService } from '../../../services/storageService'

const initialFile = null

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
    const validation = await validateFile(fileData)
    
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
      size: fileData.size,
      worker: validation.data?.worker || 'Usuario',
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
    if (!file || !file.raw) return
    
    setStep(STEPS.PROCESSING)
    setProgress(0)
    setProcessingSteps([])
    setProcessingStatus(ProcessingStatus.VALIDATING)
    setResult(null)

    try {
      // 1. Read and Parse JSON
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(new Error('Error al leer el archivo'))
        reader.readAsText(file.raw)
      })

      const data = JSON.parse(fileContent)
      
      // Flexible record extraction: Handle both array directly and { records: [] }
      const records = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : null)

      if (!records) {
        throw new Error('El archivo no contiene una lista de registros válida ("records").')
      }

      const statusConfig = [
        { status: ProcessingStatus.VALIDATING, text: 'Auditando estructura JSON', icon: '✅', delay: 1000 },
        { status: ProcessingStatus.REGISTERING, text: `Modulando ${records.length} estaciones`, icon: '🔄', delay: 1800 },
        { status: ProcessingStatus.SAVING, text: 'Indexando en Bitácora Final', icon: '⏳', delay: 2500 }
      ]

      for (let i = 0; i < statusConfig.length; i++) {
        const config = statusConfig[i]
        await new Promise(res => setTimeout(res, config.delay - (i > 0 ? statusConfig[i-1].delay : 0)))
        setProcessingStatus(config.status)
        addProcessingStep({ id: config.status, text: config.text, icon: config.icon, done: true })
        setProgress((i + 1) * 33)
      }

      // 2. Extract Final Summary from JSON using flexible field mapping
      const totalUnits = data.summary?.totalQuantity || records.reduce((s, r) => s + (Number(r.cantidad ?? r.quantity ?? 0)), 0)
      const totalRejected = data.summary?.totalRejected || records.reduce((s, r) => s + (Number(r.cantidadRechazada ?? r.quantityRejected ?? 0)) , 0)

      const finalSummary = {
        success: totalUnits - totalRejected,
        failed: totalRejected,
        total: records.length,
        units: totalUnits,
        worker: data.worker?.name || records[0]?.trabajadorNombre || 'Sistema',
        shift: data.shift?.type || records[0]?.turno || 'N/A',
        errors: [],
        rawRecords: records 
      }

      // Senior Action: Persist and Audit
      const saveResult = storageService.save({
        fileName: file.name,
        worker: file.worker,
        ...finalSummary
      })

      setProcessingStatus(ProcessingStatus.COMPLETED)
      setProgress(100)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setSummary({
        ...finalSummary,
        success: saveResult.success ?? finalSummary.success,
        units: saveResult.units ?? finalSummary.units,
        duplicatesDetected: saveResult.duplicatesDetected || saveResult.duplicates || 0,
        isSkipped: saveResult.skipped || false
      })
      setResult(ImportResult.SUCCESS)
      setStep(STEPS.SUCCESS)

    } catch (err) {
      console.error('Import Error:', err)
      setResult(ImportResult.FAILED)
      setStep(STEPS.ERROR)
      setSummary({ ...initialSummary, errors: [{ message: 'El archivo JSON no es válido o está corrupto.' }] })
    }
  }, [file, addProcessingStep])

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
