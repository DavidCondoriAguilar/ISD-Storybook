import { dbService } from './db';

/**
 * SERVICIO DE BACKUP (Data Safety)
 * Permite exportar e importar la base de datos completa.
 */
export const backupService = {
  /**
   * Genera un archivo JSON con toda la historia de la planta.
   */
  async exportDatabase() {
    try {
      const imports = await dbService.getAllImports();
      const records = await dbService.getAllRecords();

      const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        appName: 'ISD Industrial Dashboard',
        data: {
          imports,
          records
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `ISD_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, error: error.message };
    }
  }
};
