/**
 * WORKER DE IMPORTACIÓN (Segundo Plano)
 * Se encarga del procesamiento pesado para no congelar la UI.
 */
import { validateProductionData } from '../schemas/productionSchema';
import { normalizeRecords, calculateSummary } from '../utils/importUtils';

self.onmessage = async (e) => {
  // Defensive check for message data
  if (!e.data || !e.data.json) {
    self.postMessage({ success: false, error: 'No se recibieron datos válidos para procesar.' });
    return;
  }

  const { json } = e.data;

  try {
    // 1. Validación pesada
    const validation = validateProductionData(json);
    
    if (!validation.success) {
      const firstErr = (validation.errors && validation.errors[0]) || { message: 'Error de formato desconocido' };
      self.postMessage({ 
        success: false, 
        error: `Error en ${firstErr.path || 'datos'}: ${firstErr.message}` 
      });
      return;
    }

    // 2. Normalización masiva
    const normalized = normalizeRecords(validation.data);
    if (!normalized || normalized.length === 0) {
       self.postMessage({ success: false, error: 'El proceso de normalización no devolvió registros válidos.' });
       return;
    }

    // 3. Cálculo de insights
    const summary = calculateSummary(normalized);
    if (!summary) {
       self.postMessage({ success: false, error: 'No se pudo generar el resumen de la importación.' });
       return;
    }

    // 4. Devolver resultado
    self.postMessage({
      success: true,
      data: {
        records: normalized.length,
        units: summary.totalUnits,
        worker: summary.worker,
        shift: summary.shift,
        rawRecords: normalized // Cambiado de 'raw' a 'rawRecords'
      }
    });

  } catch (err) {
    console.error('Worker Internal Error:', err);
    self.postMessage({ 
      success: false, 
      error: 'Falla crítica en el motor de procesamiento: ' + (err.message || 'Error desconocido')
    });
  }
};
