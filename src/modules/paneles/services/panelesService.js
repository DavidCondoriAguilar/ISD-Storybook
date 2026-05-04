/**
 * Lógica de negocio para el área de PANELES
 */

export const filterPanelesRecords = (records) => {
  return records.filter(r => {
    const mId = String(r.maquinaId || '').toUpperCase();
    const pName = String(r.productoNombre || '').toUpperCase();
    const isResorte = mId.includes('MR') || mId.includes('RESORTE') || pName.includes('RESORTE');
    const isProceso = pName.includes('EMBARILLADO') || pName.includes('CORTADO') || pName.includes('DOBLADO') || pName.includes('VARILLA');
    
    // Es panel si no es resorte ni proceso (ajustar según lógica de negocio)
    return !isResorte && !isProceso && (r.area === 'Paneles' || pName.includes('PANEL'));
  });
};

export const getTopPaneleros = (records, limit = 5) => {
  const workerMap = {};
  
  filterPanelesRecords(records).forEach(r => {
    const name = r.trabajadorNombre || 'Sin Nombre';
    if (!workerMap[name]) {
      workerMap[name] = { name, total: 0, area: 'Paneles' };
    }
    workerMap[name].total += (r.cantidad || 0);
  });

  return Object.values(workerMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};
