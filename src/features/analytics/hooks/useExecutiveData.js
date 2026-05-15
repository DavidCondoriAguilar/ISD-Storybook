import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import { db } from '../../../data/db'
import { productionRepository } from '../../../data/repositories/productionRepository'
import { analyticsService } from '../services/analyticsService'

console.log('%c[AUDIT-HEADER] Componente cargado', 'background: #4f46e5; color: white; padding: 2px 5px;');

import { useAppStore } from '../../../store/useAppStore'
 
 export const useExecutiveData = () => {
   const { 
     globalTimeRange: timeRange, 
     globalStartDate: startDate, 
     globalEndDate: endDate,
     setGlobalDateFilter 
   } = useAppStore();
   
   const setTimeRange = (val) => setGlobalDateFilter(val, startDate, endDate);
   const setStartDate = (val) => setGlobalDateFilter(timeRange, val, endDate);
   const setEndDate = (val) => setGlobalDateFilter(timeRange, startDate, val);

   const [searchTerm, setSearchTerm] = useState('')
   const [selectedArea, setSelectedArea] = useState('all')
   const [isFilterOpen, setIsFilterOpen] = useState(false)

   const rawRecords = useLiveQuery(async () => {
    try {
      if (!db.isOpen()) await db.open();
      
      const totalInDb = await db.records.count();
      let records = await productionRepository.getFilteredRecords({ 
        moduleId: 'all', 
        timeRange, 
        startDate, 
        endDate 
      });

      // Fallback Senior: Si el filtro nos deja en 0 pero hay data en el disco, mostrar todo
      if (records.length === 0 && totalInDb > 0) {
        console.warn("[AUDIT] No hay data en el rango seleccionado, mostrando historial completo.");
        records = await db.records.toArray();
      }

      return records;
    } catch (e) {
      return [];
    }
  }, [timeRange, startDate, endDate]) || [];

  const filteredRecords = useMemo(() => {
    let filtered = rawRecords;

    if (selectedArea !== 'all') {
      const area = selectedArea.toLowerCase();
      filtered = filtered.filter(r => {
        const recordArea = (r.area || r.moduloId || '').toLowerCase();
        
        // Opción 1: Planta Unificada (Paneles + Resortes)
        if (area === 'paneles_resortes') {
          return recordArea === 'paneles' || recordArea === 'resortes';
        }
        
        // Opción 2: Filtro Estricto por Módulo
        return recordArea === area;
      });
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
  console.log(`%c[DASHBOARD-STEP 3] Stats calculadas:`, 'color: #3b82f6', dashboardData.stats?.totalRecords);


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

  const trendData = dashboardData.trendData || [];
  const topPaneleros = dashboardData.topPaneleros || [];
  const topResorteros = dashboardData.topResorteros || [];
  const allWorkers = dashboardData.allWorkers || [];
  const machineStatsMP = dashboardData.machineStatsMP || [];
  const machineStatsMR = dashboardData.machineStatsMR || [];
  const productMix = dashboardData.productMix || [];

  return {
    timeRange, setGlobalDateFilter,
    startDate,
    endDate,
    searchTerm, setSearchTerm,
    selectedArea, setSelectedArea,
    isFilterOpen, setIsFilterOpen,
    stats,
    advStats,
    trendData,
    topPaneleros,
    topResorteros,
    allWorkers,
    machineStatsMP,
    machineStatsMR,
    productMix
  };
};
