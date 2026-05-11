import { db } from '../db';

/**
 * Repository para la gestión de datos de producción.
 * Encapsula la complejidad de las consultas y asegura que la UI no dependa 
 * directamente de la estructura de la base de datos.
 */
export const productionRepository = {
  /**
   * Obtiene los registros filtrados por módulo o área.
   * Maneja el caso especial de 'Paneles' (Auditoría Máster).
   */
  async getRecordsByModule(moduleId) {
    if (!moduleId) return [];

    // Caso Auditoría Máster: Retorna todo
    if (moduleId.toLowerCase() === 'paneles') {
      return await db.records.toArray();
    }

    // Normalización de términos de búsqueda para flexibilidad industrial
    const capitalized = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
    const searchTerms = Array.from(new Set([
      moduleId, 
      capitalized, 
      moduleId.toLowerCase(),
      moduleId.toUpperCase()
    ]));

    // Consultas paralelas optimizadas por índice
    const [byModulo, byArea] = await Promise.all([
      db.records.where('moduloId').anyOf(searchTerms).toArray(),
      db.records.where('area').anyOf(searchTerms).toArray()
    ]);

    // De-duplicación Senior usando Map (Rendimiento O(n))
    const merged = [...byModulo, ...byArea];
    const uniqueMap = new Map();
    merged.forEach(r => uniqueMap.set(r.idLocal || r.id, r));

    return Array.from(uniqueMap.values());
  }
};
