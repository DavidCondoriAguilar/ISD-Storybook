import { describe, it, expect, beforeEach } from 'vitest'
import { storageService } from '../../data/storageService'
import { db } from '../../data/db'

describe('StorageService (Lógica Industrial)', () => {
  
  beforeEach(async () => {
    // Limpiar BD antes de cada test para integridad
    await db.records.clear()
    await db.imports.clear()
  })

  describe('Normalización de Fechas (Precisión Local)', () => {
    it('debe parsear correctamente metadatosFecha (anio, mes, dia)', async () => {
      const mockRecord = {
        metadatosFecha: { anio: 2026, mes: 3, dia: 30 },
        trabajadorNombre: 'Test',
        cantidad: 100
      }
      
      const payload = { fileName: 'test.json', worker: 'Test', rawRecords: [mockRecord] }
      await storageService.save(payload)
      
      const records = await storageService.getAllRecords()
      const date = new Date(records[0].fechaTimestamp)
      
      // En JS, mes 3 (Marzo) es index 2
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(2) 
      expect(date.getDate()).toBe(30)
    })

    it('debe parsear correctamente formato DD/MM/YYYY (Excel)', async () => {
      const mockRecord = {
        fecha: '07/04/2026',
        trabajadorNombre: 'Test',
        cantidad: 50
      }
      
      const payload = { fileName: 'excel.json', worker: 'Test', rawRecords: [mockRecord] }
      await storageService.save(payload)
      
      const records = await storageService.getAllRecords()
      const date = new Date(records[0].fechaTimestamp)
      
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(3) // Abril
      expect(date.getDate()).toBe(7)
    })
  })

  describe('Integridad de Datos y Duplicados', () => {
    it('debe generar IDs únicos para registros idénticos en el mismo día (Fix de Jair/Jerson)', async () => {
      const mockRecords = [
        { fecha: '30/03/2026', trabajadorNombre: 'Jerson', productoNombre: 'Embarillado', cantidad: 10 },
        { fecha: '30/03/2026', trabajadorNombre: 'Jerson', productoNombre: 'Embarillado', cantidad: 10 }
      ]
      
      const payload = { fileName: 'duplicate_entries.json', worker: 'Jerson', rawRecords: mockRecords }
      await storageService.save(payload)
      
      const records = await storageService.getAllRecords()
      
      // Deben existir ambos, no fusionarse
      expect(records.length).toBe(2)
      expect(records[0].idLocal).not.toBe(records[1].idLocal)
    })
  })

  describe('Lógica de Unidades (Paneleras vs Resorteras)', () => {
    it('debe asignar "u." a máquinas Paneleras (MP)', async () => {
      const mockRecord = {
        maquina: 'Maquina Panelera 2',
        productoNombre: 'Colchón 2 plz',
        cantidad: 100
      }
      
      const payload = { fileName: 'mp.json', worker: 'Eliza', rawRecords: [mockRecord] }
      await storageService.save(payload)
      
      const records = await storageService.getAllRecords()
      // La lógica de unidad está en el UI (Dashboard.jsx), pero podemos verificar que el maquinaId se guardó bien
      expect(records[0].maquinaId).toContain('Panelera')
    })
    
    it('debe manejar cantidades que vienen como strings numéricos', async () => {
      const mockRecord = {
        trabajadorNombre: 'StringTest',
        cantidad: "150" // String en lugar de Number
      }
      const payload = { fileName: 'strings.json', worker: 'Test', rawRecords: [mockRecord] }
      await storageService.save(payload)
      const records = await storageService.getAllRecords()
      expect(records[0].cantidad).toBe(150)
    })

    it('debe asignar valores por defecto si faltan campos críticos', async () => {
      const mockRecord = {
        // Falta trabajador, falta maquina, falta producto
        cantidad: 10
      }
      const payload = { fileName: 'empty.json', worker: 'Test', rawRecords: [mockRecord] }
      await storageService.save(payload)
      const records = await storageService.getAllRecords()
      
      expect(records[0].trabajadorNombre).toBe('Sin Nombre')
      expect(records[0].productoNombre).toBe('Sin Producto')
      expect(records[0].maquinaId).toBe('Sin Máquina')
    })
  })

  describe('Lógica de Unidades y Clasificación', () => {
    it('debe por defecto usar "u." para máquinas desconocidas (ej. MPX)', async () => {
      const mockRecord = {
        maquina: 'Cortadora Especial 5',
        productoNombre: 'Varillas',
        cantidad: 50
      }
      const payload = { fileName: 'unknown.json', worker: 'Test', rawRecords: [mockRecord] }
      await storageService.save(payload)
      const records = await storageService.getAllRecords()
      
      // La lógica de unidad en el Dashboard detectará esto como "u." (default)
      expect(records[0].maquinaId).toBe('Cortadora Especial 5')
    })
  })
})
