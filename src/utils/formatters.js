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

/**
 * Senior Metric Scaling (e.g. 1.2M, 50K)
 */
export const formatMetric = (num) => {
  if (num === null || num === undefined) return '0';
  const val = Number(num);
  if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return val.toLocaleString();
};

/**
 * Enhanced date formatting with time
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('es-ES', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
