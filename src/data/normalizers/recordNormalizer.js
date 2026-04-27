import { sanitizarNombre } from '../../utils/formatters'

export { sanitizarNombre }

export const normalizeTimestamp = (r) => {
  let normalizedTimestamp;
  try {
    if (r.metadatosFecha && r.metadatosFecha.anio) {
      const { anio, mes, dia } = r.metadatosFecha;
      const localDate = new Date(anio, (mes || 1) - 1, dia || 1, 0, 0, 0, 0);
      normalizedTimestamp = localDate.getTime();
    } else if (r.fechaLegible) {
      const [y, m, d] = r.fechaLegible.split('-').map(Number);
      const localDate = new Date(y, m - 1, d, 0, 0, 0, 0);
      normalizedTimestamp = localDate.getTime();
    } else {
      let dateStr = String(r.fecha || r.fechaLegible || "");
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const localDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 0, 0, 0, 0);
          normalizedTimestamp = localDate.getTime();
        }
      }
      
      if (!normalizedTimestamp) {
        const dateObj = new Date(dateStr || Date.now());
        dateObj.setHours(0, 0, 0, 0);
        normalizedTimestamp = dateObj.getTime();
      }
    }
  } catch (e) {
    normalizedTimestamp = new Date().setHours(0, 0, 0, 0);
  }
  return normalizedTimestamp
}

export const normalizeWorker = (r) => {
  const workerKey = r.trabajador?.dni || r.trabajador?.nombre || r.trabajadorNombre || 'UNKNOWN'
  const workerName = r.trabajador?.nombre || r.trabajadorNombre || 'Sin Nombre'
  return { workerKey, workerName }
}

export const normalizeLocation = (r) => ({
  modulo: r.ubicacion?.modulo || r.modulo || 'Otros',
  maquina: r.ubicacion?.maquina || r.maquina || 'Sin Máquina'
})

export const normalizeProduct = (r) => ({
  name: r.producto?.nombre || r.productoNombre || 'Sin Producto',
  code: r.producto?.codigo || r.productoId || 'N/A'
})

export const normalizeProduction = (r) => ({
  cantidadNeta: Number(r.produccion?.cantidad ?? r.cantidad ?? r.total ?? 0),
  lecturaMaquina: Number(r.outputMaquina ?? r.produccion?.output ?? 0),
  unidadOriginal: (r.produccion?.unidad || r.unidad || 'unidades').toLowerCase()
})

export const normalizeTime = (r) => {
  let jornadaHoras = r.tiempo?.horas || r.tiempo?.horasTotal || "8.75";
  if (!r.tiempo?.horas && r.tiempo?.minutos) {
    jornadaHoras = (r.tiempo.minutos / 60).toFixed(2);
  }
  return {
    jornadaHoras,
    minutos: r.tiempo?.minutos || 0,
    horasExtra: Number(r.tiempo?.horasExtra || 0),
    tipoJornada: r.tiempo?.tipo || r.tipoJornada || 'Estándar'
  }
}

export const generateRecordId = (workerKey, normalizedTimestamp, i, r) => {
  const businessHash = `${workerKey}-${normalizedTimestamp}-${r.produccion?.cantidad ?? r.cantidad ?? 0}-${r.ubicacion?.modulo || r.modulo || 'Otros'}-${r.producto?.nombre || r.productoNombre || 'Sin Producto'}-${i}`;
  return `ISD-${workerKey}-${normalizedTimestamp}-${i}-${r.id || r.idLocal || btoa(unescape(encodeURIComponent(businessHash))).slice(0, 8)}`;
}