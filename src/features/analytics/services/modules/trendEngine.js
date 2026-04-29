/**
 * MOTOR DE TENDENCIAS (Series temporales para gráficos)
 */
export const calculateTrends = (records) => {
  const trendMap = {};

  records.forEach(r => {
    const d = new Date(r.fechaTimestamp);
    const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!trendMap[dateKey]) {
      trendMap[dateKey] = { date: dateKey, paneles: 0, resortes: 0, procesos: 0 };
    }

    const mId = String(r.maquinaId || '').toUpperCase();
    const pName = String(r.productoNombre || '').toUpperCase();
    const isResorte = mId.includes('MR') || mId.includes('RESORTE') || pName.includes('RESORTE');
    const isProceso = pName.includes('EMBARILLADO') || pName.includes('CORTADO') || pName.includes('DOBLADO') || pName.includes('VARILLA');

    if (isResorte) trendMap[dateKey].resortes += (r.cantidad || 0);
    else if (isProceso) trendMap[dateKey].procesos += (r.cantidad || 0);
    else trendMap[dateKey].paneles += (r.cantidad || 0);
  });

  return Object.values(trendMap).sort((a, b) => {
    const [da, ma] = a.date.split('/').map(Number);
    const [db, mb] = b.date.split('/').map(Number);
    return ma !== mb ? ma - mb : da - db;
  }).map(d => ({
    ...d,
    resortes: d.resortes / 1000 // Normalización para escala visual
  }));
};
