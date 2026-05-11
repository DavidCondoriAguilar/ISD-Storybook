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
  const maquina = String(record.maquinaId || record.ubicacion?.maquina || '').toUpperCase();
  const producto = String(record.productoNombre || record.producto?.nombre || record.producto || '').toLowerCase();
  const unidad = String(record.unidad || record.produccion?.unidad || '').toLowerCase();
  
  return maquina.includes('MR') || 
         producto.includes('resorte') || 
         producto.includes('millar') || 
         unidad.includes('mil');
};

export const isProceso = (record) => {
  if (!record) return false;
  const producto = String(record.productoNombre || record.producto?.nombre || record.producto || '').toLowerCase();
  const area = String(record.moduloId || record.area || record.ubicacion?.modulo || '').toLowerCase();
  
  const keywordsProceso = [
    'embarillado', 'doblado', 'cortado', 'pegado', 'sellado', 
    'telas', 'quimicos', 'soporte', 'administrativo'
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
