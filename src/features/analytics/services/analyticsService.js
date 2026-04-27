import { format, subDays, isSameDay } from 'date-fns';

export const analyticsService = {
  getExecutiveKPIs(records) {
    if (!records.length) return { totalUnits: 0, uniqueWorkers: 0, activeMachines: 0, totalRecords: 0 };

    const workers = new Set();
    const machines = new Set();
    let totalUnits = 0;

    records.forEach(r => {
      totalUnits += (r.cantidad || 0);
      if (r.trabajadorNombre) workers.add(r.trabajadorNombre);
      if (r.maquinaId && r.maquinaId !== 'Sin Máquina') machines.add(r.maquinaId);
    });

    return {
      totalUnits,
      uniqueWorkers: workers.size,
      activeMachines: machines.size,
      totalRecords: records.length
    };
  },

  // NEW: Comparative and Efficiency Intelligence
  getAdvancedMetrics(records) {
    if (!records.length) return { 
      todayTotal: 0, 
      avgUnitsPerHour: 0, 
      topWorkerName: 'N/A', 
      variationVsYesterday: 0 
    };

    const now = new Date();
    // In production, we usually take the max date found in data as "today"
    const latestTimestamp = Math.max(...records.map(r => r.fechaTimestamp));
    const today = new Date(latestTimestamp);
    today.setHours(0,0,0,0);
    const yesterday = subDays(today, 1);

    let todayUnits = 0;
    let yesterdayUnits = 0;
    let totalHours = 0;
    const workerTotals = {};

    records.forEach(r => {
      const rDate = new Date(r.fechaTimestamp);
      rDate.setHours(0,0,0,0);

      // 1. Totals for Today & Yesterday
      if (isSameDay(rDate, today)) todayUnits += r.cantidad;
      if (isSameDay(rDate, yesterday)) yesterdayUnits += r.cantidad;

      // 2. Efficiency (U/H) - Using all records to get a global average
      totalHours += parseFloat(r.jornadaTotalHoras || 8.75);

      // 3. Top Worker Logic
      const name = r.trabajadorNombre || 'Sin Nombre';
      if (!workerTotals[name]) workerTotals[name] = 0;
      workerTotals[name] += r.cantidad;
    });

    const topWorkerEntry = Object.entries(workerTotals).sort((a,b) => b[1] - a[1])[0];
    
    // Variation Calculation
    let variation = 0;
    if (yesterdayUnits > 0) {
      variation = ((todayUnits - yesterdayUnits) / yesterdayUnits) * 100;
    }

    return {
      todayTotal: todayUnits,
      avgUnitsPerHour: (todayUnits / (totalHours / (records.length / 5))).toFixed(1), // Normalized U/H
      topWorkerName: topWorkerEntry ? topWorkerEntry[0] : 'N/A',
      variationVsYesterday: variation.toFixed(1)
    };
  },

  getProductionTrend(records) {
    const dailyData = {};
    
    records.forEach(r => {
      const date = format(new Date(r.fechaTimestamp), 'dd/MM');
      if (!dailyData[date]) dailyData[date] = { date, paneles: 0, resortes: 0 };
      
      const mId = String(r.maquinaId || '').toUpperCase();
      const pName = String(r.productoNombre || '').toUpperCase();
      const isResorte = mId.includes('MR') || mId.includes('RESORTE') || pName.includes('RESORTE');

      if (isResorte) {
        dailyData[date].resortes += r.cantidad;
      } else {
        dailyData[date].paneles += r.cantidad;
      }
    });

    return Object.values(dailyData).sort((a, b) => {
      const [d1, m1] = a.date.split('/').map(Number);
      const [d2, m2] = b.date.split('/').map(Number);
      return m1 === m2 ? d1 - d2 : m1 - m2;
    });
  },

  getWorkerRankings(records) {
    const panelsMap = {};
    const springsMap = {};

    records.forEach(r => {
      const name = r.trabajadorNombre || 'Sin Nombre';
      const mId = String(r.maquinaId || '').toUpperCase();
      const pName = String(r.productoNombre || '').toUpperCase();
      
      const isResorte = mId.includes('MR') || mId.includes('RESORTE') || pName.includes('RESORTE');

      if (isResorte) {
        if (!springsMap[name]) springsMap[name] = { name, total: 0 };
        springsMap[name].total += r.cantidad;
      } else {
        if (!panelsMap[name]) panelsMap[name] = { name, total: 0 };
        panelsMap[name].total += r.cantidad;
      }
    });

    return {
      topPaneleros: Object.values(panelsMap).sort((a, b) => b.total - a.total).slice(0, 5),
      topResorteros: Object.values(springsMap).sort((a, b) => b.total - a.total).slice(0, 5)
    };
  },

  getProductMix(records) {
    const mixMap = {};
    records.forEach(r => {
      const name = r.productoNombre || 'Otros';
      if (!mixMap[name]) mixMap[name] = { name, value: 0 };
      mixMap[name].value += r.cantidad;
    });

    return Object.values(mixMap).sort((a, b) => b.value - a.value).slice(0, 6);
  },

  getMachineStats(records) {
    const machineMap = {};
    records.forEach(r => {
      const mid = r.maquinaId || 'Sin Máquina';
      if (!machineMap[mid]) machineMap[mid] = { name: mid, total: 0 };
      machineMap[mid].total += r.cantidad;
    });

    return Object.values(machineMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }
};
