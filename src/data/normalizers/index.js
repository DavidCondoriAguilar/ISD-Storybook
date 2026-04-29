import { validateProductionData } from '../../domain/validators/productionValidator'
import { 
  sanitizarNombre, 
  normalizeTimestamp, 
  normalizeWorker, 
  normalizeLocation, 
  normalizeProduct,
  normalizeProduction,
  normalizeTime,
  generateRecordId
} from './recordNormalizer'

export const normalizeImportPayload = (importPayload) => {
  let validatedPayload;
  try {
    validatedPayload = validateProductionData(importPayload);
  } catch (error) {
    console.error('Validation Error:', error.message);
    throw error;
  }
  return validatedPayload
}

export const normalizeRecords = (validatedPayload, existingRecords = []) => {
  const normalizedRecords = (validatedPayload.rawRecords || []).map((r, i) => {
    const normalizedTimestamp = normalizeTimestamp(r)
    const { workerKey, workerName } = normalizeWorker(r)
    const { modulo, maquina } = normalizeLocation(r)
    const { name: prodName, code: prodCode } = normalizeProduct(r)
    const { cantidadNeta, lecturaMaquina, unidadOriginal } = normalizeProduction(r)
    const { jornadaHoras, minutos, horasExtra, tipoJornada } = normalizeTime(r)
    const generatedId = generateRecordId(workerKey, normalizedTimestamp, i, r)
    
    return {
      idLocal: generatedId,
      trabajadorDni: workerKey,
      trabajadorNombre: workerName,
      moduloId: modulo,
      area: modulo, // Guardamos explícitamente el área detectada
      maquinaId: maquina,
      productoId: prodCode,
      productoNombre: sanitizarNombre(prodName),
      cantidad: cantidadNeta,
      cantidadOriginal: cantidadNeta,
      unidad: unidadOriginal, // Guardamos la unidad estandarizada
      unidadOriginal: unidadOriginal,
      outputMaquina: lecturaMaquina,
      tiempoMinutos: minutos,
      fechaTimestamp: normalizedTimestamp,
      esHoraExtra: horasExtra > 0,
      horasExtraCantidad: horasExtra,
      jornadaTotalHoras: jornadaHoras,
      status: 'ok',
      tipoJornada: tipoJornada,
      fileName: validatedPayload.fileName,
      importTimestamp: new Date().toISOString()
    }
  })

  const existingKeys = new Set(existingRecords.map(r => `${r.idLocal}-${r.fechaTimestamp}`))
  const newRawRecords = normalizedRecords.filter(r => {
    const key = `${r.idLocal}-${r.fechaTimestamp}`
    return !existingKeys.has(key)
  })
  const duplicatesFound = (validatedPayload.rawRecords || []).length - newRawRecords.length

  return { newRawRecords, duplicatesFound }
}

export const buildImportRecord = (validatedPayload, newRawRecords, duplicatesFound) => ({
  timestamp: new Date().toISOString(),
  ...validatedPayload,
  success: newRawRecords.length,
  units: newRawRecords.reduce((s, r) => s + (Number(r.cantidad || 0)), 0),
  rawRecords: newRawRecords,
  duplicatesDetected: duplicatesFound
})