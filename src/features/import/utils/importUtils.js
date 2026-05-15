export function normalizeRecords(records) {
  if (!records || !Array.isArray(records)) return [];

  return records.map(r => {
    const trabajadorNombre = r.trabajador?.nombre || r.trabajadorNombre || 'Desconocido';
    const productoNombre = r.producto?.nombre || r.productoNombre || r.producto || 'Sin Producto';
    const cantidad = Number(r.produccion?.cantidad ?? r.cantidad ?? 0);
    const area = r.ubicacion?.modulo || r.area || 'General';
    const maquina = r.ubicacion?.maquina || r.maquinaId || 'N/A';

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
      if (isNaN(finalTimestamp)) finalTimestamp = Date.now();
    }

    return {
      idLocal: r.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      fechaTimestamp: finalTimestamp,
      fechaLegible: (() => {
        const d = new Date(finalTimestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })(),
      trabajadorNombre,
      productoNombre,
      cantidad,
      area,
      moduloId: area,
      maquinaId: maquina,
      outputMaquina: r.outputMaquina ?? r.produccion?.output ?? 0,
      tipoJornada: r.tiempo?.tipo || 'Estándar',
      esMillar: r.esMillar === true ? true : (r.esMillar === false ? false : null),
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
