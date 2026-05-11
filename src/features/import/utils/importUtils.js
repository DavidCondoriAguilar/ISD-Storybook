import { isResorte as checkIsResorte } from '../../../domain/production/predicates';

/**
 * UTILIDADES DE IMPORTACIÓN (Mapping Exacto para produccion_completa.json)
 */

// Flag global para forzar resorte en importUtils (v10.0 Industrial Fix)
let forceResorteContext = false;

export function setResorteContext(enabled) {
  forceResorteContext = enabled;
}

export function normalizeRecords(records) {
  if (!records || !Array.isArray(records)) return [];
  
  return records.map(r => {
    // 1. Identificación del Trabajador (Soporte Dual)
    const trabajadorNombre = r.trabajador?.nombre || r.trabajadorNombre || 'Desconocido';
    
    // 2. Identificación del Producto
    const productoNombre = r.producto?.nombre || r.productoNombre || r.producto || 'Sin Producto';
    
    // 3. Cantidad (Soporte Dual)
    const cantidad = Number(r.produccion?.cantidad ?? r.cantidad ?? 0);
    
    // 4. Mapeo de Ubicación (ÁREA y MÁQUINA)
    const area = r.ubicacion?.modulo || r.area || 'General';
    const maquina = r.ubicacion?.maquina || r.maquinaId || 'N/A';
    
    // 5. Gestión de FECHA (Crítico para evitar el 01/01)
    let finalTimestamp = null;
    const fLegible = r.fechaLegible || (r.fechaTimestamp ? new Date(Number(r.fechaTimestamp)).toISOString().split('T')[0] : null);
    
    if (fLegible && String(fLegible).includes('-')) {
      const parts = String(fLegible).split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const localDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
        finalTimestamp = localDate.getTime();
      }
    } 
    
    if (!finalTimestamp || isNaN(finalTimestamp)) {
      finalTimestamp = r.fechaTimestamp ? Number(r.fechaTimestamp) : Date.now();
      // Si sigue siendo inválido, fallback final
      if (isNaN(finalTimestamp)) finalTimestamp = Date.now();
    }

    // v10.0: PRIORIDAD AL FLAG DEL EXCEL SERVICE
    const esMillarFlag = r.esMillar === true ? true : (r.esMillar === false ? false : null);
    
    let isRes;
    if (esMillarFlag !== null) {
      isRes = esMillarFlag;
    } else {
      // Fallback: recalcular con predicado estándar
      isRes = checkIsResorte({ 
        maquinaId: maquina, 
        productoNombre: productoNombre,
        unidad: r.produccion?.unidad || r.unidad || '' 
      });
    }
    
    return {
      idLocal: r.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: finalTimestamp,
      fechaTimestamp: finalTimestamp,
      fechaLegible: (() => {
        const d = new Date(finalTimestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })(),
      trabajadorNombre,
      productoNombre,
      cantidad,
      unidad: isRes ? 'mil.' : 'u.',
      area: area,
      moduloId: area,
      maquinaId: maquina,
      outputMaquina: r.outputMaquina ?? r.produccion?.output ?? 0,
      tipoJornada: r.tiempo?.tipo || 'Estándar',
      esMillar: isRes,
      metadata: {
        originalId: r.id,
        version: r.version || '10.0-Industrial-Fix'
      }
    };
  });
}

export function calculateSummary(normalizedRecords) {
  if (!normalizedRecords || !normalizedRecords.length) return null;
  const totalUnits = normalizedRecords.reduce((sum, r) => sum + r.cantidad, 0);
  const first = normalizedRecords[0];
  return {
    totalUnits,
    totalRecords: normalizedRecords.length,
    worker: first.trabajadorNombre,
    shift: first.tipoJornada
  };
}
