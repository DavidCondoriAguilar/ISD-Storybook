/**
 * PRODUCTION TARGETS CONFIGURATION
 * These values represent the "Theoretical 100%" capacity per module.
 * Efficiency (OEE) is calculated as: (Actual Units / (Hours * TargetPerHour)) * 100
 */
export const PRODUCTION_TARGETS = {
  // Modules configuration
  modules: {
    "Paneles": {
      targetPerHour: 4500, // Theoretical capacity for Paneles module
      description: "Línea de ensamblaje de paneles de resorte"
    },
    "Resortes": {
      targetPerHour: 5000,
      description: "Producción de resortes individuales"
    },
    "Acolchado": {
      targetPerHour: 1200,
      description: "Área de acolchado y costura"
    },
    // Fallback default
    "Default": {
      targetPerHour: 1000
    }
  }
};

/**
 * Calculates efficiency for a record
 */
export const calculateRecordEfficiency = (moduleName, totalUnits, totalHours = 8) => {
  const config = PRODUCTION_TARGETS.modules[moduleName] || PRODUCTION_TARGETS.modules.Default;
  const theoreticalTotal = config.targetPerHour * totalHours;
  
  if (theoreticalTotal === 0) return 0;
  
  const efficiency = (totalUnits / theoreticalTotal) * 100;
  return Math.min(Math.round(efficiency), 120); // Cap at 120% for extreme performance
};
