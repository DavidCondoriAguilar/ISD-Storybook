import { isResorte, isProceso, isPanel } from '../../../../domain/production/predicates';

/**
 * MOTOR DE TENDENCIAS (Series temporales para gráficos)
 */
export const calculateTrends = (records) => {
  const trendMap = {};

  records.forEach(r => {
    // Usar fechaLegible o timestamp para la clave
    const dateStr = r.fechaLegible || (r.fechaTimestamp ? new Date(r.fechaTimestamp).toISOString().split('T')[0] : '2026-01-01');
    const d = new Date(dateStr + 'T12:00:00');
    const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!trendMap[dateKey]) {
      trendMap[dateKey] = { date: dateKey, paneles: 0, resortes: 0, procesos: 0, timestamp: d.getTime() };
    }

    const qty = Number(r.cantidad || r.produccion?.cantidad || 0);

    if (isResorte(r)) trendMap[dateKey].resortes += qty;
    else if (isProceso(r)) trendMap[dateKey].procesos += qty;
    else if (isPanel(r)) trendMap[dateKey].paneles += qty;
  });

  return Object.values(trendMap).sort((a, b) => a.timestamp - b.timestamp)
    .map(d => ({
      ...d,
      resortes: d.resortes / 1000 // Normalización para escala visual
    }));
};
