/**
 * DATA NORMALIZER SERVICE (Patrón Adaptador)
 * Convierte cualquier estructura de JSON de entrada al Estándar ISD.
 * Esto permite que el resto de la app sea "Less is More".
 */
export const dataNormalizer = {
  /**
   * Normaliza un registro individual
   */
  normalize: (rawRecord, sourceModule = 'general') => {
    // 1. Mapeo de campos comunes (Soporta múltiples nomenclaturas)
    const normalized = {
      id: rawRecord.id || `${rawRecord.fechaTimestamp}-${rawRecord.trabajadorId}`,
      fechaTimestamp: rawRecord.fechaTimestamp || Date.now(),
      trabajadorId: rawRecord.trabajadorId || rawRecord.operarioId || 'unknown',
      trabajadorNombre: rawRecord.trabajadorNombre || rawRecord.operarioNombre || 'Sin Nombre',
      productoNombre: rawRecord.productoNombre || rawRecord.itemNombre || 'Producto General',
      maquinaId: rawRecord.maquinaId || rawRecord.equipoId || 'Sin Máquina',
      
      // Cantidades con fallback y limpieza
      cantidad: Number(rawRecord.cantidad || rawRecord.produccion || 0),
      outputMaquina: Number(rawRecord.outputMaquina || rawRecord.contadorMaquina || 0),
      
      // Metadatos de Negocio
      unidad: rawRecord.unidad?.toLowerCase() || (rawRecord.maquinaId?.includes('MR') ? 'millares' : 'unidades'),
      area: rawRecord.area || rawRecord.moduloId || sourceModule,
      timestamp_import: Date.now()
    };

    // 2. Lógica de Negocio: Autodetectar discrepancias críticas en la ingesta
    normalized.isAnomalous = normalized.cantidad > (normalized.outputMaquina * 1.5) && normalized.outputMaquina > 0;
    
    return normalized;
  },

  /**
   * Procesa un lote completo de registros
   */
  processBatch: (records, moduleName) => {
    if (!Array.isArray(records)) return [];
    return records.map(r => dataNormalizer.normalize(r, moduleName));
  }
};
