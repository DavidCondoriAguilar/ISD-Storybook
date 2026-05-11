import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { subDays } from 'date-fns'
import { db } from '../../../data/db'
import { analyticsService } from '../services/analyticsService'

export const useExecutiveData = () => {
  const [timeRange, setTimeRange] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Consulta optimizada: Usamos índices para filtrar por tiempo directamente en IndexedDB
  const rawRecords = useLiveQuery(async () => {
    let query;

    if ((timeRange === 'custom' || timeRange === 'day') && startDate && endDate) {
      const [sY, sM, sD] = startDate.split('-').map(Number);
      const [eY, eM, eD] = endDate.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD, 0, 0, 0, 0).getTime();
      const end = new Date(eY, eM - 1, eD, 23, 59, 59, 999).getTime();
      
      query = db.records.where('fechaTimestamp').between(start, end);
    } else if (timeRange !== 'all') {
      const days = parseInt(timeRange);
      if (!isNaN(days)) {
        const cutoff = subDays(new Date(), days).getTime();
        query = db.records.where('fechaTimestamp').aboveOrEqual(cutoff);
      } else {
        query = db.records;
      }
    } else {
      query = db.records;
    }

    return await query.toArray();
  }, [timeRange, startDate, endDate]) || [];

  const filteredRecords = useMemo(() => {
    let filtered = rawRecords;

    // Filtros secundarios (en memoria sobre el set ya reducido)
    if (selectedArea !== 'all') {
      const area = selectedArea.toLowerCase();
      filtered = filtered.filter(r => 
        (r.area || r.ubicacion?.modulo || '').toLowerCase() === area ||
        (r.moduloId || '').toLowerCase() === area
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.trabajadorNombre || r.trabajador?.nombre || '').toLowerCase().includes(search) ||
        (r.productoNombre || r.producto?.nombre || '').toLowerCase().includes(search) ||
        (r.maquinaId || r.ubicacion?.maquina || '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [rawRecords, searchTerm, selectedArea]);


  const dashboardData = useMemo(() => analyticsService.getExecutiveDashboardData(filteredRecords), [filteredRecords])

  const stats = dashboardData.stats || {}
  const advStats = dashboardData.advStats || {}
  const trendData = dashboardData.trendData || []
  const topPaneleros = dashboardData.topPaneleros || []
  const topResorteros = dashboardData.topResorteros || []
  const allWorkers = dashboardData.allWorkers || []
  const productMix = dashboardData.productMix || []
  const machineStatsMP = dashboardData.machineStatsMP || []
  const machineStatsMR = dashboardData.machineStatsMR || []

  return {
    timeRange,
    setTimeRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchTerm,
    setSearchTerm,
    selectedArea,
    setSelectedArea,
    isFilterOpen,
    setIsFilterOpen,
    stats,
    advStats,
    trendData,
    topPaneleros,
    topResorteros,
    allWorkers,
    productMix,
    machineStatsMP,
    machineStatsMR,
    filteredRecords
  }
}
