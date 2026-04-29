/**
 * UTILIDADES DE IMPORTACIÓN (Mapping Exacto para produccion_completa.json)
 */

export function normalizeRecords(records) {
  if (!records || !Array.isArray(records)) return [];
  
  return records.map(r => {
    // 1. Identificación del Trabajador
    const trabajadorNombre = r.trabajador?.nombre || r.trabajadorNombre || 'Desconocido';
    
    // 2. Identificación del Producto
    const productoNombre = r.producto?.nombre || r.productoNombre || r.producto || 'Sin Producto';
    
    // 3. Cantidad y Clasificación MP/MR
    const cantidad = Number(r.produccion?.cantidad ?? r.cantidad ?? 0);
    const isResorte = productoNombre.toUpperCase().includes('RESORTE');
    
    // 4. Mapeo de Ubicación (ÁREA y MÁQUINA)
    // Usamos EXACTAMENTE lo que viene en tu JSON: ubicacion.modulo y ubicacion.maquina
    const area = r.ubicacion?.modulo || (isResorte ? 'Resortería' : 'Panelería');
    const maquina = r.ubicacion?.maquina || (isResorte ? 'Máquina Resortera' : 'Máquina Panelera');
    
    // 5. Gestión de FECHA (Respetando fechaLegible del JSON)
    let finalTimestamp;
    if (r.fechaLegible) {
      // Si existe fechaLegible, la usamos (Formato YYYY-MM-DD)
      finalTimestamp = new Date(r.fechaLegible + 'T12:00:00').getTime();
    } else if (r.metadatosFecha) {
      // Backup: Usar metadatosFecha si no hay fechaLegible
      const { anio, mes, dia } = r.metadatosFecha;
      finalTimestamp = new Date(anio, mes - 1, dia, 12, 0, 0).getTime();
    } else {
      finalTimestamp = Date.now();
    }

    return {
      idLocal: r.id || `rec_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: finalTimestamp,
      fechaTimestamp: finalTimestamp,
      fechaLegible: r.fechaLegible || new Date(finalTimestamp).toISOString().split('T')[0],
      trabajadorNombre,
      productoNombre,
      cantidad,
      unidad: isResorte ? 'mil.' : 'u.',
      area: area,
      moduloId: area, // Sincronizamos moduloId con área para consistencia
      maquinaId: maquina,
      outputMaquina: r.outputMaquina ?? null,
      tipoJornada: r.tiempo?.tipo || 'Estándar',
      metadata: {
        originalId: r.id,
        version: r.version || '1.0'
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
