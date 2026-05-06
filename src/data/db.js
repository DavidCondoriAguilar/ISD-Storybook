import Dexie from 'dexie';
import { APP_CONFIG } from '../config/appConfig';

/**
 * @database ProductionHubDB
 * @description Implementación de persistencia robusta utilizando IndexedDB (vía Dexie.js).
 * Esta arquitectura permite manejar gigabytes de datos localmente con rendimiento O(log n).
 */
export const db = new Dexie(APP_CONFIG.STORAGE.DB_NAME);

/**
 * @schema
 * @description Definición de tablas optimizadas para consultas industriales a gran escala.
 */
db.version(APP_CONFIG.STORAGE.DB_VERSION).stores({
  imports: '++id, timestamp, fileName, worker', 
  records: '++id, idLocal, timestamp, fechaTimestamp, trabajadorNombre, productoNombre, moduloId, area, maquinaId, importId',
  metadata: 'id, value'
});

/**
 * @service dbService
 * @description Capa de abstracción para operaciones atómicas en la base de datos.
 */
export const dbService = {
  /**
   * @async
   * @method saveImport
   * @description Registra un lote de importación y sus registros individuales en una transacción atómica.
   * @param {Object} importSummary - Resumen normalizado de la importación.
   * @returns {Promise<number>} ID de la importación generada.
   */
  async saveImport(importSummary) {
    return await db.transaction('rw', db.imports, db.records, async () => {
      // 1. Add summary to imports table
      const importId = await db.imports.add({
        timestamp: importSummary.timestamp,
        fileName: importSummary.fileName,
        worker: importSummary.worker,
        shift: importSummary.shift,
        success: importSummary.success,
        failed: importSummary.failed,
        total: importSummary.total,
        units: importSummary.units,
        duplicatesDetected: importSummary.duplicatesDetected
      });

      // 2. Add individual records linked to this import if needed
      if (importSummary.rawRecords && importSummary.rawRecords.length > 0) {
        const recordsToSave = importSummary.rawRecords.map(r => ({
          ...r,
          importId // Link to parent
        }));
        await db.records.bulkAdd(recordsToSave);
      }

      return importId;
    });
  },

  /**
   * Retrieves all imports
   */
  async getAllImports() {
    return await db.imports.orderBy('timestamp').reverse().toArray();
  },

  /**
   * Retrieves all individual records
   */
  async getAllRecords() {
    return await db.records.toArray();
  },

  /**
   * Clears all data with administrative safety
   */
  async clearAll() {
    return await db.transaction('rw', db.imports, db.records, async () => {
      await db.imports.clear();
      await db.records.clear();
    });
  },

  /**
   * High-Performance range query using indices
   */
  async getRecordsByDateRange(startDate, endDate) {
    return await db.records
      .where('fechaTimestamp')
      .between(startDate, endDate)
      .toArray();
  }
};
