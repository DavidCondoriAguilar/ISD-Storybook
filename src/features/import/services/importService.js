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

    // Validate the first record as a sample of integrity (supports v1 and v2)
    if (!validateRecord(records[0])) {
      return { valid: false, error: 'El formato de los datos no coincide con la especificación de Android ISD.' };
    }

    // All good, extract metadata using dynamic mapping
    const first = records[0];
    const totalUnits = records.reduce((sum, r) => {
      const qty = r.produccion ? r.produccion.cantidad : r.cantidad;
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
 */
export function validateRecord(record) {
  if (typeof record !== 'object' || record === null) return false;
  
  const r = record;
  
  // Check for Nested Format (v2)
  const isV2 = r.trabajador && r.ubicacion && r.producto && r.produccion && r.tiempo;
  
  if (isV2) {
    return (
      typeof r.trabajador.nombre === 'string' &&
      typeof r.producto.nombre === 'string' &&
      typeof r.produccion.cantidad === 'number' &&
      typeof r.fecha === 'number'
    );
  }

  // Check for Flat Format (v1)
  const requiredV1 = ['id', 'moduloId', 'trabajadorDni', 'trabajadorNombre', 'cantidad', 'fechaTimestamp'];
  for (const field of requiredV1) {
    if (!(field in r)) return false;
  }
  
  return (
    typeof r.trabajadorNombre === 'string' &&
    typeof r.cantidad === 'number' &&
    typeof r.fechaTimestamp === 'number'
  );
}

/**
 * Transforms Android IDs to Human Readable Names
 */
export function getModuleName(id) {
  return APP_CONFIG.MODULES[id] || `Módulo ${id}`;
}
