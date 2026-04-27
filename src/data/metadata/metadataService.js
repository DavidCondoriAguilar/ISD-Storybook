import { db } from '../db'
import { STORAGE_KEYS } from '../constants'

export const discoverAndSaveModules = async (records) => {
  const uniqueModules = [...new Set(records.map(r => r.moduloId))]
  
  for (const modId of uniqueModules) {
    const existing = await db.metadata.get(`${STORAGE_KEYS.MODULE_PREFIX}${modId}`)
    if (!existing) {
      await db.metadata.put({ 
        id: `${STORAGE_KEYS.MODULE_PREFIX}${modId}`, 
        value: `Línea de Producción ${modId}` 
      })
    }
  }
}

export const discoverAndSaveProducts = async (records) => {
  const uniqueProducts = [...new Set(
    records.map(r => r.productoId).filter(id => id !== null)
  )]
  
  for (const prodId of uniqueProducts) {
    const existing = await db.metadata.get(`${STORAGE_KEYS.PRODUCT_PREFIX}${prodId}`)
    if (!existing) {
      await db.metadata.put({ 
        id: `${STORAGE_KEYS.PRODUCT_PREFIX}${prodId}`, 
        value: `Producto REF-${prodId}` 
      })
    }
  }
}

export const discoverAndSaveAll = async (records) => {
  await discoverAndSaveModules(records)
  await discoverAndSaveProducts(records)
}