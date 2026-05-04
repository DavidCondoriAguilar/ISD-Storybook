/**
 * Lógica de negocio para el área de TELAS
 */

export const filterTelasRecords = (records) => {
  return records.filter(r => r.area === 'Telas' || (r.productoNombre || '').toUpperCase().includes('TELA'));
};

export const getTelasStats = (records) => {
  const telas = filterTelasRecords(records);
  return {
    count: telas.length,
    totalQuantity: telas.reduce((sum, r) => sum + (r.cantidad || 0), 0)
  };
};
