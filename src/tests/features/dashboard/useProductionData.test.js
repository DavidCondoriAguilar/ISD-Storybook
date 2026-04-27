import { describe, it, expect } from 'vitest';
import { transformProductionData, aggregateData } from '../../../features/dashboard/hooks/useProductionData';

describe('Senior Industrial Data Engine - Logic Verification', () => {
  
  describe('transformProductionData', () => {
    it('should NOT force multiply "Millares" products anymore (Keeping raw data integrity)', () => {
      const raw = [{
        fecha: '20/04/2026',
        producto: 'Millares de Resortes',
        area: 'Paneles',
        trabajador: 'Luis',
        total: 10,
        maquina: 'MR1'
      }];
      const result = transformProductionData(raw);
      expect(result[0].unidadesReales).toBe(10); // 10 is kept as 10, UI formats it
      expect(result[0].unidadFisica).toBe('millares');
    });

    it('should categorize "Pegado" as a process even if it has a machine', () => {
      const raw = [{
        fecha: '20/04/2026',
        producto: '2 plz pegado (10X20)',
        area: 'Paneles',
        trabajador: 'Angelo',
        total: 60,
        maquina: 'MP3'
      }];
      const result = transformProductionData(raw);
      expect(result[0].tipo).toBe('proceso');
    });

    it('should handle missing dates by falling back to current date', () => {
      const raw = [{ producto: 'P1', area: 'A1', trabajador: 'T1', total: 100 }];
      const result = transformProductionData(raw);
      expect(result[0].date).toBeInstanceOf(Date);
    });
  });

  describe('aggregateData', () => {
    const records = transformProductionData([
      { fecha: '20/04/2026', producto: 'P1', area: 'A1', trabajador: 'T1', total: 1000, maquina: 'MP1' },
      { fecha: '20/04/2026', producto: 'Pegado', area: 'A1', trabajador: 'T1', total: 500, maquina: 'MP3' },
      { fecha: '21/04/2026', producto: 'P1', area: 'A1', trabajador: 'T2', total: 2000, maquina: 'MP1' },
      { fecha: '21/04/2026', producto: 'Embarillado', area: 'A1', trabajador: 'T2', total: 300, maquina: 'MP2' }
    ]);

    it('should accurately aggregate production vs processes without mixing units', () => {
      const stats = aggregateData(records);
      expect(stats.totalPaneles).toBe(3000); // 1000 + 2000
      expect(stats.totalProcesos).toBe(800);  // 500 + 300
    });

    it('should aggregate by worker using the new object structure', () => {
      const stats = aggregateData(records);
      // T1: (1000/525*60 + 500/525*60) / 2 = (114.28 + 57.14) / 2 = 85.71
      expect(stats.byWorker['T1'].totalScore).toBeCloseTo(85.71, 1);
      expect(stats.byWorker['T1'].paneles).toBe(1000);
      expect(stats.byWorker['T1'].procesos).toBe(500);
    });

    it('should aggregate by product using segmented objects', () => {
      const stats = aggregateData(records);
      expect(stats.byProductPaneles['P1']).toBe(3000);
    });
  });

  describe('Audit - Real Data Verification (User Sample)', () => {
    const userSample = [
      { fecha: '30/03/2026', producto: '2 plz (11x22)', maquina: 'MP2', trabajador: 'Eliza', total: 100, output: 2240 },
      { fecha: '30/03/2026', producto: '2 plz pegado (10X20)', maquina: 'MP3', trabajador: 'Angelo', total: 60, output: 2566 },
      { fecha: '30/03/2026', producto: 'Millares de Resortes', maquina: 'MR1', trabajador: 'Luis Polo', total: 34403, output: 34403 },
      { fecha: '30/03/2026', producto: 'Millares de Resortes', maquina: 'MR2', trabajador: 'Luis Polo', total: 32041, output: 32041 }
    ];

    it('should correctly ignore cumulative output and use net TOTAL for real samples', () => {
      const transformed = transformProductionData(userSample);
      const stats = aggregateData(transformed);
      
      // Total Resortes: 34403 (MR1) + 32041 (MR2) = 66444
      expect(stats.totalResortes).toBe(66444);
      
      // Total Paneles: 100 (MP2). 
      // El de Angelo (60) es "pegado", por lo tanto es PROCESO.
      expect(stats.totalPaneles).toBe(100);
      expect(stats.totalProcesos).toBe(60);
    });

    it('should correctly parse the new Nested JSON format (v2) from produccion_completa.json', () => {
      const v2Sample = [
        {
          "trabajador": { "nombre": "Eliza" },
          "ubicacion": { "modulo": "Paneles", "maquina": "Maquina Panelera 2" },
          "producto": { "nombre": "2 plz (11x22)" },
          "produccion": { "cantidad": 100, "unidad": "unidades" },
          "metadatosFecha": { "anio": 2026, "mes": 3, "dia": 30 },
          "fechaLegible": "2026-03-30"
        }
      ];
      const transformed = transformProductionData(v2Sample);
      expect(transformed[0].trabajador).toBe("Eliza");
      expect(transformed[0].unidadesReales).toBe(100);
      expect(transformed[0].dateKey).toBe("2026-03-30");
      expect(transformed[0].maquinaKey).toBe("Maquina Panelera 2");
    });
  });
});
