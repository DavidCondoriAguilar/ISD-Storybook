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

    // Senior Logic: Flexible Validation to support various ISD versions
    if (!validateRecord(records[0])) {
      return { valid: false, error: 'El formato de los datos no coincide con la especificación de Android ISD.' };
    }

    // All good, extract metadata using dynamic mapping
    const first = records[0];
    const totalUnits = records.reduce((sum, r) => {
      const qty = r.produccion?.cantidad ?? r.cantidad ?? r.total ?? 0;
      return sum + (Number(qty || 0));
    }, 0);

    return { 
      valid: true, 
      data: { 
        records: records.length, 
        units: totalUnits,
        worker: first.trabajador?.nombre || first.trabajadorNombre || 'Usuario',
        shift: first.tiempo?.tipo || first.tipoJornada || 'Estándar',
        raw: records
      } 
    };
  } catch (err) {
    console.error('Validation Error:', err);
    return { valid: false, error: 'Error al procesar el JSON: ' + err.message };
  }
}

/**
 * Validates a single record supporting both Flat (v1) and Nested (v2) structures
 * Senior Logic: High flexibility to support all Android App versions
 */
export function validateRecord(record) {
  if (typeof record !== 'object' || record === null) return false;
  
  const r = record;
  
  // High-level heuristic: If it has trabajador and produccion, it's a valid ISD record
  const isV2 = (r.trabajador && r.produccion) || (r.trabajadorNombre && r.cantidad);
  
  if (isV2) {
    return true; // Trust the data if basic signature is present
  }
  
  // Check for minimal legacy requirements
  const requiredV1 = ['id', 'trabajadorNombre', 'cantidad'];
  const hasV1 = requiredV1.every(f => f in r);
  
  return hasV1;
}

/**
 * Transforms Android IDs to Human Readable Names
 */
export function getModuleName(id) {
  return APP_CONFIG.MODULES[id] || `Módulo ${id}`;
}
