/**
 * Formateadores de datos para UI.
 * Fase 3 del pipeline: AGGREGATED -> UI READY
 */
export const buildProductionStats = (aggregated) => {
  // 1. Formateo de volumen por máquinas
  const machineVolumePaneles = Object.entries(aggregated.byMachinePaneles)
    .map(([name, data]) => ({ name, units: data.units, unitType: data.unitType }))
    .sort((a, b) => b.units - a.units);

  const machineVolumeResortes = Object.entries(aggregated.byMachineResortes)
    .map(([name, data]) => ({ name, units: data.units, unitType: data.unitType }))
    .sort((a, b) => b.units - a.units);

  // 2. Rankings de trabajadores por categoría (Fixed Leader Logic)
  const workerRankingPaneles = Object.values(aggregated.byWorker)
    .filter(w => w.paneles > 0 || w.procesos > 0)
    .sort((a, b) => (b.paneles + b.procesos) - (a.paneles + a.procesos))
    .map(w => ({ 
      name: w.name, 
      score: w.paneles + w.procesos, 
      unit: 'u.',
      paneles: w.paneles,
      procesos: w.procesos
    }));

  const workerRankingResortes = Object.values(aggregated.byWorker)
    .filter(w => w.resortes > 0)
    .sort((a, b) => b.resortes - a.resortes)
    .map(w => ({ 
      name: w.name, 
      score: w.resortes, 
      unit: 'mil.' 
    }));

  // 3. Mix de productos
  const productMixPaneles = Object.entries(aggregated.byProductPaneles)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const productMixResortes = Object.entries(aggregated.byProductResortes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    machineVolumePaneles,
    machineVolumeResortes,
    workerRankingPaneles,
    workerRankingResortes,
    productMixPaneles,
    productMixResortes
  };
};
