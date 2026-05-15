import { db } from '../db';

/**
 * Repository para la gestión de datos de producción.
 * Encapsula la complejidad de las consultas y asegura que la UI no dependa 
 * directamente de la estructura de la base de datos.
 */
export const productionRepository = {
  /**
   * Obtiene registros filtrados por módulo y rango de fechas.
   */
  async getFilteredRecords({ moduleId, timeRange, startDate, endDate }) {
    console.log(`%c[DB-QUERY]`, 'color: #3b82f6; font-weight: bold;', { moduleId, timeRange, startDate, endDate });
    if (!db.isOpen()) await db.open();
    let records = [];

    if (timeRange === 'day' && startDate) {
      // Normalizamos la fecha de entrada para evitar desfases
      const [y, m, d] = startDate.split('-').map(Number);
      const startTs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
      const endTs = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
      
      console.log(`[DB-QUERY] Rango Día: ${new Date(startTs).toLocaleString()} - ${new Date(endTs).toLocaleString()}`);
      
      records = await db.records
        .where('fechaTimestamp')
        .between(startTs, endTs, true, true)
        .toArray();

      // Fallback por string si el timestamp fallara
      if (records.length === 0) {
        records = await db.records.where('fechaLegible').equals(startDate).toArray();
      }
    } 
    else if (timeRange === 'custom' && startDate && endDate) {
      const [sY, sM, sD] = startDate.split('-').map(Number);
      const [eY, eM, eD] = endDate.split('-').map(Number);
      const startTs = new Date(sY, sM - 1, sD, 0, 0, 0, 0).getTime();
      const endTs = new Date(eY, eM - 1, eD, 23, 59, 59, 999).getTime();
      records = await db.records.where('fechaTimestamp').between(startTs, endTs, true, true).toArray();
    }
    else if (timeRange !== 'all' && !isNaN(parseInt(timeRange))) {
      const { subDays } = await import('date-fns');
      const cutoff = subDays(new Date(), parseInt(timeRange)).getTime();
      records = await db.records.where('fechaTimestamp').aboveOrEqual(cutoff).toArray();
    }
    else {
      records = await db.records.toArray();
    }

    if (!moduleId || moduleId === 'all') {
      return records;
    }

    const mod = moduleId.toLowerCase();
    const filtered = records.filter(r => 
      (r.moduloId || '').toLowerCase() === mod || 
      (r.area || '').toLowerCase() === mod
    );

    console.log(`%c[MODULE-FILTER]`, 'color: #f59e0b; font-weight: bold;', {
      moduloBuscado: mod,
      totalPrevio: records.length,
      resultadoFinal: filtered.length
    });

    return filtered;
  }
};
