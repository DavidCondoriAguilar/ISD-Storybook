import { APP_CONFIG } from '../../../config/appConfig'

/**
 * Service to validate and process imports based on EXACT Android ISD App Specification
 * Enhanced for v2 Nested Format Support
 */

export async function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado un archivo' }
  }

  if (!file.name.endsWith('.json')) {
    return { valid: false, error: 'El archivo debe ser JSON (.json)' }
  }

  try {
    const content = await file.text();
    const records = JSON.parse(content);

    if (!Array.isArray(records)) {
      return { valid: false, error: 'Formato inválido: El archivo debe ser un Array de JSON.' };
    }

    if (records.length === 0) {
      return { valid: false, error: 'El archivo está vacío.' };
    }

    if (!validateRecord(records[0])) {
      return { valid: false, error: 'El formato de los datos no coincide con la especificación de Android ISD.' };
    }

    const normalized = normalizeRecords(records);
    const summary = calculateSummary(normalized);

    return { 
      valid: true, 
      data: { 
        records: normalized.length, 
        units: summary.totalUnits,
        worker: summary.worker,
        shift: summary.shift,
        raw: normalized
      } 
    };
  } catch (err) {
    console.error('Validation Error:', err);
    return { valid: false, error: 'Error al procesar el JSON: ' + err.message };
  }
}

/**
 * Ensures all records follow the same "Golden Schema"
 */
export function normalizeRecords(records) {
  return records.map(r => {
    // Standardize structure for v1 and v2
    const trabajadorNombre = r.trabajador?.nombre || r.trabajadorNombre || 'Desconocido';
    const productoNombre = r.producto?.nombre || r.productoNombre || r.producto || 'Sin Producto';
    const cantidad = Number(r.produccion?.cantidad ?? r.cantidad ?? r.total ?? 0);
    const moduloId = r.ubicacion?.modulo || r.moduloId || 'N/A';
    const maquinaId = r.ubicacion?.maquina || r.maquinaId || 'N/A';
    
    // Ensure we have a timestamp
    const dateStr = r.fecha || r.tiempo?.fecha || new Date().toISOString();
    const timestamp = new Date(dateStr).getTime();

    return {
      idLocal: r.id || `rec_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: timestamp,
      fechaTimestamp: timestamp,
      fechaLegible: dateStr.split('T')[0],
      trabajadorNombre,
      productoNombre,
      cantidad,
      moduloId,
      maquinaId,
      tipoJornada: r.tiempo?.tipo || r.tipoJornada || 'Estándar',
      metadata: {
        originalId: r.id,
        version: r.trabajador ? 'v2' : 'v1'
      }
    };
  });
}

/**
 * Pure function to calculate data insights before storage
 */
export function calculateSummary(normalizedRecords) {
  if (!normalizedRecords.length) return null;

  const totalUnits = normalizedRecords.reduce((sum, r) => sum + r.cantidad, 0);
  const first = normalizedRecords[0];

  return {
    totalUnits,
    totalRecords: normalizedRecords.length,
    worker: first.trabajadorNombre,
    shift: first.tipoJornada,
    avgPerRecord: (totalUnits / normalizedRecords.length).toFixed(2)
  };
}

export function validateRecord(record) {
  if (typeof record !== 'object' || record === null) return false;
  const isV2 = (record.trabajador && record.produccion) || (record.trabajadorNombre && record.cantidad);
  return isV2 || (record.id && record.trabajadorNombre && record.cantidad);
}

export function getModuleName(id) {
  return APP_CONFIG.MODULES[id] || `Módulo ${id}`;
}
