import { useLiveQuery } from 'dexie-react-hooks';
import { db, dbService } from '../../data/db';

/**
 * @hook useProductionData
 * @description Hook reactivo de alto rendimiento para el consumo de datos industriales.
 * Utiliza 'useLiveQuery' para suscripciones en tiempo real a los cambios en IndexedDB.
 */
export const useProductionData = () => {
  // Suscripción reactiva a todos los registros (Stream de datos local)
  const records = useLiveQuery(() => db.records.toArray()) || [];
  
  // Obtenemos el historial de importaciones
  const importHistory = useLiveQuery(() => db.imports.orderBy('timestamp').reverse().toArray()) || [];

  const isLoading = records === undefined || importHistory === undefined;

  /**
   * Agrega registros masivos de forma eficiente
   */
  const addImport = async (importSummary) => {
    return await dbService.saveImport(importSummary);
  };

  /**
   * Limpia toda la bitácora (Acción Administrativa)
   */
  const clearDatabase = async () => {
    return await dbService.clearAll();
  };

  return {
    records,
    importHistory,
    isLoading,
    addImport,
    clearDatabase
  };
};
