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
  const maquinaId = record.maquinaId || '';
  const unidad = record.unidad || '';
  
  return maquinaId.includes('MR') || unidad.includes('mil');
};

/**
 * Determina si un registro pertenece a la categoría de Paneles (MP).
 * @param {Object} record 
 * @returns {boolean}
 */
export const isPanel = (record) => {
  return !isResorte(record);
};

/**
 * Formatea la unidad según el tipo de producto.
 * @param {Object} record 
 * @returns {string}
 */
export const getUnitLabel = (record) => {
  return isResorte(record) ? 'mil.' : 'u.';
};
