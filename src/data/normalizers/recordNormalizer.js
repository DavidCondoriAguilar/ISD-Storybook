import { sanitizarNombre } from '../../utils/formatters'

export { sanitizarNombre }

/**
 * NORMALIZADOR DE TIEMPO (Sincronizado con fechaLegible)
 */
export const normalizeTimestamp = (r) => {
  let normalizedTimestamp;
  try {
    if (r.fechaTimestamp) {
      normalizedTimestamp = Number(r.fechaTimestamp);
    } else if (r.metadatosFecha && r.metadatosFecha.anio) {
      const { anio, mes, dia } = r.metadatosFecha;
      const localDate = new Date(anio, (mes || 1) - 1, dia || 1, 12, 0, 0, 0);
      normalizedTimestamp = localDate.getTime();
    } else if (r.fechaLegible && String(r.fechaLegible).includes('-')) {
      const parts = String(r.fechaLegible).split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const localDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
        normalizedTimestamp = localDate.getTime();
      }
    } 
    
    if (!normalizedTimestamp || isNaN(normalizedTimestamp)) {
      let dateStr = String(r.fecha || r.fechaLegible || "");
      const dateObj = new Date(dateStr);
      
      if (isNaN(dateObj.getTime())) {
        normalizedTimestamp = new Date().setHours(12, 0, 0, 0);
      } else {
        dateObj.setHours(12, 0, 0, 0);
        normalizedTimestamp = dateObj.getTime();
      }
    }
  } catch (e) {
    normalizedTimestamp = new Date().setHours(12, 0, 0, 0);
  }
  return normalizedTimestamp
}

export const normalizeWorker = (r) => {
  // Soporte para objeto {nombre} o string directo (mapeado desde schema)
  const t = r.trabajador;
  const workerName = (typeof t === 'string' ? t : (t?.nombre || r.trabajadorNombre)) || 'Sin Nombre';
  const workerKey = (typeof t === 'string' ? t : (t?.dni || t?.nombre || r.trabajadorNombre)) || 'UNKNOWN';
  
  return { workerKey, workerName };
}

/**
 * NORMALIZADOR DE UBICACIÓN (Detección Inteligente de Área)
 */
export const normalizeLocation = (r) => {
  const maquina = r.maquinaId || r.ubicacion?.maquina || r.maquina || 'Sin Máquina';
  const p = r.producto;
  const productoStr = (typeof p === 'string' ? p : (p?.nombre || r.productoNombre || '')).toUpperCase();
  const mId = maquina.toUpperCase();

  let modulo = r.area || r.ubicacion?.modulo || r.modulo;

  // Lógica Senior: Solo deducimos el área si viene vacía o como 'General'
  if (!modulo || modulo === 'General') {
    if (mId.includes('MR') || productoStr.includes('RESORTE')) {
      modulo = 'Resortes';
    } else if (mId.includes('MP') || productoStr.includes('PANEL') || productoStr.includes('PLZ')) {
      modulo = 'Paneles';
    } else {
      modulo = 'Paneles'; // Fallback por defecto
    }
  }

  return { modulo, maquina };
}

export const normalizeProduct = (r) => {
  const p = r.producto;
  const name = (typeof p === 'string' ? p : (p?.nombre || r.productoNombre)) || 'Sin Producto';
  const code = (typeof p === 'object' ? (p?.codigo || r.productoId) : 'N/A') || 'N/A';
  
  return { name, code };
}

/**
 * NORMALIZADOR DE PRODUCCIÓN (Detecta Millares/Unidades)
 */
export const normalizeProduction = (r) => {
  const unidadDetectada = r.unidad || r.produccion?.unidad || r.unidadOriginal || 'u.';
  return {
    cantidadNeta: Number(r.cantidad ?? r.produccion?.cantidad ?? r.total ?? 0),
    lecturaMaquina: Number(r.outputMaquina ?? r.produccion?.output ?? 0),
    unidadOriginal: unidadDetectada.toLowerCase().includes('mil') ? 'mil.' : 'u.'
  }
}

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
  // Generamos un hash de negocio que garantice unicidad incluso si el ID original se repite
  const rawId = r.id || r.idLocal || 'gen';
  return `ISD-${normalizedTimestamp}-${workerKey}-${rawId}-${i}`;
}