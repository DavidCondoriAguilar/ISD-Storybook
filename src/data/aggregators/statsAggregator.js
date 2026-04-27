import { calculateRecordEfficiency } from '../../config/productionTargets'

export const aggregateByWorker = (records) => {
  return records.reduce((acc, raw) => {
    const w = raw.trabajadorNombre || 'Sin asignar'
    const qty = Number(raw.cantidad ?? 0)
    acc[w] = (acc[w] || 0) + qty
    return acc
  }, {})
}

export const aggregateByArea = (records) => {
  return records.reduce((acc, raw) => {
    const area = raw.moduloId || raw.modulo || 'Otros'
    const qty = Number(raw.cantidad ?? 0)
    const rejections = Number(raw.cantidadRechazada ?? 0)
    const efficiency = Number(raw.eficiencia) || calculateRecordEfficiency(
      area, qty, Number(raw.jornadaTotalHoras) || 8, raw.unidadOriginal
    )
    
    if (!acc[area]) {
      acc[area] = { name: area, units: 0, rejected: 0, efficiencies: [], products: {} }
    }
    
    acc[area].units += qty
    acc[area].rejected += rejections
    if (efficiency > 0) acc[area].efficiencies.push(efficiency)
    
    const prodName = raw.productoNombre || 'Producto General'
    acc[area].products[prodName] = (acc[area].products[prodName] || 0) + qty
    
    return acc
  }, {})
}

export const aggregateByMachine = (records) => {
  return records.reduce((acc, raw) => {
    const machine = raw.maquinaId || 'Sin Máquina'
    const area = raw.moduloId || 'Otros'
    const qty = Number(raw.cantidad ?? 0)
    
    if (!acc[machine]) {
      acc[machine] = { name: machine, units: 0, area }
    }
    acc[machine].units += qty
    return acc
  }, {})
}

export const aggregateByDay = (records) => {
  return records.reduce((acc, raw) => {
    const dayKey = new Date(raw.fechaTimestamp || raw.fecha).toISOString().split('T')[0]
    const qty = Number(raw.cantidad ?? 0)
    const w = raw.trabajadorNombre || 'Sin asignar'
    const area = raw.moduloId || 'Otros'
    
    if (!acc[dayKey]) {
      acc[dayKey] = { total: 0, workers: {}, modules: {} }
    }
    
    acc[dayKey].total += qty
    acc[dayKey].workers[w] = (acc[dayKey].workers[w] || 0) + qty
    acc[dayKey].modules[area] = (acc[dayKey].modules[area] || 0) + qty
    
    return acc
  }, {})
}

export const buildAreaBreakdown = (areasAggregated) => {
  return Object.values(areasAggregated).map(a => {
    const topProd = Object.entries(a.products).sort((x, y) => y[1] - x[1])[0]
    return {
      ...a,
      topProduct: topProd ? `${topProd[0]} (${topProd[1]} u.)` : 'N/A',
      avgEfficiency: a.efficiencies.length > 0 
        ? Math.round(a.efficiencies.reduce((s, e) => s + e, 0) / a.efficiencies.length) 
        : 0
    }
  }).sort((a, b) => b.units - a.units)
}

export const calculateGlobalStats = (history, allRecords) => {
  if (history.length === 0) {
    return {
      totalImports: 0, totalUnits: 0, successRate: 0, avgUnitsPerImport: 0,
      totalFailed: 0, lastImport: null, topWorker: 'N/A', areaBreakdown: []
    }
  }
  
  const totalImports = history.length
  const totalUnits = allRecords.reduce((sum, r) => sum + (Number(r.cantidad || 0)), 0)
  const totalFailed = allRecords.reduce((sum, r) => sum + (Number(r.cantidadRechazada || 0)), 0)
  const totalSuccess = totalUnits - totalFailed
  const avgUnitsPerImport = Math.round(totalUnits / totalImports)
  const globalEfficiency = totalUnits > 0 ? (totalSuccess / totalUnits) * 100 : 0
  
  const workersAggregated = aggregateByWorker(allRecords)
  const topWorker = Object.entries(workersAggregated).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'
  const totalOvertimeHours = allRecords.reduce((sum, r) => sum + Number(r.horasExtraCantidad || 0), 0)
  
  const areasAggregated = aggregateByArea(allRecords)
  const machinesAggregated = aggregateByMachine(allRecords)
  const dailyStats = aggregateByDay(allRecords)
  
  return {
    totalImports,
    totalUnits,
    successRate: Math.round(globalEfficiency),
    avgUnitsPerImport,
    totalFailed,
    lastImport: history[0],
    topWorker,
    areaBreakdown: buildAreaBreakdown(areasAggregated),
    totalOvertimeHours,
    dailyStats,
    machineStats: Object.values(machinesAggregated).sort((a, b) => b.units - a.units)
  }
}