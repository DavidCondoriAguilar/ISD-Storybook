import telaSchema from './schemas/tela.json';
import panelesSchema from './schemas/paneles.json';
import resortesSchema from './schemas/resortes.json';

/**
 * ISD Schema Registry - Sistema multi-módulo de producción
 * 
 * Auto-detecta el tipo de producción basado en:
 * 1. Nombre del archivo
 * 2. Estructura de los datos
 * 3. Productos encontrados
 */

const SCHEMAS = {
  telas: telaSchema,
  paneles: panelesSchema,
  resortes: resortesSchema,
  DEFAULT: panelesSchema
};

const MODULE_NAMES = {
  telas: ['tela', 'telas', 'tejido', 'corte', 'ribete', 'banda', 'pestan', 'pillow', 'funda'],
  paneles: ['panel', 'paneles', 'espuma', 'visco', 'memory'],
  resortes: ['resorte', 'resortes', 'bobina', 'bobinado', 'pocket']
};

const DETECTION_PATTERNS = {
  telas: ['producto', 'tipo'],
  paneles: ['producto', 'cantidad', 'maquina', 'outputMaquina'],
  resortes: ['producto', 'cantidad', 'maquina', 'outputMaquina', 'calidad']
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
 * Detecta el módulo basado en los productos del registro
 */
const detectByProducts = (records) => {
  if (!records || records.length === 0) return 'paneles';
  
  const firstProducts = records.slice(0, 5).map(r => 
    (r.producto || r.product || r.tipo || r.name || '').toLowerCase()
  );
  
  const productText = firstProducts.join(' ');
  
  for (const [module, keywords] of Object.entries(MODULE_NAMES)) {
    if (keywords.some(kw => productText.includes(kw))) {
      return module;
    }
  }
  
  return 'paneles';
};

/**
 * Detecta el módulo basado en la estructura de datos
 */
const detectByStructure = (records) => {
  if (!records || records.length === 0) return 'paneles';
  
  const sample = records[0];
  const keys = Object.keys(sample).map(k => k.toLowerCase());
  
  const hasOutputMaquina = keys.some(k => 
    ['outputmaquina', 'output', 'lecturamaquina'].includes(k)
  );
  
  const hasCalidad = keys.includes('calidad');
  const hasMaquina = keys.includes('maquina');
  
  if (hasCalidad && hasMaquina) return 'resortes';
  if (hasOutputMaquina && hasMaquina) return 'paneles';
  
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
  return Object.keys(SCHEMAS).filter(k => k !== 'DEFAULT');
};

/**
 * Auto-detecta el módulo y retorna el schema correcto
 */
export const detectAndGetSchema = (fileName, records) => {
  let detectedModule = detectByFileName(fileName);
  
  if (detectedModule === 'paneles' && records?.length > 0) {
    const byProducts = detectByProducts(records);
    if (byProducts !== 'paneles') {
      detectedModule = byProducts;
    } else {
      const byStructure = detectByStructure(records);
      if (byStructure !== 'paneles') {
        detectedModule = byStructure;
      }
    }
  }
  
  return {
    module: detectedModule,
    schema: SCHEMAS[detectedModule] || SCHEMAS.paneles
  };
};

/**
 * Obtiene los tipos de productos para un módulo
 */
export const getProductTypes = (moduleName) => {
  const schema = getSchema(moduleName);
  return schema?.allowedProductTypes || [];
};

/**
 * Obtiene los turnos disponibles para un módulo
 */
export const getTurnos = (moduleName) => {
  const schema = getSchema(moduleName);
  return schema?.turnos || ['Mañana', 'Tarde', 'Noche'];
};

/**
 * Valida un registro contra su schema
 */
export const validateRecord = (record, moduleName) => {
  const schema = getSchema(moduleName);
  const required = schema?.validation?.required || [];
  
  const missing = required.filter(field => {
    const aliases = schema?.fieldMappings?.[field]?.aliases || [field];
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
  const mappings = schema?.fieldMappings || {};
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
    name: schema?.module,
    description: schema?.description,
    productCount: schema?.allowedProductTypes?.length || 0,
    lastUpdated: schema?.lastUpdated
  };
};

export default {
  getSchema,
  getAvailableModules,
  detectAndGetSchema,
  getProductTypes,
  getTurnos,
  validateRecord,
  mapFields,
  getModuleMetadata
};