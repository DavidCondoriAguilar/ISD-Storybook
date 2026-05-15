import { useMemo, useState, useEffect } from 'react';
import { filterRecords, calculateDailyStats } from '../../../domain/production/transformations';

export const useModuleLogic = (records, moduleId) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaTimestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Obtener lista única de trabajadores para el filtro
  const uniqueWorkers = useMemo(() => {
    const workers = new Set();
    records.forEach(r => {
      const name = r.trabajadorNombre || r.trabajador?.nombre;
      if (name) workers.add(name);
    });
    return Array.from(workers).sort();
  }, [records]);

  // 1. Filtrado (Memoizado independientemente para evitar recalcular stats al ordenar)
  const filteredData = useMemo(() => {
    return filterRecords(records, { 
      moduleId, 
      searchTerm,
      selectedWorker 
    });
  }, [records, moduleId, searchTerm, selectedWorker]);

  // 2. Estadísticas (Solo se recalculan si cambia el filtro, no el orden)
  const dailyStats = useMemo(() => {
    return calculateDailyStats(filteredData);
  }, [filteredData]);

  // 3. Ordenamiento (Cálculo final para la UI)
  const processedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA === valB) return 0;
      const comparison = valA > valB ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchTerm, selectedWorker, moduleId, processedData.length, sortConfig]);

  return {
    searchTerm, setSearchTerm,
    selectedWorker, setSelectedWorker,
    uniqueWorkers,
    isFilterOpen, setIsFilterOpen,
    sortConfig, handleSort,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    processedData, dailyStats
  };
};

