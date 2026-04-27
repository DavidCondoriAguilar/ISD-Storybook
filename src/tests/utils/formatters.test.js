import { describe, it, expect } from 'vitest'
import { formatDate, formatMetric, sanitizarNombre, formatHours } from '../../utils/formatters'

describe('Formatters (Visualización Senior)', () => {
  
  describe('sanitizarNombre', () => {
    it('debe limpiar caracteres especiales industriales (× -> x)', () => {
      expect(sanitizarNombre('Panel 2×1')).toBe('Panel 2x1')
      expect(sanitizarNombre('  Espuma Blanca  ')).toBe('Espuma Blanca')
    })

    it('debe dar fallback si el nombre es nulo', () => {
      expect(sanitizarNombre(null)).toBe('Sin Nombre')
      expect(sanitizarNombre(undefined)).toBe('Sin Nombre')
    })
  })

  describe('formatDate', () => {
    it('debe convertir timestamp a DD/MM/YYYY', () => {
      const ts = new Date(2026, 3, 30).getTime() // 30 de Abril 2026
      expect(formatDate(ts)).toBe('30/04/2026')
    })

    it('debe manejar valores inválidos', () => {
      expect(formatDate(null)).toBe('N/A')
      expect(formatDate(0)).toBe('N/A')
    })
  })

  describe('formatMetric (K/M Scaling)', () => {
    it('debe formatear miles con K', () => {
      expect(formatMetric(1500)).toBe('1.5K')
      expect(formatMetric(500)).toBe('500')
    })

    it('debe formatear millones con M', () => {
      expect(formatMetric(2300000)).toBe('2.3M')
    })
  })

  describe('formatHours', () => {
    it('debe añadir el sufijo h', () => {
      expect(formatHours(8.5)).toBe('8.5h')
      expect(formatHours(0)).toBe('0.00h')
    })
  })
})
