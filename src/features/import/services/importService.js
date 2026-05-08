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
      console.log('[ImportService] 📂 Formato detectado: JSON');
      const content = await file.text();
      try {
        const json = JSON.parse(content);
        records = Array.isArray(json) ? json : (json.records || []);
        console.log('[ImportService] ✅ JSON parseado correctamente');
      } catch (parseErr) {
        console.error('[ImportService] ❌ Error fatal de parseo JSON:', parseErr);
        return { valid: false, error: 'El archivo JSON tiene un formato inválido: ' + parseErr.message };
      }
    } else {
      console.log('[ImportService] 📂 Formato detectado: Excel');
      records = await excelService.parseFile(file);
    }

    if (!records || records.length === 0) {
      console.warn('[ImportService] ⚠️ No se detectaron registros en el archivo');
      return { valid: false, error: 'El archivo no contiene registros válidos' };
    }

    console.log(`[ImportService] 📊 Procesando ${records.length} registros...`);
    console.log('[ImportService] 🔍 Preview del primer registro:', JSON.stringify(records[0], null, 2));

    // Senior Approach: Offload heavy validation to a Web Worker
    return new Promise((resolve) => {
      console.log('[ImportService] 🚀 Enviando datos al Web Worker');
      const worker = new Worker(new URL('../workers/importWorker.js', import.meta.url), { type: 'module' });
      
      worker.onmessage = (e) => {
        const { success, data, error } = e.data;
        worker.terminate();
        
        if (success) {
          console.log('[ImportService] ✅ Procesamiento exitoso');
          resolve({ valid: true, data });
        } else {
          console.error('[ImportService] ❌ Error devuelto por el Worker:', error);
          resolve({ valid: false, error });
        }
      };

      worker.onerror = (err) => {
        console.error('[ImportService] ❌ Error crítico en el Web Worker:', err);
        worker.terminate();
        resolve({ valid: false, error: 'Error en el procesamiento de datos (Worker Error).' });
      };

      worker.postMessage({ json: records });
    });

  } catch (err) {
    console.error('[ImportService] 🚨 Import Error:', err);
    return { valid: false, error: 'Error al procesar el archivo: ' + err.message };
  }
}

/**
 * Transforms Android IDs to Human Readable Names
 */
export function getModuleName(id) {
  return APP_CONFIG.MODULES[id] || `Módulo ${id}`;
}
