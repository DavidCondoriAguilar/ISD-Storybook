import { APP_CONFIG } from '../../../config/appConfig';

/**
 * SERVICIO DE IMPORTACIÓN (Orquestador)
 * Delega el trabajo pesado al Web Worker y maneja la comunicación.
 */

export async function validateFile(file) {
  if (!file) return { valid: false, error: 'No se ha seleccionado un archivo' };
  if (!file.name.endsWith('.json')) return { valid: false, error: 'El archivo debe ser JSON (.json)' };

  try {
    const content = await file.text();
    const json = JSON.parse(content);

    // Senior Approach: Offload processing to a Web Worker
    return new Promise((resolve) => {
      // Usamos el constructor de URL para que Vite localice correctamente el Worker
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
        resolve({ valid: false, error: 'Error crítico en el hilo de procesamiento.' });
      };

      worker.postMessage({ json });
    });

  } catch (err) {
    console.error('Validation Error:', err);
    return { valid: false, error: 'Error al leer el archivo JSON: ' + err.message };
  }
}

/**
 * Transforms Android IDs to Human Readable Names
 */
export function getModuleName(id) {
  return APP_CONFIG.MODULES[id] || `Módulo ${id}`;
}
