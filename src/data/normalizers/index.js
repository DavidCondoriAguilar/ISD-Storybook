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
    // Si el registro ya viene normalizado por el Worker de Excel, respetamos sus campos clave
    const normalizedTimestamp = r.fechaTimestamp || normalizeTimestamp(r);
    const { workerKey, workerName } = normalizeWorker(r);
    const { modulo, maquina } = normalizeLocation(r);
    const { name: prodName, code: prodCode } = normalizeProduct(r);
    const { cantidadNeta, lecturaMaquina, unidadOriginal } = normalizeProduction(r);
    const { jornadaHoras, minutos, horasExtra, tipoJornada } = normalizeTime(r);
    
    const generatedId = r.id || r.idLocal || generateRecordId(workerKey, normalizedTimestamp, i, r);
    
    return {
      idLocal: generatedId,
      trabajadorDni: workerKey,
      trabajadorNombre: workerName,
      moduloId: modulo,
      area: modulo,
      maquinaId: maquina,
      productoId: prodCode,
      productoNombre: sanitizarNombre(prodName),
      cantidad: cantidadNeta,
      cantidadOriginal: cantidadNeta,
      unidad: unidadOriginal,
      unidadOriginal: unidadOriginal,
      outputMaquina: lecturaMaquina,
      tiempoMinutos: minutos,
      fechaTimestamp: normalizedTimestamp,
      fechaLegible: r.fechaLegible || new Date(normalizedTimestamp).toISOString().split('T')[0], // PRESERVAMOS FECHA LEGIBLE
      esHoraExtra: horasExtra > 0,
      horasExtraCantidad: horasExtra,
      jornadaTotalHoras: jornadaHoras,
      status: 'ok',
      tipoJornada: tipoJornada,
      fileName: validatedPayload.fileName,
      importTimestamp: r.importTimestamp || new Date().toISOString()
    };
  });

  // Detección de Duplicados (Mejorada para no borrar registros válidos)
  const existingKeys = new Set(existingRecords.map(r => `${r.idLocal}-${r.fechaTimestamp}-${r.cantidad}`));
  const newRawRecords = normalizedRecords.filter(r => {
    const key = `${r.idLocal}-${r.fechaTimestamp}-${r.cantidad}`;
    return !existingKeys.has(key);
  });
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