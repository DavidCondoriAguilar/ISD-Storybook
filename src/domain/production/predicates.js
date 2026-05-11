/**
 * Predicados de Dominio para Producción
 * Centraliza las reglas de negocio para evitar "fugas" de lógica en la UI.
 */

/**
 * Determina si un registro pertenece a la categoría de Resortes (MR).
 * @param {Object} record 
 * @returns {boolean}
 */
export const isResorte = (record) => {
  if (!record) return false;
  // PRIORIDAD: Usar flag directo del Excel Service (v10.1)
  if (record.esMillar === true) return true;
  if (record.esMillar === false) return false;
  
  const maquina = String(record.maquinaId || record.ubicacion?.maquina || '').toUpperCase();
  const producto = String(record.productoNombre || record.producto?.nombre || record.producto || '').toLowerCase();
  const unidad = String(record.unidad || record.produccion?.unidad || '').toLowerCase();
  
  if (maquina.includes('MR')) return true;
  if (producto.includes('resorte') || producto.includes('millar')) return true;
  if (unidad.includes('mil')) return true;
  
  return false;
};

export const isProceso = (record) => {
  if (!record) return false;
  const producto = String(record.productoNombre || record.producto?.nombre || record.producto || '').toLowerCase();
  const area = String(record.moduloId || record.area || record.ubicacion?.modulo || '').toLowerCase();
  
  // SOLO proceso real si es soporte, telas, quimicos, administrativo (NO producción)
  const keywordsProceso = [
    'soporte', 'administrativo', 'telas', 'quimicos'
  ];
  
  return keywordsProceso.some(key => producto.includes(key) || area.includes(key));
};

export const isPanel = (record) => {
  if (!record) return false;
  // Un panel es lo que NO es resorte y NO es un proceso intermedio
  return !isResorte(record) && !isProceso(record);
};

export const getUnitLabel = (record) => {
  return isResorte(record) ? 'mil.' : 'u.';
};
