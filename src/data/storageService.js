import { dbService, db } from './db'
import { APP_CONFIG } from '../config/appConfig'
import { normalizeImportPayload, normalizeRecords, buildImportRecord } from './normalizers'
import { calculateGlobalStats, getMonthlyData } from './aggregators'
import { discoverAndSaveAll } from './metadata/metadataService'

export const storageService = {
  async init() {
    const legacyData = localStorage.getItem(APP_CONFIG.STORAGE.HISTORY_KEY)
    if (legacyData) {
      try {
        const history = JSON.parse(legacyData)
        for (const record of history) {
          await dbService.saveImport(record)
        }
        localStorage.removeItem(APP_CONFIG.STORAGE.HISTORY_KEY)
      } catch (e) {
        console.error('Migration failed', e)
      }
    }
  },

  async getAll() {
    return await dbService.getAllImports()
  },

  async save(importPayload) {
    const validatedPayload = normalizeImportPayload(importPayload)
    const allExistingRecords = await dbService.getAllRecords()
    const { newRawRecords, duplicatesFound } = normalizeRecords(validatedPayload, allExistingRecords)

    if (newRawRecords.length === 0 && (validatedPayload.rawRecords || []).length > 0) {
      return { skipped: true, duplicatesDetected: duplicatesFound }
    }

    const importRecord = buildImportRecord(validatedPayload, newRawRecords, duplicatesFound)
    await discoverAndSaveAll(newRawRecords)
    await dbService.saveImport(importRecord)
    
    return importRecord
  },

  async getStats() {
    const [history, allRecords] = await Promise.all([
      dbService.getAllImports(),
      dbService.getAllRecords()
    ])

    if (history.length === 0) {
      return {
        totalImports: 0, totalUnits: 0, successRate: 0, avgUnitsPerImport: 0,
        totalFailed: 0, lastImport: null, topWorker: 'N/A', areaBreakdown: []
      }
    }

    const stats = calculateGlobalStats(history, allRecords)

    if (stats.lastImport?.id) {
      stats.lastImport.rawRecords = await db.records.where('importId').equals(stats.lastImport.id).toArray()
    }

    return stats
  },

  async getMonthlyData() {
    const history = await this.getAll()
    return getMonthlyData(history)
  },

  async getAllRecords() {
    return await dbService.getAllRecords()
  },

  async clear() {
    await dbService.clearAll()
  }
}