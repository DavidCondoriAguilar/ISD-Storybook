import Dexie from 'dexie';
import { APP_CONFIG } from '../config/appConfig';

/**
 * ProductionHub Database implementation using Dexie.js
 * Provides robust persistence using IndexedDB (Scale to GBs)
 */
export const db = new Dexie(APP_CONFIG.STORAGE.DB_NAME);

// Define schema
db.version(APP_CONFIG.STORAGE.DB_VERSION).stores({
  imports: '++id, timestamp, fileName, worker', 
  records: '++id, idLocal, timestamp, trabajadorNombre, moduloId, importId',
  metadata: 'id, value'
});

/**
 * Database Service to abstract Dexie operations
 */
export const dbService = {
  /**
   * Saves a full import result and its individual records
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
   * Clears all data
   */
  async clearAll() {
    await db.imports.clear();
    await db.records.clear();
  }
};
