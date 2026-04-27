import { describe, it, expect } from 'vitest'
import { validateFile, validateRecord } from '../../features/import/services/importService'

describe('ImportService (Validador ISD)', () => {
  
  describe('validateRecord (Firma de Datos)', () => {
    it('debe aceptar un registro con formato anidado (v2)', () => {
      const v2Record = {
        trabajador: { nombre: 'Eliza' },
        produccion: { cantidad: 100 },
        ubicacion: { modulo: 'Paneles' }
      }
      expect(validateRecord(v2Record)).toBe(true)
    })

    it('debe aceptar un registro con formato plano (v1)', () => {
      const v1Record = {
        id: 1,
        trabajadorNombre: 'Angelo',
        cantidad: 60
      }
      expect(validateRecord(v1Record)).toBe(true)
    })

    it('debe rechazar basura o null', () => {
      expect(validateRecord(null)).toBe(false)
      expect(validateRecord({})).toBe(false)
      expect(validateRecord("hola")).toBe(false)
    })
  })

  describe('validateFile (Integridad del Archivo)', () => {
    it('debe validar un archivo JSON válido con múltiples registros', async () => {
      const content = JSON.stringify([
        { trabajadorNombre: 'Jerson', cantidad: 50 },
        { trabajadorNombre: 'Jair', cantidad: 30 }
      ])
      
      const file = new File([content], 'data.json', { type: 'application/json' })
      const result = await validateFile(file)
      
      expect(result.valid).toBe(true)
      expect(result.data.records).toBe(2)
      expect(result.data.units).toBe(80)
    })

    it('debe dar error si no es un Array', async () => {
      const file = new File(['{"id":1}'], 'data.json', { type: 'application/json' })
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Array')
    })
  })
})
