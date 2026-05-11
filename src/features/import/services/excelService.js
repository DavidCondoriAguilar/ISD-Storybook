/**
 * SERVICIO DE EXCEL (Arquitectura Senior)
 * Convierte archivos .xlsx/.xls en registros de producción normalizados.
 */
export const excelService = {
  /**
   * Procesa un archivo Excel y devuelve un array de registros JSON normalizados.
   */
  parseFile: async (file) => {
    // SENIOR OPTIMIZATION: Dynamic Import for the heavy XLSX library
    const XLSX = await import('xlsx');
    
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
    console.log('[ExcelService] v1.6 - Iniciando mapeo');
    
    const hasHeader = rows[0] && rows[0].some(cell => {
      const s = String(cell || '').toLowerCase();
      return s.includes('fecha') || s.includes('trabajador') || s.includes('producto');
    });
    
    const dataRows = hasHeader ? rows.slice(1) : rows;
    
    console.log(`[ExcelService] 🗺️ Mapeando ${dataRows?.length || 0} filas a registros...`);
    const records = dataRows.map((row, index) => {
      if (!row || row.length < 3) return null;

      try {
        // 1. ANALISIS DE CONTENIDO DINAMICO
        let producto = String(row[1] || 'Sin Producto').trim();
        let area = String(row[2] || 'General').trim();
        let trabajador = String(row[3] || 'Desconocido').trim();

        // FILTRO DE RUIDO: Si el producto o área parecen ser una leyenda/nota del Excel, descartar.
        const noiseKeywords = ['LO QUE ESTA', 'RESALTADO', 'FORMA PARTE', 'PRODUCTO TERMINADO'];
        const isNoise = noiseKeywords.some(key => 
          producto.toUpperCase().includes(key) || 
          area.toUpperCase().includes(key)
        );
        
        if (isNoise) {
          console.warn('[ExcelService] 🛑 Fila de ruido/leyenda descartada:', producto);
          return null;
        }
        
        let output = 0;
        let cantidad = 0;
        let maquina = 'N/A';

        // Recorremos las celdas de datos (de la 4 en adelante)
        for (let i = 4; i < row.length; i++) {
          const val = row[i];
          const num = Number(val);

          if (!isNaN(num) && val !== '' && typeof val !== 'boolean') {
            // Lógica de magnitudes:
            if (num > 500 && output === 0) {
              output = num; // Es un contador de máquina
            } else if (num > 0 && cantidad === 0) {
              cantidad = num; // Es producción neta
            }
          } else if (typeof val === 'string' && val.length > 0) {
            maquina = val.trim();
          }
        }

        // 2. PARSEO DE FECHA REFORZADO
        let fechaRaw = row[0];
        let timestamp = Date.now();
        
        if (fechaRaw instanceof Date) {
          timestamp = fechaRaw.getTime();
        } else if (typeof fechaRaw === 'number') {
          timestamp = new Date(Math.round((fechaRaw - 25569) * 86400 * 1000)).getTime();
        } else if (typeof fechaRaw === 'string') {
          const p = fechaRaw.split(/[\/\-]/);
          if (p.length === 3) timestamp = new Date(p[2], p[1] - 1, p[0], 12, 0, 0).getTime();
        }

        const fLegible = new Date(timestamp + 6 * 3600 * 1000).toISOString().split('T')[0];

        return {
          id: `xl-${timestamp}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          trabajador: { nombre: trabajador },
          ubicacion: { modulo: area, maquina: maquina },
          producto: { nombre: producto },
          produccion: { cantidad: cantidad },
          fechaTimestamp: timestamp,
          fechaLegible: fLegible,
          outputMaquina: output,
          version: '2.0-XL-Robust'
        };
      } catch (e) {
        console.error(`[ExcelService] ❌ Error en fila ${index + 1}:`, e);
        return null;
      }
    }).filter(r => r !== null);

    console.log(`[ExcelService] ✅ Mapeo finalizado. ${records.length} registros válidos.`);
    return records;
  }
};
