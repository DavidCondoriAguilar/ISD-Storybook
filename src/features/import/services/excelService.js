import * as XLSX from 'xlsx';

export const excelService = {
  
  parseFile: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(excelService.processEngine(rawRows));
        } catch (err) { reject(err); }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  processEngine: (matrix) => {
    if (!matrix || matrix.length === 0) return [];

    let mapping = { fecha: 0, producto: 1, area: 2, trabajador: 3, output: 4, total: 5, maquina: 6 };
    
    for (let i = 0; i < Math.min(matrix.length, 5); i++) {
      const row = matrix[i].map(c => String(c).toUpperCase());
      if (row.includes('TOTAL') || row.includes('OUTPUT') || row.includes('TRABAJADOR')) {
        mapping.fecha = row.indexOf('FECHA') !== -1 ? row.indexOf('FECHA') : mapping.fecha;
        mapping.producto = row.indexOf('PRODUCTO') !== -1 ? row.indexOf('PRODUCTO') : mapping.producto;
        mapping.area = row.indexOf('ÁREA') !== -1 ? row.indexOf('ÁREA') : (row.indexOf('AREA') !== -1 ? row.indexOf('AREA') : mapping.area);
        mapping.trabajador = row.indexOf('TRABAJADOR') !== -1 ? row.indexOf('TRABAJADOR') : mapping.trabajador;
        mapping.output = row.indexOf('OUTPUT') !== -1 ? row.indexOf('OUTPUT') : mapping.output;
        mapping.total = row.indexOf('TOTAL') !== -1 ? row.indexOf('TOTAL') : mapping.total;
        mapping.maquina = row.indexOf('MÁQUINA') !== -1 ? row.indexOf('MÁQUINA') : (row.indexOf('MAQUINA') !== -1 ? row.indexOf('MAQUINA') : mapping.maquina);
        break;
      }
    }

    const noiseKeywords = ['LO QUE ESTA', 'RESALTADO', 'FORMA PARTE', 'PRODUCTO TERMINADO'];

    return matrix.map((row, index) => {
      if (!row || row.length < 2) return null;

      try {
        const firstCell = String(row[0]).toUpperCase();
        if (firstCell === 'FECHA' || firstCell.includes('INFORME')) return null;

        const trabajadorRaw = String(row[mapping.trabajador] || '').trim();
        const areaRaw = String(row[mapping.area] || '').trim();
        const productoRaw = String(row[mapping.producto] || '').trim();
        const maquinaRaw = String(row[mapping.maquina] || '').trim();
        
        // v12.1: Extraer cantidad y output según mapeo de columnas
        // El primer número es TOTAL (cantidad produced), el segundo es Output de máquina
        const numbers = row.filter(c => typeof c === 'number' && c > 0 && c < 1000000);
        let cantidad = 0;
        let output = 0;
        
        if (numbers.length >= 2) {
          cantidad = numbers[0]; // Primer número = Total (producción total)
          output = numbers[1];   // Segundo número = Output de máquina
        } else if (numbers.length === 1) {
          cantidad = numbers[0]; // Solo 1 número = cantidad total (sin output de máquina)
        }

        let trabajadorFinal = trabajadorRaw;
        if (trabajadorFinal.toUpperCase() === areaRaw.toUpperCase() || trabajadorFinal === '' || trabajadorFinal === 'undefined') {
          trabajadorFinal = 'Sin Asignar';
        }

        if (noiseKeywords.some(key => productoRaw.toUpperCase().includes(key))) return null;

        let fLegible = '2026-01-01';
        const rawFecha = row[mapping.fecha];
        
        if (typeof rawFecha === 'string' && rawFecha.includes('/')) {
          const p = rawFecha.split(/[\/\-]/);
          const day = p[0].padStart(2, '0');
          const month = p[1].padStart(2, '0');
          const year = p[2].length === 2 ? `20${p[2]}` : p[2];
          fLegible = `${year}-${month}-${day}`;
        } else if (rawFecha instanceof Date) {
          const day = String(rawFecha.getDate()).padStart(2, '0');
          const month = String(rawFecha.getMonth() + 1).padStart(2, '0');
          const year = rawFecha.getFullYear();
          fLegible = `${year}-${month}-${day}`;
        } else if (typeof rawFecha === 'number') {
          const d = new Date(Math.round((rawFecha - 25569) * 86400 * 1000));
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          fLegible = `${year}-${month}-${day}`;
        }

        const [fy, fm, fd] = fLegible.split('-').map(Number);
        const localDate = new Date(fy, fm - 1, fd, 12, 0, 0);
        const finalTimestamp = localDate.getTime();

        const productoLower = productoRaw.toLowerCase();
        const esMillarRaw = productoLower.includes('millar') || productoLower.includes('resorte');
        
        const cantidadFinal = isNaN(cantidad) ? 0 : cantidad;

        return {
          id: `isd-v12-${fLegible}-${index}`,
          trabajador: { nombre: trabajadorFinal !== 'Sin Asignar' ? trabajadorFinal : (areaRaw !== 'Paneles' ? areaRaw : 'Operario') },
          ubicacion: { modulo: areaRaw, maquina: maquinaRaw },
          producto: { nombre: productoRaw },
          produccion: { cantidad: cantidadFinal, unidad: esMillarRaw ? 'mil.' : 'u.' },
          fechaTimestamp: finalTimestamp,
          fechaLegible: fLegible,
          outputMaquina: isNaN(output) ? 0 : output,
          esMillar: esMillarRaw,
          version: '12.0-Raw-Values'
        };
      } catch (e) { return null; }
    }).filter(r => r !== null);
  },

  parseExcelDate: (val) => {
    if (val instanceof Date) {
      val.setHours(12, 0, 0, 0);
      return val.getTime();
    }
    if (typeof val === 'number') {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      date.setHours(12, 0, 0, 0);
      return date.getTime();
    }
    if (typeof val === 'string') {
      const parts = val.split(/[\/\-]/);
      if (parts.length === 3) {
        const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00`);
        return date.getTime();
      }
    }
    return Date.now();
  }
};
