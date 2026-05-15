import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { productionRepository } from '../data/repositories/productionRepository';
import { useModuleLogic } from '../features/factory/hooks/useModuleLogic';
import ModuleHeader from '../features/factory/components/ModuleHeader/ModuleHeader';
import DailyStatsGrid from '../features/factory/components/DailyStatsGrid/DailyStatsGrid';
import AuditSection from '../features/factory/components/AuditSection/AuditSection';
import { DateRangePicker } from '../shared';
import '../features/factory/styles/ModuleView.css';

import { getProductionColumns } from '../features/factory/config/moduleColumns';

import { useAppStore } from '../store/useAppStore';
// Sincronización de Módulo: 2026-05-15T11:41
export const ModuleView = () => {
  const { moduleId } = useParams();
  
  // Estados de Filtrado de Fecha (Sincronizados Globalmente)
  const { 
    globalTimeRange: timeRange, 
    globalStartDate: startDate, 
    globalEndDate: endDate,
    setGlobalDateFilter 
  } = useAppStore();
  
  const setTimeRange = (val) => setGlobalDateFilter(val, startDate, endDate);
  const setStartDate = (val) => setGlobalDateFilter(timeRange, val, endDate);
  const setEndDate = (val) => setGlobalDateFilter(timeRange, startDate, val);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Consulta delegada al Repository con filtros de fecha y Rescate Automático
  const records = useLiveQuery(
    async () => {
      const results = await productionRepository.getFilteredRecords({ 
        moduleId, 
        timeRange, 
        startDate, 
        endDate 
      });

      console.log(`%c[RENDER-STEP 1] Data de BD:`, 'color: #8b5cf6', results.length);

      // Rescate: Si el filtro de fecha nos deja en 0, pero sabemos que hay data de este módulo
      if (results.length === 0) {
        const allModuleRecords = await productionRepository.getFilteredRecords({ moduleId, timeRange: 'all' });
        if (allModuleRecords.length > 0) {
          console.warn(`[MODULE-RESCUE] No hay data para el filtro aplicado. Mostrando historial de ${moduleId}.`);
          return allModuleRecords;
        }
      }

      return results;
    }, 
    [moduleId, timeRange, startDate, endDate]
  ) || [];

  const logic = useModuleLogic(records, moduleId);
  const moduleName = moduleId?.charAt(0).toUpperCase() + moduleId?.slice(1);

  // Configuración de columnas externalizada para Mantenibilidad Senior
  const columns = useMemo(() => getProductionColumns(), []);

  const displayRecords = useMemo(() => {
    if (!logic.processedData || logic.processedData.length === 0) {
      console.log(`%c[RENDER-STEP 2] processedData vacío`, 'color: #ef4444');
      return [];
    }
    
    const start = (logic.currentPage - 1) * logic.itemsPerPage;
    const sliced = logic.processedData.slice(start, start + logic.itemsPerPage);
    const final = sliced.length > 0 ? sliced : logic.processedData.slice(0, logic.itemsPerPage);
    
    console.log(`%c[RENDER-STEP 2] Records para mostrar:`, 'color: #10b981', final.length);
    return final;
  }, [logic.processedData, logic.currentPage, logic.itemsPerPage]);

  console.log(`%c[RENDER-STEP 3] Dibujando AuditSection con:`, 'color: #3b82f6', displayRecords.length);

  return (
    <div className="module-page-layout">
      <div className="page-content-restrictor">
        <ModuleHeader moduleName={moduleName} />
        
        <DailyStatsGrid stats={logic.dailyStats} />
        
        <AuditSection 
          displayRecords={displayRecords}
          columns={columns}
          logic={logic}
        />
      </div>
    </div>
  );
};

export default ModuleView;
