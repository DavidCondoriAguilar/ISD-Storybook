import { useMemo, useState, useEffect } from 'react';
import { subDays } from 'date-fns';

export const useModuleLogic = (records, moduleId) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaTimestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const { processedData, dailyStats } = useMemo(() => {
    // 1. Filtro por Módulo
    let filtered = records.filter(r => 
      r.area?.toLowerCase() === moduleId?.toLowerCase() || 
      r.moduloId?.toLowerCase() === moduleId?.toLowerCase()
    );

    // 2. Filtros Temporales
    if ((timeRange === 'custom' || timeRange === 'day') && startDate && endDate) {
      const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
      const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
      const start = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0).getTime();
      const end = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999).getTime();
      filtered = filtered.filter(r => r.fechaTimestamp >= start && r.fechaTimestamp <= end);
    } else if (timeRange !== 'all' && timeRange !== 'custom' && timeRange !== 'day') {
      const cutoff = subDays(new Date(), parseInt(timeRange));
      cutoff.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => r.fechaTimestamp >= cutoff.getTime());
    }

    // 3. Filtro de Búsqueda
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.trabajadorNombre || '').toLowerCase().includes(s) ||
        (r.productoNombre || '').toLowerCase().includes(s) ||
        (r.maquinaId || '').toLowerCase().includes(s)
      );
    }

    // 4. Ordenamiento Dinámico
    const sorted = [...filtered].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA === valB) return 0;
      const comparison = valA > valB ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    // 5. Estadísticas Diarias Segmentadas (MP vs MR)
    const dailyMap = filtered.reduce((acc, r) => {
      const dateKey = new Date(r.fechaTimestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, mp: { total: 0, machine: 0 }, mr: { total: 0, machine: 0 }, workerCount: new Set(), timestamp: r.fechaTimestamp };
      }
      const isResorte = (r.maquinaId || '').includes('MR') || (r.unidad || '').includes('mil');
      if (isResorte) {
        acc[dateKey].mr.total += (r.cantidad || 0);
        acc[dateKey].mr.machine += (r.outputMaquina || 0);
      } else {
        acc[dateKey].mp.total += (r.cantidad || 0);
        acc[dateKey].mp.machine += (r.outputMaquina || 0);
      }
      if (r.trabajadorNombre) acc[dateKey].workerCount.add(r.trabajadorNombre);
      return acc;
    }, {});

    const dailyArray = Object.values(dailyMap)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(d => ({ ...d, workers: d.workerCount.size }))
      .slice(0, 5);

    return { processedData: sorted, dailyStats: dailyArray };
  }, [records, moduleId, searchTerm, timeRange, startDate, endDate, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, moduleId, timeRange, processedData.length, sortConfig]);

  return {
    searchTerm, setSearchTerm,
    timeRange, setTimeRange,
    startDate, setStartDate,
    endDate, setEndDate,
    isFilterOpen, setIsFilterOpen,
    sortConfig, handleSort,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    processedData, dailyStats
  };
};
