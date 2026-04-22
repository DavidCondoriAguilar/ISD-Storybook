import { z } from 'zod';

/**
 * Enterprise Production Schema
 * Validates the structure of incoming JSON from the Android App
 */
export const ProductionRecordSchema = z.object({
  version: z.string().optional(),
  id: z.coerce.number().optional(),
  trabajador: z.object({
    dni: z.string().optional(), // puede ser UUID si no hay DNI real
    nombre: z.string().min(1, "Nombre de trabajador es requerido")
  }),
  ubicacion: z.object({
    modulo: z.string().min(1, "Módulo es requerido"),
    maquina: z.string().optional()
  }),
  producto: z.object({
    nombre: z.string().min(1, "Nombre de producto es requerido"),
    codigo: z.string().min(1, "Código de producto es requerido")
  }).nullable().optional(),
  produccion: z.object({
    cantidad: z.coerce.number().min(0, "La cantidad no puede ser negativa"),
    unidad: z.string().default('u.')
  }),
  tiempo: z.object({
    minutos: z.coerce.number().optional(),
    horas: z.string().optional(), // NUEVO: campo calculado de horas
    horasTotal: z.string().default("8.00"),
    horasExtra: z.coerce.number().default(0),
    tipo: z.string().default('Estándar')
  }),
  fecha: z.coerce.number().or(z.string()),
  fechaLegible: z.string().optional(),
  updatedAt: z.coerce.number().optional(),
  sincronizado: z.boolean().optional(),
  metadatosFecha: z.object({
    anio: z.number().optional(),
    mes: z.number().optional(),
    dia: z.number().optional(),
    diaSemana: z.number().optional(),
    semanaAnio: z.number().optional()
  }).optional()
});

export const ImportPayloadSchema = z.object({
  fileName: z.string().optional(),
  worker: z.string().optional(),
  rawRecords: z.array(ProductionRecordSchema)
});

/**
 * Validates raw data and returns normalized results or throws error
 */
export const validateProductionData = (data) => {
  // If data is just an array, wrap it to match the expected payload
  const payload = Array.isArray(data) ? { rawRecords: data } : data;
  
  const result = ImportPayloadSchema.safeParse(payload);
  
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => 
      `Campo [${err.path.join('.')}]: ${err.message}`
    ).join('\n');
    throw new Error(`Validación de datos fallida:\n${errorMessages}`);
  }
  
  return result.data;
};
