import { describe, it, expect } from 'vitest';
import { isResorte, isPanel } from '../../domain/production/predicates';
import { filterRecords, calculateDailyStats } from '../../domain/production/transformations';

describe('Domain Production Logic', () => {
  describe('Predicates', () => {
    it('should identify a Resorte record by machineId MR', () => {
      const record = { maquinaId: 'MR-01', unidad: 'u' };
      expect(isResorte(record)).toBe(true);
    });

    it('should identify a Resorte record by unit mil', () => {
      const record = { maquinaId: 'MP-01', unidad: 'mil' };
      expect(isResorte(record)).toBe(true);
    });

    it('should identify a Panel record', () => {
      const record = { maquinaId: 'MP-05', unidad: 'u' };
      expect(isPanel(record)).toBe(true);
    });
  });

  describe('Transformations', () => {
    const mockRecords = [
      { id: 1, area: 'paneles', moduloId: 'paneles', fechaTimestamp: 1000, cantidad: 10, maquinaId: 'MP-1' },
      { id: 2, area: 'telas', moduloId: 'telas', fechaTimestamp: 2000, cantidad: 20, maquinaId: 'MR-1' },
    ];

    it('should filter records by moduleId', () => {
      const result = filterRecords(mockRecords, { moduleId: 'paneles' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should calculate daily stats correctly', () => {
      const stats = calculateDailyStats(mockRecords);
      expect(stats).toHaveLength(1); // Same day mock
      expect(stats[0].mp.total).toBe(10);
      expect(stats[0].mr.total).toBe(20);
    });
  });
});
