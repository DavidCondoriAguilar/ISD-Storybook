import { useMemo, useState, useEffect } from 'react';
import { filterRecords, calculateDailyStats } from '../../../domain/production/transformations';

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
    // 1. Filtrado (Delegado al dominio)
    const filtered = filterRecords(records, { 
      moduleId, 
      timeRange, 
      startDate, 
      endDate, 
      searchTerm 
    });

    // 2. Ordenamiento (Lógica de UI se queda aquí, pero es genérica)
    const sorted = [...filtered].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA === valB) return 0;
      const comparison = valA > valB ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    // 3. Estadísticas (Delegado al dominio)
    const stats = calculateDailyStats(filtered);

    return { processedData: sorted, dailyStats: stats };
  }, [records, moduleId, searchTerm, timeRange, startDate, endDate, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchTerm, moduleId, timeRange, processedData.length, sortConfig]);

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

