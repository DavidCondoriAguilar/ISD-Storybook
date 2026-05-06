import { APP_CONFIG } from '../../../config/appConfig';
import { excelService } from './excelService';

/**
 * SERVICIO DE IMPORTACIÓN (Orquestador)
 * Soporta JSON (Nativo) y Excel (Android App Export).
 */

export async function validateFile(file) {
  if (!file) return { valid: false, error: 'No se ha seleccionado un archivo' };
  
  const isJSON = file.name.endsWith('.json');
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

  if (!isJSON && !isExcel) {
    return { valid: false, error: 'Formato no soportado. Usa .json o .xlsx' };
  }

  try {
    let records = [];

    if (isJSON) {
      console.log('[ImportService] Formato detectado: JSON');
      const content = await file.text();
      const json = JSON.parse(content);
      records = Array.isArray(json) ? json : (json.records || []);
    } else {
      console.log('[ImportService] Formato detectado: Excel');
      records = await excelService.parseFile(file);
    }

    console.log(`[ImportService] Procesando ${records.length} registros...`);

    // Senior Approach: Offload heavy validation to a Web Worker
    return new Promise((resolve) => {
      console.log('[ImportService] Enviando datos al Web Worker');
      const worker = new Worker(new URL('../workers/importWorker.js', import.meta.url), { type: 'module' });
      
      worker.onmessage = (e) => {
        const { success, data, error } = e.data;
        worker.terminate();
        
        if (success) {
          resolve({ valid: true, data });
        } else {
          resolve({ valid: false, error });
        }
      };

      worker.onerror = (err) => {
        worker.terminate();
        resolve({ valid: false, error: 'Error en el procesamiento de datos.' });
      };

      worker.postMessage({ json: records });
    });

  } catch (err) {
    console.error('Import Error:', err);
    return { valid: false, error: 'Error al procesar el archivo: ' + err.message };
  }
}

/**
 * Transforms Android IDs to Human Readable Names
 */
export function getModuleName(id) {
  return APP_CONFIG.MODULES[id] || `Módulo ${id}`;
}
