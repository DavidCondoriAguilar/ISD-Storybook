import { dbService, db } from '../data/db';
import { APP_CONFIG } from '../config/appConfig';
import { validateProductionData } from '../features/import/utils/validationSchema';
import { calculateRecordEfficiency } from '../config/productionTargets';

/**
 * Enhanced Storage Service
 * Migrated from localStorage to IndexedDB (Scale & Persistence)
 * Now returning Promises for all operations
 */
export const storageService = {
  /**
   * Initialize and migrate legacy data if needed
   */
  async init() {
    const legacyData = localStorage.getItem(APP_CONFIG.STORAGE.HISTORY_KEY);
    if (legacyData) {
      try {
        const history = JSON.parse(legacyData);
        for (const record of history) {
          await dbService.saveImport(record);
        }
        localStorage.removeItem(APP_CONFIG.STORAGE.HISTORY_KEY);
        console.log('Legacy data migrated to IndexedDB');
      } catch (e) {
        console.error('Migration failed', e);
      }
    }
  },

  async getAll() {
    return await dbService.getAllImports();
  },

  async save(importPayload) {
    // Senior Logic: Validate with Schema First
    let validatedPayload;
    try {
      validatedPayload = validateProductionData(importPayload);
    } catch (error) {
      console.error('Validation Error:', error.message);
      throw error;
    }

    // Normalization Config (Business Logic)
    const FACTORES_UNIDAD = {
      'unidades': 1,
      'metros': 1,
      'kg': 1,
      'millar': 1000,
      'pares': 2,
      'rollos': 50,
      'litros': 1
    };

    const sanitizarNombre = (n) => n ? n.replace('×', 'x').trim() : 'Sin Nombre';

    // Senior Logic: Normalize Nested JSON to Flat Structure + Unit Conversion
    const normalizedRecords = (validatedPayload.rawRecords || []).map(r => {
      const originalDate = new Date(r.fecha || Date.now());
      originalDate.setHours(0, 0, 0, 0);
      const normalizedTimestamp = originalDate.getTime();

      const unidadOriginal = (r.produccion?.unidad || 'unidades').toLowerCase();
      const cantidadBruta = Number(r.produccion?.cantidad || 0);
      const factor = FACTORES_UNIDAD[unidadOriginal] || 1;
      const cantidadNormalizada = cantidadBruta * factor;

      // NUEVO: Usar tiempo.horas si existe, si no calcular desde tiempo.minutos o usar default
      let jornadaHoras = r.tiempo?.horas || r.tiempo?.horasTotal || "8.00";
      if (!r.tiempo?.horas && r.tiempo?.minutos) {
        jornadaHoras = (r.tiempo.minutos / 60).toFixed(2);
      }

      // Business Logic: UUID como identificador único de trabajador
      const workerKey = r.trabajador?.dni || r.trabajador?.nombre;
      const businessHash = `${workerKey}-${normalizedTimestamp}-${cantidadBruta}-${r.ubicacion?.modulo}-${r.producto?.codigo || 'SIN_PRODUCTO'}`;
      
      // Senior Logic: Unique ID per worker/day/product to avoid clashing external IDs
      const generatedId = r.id ? `ISD-EXT-${workerKey}-${r.id}` : (r.idLocal || `ISD-${btoa(unescape(encodeURIComponent(businessHash))).slice(0, 16)}`);

      // Manejar producto nullable
      const hasProducto = r.producto && r.producto.codigo && r.producto.nombre;

      if (r.trabajador && r.ubicacion) {
        return {
          idLocal: generatedId,
          trabajadorDni: r.trabajador.dni || r.trabajador.nombre, // UUID o nombre como fallback
          trabajadorNombre: r.trabajador.nombre,
          moduloId: r.ubicacion.modulo,
          maquinaId: r.ubicacion.maquina || 'Sin Máquina',
          productoId: hasProducto ? r.producto.codigo : 'N/A',
          productoNombre: hasProducto ? sanitizarNombre(r.producto.nombre) : 'Sin Producto',
          cantidad: cantidadNormalizada,
          cantidadOriginal: cantidadBruta,
          unidadOriginal: unidadOriginal,
          tiempoMinutos: r.tiempo?.minutos || 0,
          fechaTimestamp: normalizedTimestamp,
          esHoraExtra: (r.tiempo?.horasExtra || 0) > 0,
          horasExtraCantidad: Number(r.tiempo?.horasExtra || 0),
          jornadaTotalHoras: jornadaHoras,
          status: 'ok',
          tipoJornada: r.tipoJornada || 'Estándar',
          fileName: validatedPayload.fileName,
          importTimestamp: new Date().toISOString()
        }
      }
      return { 
        ...r, 
        idLocal: generatedId,
        fechaTimestamp: normalizedTimestamp,
        cantidad: Number(r.cantidad || 0)
      };
    });

    const allExistingRecords = await dbService.getAllRecords();
    const existingKeys = new Set(allExistingRecords.map(r => 
      `${r.idLocal}-${r.fechaTimestamp}`
    ));

    const newRawRecords = normalizedRecords.filter(r => {
      const key = `${r.idLocal}-${r.fechaTimestamp}`;
      return !existingKeys.has(key);
    });

    const duplicatesFound = (validatedPayload.rawRecords || []).length - newRawRecords.length;

    if (newRawRecords.length === 0 && (validatedPayload.rawRecords || []).length > 0) {
      // Logic: If everything is duplicate, we still want to link them to a new import?
      // No, for auditing, we only care about NEW records.
      return { skipped: true, duplicatesDetected: duplicatesFound };
    }

    const newRecord = {
      timestamp: new Date().toISOString(),
      ...validatedPayload,
      success: newRawRecords.length,
      units: newRawRecords.reduce((s, r) => s + (Number(r.cantidad || 0)), 0),
      rawRecords: newRawRecords,
      duplicatesDetected: duplicatesFound
    };

    // Senior Logic: Auto-discover modules & products
    const uniqueModulesInImport = [...new Set(newRawRecords.map(r => r.moduloId))];
    const uniqueProductsInImport = [...new Set(newRawRecords.map(r => r.productoId).filter(id => id !== null))];
    
    for (const modId of uniqueModulesInImport) {
      const existing = await db.metadata.get(`module_${modId}`);
      if (!existing) {
        await db.metadata.put({ id: `module_${modId}`, value: `Línea de Producción ${modId}` });
      }
    }

    for (const prodId of uniqueProductsInImport) {
      const existing = await db.metadata.get(`product_${prodId}`);
      if (!existing) {
        await db.metadata.put({ id: `product_${prodId}`, value: `Producto REF-${prodId}` });
      }
    }

    await dbService.saveImport(newRecord);
    return newRecord;
  },

  async getStats() {
    const [history, allRecords] = await Promise.all([
      dbService.getAllImports(),
      dbService.getAllRecords()
    ]);

    if (history.length === 0) {
      return {
        totalImports: 0, totalUnits: 0, successRate: 0, avgUnitsPerImport: 0,
        totalFailed: 0, lastImport: null, topWorker: 'N/A', areaBreakdown: []
      };
    }
    
    const totalImports = history.length;
    const totalUnits = allRecords.reduce((sum, r) => sum + (Number(r.cantidad || 0)), 0);
    const totalFailed = allRecords.reduce((sum, r) => sum + (Number(r.cantidadRechazada || 0)), 0);
    const totalSuccess = totalUnits - totalFailed;
    
    const avgUnitsPerImport = Math.round(totalUnits / totalImports);
    const globalEfficiency = totalUnits > 0 ? (totalSuccess / totalUnits) * 100 : 0;
    
    const workers = {};
    const areas = {};
    const machines = {};
    const dailyStats = {}; // New: { 'YYYY-MM-DD': { total: 0, workers: {}, modules: {} } }
    let totalOvertimeHours = 0;
    
    // Aggregate by records
    allRecords.forEach(raw => {
      const w = raw.trabajadorNombre || 'Sin asignar';
      const area = raw.moduloId || raw.modulo || 'Otros';
      const machine = raw.maquinaId || 'Sin Máquina';
      const prodName = raw.productoNombre || 'Producto General';
      const qty = Number(raw.cantidad ?? 0);
      const rejections = Number(raw.cantidadRechazada ?? 0);
      
      // Senior Logic: Auto-calculate efficiency based on targets if missing
      const efficiency = Number(raw.eficiencia) || calculateRecordEfficiency(area, qty, Number(raw.jornadaTotalHoras) || 8, raw.unidadOriginal);
      
      const overtime = Number(raw.horasExtraCantidad || 0);
      
      // Daily Tracking
      const dayKey = new Date(raw.fechaTimestamp || raw.fecha).toISOString().split('T')[0];
      if (!dailyStats[dayKey]) {
        dailyStats[dayKey] = { total: 0, workers: {}, modules: {} };
      }
      dailyStats[dayKey].total += qty;
      dailyStats[dayKey].workers[w] = (dailyStats[dayKey].workers[w] || 0) + qty;
      dailyStats[dayKey].modules[area] = (dailyStats[dayKey].modules[area] || 0) + qty;

      workers[w] = (workers[w] || 0) + qty;
      totalOvertimeHours += overtime;
      
      // Area Breakdown
      if (!areas[area]) {
        areas[area] = { name: area, units: 0, rejected: 0, efficiencies: [], products: {} };
      }
      areas[area].units += qty;
      areas[area].rejected += rejections;
      if (efficiency > 0) areas[area].efficiencies.push(efficiency);
      areas[area].products[prodName] = (areas[area].products[prodName] || 0) + qty;

      // Machine Breakdown
      if (!machines[machine]) {
        machines[machine] = { name: machine, units: 0, area: area };
      }
      machines[machine].units += qty;
    });

    const topWorker = Object.entries(workers).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
    let lastImport = history[0];

    if (lastImport && lastImport.id) {
      lastImport.rawRecords = await db.records.where('importId').equals(lastImport.id).toArray();
    }

    const areaBreakdown = Object.values(areas).map(a => {
      const topProd = Object.entries(a.products).sort((x, y) => y[1] - x[1])[0];
      return {
        ...a,
        topProduct: topProd ? `${topProd[0]} (${topProd[1]} u.)` : 'N/A',
        avgEfficiency: a.efficiencies.length > 0 ? Math.round(a.efficiencies.reduce((s, e) => s + e, 0) / a.efficiencies.length) : 0
      }
    }).sort((a,b) => b.units - a.units);

    return {
      totalImports, totalUnits, successRate: Math.round(globalEfficiency),
      avgUnitsPerImport, totalFailed, lastImport, topWorker, areaBreakdown,
      totalOvertimeHours, dailyStats,
      machineStats: Object.values(machines).sort((a,b) => b.units - a.units)
    };
  },

  async getMonthlyData() {
    const history = await this.getAll();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dataByMonth = {};
    
    history.forEach(r => {
      const date = new Date(r.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!dataByMonth[key]) {
        dataByMonth[key] = { 
          name: months[date.getMonth()], 
          units: 0, imports: 0, ts: date.getTime(), breakdown: {} 
        };
      }
      
      dataByMonth[key].units += (r.units || 0);
      dataByMonth[key].imports += 1;
      
      const records = r.rawRecords || [];
      records.forEach(rec => {
        const cat = rec.modulo || rec.productoTipo || 'Otros';
        const qty = Number(rec.cantidad || 0);
        dataByMonth[key].breakdown[cat] = (dataByMonth[key].breakdown[cat] || 0) + qty;
      });
    });
    
    return Object.values(dataByMonth).sort((a, b) => a.ts - b.ts).slice(-6);
  },

  async getAllRecords() {
    return await dbService.getAllRecords();
  },

  async clear() {
    await dbService.clearAll();
  }
};
