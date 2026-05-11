import { isResorte, isPanel, isProceso } from '../../../../domain/production/predicates';

/**
 * MOTOR DE RENDIMIENTO (Rankings y Líderes)
 */
export const calculatePerformance = (records) => {
  const workerMap = {};
  const machineMap = {};

  records.forEach(r => {
    const qty = Number(r.cantidad || r.produccion?.cantidad || 0);
    const workerName = r.trabajadorNombre || r.trabajador?.nombre || 'Sin Nombre';
    const mId = r.maquinaId || r.ubicacion?.maquina || 'Sin Máquina';

    // Workers
    if (!workerMap[workerName]) {
      workerMap[workerName] = { 
        name: workerName, 
        total: 0, 
        paneles: 0, 
        procesos: 0, 
        resortes: 0, 
        area: r.area || r.ubicacion?.modulo || 'General' 
      };
    }
    
    workerMap[workerName].total += qty;
    
    if (isResorte(r)) workerMap[workerName].resortes += qty;
    else if (isProceso(r)) workerMap[workerName].procesos += qty;
    else if (isPanel(r)) workerMap[workerName].paneles += qty;

    // Machines
    if (mId !== 'Sin Máquina') {
      if (!machineMap[mId]) machineMap[mId] = { name: mId, total: 0 };
      machineMap[mId].total += qty;
    }
  });

  const topPaneleros = Object.values(workerMap)
    .filter(w => w.paneles > 0 || w.procesos > 0)
    .sort((a, b) => (b.paneles + b.procesos) - (a.paneles + a.procesos))
    .slice(0, 5);

  const topResorteros = Object.values(workerMap)
    .filter(w => w.resortes > 0)
    .sort((a, b) => b.resortes - a.resortes)
    .slice(0, 5)
    .map(w => ({ ...w, total: w.resortes / 1000 })); // Mostrar en millares

  const machineStatsMP = Object.values(machineMap)
    .filter(m => !m.name.toUpperCase().includes('MR'))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const machineStatsMR = Object.values(machineMap)
    .filter(m => m.name.toUpperCase().includes('MR'))
    .map(m => ({ ...m, total: m.total / 1000 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Líderes destacados para tarjetas
  const leaderPaneles = topPaneleros[0] || null;
  const leaderResortes = topResorteros[0] || null;

  const allWorkers = Object.values(workerMap).sort((a, b) => b.total - a.total);

  return {
    topPaneleros,
    topResorteros,
    machineStatsMP,
    machineStatsMR,
    allWorkers,
    leaders: {
      topPanelero: leaderPaneles ? { name: leaderPaneles.name, reason: `${leaderPaneles.total.toLocaleString()} u. producidas` } : null,
      topResortero: leaderResortes ? { name: leaderResortes.name, reason: `${leaderResortes.total.toLocaleString()} mil. producidos` } : null
    }
  };
};
