import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { useModuleLogic } from '../features/factory/hooks/useModuleLogic';
import ModuleHeader from '../features/factory/components/ModuleHeader/ModuleHeader';
import DailyStatsGrid from '../features/factory/components/DailyStatsGrid/DailyStatsGrid';
import AuditSection from '../features/factory/components/AuditSection/AuditSection';
import '../features/factory/styles/ModuleView.css';

export const ModuleView = () => {
  const { moduleId } = useParams();
  
  // Consulta optimizada: En Paneles mostramos TODO por requerimiento de auditoría máster
  const records = useLiveQuery(async () => {
    if (!moduleId) return [];
    if (moduleId.toLowerCase() === 'paneles') {
      return await db.records.toArray();
    }
    const capitalized = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
    const searchTerms = Array.from(new Set([moduleId, capitalized, moduleId.toLowerCase()]));
    const byModulo = await db.records.where('moduloId').anyOf(searchTerms).toArray();
    const byArea = await db.records.where('area').anyOf(searchTerms).toArray();
    const merged = [...byModulo, ...byArea];
    const uniqueMap = new Map();
    merged.forEach(r => uniqueMap.set(r.idLocal || r.id, r));
    return Array.from(uniqueMap.values());
  }, [moduleId]) || [];

  const logic = useModuleLogic(records, moduleId);
  const moduleName = moduleId?.charAt(0).toUpperCase() + moduleId?.slice(1);

  // Configuración de columnas con Nomenclatura Industrial Senior
  const columns = useMemo(() => [
    { key: 'fechaLegible',    label: 'FECHA',      width: '65px',
      render: (v) => <span className="date-cell">{v?.split('-').slice(1).reverse().join('/')}</span> },
    { key: 'productoNombre',  label: 'PRODUCTO',   width: '210px',
      render: (v) => <div className="product-name" title={v}>{v}</div> },
    { key: 'area',            label: 'ÁREA',       width: '90px',
      render: (v) => <span className="area-badge">{v?.toUpperCase()}</span> },
    { key: 'trabajadorNombre',label: 'TRABAJADOR', width: '105px',
      render: (v) => <span className="operator-name">{v}</span> },
    { key: 'outputMaquina',   label: 'OUTPUT',     width: '95px', align: 'right',
      render: (v) => <div className="output-cell mono-data">{v?.toLocaleString() || '0'}</div> },
    { key: 'cantidad',        label: 'TOTAL',      width: '95px', align: 'right',
      render: (v, r) => (
        <div className="production-cell">
          <span className={`production-value ${r.moduloId?.toLowerCase() === 'resortes' ? 'resorte' : 'panel'}`}>
            {r.moduloId?.toLowerCase() === 'resortes' ? (v / 1000).toFixed(3) : v}
          </span>
          <span className="unit-label">{r.moduloId?.toLowerCase() === 'resortes' ? 'mil.' : 'u.'}</span>
        </div>
      )},
    { key: 'maquinaId', label: 'MÁQUINA', width: '80px', align: 'center',
      render: (v) => <div className="machine-chip">{v || 'N/A'}</div> },
  ], []);

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
