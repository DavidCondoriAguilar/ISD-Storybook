import { parse, format, isValid } from 'date-fns';
import { isResorte, isProceso } from '../../../domain/production/predicates';

/**
 * Normaliza los datos crudos de producción a un esquema estándar.
 * Fase 1 del pipeline: RAW -> CLEAN
 */
export const transformProductionData = (rawRecords) => {
  if (!Array.isArray(rawRecords)) return [];

  // 1. FILTRO GLOBAL DE RUIDO (Senior Edition)
  // Eliminamos cualquier fila que no tenga trabajador o sea una nota administrativa
  const cleanRecords = rawRecords.filter(record => {
    const p = String(record.productoNombre || record.producto || record.Producto || '').toUpperCase();
    const t = String(record.trabajadorNombre || record.trabajador || '').toUpperCase();
    
    const isNoise = [
      'LO QUE ESTA', 'RESALTADO', 'FORMA PARTE', 'PRODUCTO TERMINADO', 
      'PANELES DE PT', 'TOTALES', 'MES', 'PLANTA', 'CENTRAL'
    ].some(key => p.includes(key));

    const hasWorker = t.length > 0 && !t.includes('SIN ASIGNAR') && !t.includes('TRABAJADOR');
    const hasData = Number(record.total || record.Total || record.output || record.Output || 0) > 0;

    return !isNoise && hasWorker && hasData;
  });

  return cleanRecords.map((record) => {
    let date = new Date();
    const rawFecha = record.fechaTimestamp || record.fecha;
    
    // Lógica de parseo de fechas robusta
    if (rawFecha) {
      if (typeof rawFecha === 'string' && rawFecha.includes('/')) {
        try {
          const parsed = parse(rawFecha, 'dd/MM/yyyy', new Date());
          if (isValid(parsed)) date = parsed;
        } catch (e) {
          date = new Date(rawFecha);
        }
      } else {
        date = new Date(rawFecha);
      }
    } else if (record.metadatosFecha) {
      const { anio, mes, dia, Anio, Mes, Dia } = record.metadatosFecha;
      date = new Date(anio || Anio, (mes || Mes) - 1, dia || Dia);
    } else if (record.fechaLegible || record.FechaLegible) {
      const fl = record.fechaLegible || record.FechaLegible;
      const parts = fl.split('-').map(Number);
      date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
    
    if (!isValid(date)) date = new Date();

    const unidad = (record.produccion?.unidad || record.Produccion?.Unidad || record.unidad || record.Unidad || 'unidades').toLowerCase();
    const maquina = record.ubicacion?.maquina || record.Ubicacion?.Maquina || 
                    record.ubicacion?.nombre || record.Ubicacion?.Nombre ||
                    record.maquinaNombre || record.maquina || record.Maquina || 'Sin máquina';
                    
    const productoLabel = record.producto?.nombre || record.Producto?.Nombre || 
                         record.productoNombre || record.producto || record.Producto || 'General';
    
    const modulo = (record.ubicacion?.modulo || record.Ubicacion?.Modulo || record.moduloNombre || record.modulo || '').toLowerCase();
    const trabajador = record.trabajador?.nombre || record.Trabajador?.Nombre || record.trabajadorNombre || record.trabajador || 'Sin Asignar';
    
    // 2. LÓGICA DE PRODUCCIÓN NETA (Detección de Odométricos)
    // Si 'total' existe, es la verdad absoluta. Si no, intentamos deducir por Output.
    const totalRaw = Number(record.total || record.Total || record.TOTAL || 0);
    const outputRaw = Number(record.output || record.Output || record.OutputMaquina || 0);
    
    // Si el total es 0 pero el output es masivo, probablemente el total está en la columna output (común en Resortes)
    const unidadesReales = totalRaw > 0 ? totalRaw : outputRaw;
    const minutos = Number(record.tiempo?.minutos || record.Tiempo?.Minutos || record.tiempoMinutos || 525);

    // Predicados de clasificación - USAR DOMAIN PREDICATES (v11.0)
    const normalizedRecord = { 
      ...record, 
      productoNombre: productoLabel, 
      unidad, 
      maquinaId: maquina,
      moduloId: modulo 
    };

    const esMillar = isResorte(normalizedRecord);
    const esProceso = isProceso(normalizedRecord);
    const esPanel = !esMillar && !esProceso;

    const eficiencia = minutos > 0 ? (unidadesReales / minutos) * 60 : 0;

    const result = {
      ...record,
      date,
      dateKey: format(date, 'yyyy-MM-dd'),
      tipo: esMillar ? 'resorte' : esPanel ? 'panel' : 'proceso',
      unidadesReales,
      unidadFisica: esMillar ? 'millares' : (unidad.includes('mil') ? 'millares' : 'u.'),
      esMillar,
      esPanel,
      esProceso,
      eficiencia,
      maquinaKey: maquina,
      trabajador,
      producto: productoLabel,
      minutos
    };

    if (index === 0) console.log(`[DEBUG] First Record Transformed:`, { trabajador, tipo: result.tipo, qty: unidadesReales });
    return result;
  });
};
