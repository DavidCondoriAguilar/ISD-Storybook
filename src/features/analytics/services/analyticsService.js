import { format } from 'date-fns';

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

    const topPaneleros = Object.values(panelsMap).sort((a, b) => b.total - a.total).slice(0, 5);
    const topResorteros = Object.values(springsMap).sort((a, b) => b.total - a.total).slice(0, 5);

    console.log('📊 ANALYTICS CLASSIFICATION:', {
      paneleros: topPaneleros.length,
      resorteros: topResorteros.length,
      totalRecords: records.length
    });

    return { topPaneleros, topResorteros };
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
