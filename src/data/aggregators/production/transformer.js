import { parse, format, isValid } from 'date-fns';
import { isResorte, isProceso } from '../../../domain/production/predicates';

/**
 * Normaliza los datos crudos de producción a un esquema estándar.
 * Fase 1 del pipeline: RAW -> CLEAN
 */
export const transformProductionData = (rawRecords) => {
  if (!Array.isArray(rawRecords)) return [];

  // FILTRO GLOBAL DE INTEGRIDAD: Eliminar ruidos, leyendas y notas de texto del Excel
  const cleanRecords = rawRecords.filter(record => {
    const p = String(record.productoNombre || record.producto?.nombre || record.producto || '').toUpperCase();
    const a = String(record.moduloId || record.area || record.ubicacion?.modulo || '').toUpperCase();
    const noise = ['LO QUE ESTA', 'RESALTADO', 'FORMA PARTE', 'PRODUCTO TERMINADO', 'PANELES DE PT'];
    return !noise.some(key => p.includes(key) || a.includes(key));
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
    
    const unidadesReales = Number(
      record.produccion?.cantidad || record.Produccion?.Cantidad || 
      record.cantidad || record.Cantidad || 
      record.total || record.Total || 0
    );
    const minutos = Number(record.tiempo?.minutos || record.Tiempo?.Minutos || record.tiempoMinutos || 525);

    // Predicados de clasificación - USAR FLAG DEL EXCEL SERVICE SI EXISTE (v10.0)
    const esMillar = record.esMillar === true || isResorte({ ...record, productoNombre: productoLabel, unidad, maquinaId: maquina });
    const esProceso = isProceso({ ...record, productoNombre: productoLabel, moduloId: modulo });
    const esPanel = !esMillar && !esProceso;

    const eficiencia = minutos > 0 ? (unidadesReales / minutos) * 60 : 0;

    return {
      ...record,
      date,
      dateKey: format(date, 'yyyy-MM-dd'),
      tipo: esMillar ? 'resorte' : esPanel ? 'panel' : 'proceso',
      unidadesReales,
      unidadFisica: esMillar ? 'millares' : unidad,
      esMillar,
      esPanel,
      esProceso,
      eficiencia,
      maquinaKey: maquina,
      trabajador,
      producto: productoLabel,
      minutos
    };
  });
};
