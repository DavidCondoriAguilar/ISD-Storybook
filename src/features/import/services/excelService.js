import * as XLSX from 'xlsx';

/**
 * SERVICIO DE EXCEL (Arquitectura Senior)
 * Convierte archivos .xlsx/.xls en registros de producción normalizados.
 */
export const excelService = {
  /**
   * Procesa un archivo Excel y devuelve un array de registros JSON normalizados.
   */
  parseFile: async (file) => {
    console.log('[ExcelService] Iniciando parseo de:', file.name);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          
          console.log('[ExcelService] Libro leído. Hojas detectadas:', workbook.SheetNames);

          // Senior Choice: Solo procesamos la PRIMERA hoja por defecto para evitar duplicidad
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          console.log(`[ExcelService] Procesando hoja principal: ${firstSheetName} (${rows.length} filas)`);
          const records = excelService.mapRowsToRecords(rows, firstSheetName);

          console.log('[ExcelService] Mapeo completado. Registros válidos:', records.length);
          resolve(records);
        } catch (err) {
          console.error('[ExcelService] Error crítico:', err);
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Mapeo Inteligente con Corrección de Fechas Excel
   */
  mapRowsToRecords: (rows, sheetName) => {
    const hasHeader = rows[0] && rows[0].some(cell => {
      const s = String(cell || '').toLowerCase();
      return s.includes('fecha') || s.includes('trabajador') || s.includes('producto');
    });
    
    const dataRows = hasHeader ? rows.slice(1) : rows;

    return dataRows.map((row, index) => {
      if (!row || row.length < 3) return null;

      try {
        // [0] Fecha, [1] Producto, [2] Area, [3] Trabajador, [4] Output?, [5] Cantidad, [6] Maquina
        let fechaRaw = row[0];
        let timestamp;
        
        if (fechaRaw instanceof Date) {
          timestamp = fechaRaw.getTime();
        } else if (typeof fechaRaw === 'number') {
          // Convertir número de serie de Excel (basado en 1899-12-30)
          const date = new Date(Math.round((fechaRaw - 25569) * 86400 * 1000));
          timestamp = date.getTime();
        } else if (typeof fechaRaw === 'string') {
          const parts = fechaRaw.split(/[\/\-]/);
          if (parts.length === 3) {
            const d = new Date(parts[2], parts[1] - 1, parts[0], 12, 0, 0);
            timestamp = d.getTime();
          }
        }

        if (!timestamp || isNaN(timestamp)) return null;

        const isLongRow = row.length >= 7;
        const cantidadIdx = isLongRow ? 5 : 4;
        const maquinaIdx = isLongRow ? 6 : 5;
        
        // Generar fechaLegible ISO segura
        const fLegible = new Date(timestamp + 6 * 3600 * 1000).toISOString().split('T')[0];

        return {
          id: `xl-${timestamp}-${index}`,
          trabajador: {
            nombre: String(row[3] || 'Desconocido').trim()
          },
          ubicacion: {
            modulo: String(row[2] || 'General').trim(),
            maquina: String(row[maquinaIdx] || 'N/A').trim()
          },
          producto: {
            nombre: String(row[1] || 'Sin Producto').trim()
          },
          produccion: {
            cantidad: Number(row[cantidadIdx] || 0)
          },
          fechaTimestamp: timestamp,
          fechaLegible: fLegible,
          outputMaquina: isLongRow ? Number(row[4] || 0) : 0,
          version: '1.4-XL-Fixed'
        };
      } catch (e) {
        return null;
      }
    }).filter(r => r !== null);
  }
};
