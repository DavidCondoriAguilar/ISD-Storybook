/**
 * PRODUCTION AGGREGATOR - Public Facade
 * Esta es la puerta de entrada para la analítica de producción.
 * Implementa un pipeline modular: Transform -> Aggregate -> Format.
 */
import { transformProductionData } from './production/transformer';
import { aggregateProductionData } from './production/engine';
import { buildProductionStats } from './production/formatters';

export {
  transformProductionData,
  aggregateProductionData,
  buildProductionStats
};

/**
 * Helper para ejecutar el pipeline completo en un solo paso si es necesario.
 */
export const processProductionAnalytics = (rawRecords) => {
  const cleanData = transformProductionData(rawRecords);
  const aggregated = aggregateProductionData(cleanData);
  const uiReady = buildProductionStats(aggregated);
  
  return {
    ...aggregated,
    ...uiReady
  };
};