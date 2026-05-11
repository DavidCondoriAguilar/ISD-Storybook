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
  const mId = String(record.maquinaId || record.ubicacion?.maquina || '').toUpperCase();
  const unidad = String(record.unidad || record.produccion?.unidad || '').toLowerCase();
  const producto = String(record.productoNombre || record.producto?.nombre || record.producto || '').toLowerCase();
  
  return mId.includes('MR') || unidad.includes('mil') || producto.includes('resorte');
};

export const isProceso = (record) => {
  if (!record) return false;
  const mId = String(record.maquinaId || record.ubicacion?.maquina || '').toUpperCase();
  
  const isRes = isResorte(record);
  const isPanelMachine = ['MP1', 'MP2', 'MP3', 'MP4'].some(m => mId.includes(m));

  return !isRes && !isPanelMachine;
};

/**
 * Determina si un registro pertenece a la categoría de Paneles (MP).
 */
export const isPanel = (record) => {
  if (!record) return false;
  const mId = String(record.maquinaId || record.ubicacion?.maquina || '').toUpperCase();
  
  return ['MP1', 'MP2', 'MP3', 'MP4'].some(m => mId.includes(m));
};

/**
 * Formatea la unidad según el tipo de producto.
 */
export const getUnitLabel = (record) => {
  return isResorte(record) ? 'mil.' : 'u.';
};
