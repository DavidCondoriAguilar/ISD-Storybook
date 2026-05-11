import { subDays } from 'date-fns';
import { isResorte, isPanel, isProceso } from './predicates';

/**
 * Filtra registros según criterios de módulo, tiempo y búsqueda.
 */
export const filterRecords = (records, { moduleId, timeRange, startDate, endDate, searchTerm, selectedWorker }) => {
  if (!Array.isArray(records)) {
    console.error("[Domain Error] filterRecords: 'records' must be an array.", { records });
    return [];
  }

  try {
    let filtered = records;

    // 1. Filtro por Módulo (Bypass para Auditoría Máster en Paneles)
    if (moduleId && moduleId.toLowerCase() !== 'paneles' && records.length > 0) {
      const firstRecord = records[0];
      const isAlreadyFiltered = (firstRecord.area === moduleId || firstRecord.moduloId === moduleId);
      
      if (!isAlreadyFiltered) {
        filtered = records.filter(r => 
          r.area?.toLowerCase() === moduleId?.toLowerCase() || 
          r.moduloId?.toLowerCase() === moduleId?.toLowerCase()
        );
      }
    }

    // 2. Filtro por Trabajador (Explícito)
    if (selectedWorker && selectedWorker !== 'all') {
      filtered = filtered.filter(r => {
        const name = r.trabajadorNombre || r.trabajador?.nombre;
        return name === selectedWorker;
      });
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
      // Prioridad Senior: Usamos fechaLegible para la clave de agrupación
      const dateStr = r.fechaLegible || (r.fechaTimestamp ? new Date(r.fechaTimestamp).toISOString().split('T')[0] : '2026-01-01');
      
      const dateObj = new Date(dateStr + 'T12:00:00'); // Evitar problemas de timezone
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
          timestamp: dateObj.getTime()
        };
      }

      const qty = Number(r.produccion?.cantidad || r.cantidad || 0);
      const output = Number(r.outputMaquina || 0);

      // FILTRO PT: Solo sumamos si es Producto Terminado (Paneles o Resortes)
      if (isResorte(r)) {
        acc[dateKey].mr.total += qty;
        acc[dateKey].mr.machine += output;
      } else if (isPanel(r)) {
        acc[dateKey].mp.total += qty;
        acc[dateKey].mp.machine += output;
      }
      // Los procesos intermedios (isProceso) se ignoran en el cálculo de totales PT

      const workerName = r.trabajador?.nombre || r.trabajadorNombre;
      if (workerName) acc[dateKey].workerCount.add(workerName);
      return acc;
    }, {});

    return Object.values(dailyMap)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(d => ({ ...d, workers: d.workerCount.size }));
  } catch (error) {
    console.error("[Domain Error] calculateDailyStats failed:", error);
    return [];
  }
};

