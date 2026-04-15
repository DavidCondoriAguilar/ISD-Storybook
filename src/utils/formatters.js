/**
 * Dynamic Mappings for Manager-Friendly UI
 */
let moduleMapCache = {};
let productMapCache = {};

export const setModuleMapCache = (map) => {
  moduleMapCache = map;
};

export const setProductMapCache = (map) => {
  productMapCache = map;
};

export const getModuleName = (moduloId) => {
  const id = String(moduloId);
  return moduleMapCache[id] || `Módulo ${id}`;
};

export const getProductName = (productoId) => {
  if (!productoId) return 'Producto General';
  const id = String(productoId);
  return productMapCache[id] || `Referencia #${id}`;
};

/**
 * Formats date from Unix Timestamp (ms) to DD/MM/YYYY
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

/**
 * Formats hours with h suffix
 */
export const formatHours = (hours) => {
  if (!hours) return '0.00h';
  return `${hours}h`;
};
