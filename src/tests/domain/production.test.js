import { describe, it, expect } from 'vitest';
import { isPanel, isResorte } from '../../domain/production/predicates';
import { calculatePerformance } from '../../features/analytics/services/modules/performanceEngine';

/**
 * SET DE PRUEBAS MAESTRO - AUDITORÍA INDUSTRIAL
 * Objetivo: Garantizar integridad de datos y cumplimiento de reglas de negocio.
 */
describe('Auditoría QA - Integridad de Datos y Agregación', () => {
  
  // 1. Test de Discriminación de Identificadores
  it('Debe discriminar correctamente entre máquinas MP (Producción) y Procesos', () => {
    const data = [
      { ubicacion: { maquina: 'MP2' }, produccion: { cantidad: 100 }, producto: { nombre: 'Panel Terminado' } },
      { ubicacion: { maquina: 'N/A' }, produccion: { cantidad: 50 }, producto: { nombre: 'Embarillado' } },
      { ubicacion: { maquina: 'N/A' }, produccion: { cantidad: 1 }, producto: { nombre: 'Doblado' } }
    ];
    
    const res = calculatePerformance(data);
    const worker = res.allWorkers[0];
    
    expect(worker.paneles).toBe(100);
    expect(worker.procesos).toBe(51);
    expect(worker.total).toBe(151);
  });

  // 2. Test de Acumulación por Operario (Anti-Overwrite)
  it('Debe acumular registros de un mismo trabajador sin sobreescribir', () => {
    const workerName = 'Jerson';
    const data = [
      { trabajador: { nombre: workerName }, ubicacion: { maquina: 'MP1' }, produccion: { cantidad: 10 } },
      { trabajador: { nombre: workerName }, ubicacion: { maquina: 'MP1' }, produccion: { cantidad: 20 } },
      { trabajador: { nombre: workerName }, ubicacion: { maquina: 'MP1' }, produccion: { cantidad: 30 } }
    ];
    
    const res = calculatePerformance(data);
    const jerson = res.allWorkers.find(w => w.name === workerName);
    
    expect(jerson.paneles).toBe(60); 
  });

  // 3. Test de Conversión de Tipos (Sanitización)
  it('Debe sanitizar strings, null y undefined tratándolos como números o 0', () => {
    const data = [
      { trabajador: { nombre: 'Test' }, ubicacion: { maquina: 'MP1' }, produccion: { cantidad: '60' } }, 
      { trabajador: { nombre: 'Test' }, ubicacion: { maquina: 'MP1' }, produccion: { cantidad: null } },   
      { trabajador: { nombre: 'Test' }, ubicacion: { maquina: 'MP1' }, produccion: { cantidad: undefined } }, 
      { trabajador: { nombre: 'Test' }, ubicacion: { maquina: 'MP1' }, produccion: { cantidad: 40 } }    
    ];
    
    const res = calculatePerformance(data);
    const testWorker = res.allWorkers.find(w => w.name === 'Test');
    
    expect(testWorker.paneles).toBe(100); 
  });

  // 4. Test de Caso de Borde (Decimales)
  it('Debe sumar correctamente cantidades con decimales (ej. 1.5 plz)', () => {
    const data = [
      { maquinaId: 'MP1', cantidad: 1.5 },
      { maquinaId: 'MP1', cantidad: 2.75 },
      { maquinaId: 'MP1', cantidad: 0.25 }
    ];
    
    const res = calculatePerformance(data);
    const worker = res.allWorkers[0];
    
    expect(worker.paneles).toBe(4.5); // 1.5 + 2.75 + 0.25
  });

  // 5. Test de Integridad de Resortes (MR)
  it('Debe asegurar precisión exacta en la suma de resortes (MR)', () => {
    const data = [
      { maquinaId: 'MR1', cantidad: 12500.456 },
      { maquinaId: 'MR2', cantidad: 7500.544 }
    ];
    
    const res = calculatePerformance(data);
    const totalRaw = res.allWorkers[0].resortes;
    
    expect(totalRaw).toBe(20001); 
    // En el ranking se divide por 1000
    expect(res.topResorteros[0].total).toBe(20.001);
  });

});
