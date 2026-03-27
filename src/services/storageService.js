const STORAGE_KEY = 'import_production_history'

export const storageService = {
  getAll() {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  save(importRecord) {
    const history = this.getAll()
    const newRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...importRecord
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
        const area = raw.stageName || 'Otros'
        
        workers[w] = (workers[w] || 0) + (raw.quantity || 0)
        
        if (!areas[area]) areas[area] = { name: area, units: 0, rejected: 0 }
        areas[area].units += (raw.quantity || 0)
        areas[area].rejected += (raw.quantityRejected || 0)
      })
    })
    
    const topWorker = Object.entries(workers).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'
    const lastImport = history[0]

    return {
      totalImports,
      totalUnits,
      successRate: Math.round(globalEfficiency),
      avgUnitsPerImport,
      totalFailed,
      lastImport,
      topWorker,
      areaBreakdown: Object.values(areas).sort((a,b) => b.units - a.units)
    }
  },

  getMonthlyData() {
    const history = this.getAll()
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const dataByMonth = {}
    
    history.forEach(r => {
      const date = new Date(r.timestamp)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!dataByMonth[key]) dataByMonth[key] = { name: months[date.getMonth()], units: 0, imports: 0, ts: date.getTime() }
      dataByMonth[key].units += (r.units || 0)
      dataByMonth[key].imports += 1
    })
    
    return Object.values(dataByMonth)
      .sort((a, b) => a.ts - b.ts)
      .slice(-6)
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}
