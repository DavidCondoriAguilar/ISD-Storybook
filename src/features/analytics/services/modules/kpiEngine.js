import { isResorte as checkIsResorte } from '../../../../domain/production/predicates';

/**
 * MOTOR DE KPIs (Core de métricas de producción)
 */
export const calculateKPIs = (records) => {
  if (!records || records.length === 0) return {
    totalUnits: 0, totalPaneles: 0, totalResortes: 0, totalProcesos: 0,
    uniqueWorkers: 0, activeMachines: 0, totalRecords: 0,
    variations: { paneles: 0, resortes: 0, procesos: 0 },
    cumplimientoPaneles: 0, cumplimientoResortes: 0, cumplimientoProcesos: 0
  };

  const workers = new Set();
  const machines = new Set();
  let totalPaneles = 0;
  let totalResortes = 0;
  let totalProcesos = 0;

  const dailyTotals = {};

  records.forEach(r => {
    const date = new Date(r.fechaTimestamp).toLocaleDateString('en-CA');
    if (!dailyTotals[date]) dailyTotals[date] = { p: 0, r: 0, pr: 0 };

    const pName = String(r.productoNombre || '').toUpperCase();
    
    // Clasificación Unificada (Dominio)
    const isResorte = checkIsResorte(r);
    
    // Identificación de Procesos (Lógica específica de analítica)
    const isProceso = pName.includes('EMBARILLADO') || 
                      pName.includes('CORTADO') || 
                      pName.includes('DOBLADO') || 
                      pName.includes('VARILLA');

    if (isResorte) {
      totalResortes += (r.cantidad || 0);
      dailyTotals[date].r += (r.cantidad || 0);
    } else if (isProceso) {
      totalProcesos += (r.cantidad || 0);
      dailyTotals[date].pr += (r.cantidad || 0);
    } else {
      totalPaneles += (r.cantidad || 0);
      dailyTotals[date].p += (r.cantidad || 0);
    }
    
    if (r.trabajadorNombre) workers.add(r.trabajadorNombre);
    if (r.maquinaId && r.maquinaId !== 'Sin Máquina') machines.add(r.maquinaId);
  });


  // Variaciones sobre datos reales disponibles (no necesariamente días consecutivos)
  const sortedDates = Object.keys(dailyTotals).sort();
  const lastDate = sortedDates[sortedDates.length - 1];
  const prevDate = sortedDates[sortedDates.length - 2];
  
  const calculateVar = (curr, prev) => {
    if (!prev || prev === 0) return null; // Retornar null si no hay con qué comparar
    return ((curr - prev) / prev) * 100;
  };

  const variations = {
    paneles: calculateVar(dailyTotals[lastDate]?.p, dailyTotals[prevDate]?.p),
    resortes: calculateVar(dailyTotals[lastDate]?.r, dailyTotals[prevDate]?.r),
    procesos: calculateVar(dailyTotals[lastDate]?.pr, dailyTotals[prevDate]?.pr)
  };

  const uniqueDays = sortedDates.length || 1;
  const METAS_BASE = { paneles: 1500, resortes: 1000, procesos: 2000 };
  const totalResortesMil = totalResortes / 1000;

  return {
    totalUnits: totalPaneles + totalResortes + totalProcesos,
    totalPaneles,
    totalResortes: totalResortesMil,
    totalProcesos,
    uniqueWorkers: workers.size,
    activeMachines: machines.size,
    totalRecords: records.length,
    variations,
    lastUpdate: lastDate,
    cumplimientoPaneles: (totalPaneles / (METAS_BASE.paneles * uniqueDays)) * 100,
    cumplimientoResortes: (totalResortesMil / (METAS_BASE.resortes * uniqueDays)) * 100,
    cumplimientoProcesos: (totalProcesos / (METAS_BASE.procesos * uniqueDays)) * 100,
    metas: {
      paneles: METAS_BASE.paneles * uniqueDays,
      resortes: METAS_BASE.resortes * uniqueDays,
      procesos: METAS_BASE.procesos * uniqueDays
    }
  };
};
