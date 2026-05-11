import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { productionRepository } from '../data/repositories/productionRepository';
import { useModuleLogic } from '../features/factory/hooks/useModuleLogic';
import ModuleHeader from '../features/factory/components/ModuleHeader/ModuleHeader';
import DailyStatsGrid from '../features/factory/components/DailyStatsGrid/DailyStatsGrid';
import AuditSection from '../features/factory/components/AuditSection/AuditSection';
import '../features/factory/styles/ModuleView.css';

import { getProductionColumns } from '../features/factory/config/moduleColumns';

export const ModuleView = () => {
  const { moduleId } = useParams();
  
  // Consulta delegada al Repository para Arquitectura de desacoplamiento
  const records = useLiveQuery(
    () => productionRepository.getRecordsByModule(moduleId), 
    [moduleId]
  ) || [];

  const logic = useModuleLogic(records, moduleId);
  const moduleName = moduleId?.charAt(0).toUpperCase() + moduleId?.slice(1);

  // Configuración de columnas externalizada para Mantenibilidad Senior
  const columns = useMemo(() => getProductionColumns(), []);


  const displayRecords = useMemo(() => {
    const start = (logic.currentPage - 1) * logic.itemsPerPage;
    return logic.processedData.slice(start, start + logic.itemsPerPage);
  }, [logic.processedData, logic.currentPage, logic.itemsPerPage]);

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
