import { ImportResult } from '../types/importTypes'

export async function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado un archivo' }
  }

  if (!file.name.endsWith('.json')) {
    return { valid: false, error: 'El archivo debe ser JSON' }
  }

  try {
    const content = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });

    const data = JSON.parse(content);
    const records = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : null);

    if (!records) {
      return { valid: false, error: 'El archivo no contiene una lista de registros válida.' };
    }

    // New format uses 'cantidad'
    const units = records.reduce((sum, r) => sum + (Number(r.cantidad ?? r.quantity ?? 0)), 0);
    const worker = data.worker?.name || records[0]?.trabajadorNombre || 'Usuario';
    const shift = data.shift?.type || records[0]?.turno || 'N/A';

    return { 
      valid: true, 
      data: { 
        records: records.length, 
        units: units,
        worker: worker,
        shift: shift,
        dni: records[0]?.trabajadorDni || null
      } 
    };
  } catch (err) {
    return { valid: false, error: 'El archivo JSON no es válido o está corrupto.' };
  }
}

export async function processImport(file, validate) {
  await new Promise(resolve => setTimeout(resolve, 500))

  const shouldFail = Math.random() > 0.7

  if (shouldFail) {
    return {
      result: ImportResult.PARTIAL,
      success: 2,
      failed: 1,
      total: 3,
      units: 950,
      errors: [
        { message: 'Producto no encontrado: ID 999', record: 'rec-003' }
      ]
    }
  }

  return {
    result: ImportResult.SUCCESS,
    success: 3,
    failed: 0,
    total: 3,
    units: 1430,
    errors: []
  }
}

export function generateReport(summary) {
  const lines = [
    '=== REPORTE DE IMPORTACIÓN ===',
    `Fecha: ${new Date().toISOString()}`,
    `Total registros: ${summary.total}`,
    `Exitosos: ${summary.success}`,
    `Fallidos: ${summary.failed}`,
    `Unidades: ${summary.units}`,
    ''
  ]

  if (summary.errors.length > 0) {
    lines.push('=== ERRORES ===')
    summary.errors.forEach(err => {
      lines.push(`- ${err.message} (${err.record})`)
    })
  }

  return lines.join('\n')
}
