/**
 * ISD Schema Registry - Sistema multi-módulo de producción
 * 
 * Refactorizado para evitar archivos JSON externos (Data Trash)
 * y priorizar la detección basada en patrones reales.
 */

// Schema Base para todos los módulos industriales
const BASE_SCHEMA = {
  validation: {
    required: ["trabajador", "fecha", "producto", "cantidad"],
    numeric: ["cantidad", "outputMaquina"],
    dateFormat: "YYYY-MM-DD"
  },
  fieldMappings: {
    trabajador: { aliases: ["trabajador", "worker", "nombre", "operario", "name", "empleado", "trabajadorNombre"] },
    dni: { aliases: ["dni", "cedula", "ci", "id", "trabajadorDni"] },
    turno: { aliases: ["turno", "shift", "jornada", "tipoJornada"] },
    fecha: { aliases: ["fecha", "date", "dia", "timestamp", "fechaLegible"] },
    producto: { aliases: ["producto", "tipo", "name", "articulo", "item", "productoNombre"] },
    cantidad: { aliases: ["cantidad", "qty", "units", "cant", "piezas", "total", "cantidadNeta"] },
    maquina: { aliases: ["maquina", "machine", "equipo", "maq", "maquinaId"] },
    outputMaquina: { aliases: ["outputMaquina", "lecturaMaquina", "contador", "output"] },
    observaciones: { aliases: ["obs", "notas", "notes", "comentarios"] }
  },
  turnos: ["Mañana", "Tarde", "Noche"]
};

const SCHEMAS = {
  telas: { ...BASE_SCHEMA, module: "Telas", description: "Producción de Telas y Corte" },
  paneles: { ...BASE_SCHEMA, module: "Paneles", description: "Producción de Paneles de Espuma" },
  resortes: { ...BASE_SCHEMA, module: "Resortes", description: "Producción de Resortes y Estructuras" }
};

const MODULE_NAMES = {
  telas: ['tela', 'telas', 'tejido', 'corte', 'ribete', 'banda', 'pestan', 'pillow', 'funda'],
  paneles: ['panel', 'paneles', 'espuma', 'visco', 'memory', 'mp'],
  resortes: ['resorte', 'resortes', 'bobina', 'bobinado', 'pocket', 'mr']
};

/**
 * Detecta el módulo basado en el nombre del archivo
 */
const detectByFileName = (fileName) => {
  if (!fileName) return 'paneles';
  const lowerName = fileName.toLowerCase();
  
  for (const [module, keywords] of Object.entries(MODULE_NAMES)) {
    if (keywords.some(kw => lowerName.includes(kw))) {
      return module;
    }
  }
  return 'paneles';
};

/**
 * Detecta el módulo basado en la estructura de datos y contenido
 */
const detectByContent = (records) => {
  if (!records || records.length === 0) return 'paneles';
  
  const sample = records[0];
  const keys = Object.keys(sample).map(k => k.toLowerCase());
  const productStr = String(sample.producto || sample.tipo || sample.name || '').toUpperCase();
  const machineStr = String(sample.maquina || sample.maquinaId || '').toUpperCase();

  // Detección por Máquina (MR = Resortes, MP = Paneles)
  if (machineStr.includes('MR') || productStr.includes('RESORTE')) return 'resortes';
  if (machineStr.includes('MP') || productStr.includes('PANEL') || productStr.includes('PLZ')) return 'paneles';
  
  // Detección por Columnas Específicas
  if (keys.includes('calidad') || keys.includes('alambre')) return 'resortes';
  
  return 'telas';
};

/**
 * Obtiene el schema para un módulo específico
 */
export const getSchema = (moduleName) => {
  const normalized = moduleName?.toLowerCase();
  return SCHEMAS[normalized] || SCHEMAS.paneles;
};

/**
 * Obtiene todos los módulos disponibles
 */
export const getAvailableModules = () => {
  return Object.keys(SCHEMAS);
};

/**
 * Auto-detecta el módulo y retorna el schema correcto
 */
export const detectAndGetSchema = (fileName, records) => {
  let detectedModule = detectByFileName(fileName);
  
  if (records?.length > 0) {
    detectedModule = detectByContent(records);
  }
  
  return {
    module: detectedModule,
    schema: getSchema(detectedModule)
  };
};

/**
 * Obtiene los turnos disponibles
 */
export const getTurnos = (moduleName) => {
  return BASE_SCHEMA.turnos;
};

/**
 * Valida un registro contra su schema
 */
export const validateRecord = (record, moduleName) => {
  const schema = getSchema(moduleName);
  const required = schema.validation.required;
  
  const missing = required.filter(field => {
    const aliases = schema.fieldMappings[field]?.aliases || [field];
    return !aliases.some(alias => 
      record.hasOwnProperty(alias) || record[alias] !== undefined
    );
  });
  
  return {
    valid: missing.length === 0,
    missing,
    errors: missing.map(f => `Campo requerido: ${f}`)
  };
};

/**
 * Mapea campos del registro al formato del schema
 */
export const mapFields = (record, moduleName) => {
  const schema = getSchema(moduleName);
  const mappings = schema.fieldMappings;
  const mapped = {};
  
  for (const [targetField, config] of Object.entries(mappings)) {
    const aliases = config.aliases || [targetField];
    for (const alias of aliases) {
      if (record[alias] !== undefined) {
        mapped[targetField] = record[alias];
        break;
      }
    }
  }
  
  return mapped;
};

/**
 * Obtiene metadata del módulo para display
 */
export const getModuleMetadata = (moduleName) => {
  const schema = getSchema(moduleName);
  return {
    name: schema.module,
    description: schema.description,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
};

export default {
  getSchema,
  getAvailableModules,
  detectAndGetSchema,
  getTurnos,
  validateRecord,
  mapFields,
  getModuleMetadata
};