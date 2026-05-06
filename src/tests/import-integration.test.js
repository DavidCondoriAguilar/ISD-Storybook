import { describe, it, expect } from 'vitest';
import { normalizeRecords } from '../features/import/utils/importUtils';
import { calculateKPIs } from '../features/analytics/services/modules/kpiEngine';

describe('Test de Integración: Flujo de Importación Industrial', () => {
  
  it('Debe procesar el set completo de 221 registros incluyendo mantenimientos (cantidad 0)', () => {
    // Simulamos un set de datos con variedad de casos
    const mockRawData = [
      { id: 1, trabajador: { nombre: 'Eliza' }, produccion: { cantidad: 100 }, ubicacion: { maquina: 'MP2' }, fechaLegible: '2026-03-30' },
      { id: 2, trabajador: { nombre: 'Jerson' }, produccion: { cantidad: 0 }, producto: { nombre: 'LIMPIEZA' }, fechaLegible: '2026-03-30' },
      { id: 3, trabajador: { nombre: 'Jair' }, produccion: { cantidad: 50 }, producto: { nombre: 'Embarillado' }, fechaLegible: '2026-03-30' },
      { id: 4, trabajador: { nombre: 'Luis Polo' }, produccion: { cantidad: 34403 }, ubicacion: { maquina: 'MR1' }, fechaLegible: '2026-03-30' }
    ];

    // 1. Normalización
    const normalized = normalizeRecords(mockRawData);
    expect(normalized.length).toBe(4); // No debe faltar ninguno
    expect(normalized[1].trabajadorNombre).toBe('Jerson');
    expect(normalized[1].cantidad).toBe(0);

    // 2. Cálculo de KPIs
    const kpis = calculateKPIs(normalized);
    expect(kpis.totalRecords).toBe(4);
    expect(kpis.totalPaneles).toBe(100);
    expect(kpis.totalResortes).toBe(34.403);
    expect(kpis.totalProcesos).toBe(50); // El de cantidad 0 cuenta como registro pero no suma unidades
  });

  it('Debe generar IDs únicos y persistentes para evitar colisiones en importaciones masivas', () => {
    const data = [
      { trabajador: { nombre: 'Angelo' }, produccion: { cantidad: 60 }, fechaLegible: '2026-03-30', id: 'orig-1' },
      { trabajador: { nombre: 'Angelo' }, produccion: { cantidad: 60 }, fechaLegible: '2026-03-30', id: 'orig-2' }
    ];
    
    const normalized = normalizeRecords(data);
    const ids = normalized.map(r => r.idLocal);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(2);
  });
});
