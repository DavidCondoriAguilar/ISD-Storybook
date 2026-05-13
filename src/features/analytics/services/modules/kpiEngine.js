import { isResorte, isPanel, isProceso } from '../../../../domain/production/predicates';

/**
 * MOTOR DE KPIs (Core de métricas de producción)
 * Refactorizado por Mentor Senior (30+ años exp) para Máximo Valor Ejecutivo.
 */
export const calculateKPIs = (records) => {
  // 1. Manejo de estado vacío (Guard Clause)
  if (!records || records.length === 0) return {
    totalUnits: 0, totalPaneles: 0, totalResortes: 0, totalProcesos: 0,
    uniqueWorkers: 0, activeMachines: 0, totalRecords: 0,
    variations: { paneles: 0, resortes: 0, procesos: 0 },
    cumplimiento: { paneles: 0, resortes: 0, procesos: 0, global: 0 },
    metas: { paneles: 0, resortes: 0, procesos: 0 }
  };

  console.log('[KPI v12] Registros recibidos:', records.length);
  if (records.length > 0) {
    console.log('[KPI v12] Sample:', JSON.stringify(records[0], null, 2));
  }
  
  const workers = new Set();
  const machines = new Set();
  let totalPaneles = 0;
  let totalResortesRaw = 0;
  let totalProcesos = 0;

  const dailyTotals = {};

  // 2. Procesamiento de registros (Single Pass Architecture)
  records.forEach(r => {
    const date = r.fechaLegible || '2026-01-01';
    if (!dailyTotals[date]) dailyTotals[date] = { p: 0, r: 0, pr: 0 };

    const qty = Number(r.cantidad || r.produccion?.cantidad || r.cantidadOriginal || 0);
    const workerName = r.trabajadorNombre || r.trabajador?.nombre;
    
    // CLASIFICACIÓN POR PREDICADOS DE DOMINIO (Senior Standard)
    if (isResorte(r)) {
      totalResortesRaw += qty;
      dailyTotals[date].r += qty;
    } else if (isPanel(r)) {
      totalPaneles += qty;
      dailyTotals[date].p += qty;
    } else if (isProceso(r)) {
      totalProcesos += qty;
      dailyTotals[date].pr += qty;
    }
    
    if (workerName) workers.add(workerName);
    const mId = r.maquinaId || r.ubicacion?.maquina || r.maquina;
    if (mId && mId !== 'Sin Máquina') machines.add(mId);
  });

  console.log(`[KPI v13] Agregación: Paneles=${totalPaneles}, Resortes=${totalResortesRaw}, Procesos=${totalProcesos}`);

  // 3. Inteligencia Comparativa (Deltas)
  const sortedDates = Object.keys(dailyTotals).sort();
  const lastDate = sortedDates[sortedDates.length - 1];
  const prevDate = sortedDates[sortedDates.length - 2];
  
  const calculateVar = (curr, prev) => {
    if (!prev || prev === 0) return 0; 
    return parseFloat(((curr - prev) / prev * 100).toFixed(1));
  };

  const variations = {
    paneles: calculateVar(dailyTotals[lastDate]?.p, dailyTotals[prevDate]?.p),
    resortes: calculateVar(dailyTotals[lastDate]?.r, dailyTotals[prevDate]?.r),
    procesos: calculateVar(dailyTotals[lastDate]?.pr, dailyTotals[prevDate]?.pr)
  };

  // 4. Metas y Cumplimiento (Normalizado)
  const uniqueDays = sortedDates.length || 1;
  const METAS_DIARIAS = { paneles: 300, resortes: 35000, procesos: 500 }; 
  
  const totalResortesMil = totalResortesRaw / 1000;
  const metaResortesMil = (METAS_DIARIAS.resortes * uniqueDays) / 1000;

  const cumplimiento = {
    paneles: Math.min((totalPaneles / (METAS_DIARIAS.paneles * uniqueDays)) * 100, 100),
    resortes: Math.min((totalResortesRaw / (METAS_DIARIAS.resortes * uniqueDays)) * 100, 100),
    procesos: Math.min((totalProcesos / (METAS_DIARIAS.procesos * uniqueDays)) * 100, 100)
  };

  // Cumplimiento Global (Media ponderada de éxito)
  cumplimiento.global = parseFloat(((cumplimiento.paneles + cumplimiento.resortes) / 2).toFixed(1));

  return {
    totalUnits: totalPaneles + totalResortesRaw + totalProcesos,
    totalPaneles,
    totalResortes: totalResortesMil,
    totalProcesos,
    uniqueWorkers: workers.size,
    activeMachines: machines.size,
    totalRecords: records.length,
    variations,
    cumplimiento,
    lastUpdate: lastDate,
    metas: {
      paneles: METAS_DIARIAS.paneles * uniqueDays,
      resortes: metaResortesMil,
      procesos: METAS_DIARIAS.procesos * uniqueDays
    }
  };
};

