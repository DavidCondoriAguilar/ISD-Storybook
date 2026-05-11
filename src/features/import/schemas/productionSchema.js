import { z } from 'zod';

/**
 * ESQUEMA DE PRODUCCIÓN (Mapping Real para produccion_completa.json)
 */

const ProductionV2Schema = z.object({
  id: z.number().or(z.string()),
  version: z.string().optional(),
  trabajador: z.object({
    nombre: z.string(),
    dni: z.string().optional()
  }),
  ubicacion: z.object({
    modulo: z.string(),
    maquina: z.string()
  }),
  producto: z.object({
    nombre: z.string(),
    codigo: z.string().optional()
  }),
  produccion: z.object({
    cantidad: z.number(),
    unidad: z.string().optional()
  }),
  tiempo: z.object({
    tipo: z.string().optional(),
    minutos: z.number().optional(),
    horas: z.string().or(z.number()).optional()
  }).optional(),
  fechaLegible: z.string().optional(),
  metadatosFecha: z.object({
    anio: z.number(),
    mes: z.number(),
    dia: z.number()
  }).optional(),
  fechaTimestamp: z.number().optional(),
  outputMaquina: z.number().optional(),
  esMillar: z.boolean().optional()
}).passthrough(); // Permitir campos extra para no romper si la App de Android añade algo nuevo

export const RecordSchema = ProductionV2Schema;
export const ProductionFileSchema = z.array(RecordSchema).min(1);

export const validateProductionData = (data) => {
  try {
    const parsed = ProductionFileSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    const errors = error.errors || [];
    return { 
      success: false, 
      errors: errors.map(err => ({
        path: err.path ? err.path.join('.') : 'root',
        message: err.message
      }))
    };
  }
};
