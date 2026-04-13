const STORAGE_KEY = 'import_production_history'

export const storageService = {
  getAll() {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  save(importRecord) {
    const history = this.getAll()
    
    // Senior Logic: Global Duplicate Detection (Idempotency)
    // We create a set of unique keys from all past records to avoid double-counting
    const existingKeys = new Set()
    history.forEach(h => {
      (h.rawRecords || []).forEach(r => {
        const key = `${r.idLocal || r.orderNumber}-${r.fecha || r.timestamp}`
        existingKeys.add(key)
      })
    })

    const newRawRecords = (importRecord.rawRecords || []).filter(r => {
      const key = `${r.idLocal || r.orderNumber}-${r.fecha || r.timestamp}`
      return !existingKeys.has(key)
    })

    const duplicatesFound = (importRecord.rawRecords || []).length - newRawRecords.length

    if (newRawRecords.length === 0 && (importRecord.rawRecords || []).length > 0) {
      return { skipped: true, duplicates: duplicatesFound }
    }

    const newRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...importRecord,
      success: newRawRecords.length, // Only count successfully added unique records
      units: newRawRecords.reduce((s, r) => s + (Number(r.cantidad || 0)), 0),
      rawRecords: newRawRecords,
      duplicatesDetected: duplicatesFound
    }

    history.unshift(newRecord)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return newRecord
  },

  getStats() {
    const history = this.getAll()
    if (history.length === 0) {
      return {
        totalImports: 0, 
        totalUnits: 0, 
        successRate: 0, 
        avgUnitsPerImport: 0,
        totalFailed: 0,
        lastImport: null,
        topWorker: 'N/A'
      }
    }
    
    const totalImports = history.length
    const totalUnits = history.reduce((sum, r) => sum + (r.units || 0), 0)
    // Use the 'success' and 'failed' properties from the stored record
    const totalSuccess = history.reduce((sum, r) => sum + (r.success || 0), 0)
    const totalFailed = history.reduce((sum, r) => sum + (r.failed || 0), 0)
    
    // Derived Metrics
    const avgUnitsPerImport = Math.round(totalUnits / totalImports)
    // Efficiency is based on Units: (Good Units / Total Units)
    const globalEfficiency = totalUnits > 0 ? (totalSuccess / totalUnits) * 100 : 0
    
    // Aggregations
    const workers = {}
    const areas = {}
    
    history.forEach(r => {
      // Record-level granularity if rawRecords exists
      const innerRecs = r.rawRecords || [r]
      innerRecs.forEach(raw => {
        const w = r.worker || 'Sin asignar'
        const area = raw.modulo || raw.stageName || 'Otros'
        const qty = Number(raw.cantidad ?? raw.quantity ?? 0)
        const rejections = Number(raw.cantidadRechazada ?? raw.quantityRejected ?? 0)
        const efficiency = Number(raw.eficiencia || 0)
        
        workers[w] = (workers[w] || 0) + qty
        
        if (!areas[area]) areas[area] = { name: area, units: 0, rejected: 0, efficiencies: [] }
        areas[area].units += qty
        areas[area].rejected += rejections
        if (efficiency > 0) areas[area].efficiencies.push(efficiency)
      })
    })
    
    const topWorker = Object.entries(workers).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'
    const lastImport = history[0]

    const areaBreakdown = Object.values(areas).map(a => ({
      ...a,
      avgEfficiency: a.efficiencies.length > 0 ? Math.round(a.efficiencies.reduce((s, e) => s + e, 0) / a.efficiencies.length) : 0
    })).sort((a,b) => b.units - a.units)

    return {
      totalImports,
      totalUnits,
      successRate: Math.round(globalEfficiency),
      avgUnitsPerImport,
      totalFailed,
      lastImport,
      topWorker,
      areaBreakdown
    }
  },

  getMonthlyData() {
    const history = this.getAll()
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const dataByMonth = {}
    
    history.forEach(r => {
      const date = new Date(r.timestamp)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!dataByMonth[key]) {
        dataByMonth[key] = { 
          name: months[date.getMonth()], 
          units: 0, 
          imports: 0, 
          ts: date.getTime(),
          breakdown: {} 
        }
      }
      
      dataByMonth[key].units += (r.units || 0)
      dataByMonth[key].imports += 1
      
      // Categorical breakdown for trend insights
      const records = r.rawRecords || []
      records.forEach(rec => {
        const cat = rec.modulo || rec.productoTipo || 'Otros'
        const qty = Number(rec.cantidad || 0)
        dataByMonth[key].breakdown[cat] = (dataByMonth[key].breakdown[cat] || 0) + qty
      })
    })
    
    return Object.values(dataByMonth)
      .sort((a, b) => a.ts - b.ts)
      .slice(-6)
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}
