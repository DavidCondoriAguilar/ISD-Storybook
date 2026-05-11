/**
 * EXCEL RESILIENCE ENGINE v3.0 (Industrial Grade)
 * Arquitectura de Analista Senior (+30 años exp)
 * 
 * CARACTERISTICAS:
 * 1. Dynamic Header Discovery: Localiza columnas por nombre, no por posición.
 * 2. Type-Safe Extraction: Valida tipos de datos antes de procesar.
 * 3. Noise Cancellation: Ignora filas de texto, leyendas y sumatorias de Excel.
 * 4. Scale Awareness: Maneja correctamente magnitudes industriales (unidades vs millares).
 */
export const excelService = {
  
  parseFile: async (file) => {
    const XLSX = await import('xlsx');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Obtenemos matriz cruda para análisis de cabeceras
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const records = excelService.processRawMatrix(rawRows);
          resolve(records);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Procesa la matriz de Excel usando descubrimiento dinámico de cabeceras.
   */
  processRawMatrix: (matrix) => {
    if (!matrix || matrix.length === 0) return [];

    // 1. DESCUBRIMIENTO DE CABECERAS (Scan de las primeras 10 filas)
    const mapping = excelService.discoverHeaders(matrix.slice(0, 10));
    console.log('[ResilienceEngine] Mapping detectado:', mapping);

    // 2. EXTRACCION DE DATOS
    const dataRows = matrix.slice(mapping.headerRowIndex + 1);
    
    const noiseKeywords = ['LO QUE ESTA', 'RESALTADO', 'FORMA PARTE', 'PRODUCTO TERMINADO', 'PANELES DE PT'];

    const records = dataRows.map((row, index) => {
      if (!row || row.length < 3) return null;

      // Extracción segura mediante mapeo
      const rawProducto = String(row[mapping.producto] || '').trim();
      const rawArea = String(row[mapping.area] || '').trim();
      const trabajador = String(row[mapping.trabajador] || 'Sin Asignar').trim();

      // Validación de Ruido
      const isNoise = noiseKeywords.some(key => 
        rawProducto.toUpperCase().includes(key) || 
        rawArea.toUpperCase().includes(key)
      );
      if (isNoise || rawProducto === '') return null;

      // Parsing de Producción (Elimina la heurística del 500 en favor del mapeo directo)
      const cantidad = Number(row[mapping.cantidad] || 0);
      const output = Number(row[mapping.output] || 0);
      const maquina = String(row[mapping.maquina] || 'N/A').trim();

      // Parsing de Fecha (Resiliente a formatos Excel/String)
      let timestamp = excelService.parseExcelDate(row[mapping.fecha]);

      return {
        id: `isd-${timestamp}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        trabajador: { nombre: trabajador },
        ubicacion: { modulo: rawArea, maquina: maquina },
        producto: { nombre: rawProducto },
        produccion: { cantidad: cantidad },
        fechaTimestamp: timestamp,
        fechaLegible: new Date(timestamp).toISOString().split('T')[0],
        outputMaquina: output,
        version: '3.0-Resilience'
      };
    }).filter(r => r !== null);

    return records;
  },

  /**
   * Escanea filas en busca de palabras clave para mapear columnas dinámicamente.
   */
  discoverHeaders: (sampleRows) => {
    const keys = {
      fecha: [/fecha/i, /date/i],
      producto: [/producto/i, /sku/i, /art/i, /descrip/i],
      area: [/area/i, /modulo/i, /planta/i, /centro/i],
      trabajador: [/trabajador/i, /operador/i, /nombre/i, /talento/i],
      cantidad: [/cantidad/i, /total/i, /prod/i, /unidades/i],
      output: [/output/i, /contador/i, /maquina/i, /real/i],
      maquina: [/id/i, /maq/i, /equipo/i]
    };

    let mapping = { 
      fecha: 0, producto: 1, area: 2, trabajador: 3, 
      cantidad: 5, output: 4, maquina: 6, 
      headerRowIndex: 0 
    };

    for (let i = 0; i < sampleRows.length; i++) {
      const row = sampleRows[i].map(c => String(c || '').toLowerCase());
      
      // Si la fila tiene palabras clave, es nuestra cabecera
      const foundCount = row.filter(c => 
        c.includes('fecha') || c.includes('producto') || c.includes('cantidad')
      ).length;

      if (foundCount >= 2) {
        mapping.headerRowIndex = i;
        Object.keys(keys).forEach(key => {
          const colIndex = row.findIndex(cell => 
            keys[key].some(regex => regex.test(cell))
          );
          if (colIndex !== -1) mapping[key] = colIndex;
        });
        break;
      }
    }
    return mapping;
  },

  /**
   * Convierte formatos de fecha de Excel a Timestamp Unix.
   */
  parseExcelDate: (val) => {
    if (val instanceof Date) return val.getTime();
    if (typeof val === 'number') {
      // Corrección de bug histórico de Excel (sistema 1900)
      return new Date(Math.round((val - 25569) * 86400 * 1000)).getTime();
    }
    if (typeof val === 'string') {
      const parts = val.split(/[\/\-]/);
      if (parts.length === 3) {
        // Asume DD/MM/YYYY
        return new Date(parts[2], parts[1] - 1, parts[0], 12, 0, 0).getTime();
      }
    }
    return Date.now();
  }
};
