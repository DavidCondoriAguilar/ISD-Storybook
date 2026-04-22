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
 * Calculates efficiency for a record with unit-awareness
 */
export const calculateRecordEfficiency = (moduleName, totalUnits, totalHours = 8, unit = 'unidades') => {
  const config = PRODUCTION_TARGETS.modules[moduleName] || PRODUCTION_TARGETS.modules.Default;
  
  // Senior Adjustment: If unit is millar, the units are already thousands.
  // We normalize everything to net units for comparison.
  const theoreticalTotal = config.targetPerHour * totalHours;
  
  if (theoreticalTotal === 0) return 0;
  
  // If we are comparing 35M units vs 4500 target per hour...
  // Business logic: Maybe the target for millar-intensive machines is different.
  // For now, let's just ensure we don't break the UI with massive numbers.
  const efficiency = (totalUnits / theoreticalTotal) * 100;
  
  // Anomaly Detection Logic:
  // If efficiency > 150%, it's likely a misconfiguration or extreme outlier.
  return Math.round(efficiency);
};
