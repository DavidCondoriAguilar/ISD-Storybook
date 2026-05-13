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
  const maquina = String(record.maquinaId || record.maquina || record.ubicacion?.maquina || '').toUpperCase();
  const producto = String(record.productoNombre || record.producto?.nombre || record.producto || '').toLowerCase();
  const unidad = String(record.unidad || record.produccion?.unidad || '').toLowerCase();
  
  // PRIORIDAD 1: Máquina MR
  if (maquina.includes('MR')) return true;
  
  // PRIORIDAD 2: Producto que contenga 'RESORTE' o 'MILLAR'
  if (producto.includes('resorte') || producto.includes('millar')) return true;
  
  // PRIORIDAD 3: Unidad declarada como millares
  if (unidad.includes('mil')) return true;
  
  return false;
};

export const isProceso = (record) => {
  if (!record) return false;
  const producto = String(record.productoNombre || record.producto?.nombre || record.producto || '').toLowerCase();
  const area = String(record.moduloId || record.area || record.ubicacion?.modulo || '').toLowerCase();
  
  // SOLO tareas administrativas, mantenimiento o permisos (NO cuentan como unidades de producto)
  const keywordsNoProduccion = [
    'soporte', 'administrativo', 'limpieza', 'permiso', 'mantenimiento', 'no trabajó', 'reunión', 'capacitación'
  ];
  
  return keywordsNoProduccion.some(key => producto.includes(key) || area.includes(key));
};

export const isPanel = (record) => {
  if (!record) return false;
  // Un panel es lo que NO es resorte y NO es un proceso intermedio
  return !isResorte(record) && !isProceso(record);
};

export const getUnitLabel = (record) => {
  return isResorte(record) ? 'mil.' : 'u.';
};
