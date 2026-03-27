import { ImportResult } from '../types'

export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado un archivo' }
  }

  if (!file.name.endsWith('.json')) {
    return { valid: false, error: 'El archivo debe ser JSON' }
  }

  return { valid: true, data: { records: 3, units: 1430 } }
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
