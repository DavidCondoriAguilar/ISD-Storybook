import { calculateKPIs } from './modules/kpiEngine';
import { calculatePerformance } from './modules/performanceEngine';
import { calculateTrends } from './modules/trendEngine';
import { calculateDistribution } from './modules/distributionEngine';

/**
 * ANALYTICS SERVICE (Fachada de Arquitectura Senior)
 * Centraliza y orquesta todos los motores de cálculo de la planta.
 */
export const analyticsService = {
  /**
   * Obtiene todos los KPIs y métricas para el Dashboard Ejecutivo
   */
  getExecutiveDashboardData: (records) => {
    if (!records || records.length === 0) {
      return {
        stats: null,
        advStats: { topPanelero: null, topResortero: null },
        trendData: [],
        topPaneleros: [],
        topResorteros: [],
        productMix: [],
        machineStats: []
      };
    }

    // Ejecutamos los motores de forma aislada
    const stats = calculateKPIs(records);
    const performance = calculatePerformance(records);
    const trendData = calculateTrends(records);
    const productMix = calculateDistribution(records);

    return {
      stats,
      advStats: performance.leaders,
      trendData,
      topPaneleros: performance.topPaneleros,
      topResorteros: performance.topResorteros,
      allWorkers: performance.allWorkers,
      productMix,
      machineStats: performance.machineStats
    };
  },

  /**
   * Métricas avanzadas adicionales (Sostenibilidad, Eficiencia horaria, etc.)
   */
  getAdvancedEfficiency: (records) => {
    // Aquí podrías añadir lógica futura de mantenimiento predictivo o ROI
    const validRecords = records.filter(r => r.outputMaquina > 0);
    if (validRecords.length === 0) return 0;

    const totalEff = validRecords.reduce((acc, r) => {
      const eff = (r.cantidad / r.outputMaquina) * 100;
      return acc + Math.min(eff, 100);
    }, 0);

    return (totalEff / validRecords.length).toFixed(1);
  }
};
