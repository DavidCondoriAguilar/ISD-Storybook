import { sanitizarNombre } from '../../utils/formatters'

export { sanitizarNombre }

/**
 * NORMALIZADOR DE TIEMPO (Sincronizado con fechaLegible)
 */
export const normalizeTimestamp = (r) => {
  let normalizedTimestamp;
  const rawDate = r.fecha || r.fechaLegible || r.date;
  
  console.log(`[DATE-DEBUG] Procesando fecha raw:`, rawDate);

  try {
    // 0. Prioridad: Número (Excel Serial Date)
    if (typeof rawDate === 'number' && rawDate > 30000 && rawDate < 60000) {
      const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
      d.setHours(12, 0, 0, 0);
      normalizedTimestamp = d.getTime();
      console.log(`[DATE-DEBUG] Excel Serial detected: ${rawDate} -> ${new Date(normalizedTimestamp).toISOString()}`);
    }
    // 1. Prioridad: Objeto Date nativo
    else if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
      const d = new Date(rawDate);
      d.setHours(12, 0, 0, 0);
      normalizedTimestamp = d.getTime();
    }
    // 2. Prioridad: Timestamp explícito (ms)
    else if (r.fechaTimestamp || (typeof rawDate === 'number' && rawDate > 1000000000000)) {
      normalizedTimestamp = Number(r.fechaTimestamp || rawDate);
    } 
    // 3. Prioridad: Metadatos estructurados
    else {
      const meta = r.metadatosFecha || r.MetadatosFecha || r.metadatos?.fecha || {};
      const anio = meta.anio || meta.year || r.anio;
      const mes = meta.mes || meta.month || r.mes;
      const dia = meta.dia || meta.day || r.dia;

      if (anio && mes && dia) {
        const localDate = new Date(Number(anio), Number(mes) - 1, Number(dia), 12, 0, 0, 0);
        normalizedTimestamp = localDate.getTime();
      }
    }

    // 4. Prioridad: Parseo de String (YYYY-MM-DD o DD/MM/YYYY)
    if (!normalizedTimestamp && rawDate) {
      const dateStr = String(rawDate).trim();
      
      // Caso DD/MM/YYYY
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/').map(s => s.trim()).map(Number);
        if (parts.length === 3) {
          const [d, m, y] = parts;
          if (y > 1000) {
            normalizedTimestamp = new Date(y, m - 1, d, 12, 0, 0, 0).getTime();
          }
        }
      } 
      // Caso YYYY-MM-DD
      else if (dateStr.includes('-')) {
        const parts = dateStr.split('-').map(s => s.trim()).map(Number);
        if (parts.length === 3) {
          const [y, m, d] = parts[0] > 1000 ? [parts[0], parts[1], parts[2]] : [parts[2], parts[1], parts[0]];
          normalizedTimestamp = new Date(y, m - 1, d, 12, 0, 0, 0).getTime();
        }
      }
    }

    // Fallback final
    if (!normalizedTimestamp || isNaN(normalizedTimestamp)) {
      const fallback = new Date(String(rawDate));
      if (!isNaN(fallback.getTime())) {
        fallback.setHours(12, 0, 0, 0);
        normalizedTimestamp = fallback.getTime();
      } else {
        console.warn("[DATE-WARN] No se pudo parsear fecha, usando HOY:", rawDate);
        normalizedTimestamp = new Date().setHours(12, 0, 0, 0);
      }
    }
  } catch (e) {
    normalizedTimestamp = new Date().setHours(12, 0, 0, 0);
  }
  return normalizedTimestamp;
}

export const normalizeWorker = (r) => {
  // Soporte para objeto {nombre} o string directo (mapeado desde schema)
  const t = r.trabajador;
  const workerName = (typeof t === 'string' ? t.trim() : (t?.nombre?.trim() || r.trabajadorNombre?.trim())) || 'Sin Nombre';
  const workerKey = (typeof t === 'string' ? t.trim() : (t?.dni || t?.nombre?.trim() || r.trabajadorNombre?.trim())) || 'UNKNOWN';
  
  return { workerKey, workerName };
}

/**
 * NORMALIZADOR DE UBICACIÓN (Detección Inteligente de Área)
 * Prioriza Máquina/Producto sobre la columna 'ÁREA' del Excel (Data Trash).
 */
export const normalizeLocation = (r) => {
  const maquina = r.maquinaId || r.ubicacion?.maquina || r.maquina || 'Sin Máquina';
  const p = r.producto;
  const productoStr = (typeof p === 'string' ? p : (p?.nombre || r.productoNombre || '')).toUpperCase();
  const mId = maquina.toUpperCase();

  // 1. Detección por Máquina (Lo más confiable)
  if (mId.includes('MR')) return { modulo: 'Resortes', maquina };
  if (mId.includes('MP')) return { modulo: 'Paneles', maquina };

  // 2. Detección por Producto
  if (productoStr.includes('RESORTE')) return { modulo: 'Resortes', maquina };
  if (productoStr.includes('PANEL') || productoStr.includes('PLZ')) return { modulo: 'Paneles', maquina };

  // 3. Fallback a la columna del Excel si existe y no es basura
  let modulo = r.area || r.ubicacion?.modulo || r.modulo;
  if (!modulo || modulo === 'General' || modulo === 'Paneles') { 
    // Si dice 'Paneles' pero no detectamos MP/PLZ arriba, mantenemos Paneles como default seguro
    modulo = 'Paneles';
  }

  const result = { modulo, maquina };
  console.log(`[DEBUG] normalizeLocation: ${productoStr.slice(0,20)}... | MId: ${mId} -> ${modulo}`);
  return result;
}

export const normalizeProduct = (r) => {
  const p = r.producto;
  const name = (typeof p === 'string' ? p.trim() : (p?.nombre?.trim() || r.productoNombre?.trim())) || 'Sin Producto';
  const code = (typeof p === 'object' ? (p?.codigo || r.productoId) : 'N/A') || 'N/A';
  
  return { name, code };
}

/**
 * NORMALIZADOR DE PRODUCCIÓN (Detecta Millares/Unidades)
 */
export const normalizeProduction = (r, modulo) => {
  // Si es Resortes y no tiene unidad definida, asumimos millares
  const defaultUnidad = (modulo === 'Resortes') ? 'mil.' : 'u.';
  const unidadDetectada = r.unidad || r.produccion?.unidad || r.unidadOriginal || defaultUnidad;
  
  // LÓGICA DE PRODUCCIÓN NETA (Senior Fallback)
  const total = Number(r.cantidad ?? r.produccion?.cantidad ?? r.total ?? 0);
  const output = Number(r.outputMaquina ?? r.produccion?.output ?? r.output ?? 0);
  
  // Si el total es 0 pero hay lectura de máquina, usamos la lectura
  const cantidadNeta = total > 0 ? total : output;

  return {
    cantidadNeta,
    lecturaMaquina: output,
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