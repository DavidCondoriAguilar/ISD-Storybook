import { isResorte, isProceso, isPanel } from '../../../../domain/production/predicates';

/**
 * MOTOR DE TENDENCIAS (Series temporales para gráficos)
 */
export const calculateTrends = (records) => {
  const trendMap = {};

  const dateCache = new Map();
  
  records.forEach(r => {
    const ts = r.fechaTimestamp;
    if (!ts) return;

    // Redondear al inicio del día para la clave
    const dayStart = Math.floor(ts / 86400000) * 86400000;
    
    if (!trendMap[dayStart]) {
      let dateKey = dateCache.get(dayStart);
      if (!dateKey) {
        const d = new Date(ts);
        dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        dateCache.set(dayStart, dateKey);
      }
      trendMap[dayStart] = { date: dateKey, paneles: 0, resortes: 0, procesos: 0, timestamp: dayStart };
    }

    const qty = Number(r.cantidad || r.produccion?.cantidad || 0);

    if (isResorte(r)) trendMap[dayStart].resortes += qty;
    else if (isProceso(r)) trendMap[dayStart].procesos += qty;
    else trendMap[dayStart].paneles += qty;
  });

  return Object.values(trendMap).sort((a, b) => a.timestamp - b.timestamp)
    .map(d => ({
      ...d,
      resortes: d.resortes / 1000 // Normalización para escala visual
    }));
};
