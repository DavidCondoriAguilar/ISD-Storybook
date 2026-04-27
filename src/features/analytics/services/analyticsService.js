/**
 * Analytics Service - Industrial Intelligence Engine
 * Follows SOLID principles: Handles data transformation logic for dashboards.
 */

export const analyticsService = {
  /**
   * Transforms raw records into daily production trends.
   * Groups by Date and stacks Paneles (u.) vs Resortes (mil.)
   */
  getProductionTrend(records) {
    const dailyMap = {};

    records.forEach(r => {
      const dateStr = new Date(r.fechaTimestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, paneles: 0, resortes: 0 };
      }

      const isResorte = String(r.maquinaId || '').toUpperCase().includes('RESORTE') || 
                        String(r.productoNombre || '').toUpperCase().includes('RESORTE') ||
                        String(r.maquinaId || '').toUpperCase().includes('MR');

      if (isResorte) {
        dailyMap[dateStr].resortes += r.cantidad;
      } else {
        dailyMap[dateStr].paneles += r.cantidad;
      }
    });

    // Sort by date (ascending for charts) and return as array
    return Object.values(dailyMap).reverse(); // Reverse if records were descending
  },

  /**
   * Identifies top performers by total output volume.
   */
  getWorkerRankings(records) {
    const panelsMap = {};
    const springsMap = {};

    records.forEach(r => {
      const name = r.trabajadorNombre || 'Sin Nombre';
      const mId = String(r.maquinaId || '').toUpperCase();
      const pName = String(r.productoNombre || '').toUpperCase();
      
      // Robust detection: MR or RESORTE for Springs, everything else or MP for Panels
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

  /**
   * Categorizes production by product size/type.
   */
  getProductMix(records) {
    const mixMap = {};

    records.forEach(r => {
      let category = 'Otros';
      const name = String(r.productoNombre || '').toUpperCase();

      if (name.includes('KING')) category = 'King';
      else if (name.includes('2 PLZ')) category = '2 Plazas';
      else if (name.includes('1.5 PLZ')) category = '1.5 Plazas';
      else if (name.includes('1 PLZ')) category = '1 Plaza';
      else if (name.includes('RESORTE')) category = 'Resortes';

      if (!mixMap[category]) mixMap[category] = { name: category, value: 0 };
      mixMap[category].value += r.cantidad;
    });

    return Object.values(mixMap).sort((a, b) => b.value - a.value);
  },

  /**
   * Calculates high-level KPIs.
   */
  getExecutiveKPIs(records) {
    const totalRecords = records.length;
    const totalUnits = records.reduce((acc, r) => acc + r.cantidad, 0);
    const uniqueWorkers = new Set(records.map(r => r.trabajadorNombre)).size;
    const activeMachines = new Set(records.map(r => r.maquinaId)).size;

    return {
      totalRecords,
      totalUnits,
      uniqueWorkers,
      activeMachines
    };
  }
};
