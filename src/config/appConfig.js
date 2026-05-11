/**
 * Global application configuration
 * Centralizes magic numbers and business rules
 */
export const APP_CONFIG = {
  PRODUCTION: {
    COST_PER_SCRAP: 3.50, // Mock cost per unit rejected
    EFFICIENCY_TARGET: 98, // Percentage
    CURRENCY: 'USD',
  },
  STORAGE: {
    DB_NAME: 'ProductionHubDB',
    DB_VERSION: 3,
    HISTORY_KEY: 'import_production_history',
  },
  IMPORT: {
    SIMULATED_DELAY: true,
    MAX_FILE_SIZE_MB: 10,
  }
}
