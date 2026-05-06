import { subDays } from 'date-fns';
import { isResorte } from './predicates';

/**
 * Filtra registros según criterios de módulo, tiempo y búsqueda.
 */
export const filterRecords = (records, { moduleId, timeRange, startDate, endDate, searchTerm }) => {
  if (!Array.isArray(records)) {
    console.error("[Domain Error] filterRecords: 'records' must be an array.", { records });
    return [];
  }

  try {
    let filtered = records;

    // 1. Filtro por Módulo (Solo si es necesario y los registros no vienen ya filtrados)
    // Nota Senior: En entornos de alto rendimiento, esto se hace en la DB (Dexie)
    if (moduleId && records.length > 0) {
      const firstRecord = records[0];
      const isAlreadyFiltered = (firstRecord.area === moduleId || firstRecord.moduloId === moduleId);
      
      if (!isAlreadyFiltered) {
        filtered = records.filter(r => 
          r.area?.toLowerCase() === moduleId?.toLowerCase() || 
          r.moduloId?.toLowerCase() === moduleId?.toLowerCase()
        );
      }
    }

    // Filtros Temporales
    if ((timeRange === 'custom' || timeRange === 'day') && startDate && endDate) {
      const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
      const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
      const start = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0).getTime();
      const end = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999).getTime();
      
      if (isNaN(start) || isNaN(end)) {
        console.warn("[Domain Warning] filterRecords: Invalid date range provided.", { startDate, endDate });
      } else {
        filtered = filtered.filter(r => r.fechaTimestamp >= start && r.fechaTimestamp <= end);
      }
    } else if (timeRange !== 'all' && timeRange !== 'custom' && timeRange !== 'day') {
      const days = parseInt(timeRange);
      if (!isNaN(days)) {
        const cutoff = subDays(new Date(), days);
        cutoff.setHours(0, 0, 0, 0);
        filtered = filtered.filter(r => r.fechaTimestamp >= cutoff.getTime());
      }
    }

    // Filtro de Búsqueda
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.trabajadorNombre || '').toLowerCase().includes(s) ||
        (r.productoNombre || '').toLowerCase().includes(s) ||
        (r.maquinaId || '').toLowerCase().includes(s)
      );
    }

    return filtered;
  } catch (error) {
    console.error("[Domain Error] filterRecords failed:", error);
    return [];
  }
};

/**
 * Calcula estadísticas diarias agrupadas por fecha.
 */
export const calculateDailyStats = (records) => {
  if (!Array.isArray(records)) return [];

  try {
    const dailyMap = records.reduce((acc, r) => {
      // Validar existencia de timestamp
      if (!r.fechaTimestamp) return acc;

      const dateObj = new Date(r.fechaTimestamp);
      if (isNaN(dateObj.getTime())) return acc;

      const dateKey = dateObj.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short' 
      });
      
      if (!acc[dateKey]) {
        acc[dateKey] = { 
          date: dateKey, 
          mp: { total: 0, machine: 0 }, 
          mr: { total: 0, machine: 0 }, 
          workerCount: new Set(), 
          timestamp: r.fechaTimestamp 
        };
      }

      if (isResorte(r)) {
        acc[dateKey].mr.total += (r.cantidad || 0);
        acc[dateKey].mr.machine += (r.outputMaquina || 0);
      } else {
        acc[dateKey].mp.total += (r.cantidad || 0);
        acc[dateKey].mp.machine += (r.outputMaquina || 0);
      }

      if (r.trabajadorNombre) acc[dateKey].workerCount.add(r.trabajadorNombre);
      return acc;
    }, {});

    return Object.values(dailyMap)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(d => ({ ...d, workers: d.workerCount.size }))
      .slice(0, 5);
  } catch (error) {
    console.error("[Domain Error] calculateDailyStats failed:", error);
    return [];
  }
};

