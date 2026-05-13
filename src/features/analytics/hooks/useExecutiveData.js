import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import { db } from '../../../data/db'
import { analyticsService } from '../services/analyticsService'

export const useExecutiveData = () => {
  const [timeRange, setTimeRange] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const rawRecords = useLiveQuery(async () => {
    try {
      const totalInDb = await db.records.count();
      console.log(`[AUDIT] Registros en disco: ${totalInDb}`);

      if (totalInDb === 0) return [];

      let records = [];

      // MODO 1: Rango de Fechas (Día o Custom)
      if ((timeRange === 'custom' || timeRange === 'day') && startDate) {
        const [sY, sM, sD] = startDate.split('-').map(Number);
        const [eY, eM, eD] = (endDate || startDate).split('-').map(Number);
        
        const startTs = new Date(sY, sM - 1, sD, 0, 0, 0, 0).getTime();
        const endTs = new Date(eY, eM - 1, eD, 23, 59, 59, 999).getTime();

        console.log(`[QUERY] Buscando entre ${startDate} y ${endDate || startDate}`);
        
        // Intento A: Por Timestamp (Optimizado)
        records = await db.records.where('fechaTimestamp').between(startTs, endTs, true, true).toArray();
        
        // Intento B: Fallback por Fecha Legible (Zero-Fail)
        if (records.length === 0 && timeRange === 'day') {
          console.warn(`[QUERY] Fallback: No se halló data por timestamp. Intentando por fecha legible: ${startDate}`);
          records = await db.records.where('fechaLegible').equals(startDate).toArray();
        }
      } 
      // MODO 2: Últimos X días
      else if (timeRange !== 'all' && !isNaN(parseInt(timeRange))) {
        const cutoff = subDays(new Date(), parseInt(timeRange)).getTime();
        records = await db.records.where('fechaTimestamp').aboveOrEqual(cutoff).toArray();
      } 
      // MODO 3: Todo
      else {
        records = await db.records.toArray();
      }

      console.log(`[QUERY] Resultado Final: ${records.length} registros encontrados.`);
      return records;

    } catch (error) {
      console.error("[CRITICAL] useExecutiveData query failed:", error);
      return [];
    }
  }, [timeRange, startDate, endDate]) || [];

  const filteredRecords = useMemo(() => {
    let filtered = rawRecords;

    if (selectedArea !== 'all') {
      const area = selectedArea.toLowerCase();
      filtered = filtered.filter(r => 
        (r.area || r.moduloId || '').toLowerCase() === area
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.trabajadorNombre || '').toLowerCase().includes(search) ||
        (r.productoNombre || '').toLowerCase().includes(search) ||
        (r.maquinaId || '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [rawRecords, searchTerm, selectedArea]);

  const dashboardData = useMemo(() => analyticsService.getExecutiveDashboardData(filteredRecords), [filteredRecords])

  // Blindaje de Nulos (Senior Null-Safety)
  const stats = dashboardData.stats || {
    totalUnits: 0, totalPaneles: 0, totalResortes: 0, totalProcesos: 0,
    uniqueWorkers: 0, activeMachines: 0, totalRecords: 0,
    variations: { paneles: 0, resortes: 0, procesos: 0 },
    cumplimiento: { paneles: 0, resortes: 0, procesos: 0, global: 0 },
    metas: { paneles: 0, resortes: 0, procesos: 0 }
  };

  const advStats = dashboardData.advStats || { 
    topPanelero: { name: 'N/A', reason: 'Sin Datos' }, 
    topResortero: { name: 'N/A', reason: 'Sin Datos' } 
  };

  return {
    timeRange, setTimeRange,
    startDate, setStartDate,
    endDate, setEndDate,
    searchTerm, setSearchTerm,
    selectedArea, setSelectedArea,
    isFilterOpen, setIsFilterOpen,
    ...dashboardData,
    stats,
    advStats,
    filteredRecords
  }
}
