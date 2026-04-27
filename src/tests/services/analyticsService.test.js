import { describe, it, expect } from 'vitest';
import { analyticsService } from '../../features/analytics/services/analyticsService';

describe('AnalyticsService - Industrial Logic Tests', () => {
  
  const mockRecords = [
    // Trabajador A - Paneles (MP)
    { trabajadorNombre: 'Jair', maquinaId: 'MP1', productoNombre: 'Panel 2plz', cantidad: 100, fechaTimestamp: new Date('2026-04-10').getTime() },
    { trabajadorNombre: 'Jair', maquinaId: 'MP1', productoNombre: 'Panel 1.5plz', cantidad: 50, fechaTimestamp: new Date('2026-04-10').getTime() },
    
    // Trabajador B - Resortes (MR)
    { trabajadorNombre: 'Luis Polo', maquinaId: 'MR1', productoNombre: 'Resortes Bonell', cantidad: 10000, fechaTimestamp: new Date('2026-04-10').getTime() },
    { trabajadorNombre: 'Luis Polo', maquinaId: 'MR2', productoNombre: 'Millares de Resortes', cantidad: 5000, fechaTimestamp: new Date('2026-04-11').getTime() },
    
    // Trabajador C - Mixto (pero debería separarse)
    { trabajadorNombre: 'Angelo', maquinaId: 'MP2', productoNombre: 'Panel King', cantidad: 80, fechaTimestamp: new Date('2026-04-11').getTime() }
  ];

  it('debe clasificar correctamente Paneles (MP) vs Resortes (MR)', () => {
    const trend = analyticsService.getProductionTrend(mockRecords);
    
    // El 10/04 tenemos 150 paneles (100+50) y 10000 resortes
    const day10 = trend.find(d => d.date === '10/04');
    expect(day10.paneles).toBe(150);
    expect(day10.resortes).toBe(10000);
    
    // El 11/04 tenemos 80 paneles (Angelo) y 5000 resortes (Luis)
    const day11 = trend.find(d => d.date === '11/04');
    expect(day11.paneles).toBe(80);
    expect(day11.resortes).toBe(5000);
  });

  it('debe generar rankings de trabajadores separados por unidad de medida', () => {
    const { topPaneleros, topResorteros } = analyticsService.getWorkerRankings(mockRecords);

    // Jair debe ser el #1 en Paneles con 150
    expect(topPaneleros[0].name).toBe('Jair');
    expect(topPaneleros[0].total).toBe(150);

    // Luis Polo debe ser el #1 en Resortes con 15000
    expect(topResorteros[0].name).toBe('Luis Polo');
    expect(topResorteros[0].total).toBe(15000);
  });

  it('debe calcular correctamente las estadísticas de máquinas', () => {
    const machineStats = analyticsService.getMachineStats(mockRecords);
    
    const mr1 = machineStats.find(m => m.name === 'MR1');
    expect(mr1.total).toBe(10000);

    const mp1 = machineStats.find(m => m.name === 'MP1');
    expect(mp1.total).toBe(150); // 100 + 50
  });

  it('debe manejar registros sin máquina o nombre de trabajador', () => {
    const edgeCases = [
      { cantidad: 10, fechaTimestamp: Date.now() } // No tiene nada
    ];
    const kpis = analyticsService.getExecutiveKPIs(edgeCases);
    expect(kpis.totalUnits).toBe(10);
    expect(kpis.uniqueWorkers).toBe(0);
    expect(kpis.activeMachines).toBe(0);
  });
});
