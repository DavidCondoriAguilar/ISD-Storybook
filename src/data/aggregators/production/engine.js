/**
 * Motor de agregación de producción.
 * Fase 2 del pipeline: CLEAN -> AGGREGATED
 */
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
  };

  records.forEach(r => {
    const { dateKey, maquinaKey, trabajador, producto, unidadesReales, unidadFisica, esMillar, esPanel, esProceso, eficiencia } = r;

    if (!stats.byDay[dateKey]) {
      stats.byDay[dateKey] = { date: dateKey, total: 0, paneles: 0, resortes: 0, procesos: 0 };
    }
    
    if (!stats.byWorker[trabajador]) {
      stats.byWorker[trabajador] = { 
        name: trabajador, 
        paneles: 0, 
        resortes: 0, 
        procesos: 0, 
        efficiencyScores: [],
        totalScore: 0 
      };
    }

    if (esPanel) {
      stats.totalPaneles += unidadesReales;
      stats.byDay[dateKey].paneles += unidadesReales;
      
      if (!stats.byMachinePaneles[maquinaKey]) {
        stats.byMachinePaneles[maquinaKey] = { units: 0, unitType: unidadFisica };
      }
      stats.byMachinePaneles[maquinaKey].units += unidadesReales;
      
      stats.byProductPaneles[producto] = (stats.byProductPaneles[producto] || 0) + unidadesReales;
      stats.byWorker[trabajador].paneles += unidadesReales;
    } else if (esMillar) {
      stats.totalResortes += unidadesReales;
      stats.byDay[dateKey].resortes += unidadesReales;
      
      if (!stats.byMachineResortes[maquinaKey]) {
        stats.byMachineResortes[maquinaKey] = { units: 0, unitType: unidadFisica };
      }
      stats.byMachineResortes[maquinaKey].units += unidadesReales;
      
      stats.byProductResortes[producto] = (stats.byProductResortes[producto] || 0) + unidadesReales;
      // Normalización a millares para el ranking
      stats.byWorker[trabajador].resortes += unidadesReales / 1000;
    } else if (esProceso) {
      stats.totalProcesos += unidadesReales;
      stats.byDay[dateKey].procesos += unidadesReales;
      stats.byWorker[trabajador].procesos += unidadesReales;
    }

    stats.byDay[dateKey][maquinaKey] = (stats.byDay[dateKey][maquinaKey] || 0) + unidadesReales;

    if (eficiencia > 0) {
      stats.byWorker[trabajador].efficiencyScores.push(eficiencia);
    }
  });

  // Cálculo de eficiencia promedio por trabajador
  Object.values(stats.byWorker).forEach(w => {
    if (w.efficiencyScores.length > 0) {
      w.totalScore = w.efficiencyScores.reduce((a, b) => a + b, 0) / w.efficiencyScores.length;
    }
  });

  // Generación de acumulados diarios
  let accPaneles = 0;
  let accResortes = 0;
  let accProcesos = 0;
  
  stats.dailyAccumulated = Object.entries(stats.byDay)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, data]) => {
      accPaneles += data.paneles;
      accResortes += data.resortes;
      accProcesos += data.procesos;
      return { date, accPaneles, accResortes, accProcesos };
    });

  return stats;
};
