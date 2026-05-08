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
import { getSchema, detectAndGetSchema, mapFields } from '../schemaRegistry'

/**
 * Genera una key única para detección de duplicados.
 * Usa: id + máquina + módulo para evitar falsos positivos.
 */
const generateDuplicateKey = (record, moduleName) => {
  const id = record.idLocal || record.id || ''
  const machine = record.maquinaId || record.maquina || ''
  const module = moduleName || 'default'
  return `${module}-${id}-${machine}`
}

/**
 * Extrae las keys únicas de registros existentes.
 */
const extractExistingKeys = (records, moduleName) => {
  return new Set(records.map(r => generateDuplicateKey(r, moduleName)))
}

/**
 * Filtra registros nuevos, evitando duplicados basados en id + máquina.
 */
const filterUniqueRecords = (records, existingKeys, moduleName) => {
  return records.filter(record => {
    const key = generateDuplicateKey(record, moduleName)
    return !existingKeys.has(key)
  })
}

/**
 * Normaliza un registro según el tipo de módulo
 */
const normalizeRecord = (record, index, moduleName, fileName) => {
  const schema = getSchema(moduleName)
  const mapped = mapFields(record, moduleName)
  
  const normalizedTimestamp = mapped.fechaTimestamp || normalizeTimestamp(mapped)
  const { workerKey, workerName } = normalizeWorker(mapped)
  const { modulo, maquina } = normalizeLocation(mapped)
  const { name: prodName, code: prodCode } = normalizeProduct(mapped)
  const { cantidadNeta, lecturaMaquina, unidadOriginal } = normalizeProduction(mapped)
  const { jornadaHoras, minutos, horasExtra, tipoJornada } = normalizeTime(mapped)
  
  const generatedId = record.id || record.idLocal || generateRecordId(workerKey, normalizedTimestamp, index, record)
  
  return {
    idLocal: generatedId,
    trabajadorDni: workerKey,
    trabajadorNombre: workerName,
    moduloId: modulo,
    area: modulo,
    maquinaId: maquina,
    productoId: prodCode,
    productoNombre: sanitizarNombre(prodName || mapped.producto || mapped.tipo),
    cantidad: cantidadNeta,
    cantidadOriginal: cantidadNeta,
    unidad: unidadOriginal,
    unidadOriginal: unidadOriginal,
    outputMaquina: lecturaMaquina,
    tiempoMinutos: minutos,
    fechaTimestamp: normalizedTimestamp,
    fechaLegible: mapped.fecha || new Date(normalizedTimestamp).toISOString().split('T')[0],
    esHoraExtra: horasExtra > 0,
    horasExtraCantidad: horasExtra,
    jornadaTotalHoras: jornadaHoras,
    status: 'ok',
    tipoJornada: tipoJornada,
    module: moduleName,
    fileName: fileName,
    importTimestamp: new Date().toISOString()
  }
}

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

export const normalizeRecords = (validatedPayload, existingRecords = [], moduleName = 'paneles') => {
  const { schema, detected } = detectAndGetSchema(validatedPayload.fileName, validatedPayload.rawRecords)
  const activeModule = moduleName || detected || 'paneles'
  
  const normalizedRecords = (validatedPayload.rawRecords || []).map((r, i) => 
    normalizeRecord(r, i, activeModule, validatedPayload.fileName)
  )

  const existingKeys = extractExistingKeys(existingRecords, activeModule)
  const newRawRecords = filterUniqueRecords(normalizedRecords, existingKeys, activeModule)
  const duplicatesFound = (validatedPayload.rawRecords || []).length - newRawRecords.length

  return { 
    newRawRecords, 
    duplicatesFound,
    module: activeModule,
    schema: schema?.module
  }
}

export const buildImportRecord = (validatedPayload, newRawRecords, duplicatesFound, moduleName = 'paneles') => ({
  timestamp: new Date().toISOString(),
  ...validatedPayload,
  module: moduleName,
  success: newRawRecords.length,
  units: newRawRecords.reduce((sum, r) => sum + (Number(r.cantidad || 0)), 0),
  rawRecords: newRawRecords,
  duplicatesDetected: duplicatesFound
})

export { getSchema, detectAndGetSchema, mapFields }