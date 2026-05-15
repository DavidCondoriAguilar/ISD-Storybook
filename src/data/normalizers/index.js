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
  const mapped = mapFields(record, moduleName)
  
  // RESCATE DE DATA ANIDADA (Deep Mapping Senior)
  // Si el mapeo plano falló, buscamos en estructuras conocidas del JSON de exportación
  const deepMapped = {
    ...mapped,
    cantidad: mapped.cantidad || record.produccion?.cantidad || record.cantidad || 0,
    outputMaquina: mapped.outputMaquina || record.produccion?.output || record.output || 0,
    trabajador: mapped.trabajador || record.trabajador?.nombre || record.trabajador,
    maquina: mapped.maquina || record.ubicacion?.maquina || record.maquina,
    fecha: mapped.fecha || record.fechaLegible || record.fecha,
    // CRITICAL: Preservar metadatos de fecha para reconstrucción de timestamp
    metadatosFecha: record.metadatosFecha || record.MetadatosFecha || mapped.metadatosFecha,
    metadatos: record.metadatos || mapped.metadatos
  };

  const normalizedTimestamp = deepMapped.fechaTimestamp || normalizeTimestamp(deepMapped)
  const { workerKey, workerName } = normalizeWorker(deepMapped)
  const { modulo, maquina } = normalizeLocation(deepMapped)
  const { name: prodName, code: prodCode } = normalizeProduct(deepMapped)
  const { cantidadNeta, lecturaMaquina, unidadOriginal } = normalizeProduction(deepMapped)
  const { jornadaHoras, minutos, horasExtra, tipoJornada } = normalizeTime(deepMapped)
  
  const generatedId = generateRecordId(workerKey, normalizedTimestamp, index, record)

  const mId = (maquina || '').toUpperCase();
  const prod = (deepMapped.productoNombre || '').toLowerCase();
  const esMillar = mId.includes('MR') || prod.includes('resorte') || prod.includes('millar');

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
    fechaLegible: (() => {
      const d = new Date(normalizedTimestamp);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    esHoraExtra: horasExtra > 0,
    horasExtraCantidad: horasExtra,
    jornadaTotalHoras: jornadaHoras,
    status: 'ok',
    tipoJornada: tipoJornada,
    module: moduleName,
    fileName: fileName,
    importTimestamp: new Date().toISOString(),
    esMillar
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
  const { schema, module: detectedModule } = detectAndGetSchema(validatedPayload.fileName, validatedPayload.rawRecords)
  const activeModule = moduleName || detectedModule || 'paneles'
  
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