import React, { useEffect, useMemo } from 'react';
import { useProductionData } from '../../hooks/useProductionData';

// Modular Sub-components
import { StatCard, formatNumber } from './components/SharedComponents';
import { ProductionTimeline } from './components/ProductionTimeline';
import { ProductionHeatmap } from './components/ProductionHeatmap';
import { 
  AccumulatedEvolution, 
  MachineVolume, 
  WorkerRanking, 
  ProductMix 
} from './components/DistributionCharts';

/**
 * MASTER INDUSTRIAL ANALYTICS ORCHESTRATOR
 * Clean Code Architecture: Specialized Hook -> Modular Sub-components
 */
export function IndustrialAnalytics({ rawData, filters }) {
  
  // 1. Specialized Industrial Hook
  // We apply filters to the rawData BEFORE passing it to the hook or filter the processed results.
  // Senior approach: filter rawData for better performance in the aggregation stage.
  const filteredRawData = useMemo(() => {
    if (!rawData) return [];
    let filtered = rawData;
    
    if (filters?.trabajador) {
      filtered = filtered.filter(r => {
        const workerName = r.trabajadorNombre || r.trabajador?.nombre || r.trabajador || '';
        const nameStr = typeof workerName === 'object' ? (workerName.nombre || '') : String(workerName);
        return nameStr.toLowerCase().includes(filters.trabajador.toLowerCase());
      });
    }
    
    if (filters?.maquina) {
      filtered = filtered.filter(r => {
        const m = r.maquinaId || r.maquina || r.ubicacion?.maquina || '';
        return String(m) === String(filters.maquina);
      });
    }
    
    return filtered;
  }, [rawData, filters]);

  const { processedData, machines } = useProductionData(filteredRawData);

  // 2. Senior Diagnostic Logging
  useEffect(() => {
    if (!processedData) return;
    console.group('INDUSTRIAL DIAGNOSTIC');
    console.log('Records Input:', filteredRawData.length);
    console.log('Paneles (U):', processedData.totalPaneles);
    console.log('Resortes (k):', processedData.totalResortes);
    console.log('Operational Machines:', machines.length);
    console.groupEnd();
  }, [processedData, machines.length]);

  if (!processedData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '32px' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 800 }}>Sincronización pendiente. Esperando datos de auditoría...</p>
      </div>
    );
  }

  // Prep Timeline data
  const timelineData = Object.values(processedData.byDay).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="industrial-analytics-orchestrator" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* KPI Section - Strictly Separated Metrics with Managerial Context */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <StatCard 
          title="Volumen Paneles" 
          value={`${formatNumber(processedData.totalPaneles)} U.`} 
          color="#6366f1"
          info="Producción neta de paneles terminados" 
        />
        <StatCard 
          title="Volumen Resortes" 
          value={`${(processedData.totalResortes / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} k.`} 
          color="#8b5cf6" 
          info="Contabilizado en Millares (k) de resortes"
        />
        <StatCard 
          title="Procesos Totales" 
          value={`${formatNumber(processedData.totalProcesos)} U.`} 
          color="#10b981" 
          info="Tareas de soporte (Embarillado, Doblado, etc.)"
        />
        <StatCard 
          title="Máquinas Activas" 
          value={machines.length} 
          color="#f59e0b" 
          info="Unidades operativas con registro hoy"
        />
      </div>

      {/* Primary Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        <ProductionTimeline data={timelineData} machines={machines} />
        <AccumulatedEvolution data={processedData.dailyAccumulated} />
      </div>

      {/* Distribution & Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
        <MachineVolume 
          dataPaneles={processedData.machineVolumePaneles} 
          dataResortes={processedData.machineVolumeResortes} 
        />
        <WorkerRanking data={processedData.workerRanking} />
        <ProductMix 
          dataPaneles={processedData.productMixPaneles} 
          dataResortes={processedData.productMixResortes} 
        />
      </div>

      {/* Operational Intensity */}
      <ProductionHeatmap dailyStats={processedData.byDay} machines={machines} />

    </div>
  );
}

