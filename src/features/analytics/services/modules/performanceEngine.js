/**
 * MOTOR DE RENDIMIENTO (Rankings y Líderes)
 */
export const calculatePerformance = (records) => {
  const workerMap = {};
  const machineMap = {};

  records.forEach(r => {
    // Definir tipo de producto
    const mId = String(r.maquinaId || '').toUpperCase();
    const pName = String(r.productoNombre || '').toUpperCase();
    const isResorte = mId.includes('MR') || mId.includes('RESORTE') || pName.includes('RESORTE');
    const isProceso = pName.includes('EMBARILLADO') || pName.includes('CORTADO') || pName.includes('DOBLADO') || pName.includes('VARILLA');

    // Workers
    const name = r.trabajadorNombre || 'Sin Nombre';
    if (!workerMap[name]) {
      workerMap[name] = { name, total: 0, paneles: 0, procesos: 0, resortes: 0, area: r.area || 'General' };
    }
    
    workerMap[name].total += (r.cantidad || 0);
    
    if (isResorte) workerMap[name].resortes += (r.cantidad || 0);
    else if (isProceso) workerMap[name].procesos += (r.cantidad || 0);
    else workerMap[name].paneles += (r.cantidad || 0);

    // Machines
    const mName = r.maquinaId || 'Sin Máquina';
    if (mName !== 'Sin Máquina') {
      if (!machineMap[mName]) machineMap[mName] = { name: mName, total: 0 };
      machineMap[mName].total += (r.cantidad || 0);
    }
  });

  const topPaneleros = Object.values(workerMap)
    .filter(w => w.paneles > 0 || w.procesos > 0)
    .sort((a, b) => b.total - a.total)
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
