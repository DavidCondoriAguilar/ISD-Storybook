import { parse, format, isValid } from 'date-fns'

export const transformProductionData = (rawRecords) => {
  if (!Array.isArray(rawRecords)) return []

  return rawRecords.map((record, index) => {
    let date = new Date()
    const rawFecha = record.fechaTimestamp || record.fecha
    
    if (rawFecha) {
      if (typeof rawFecha === 'string' && rawFecha.includes('/')) {
        try {
          const parsed = parse(rawFecha, 'dd/MM/yyyy', new Date())
          if (isValid(parsed)) date = parsed
        } catch (e) {
          date = new Date(rawFecha)
        }
      } else {
        date = new Date(rawFecha)
      }
    } else if (record.metadatosFecha) {
      const { anio, mes, dia, Anio, Mes, Dia } = record.metadatosFecha
      date = new Date(anio || Anio, (mes || Mes) - 1, dia || Dia)
    } else if (record.fechaLegible || record.FechaLegible) {
      date = new Date(record.fechaLegible || record.FechaLegible)
    }
    
    if (!isValid(date)) date = new Date()

    const unidad = (record.produccion?.unidad || record.Produccion?.Unidad || record.unidad || record.Unidad || 'unidades').toLowerCase()
    
    const maquina = record.ubicacion?.maquina || record.Ubicacion?.Maquina || 
                    record.ubicacion?.nombre || record.Ubicacion?.Nombre ||
                    record.maquinaNombre || record.maquina || record.Maquina || 'Sin máquina'
                    
    const productoLabel = record.producto?.nombre || record.Producto?.Nombre || 
                         record.productoNombre || record.producto || record.Producto || 'General'
    const productoLower = String(productoLabel).toLowerCase()
    
    const modulo = (record.ubicacion?.modulo || record.Ubicacion?.Modulo || record.moduloNombre || record.modulo || '').toLowerCase()
    const trabajador = record.trabajador?.nombre || record.Trabajador?.Nombre || record.trabajadorNombre || record.trabajador || 'Sin Asignar'
    
    const unidadesReales = Number(
      record.produccion?.cantidad || record.Produccion?.Cantidad || 
      record.cantidad || record.Cantidad || 
      record.total || record.Total || 0
    )
    const minutos = Number(record.tiempo?.minutos || record.Tiempo?.Minutos || record.tiempoMinutos || 525)

    const esMillar = unidad.includes('millar') || productoLower.includes('millar')
    const esTareaSoporte = productoLower.includes('embarillado') || 
                          productoLower.includes('doblado') || 
                          productoLower.includes('cortado') ||
                          productoLower.includes('pegado') ||
                          modulo.includes('soporte')
    
    const esPanel = !esMillar && !esTareaSoporte
    const esProceso = esTareaSoporte

    const eficiencia = minutos > 0 ? (unidadesReales / minutos) * 60 : 0

    return {
      ...record,
      date,
      dateKey: format(date, 'yyyy-MM-dd'),
      tipo: esMillar ? 'resorte' : esPanel ? 'panel' : 'proceso',
      unidadesReales,
      unidadFisica: esMillar ? 'millares' : unidad,
      esMillar,
      esPanel,
      esProceso,
      eficiencia,
      maquinaKey: maquina,
      trabajador,
      producto: productoLabel,
      minutos
    }
  })
}

export const aggregateProductionData = (records) => {
  const stats = {
    byDay: {},
    byMachinePaneles: {},
    byMachineResortes: {},
    byWorker: {}, 
    byProductPaneles: {},
    byProductResortes: {},
    dailyAccumulated: [],
    totalPaneles: 0,   
    totalResortes: 0,  
    totalProcesos: 0
  }

  records.forEach(r => {
    const { dateKey, maquinaKey, trabajador, producto, unidadesReales, unidadFisica, esMillar, esPanel, esProceso, eficiencia } = r

    if (!stats.byDay[dateKey]) {
      stats.byDay[dateKey] = { date: dateKey, total: 0, paneles: 0, resortes: 0, procesos: 0 }
    }
    
    if (!stats.byWorker[trabajador]) {
      stats.byWorker[trabajador] = { 
        name: trabajador, 
        paneles: 0, 
        resortes: 0, 
        procesos: 0, 
        efficiencyScores: [],
        totalScore: 0 
      }
    }

    if (esPanel) {
      stats.totalPaneles += unidadesReales
      stats.byDay[dateKey].paneles += unidadesReales
      
      if (!stats.byMachinePaneles[maquinaKey]) {
        stats.byMachinePaneles[maquinaKey] = { units: 0, unitType: unidadFisica }
      }
      stats.byMachinePaneles[maquinaKey].units += unidadesReales
      
      stats.byProductPaneles[producto] = (stats.byProductPaneles[producto] || 0) + unidadesReales
      stats.byWorker[trabajador].paneles += unidadesReales
    } else if (esMillar) {
      stats.totalResortes += unidadesReales
      stats.byDay[dateKey].resortes += unidadesReales
      
      if (!stats.byMachineResortes[maquinaKey]) {
        stats.byMachineResortes[maquinaKey] = { units: 0, unitType: unidadFisica }
      }
      stats.byMachineResortes[maquinaKey].units += unidadesReales
      
      stats.byProductResortes[producto] = (stats.byProductResortes[producto] || 0) + unidadesReales
      stats.byWorker[trabajador].resortes += unidadesReales / 1000
    } else if (esProceso) {
      stats.totalProcesos += unidadesReales
      stats.byDay[dateKey].procesos += unidadesReales
      stats.byWorker[trabajador].procesos += unidadesReales
    }

    stats.byDay[dateKey][maquinaKey] = (stats.byDay[dateKey][maquinaKey] || 0) + unidadesReales

    if (eficiencia > 0) {
      stats.byWorker[trabajador].efficiencyScores.push(eficiencia)
    }
  })

  Object.values(stats.byWorker).forEach(w => {
    if (w.efficiencyScores.length > 0) {
      w.totalScore = w.efficiencyScores.reduce((a, b) => a + b, 0) / w.efficiencyScores.length
    }
  })

  let accPaneles = 0
  let accResortes = 0
  let accProcesos = 0
  
  stats.dailyAccumulated = Object.entries(stats.byDay)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, data]) => {
      accPaneles += data.paneles
      accResortes += data.resortes
      accProcesos += data.procesos
      return { date, accPaneles, accResortes, accProcesos }
    })

  return stats
}

export const buildProductionStats = (aggregated) => {
  const machineVolumePaneles = Object.entries(aggregated.byMachinePaneles)
    .map(([name, data]) => ({ name, units: data.units, unitType: data.unitType }))
    .sort((a, b) => b.units - a.units)

  const machineVolumeResortes = Object.entries(aggregated.byMachineResortes)
    .map(([name, data]) => ({ name, units: data.units, unitType: data.unitType }))
    .sort((a, b) => b.units - a.units)

  const maxEfficiency = Math.max(...Object.values(aggregated.byWorker).map(w => w.totalScore), 1)

  const workerRanking = Object.values(aggregated.byWorker)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map(w => ({
      name: w.name,
      paneles: w.paneles,
      resortes: w.resortes,
      procesos: w.procesos,
      efficiency: w.totalScore,
      visualScore: (w.totalScore / maxEfficiency) * 100 
    }))

  const productMixPaneles = Object.entries(aggregated.byProductPaneles)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const productMixResortes = Object.entries(aggregated.byProductResortes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return {
    machineVolumePaneles,
    machineVolumeResortes,
    workerRanking,
    productMixPaneles,
    productMixResortes
  }
}