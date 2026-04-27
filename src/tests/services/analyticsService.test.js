import { describe, it, expect } from 'vitest'
import { analyticsService } from '../../features/analytics/services/analyticsService'

describe('AnalyticsService (Inteligencia Industrial)', () => {
  
  const mockRecords = [
    { 
      trabajadorNombre: 'Luis Polo', 
      cantidad: 30000, 
      maquinaId: 'Maquina Resortera 1', 
      productoNombre: 'Millares de Resortes' 
    },
    { 
      trabajadorNombre: 'Eliza', 
      cantidad: 100, 
      maquinaId: 'Maquina Panelera 2', 
      productoNombre: 'Colchón 2 plz' 
    },
    { 
      trabajadorNombre: 'Jair', 
      cantidad: 50, 
      maquinaId: 'Sin Máquina', 
      productoNombre: 'Embarillado' 
    },
    { 
      trabajadorNombre: 'Luis Polo', 
      cantidad: 5000, 
      maquinaId: 'MR2', 
      productoNombre: 'Resortes Bonnell' 
    }
  ]

  describe('Clasificación MP vs MR (Unidades vs Millares)', () => {
    it('debe separar correctamente los totales por tipo de máquina', () => {
      const { topPaneleros, topResorteros } = analyticsService.getWorkerRankings(mockRecords)
      
      // Luis Polo debe estar en Resorteros con 35000
      const luis = topResorteros.find(w => w.name === 'Luis Polo')
      expect(luis).toBeDefined()
      expect(luis.total).toBe(35000)
      
      // Eliza debe estar en Paneleros con 100
      const eliza = topPaneleros.find(w => w.name === 'Eliza')
      expect(eliza).toBeDefined()
      expect(eliza.total).toBe(100)

      // Jair debe estar en Paneleros con 50 (Sin Máquina es Panel por defecto)
      const jair = topPaneleros.find(w => w.name === 'Jair')
      expect(jair).toBeDefined()
      expect(jair.total).toBe(50)
    })
  })

  describe('Resumen Ejecutivo (KPIs)', () => {
    it('debe calcular totales generales correctamente', () => {
      const stats = analyticsService.getExecutiveKPIs(mockRecords)
      expect(stats.totalUnits).toBe(35150)
      expect(stats.uniqueWorkers).toBe(3)
    })
  })
})
