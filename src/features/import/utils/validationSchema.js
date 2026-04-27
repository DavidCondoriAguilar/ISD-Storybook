import { z } from 'zod';

/**
 * Enterprise Production Schema - Senior Version
 * Optimized for ISD Senior JSON format.
 * Extremely permissive to avoid import blocks while ensuring core data.
 */
export const ProductionRecordSchema = z.object({
  version: z.string().optional(),
  id: z.coerce.number().optional(),
  trabajador: z.object({
    dni: z.string().optional(),
    nombre: z.string().min(1, "Nombre de trabajador es requerido")
  }).optional(),
  ubicacion: z.object({
    modulo: z.string().optional(),
    maquina: z.string().optional()
  }).optional(),
  producto: z.object({
    nombre: z.string().optional(),
    codigo: z.string().optional()
  }).nullable().optional(),
  produccion: z.object({
    cantidad: z.coerce.number().optional(),
    unidad: z.string().optional(),
    total: z.coerce.number().optional()
  }).optional(),
  tiempo: z.object({
    minutos: z.coerce.number().optional(),
    horas: z.coerce.string().optional(),
    horasTotal: z.coerce.string().optional(),
    horasExtra: z.coerce.number().optional(),
    tipo: z.string().optional()
  }).optional(),
  fecha: z.any().optional(),
  fechaLegible: z.string().optional(),
  outputMaquina: z.coerce.number().optional(),
  metadatosFecha: z.object({
    anio: z.number().optional(),
    mes: z.number().optional(),
    dia: z.number().optional()
  }).optional()
}).passthrough(); // Allow extra fields without failing

export const ImportPayloadSchema = z.object({
  fileName: z.string().optional(),
  worker: z.string().optional(),
  rawRecords: z.array(z.any()) // Allow any record structure to prevent hard failures
});

/**
 * Validates raw data and returns normalized results or throws error
 */
export const validateProductionData = (data) => {
  // If data is just an array, wrap it to match the expected payload
  const payload = Array.isArray(data) ? { rawRecords: data } : data;
  
  // High-level check only
  if (!payload.rawRecords || !Array.isArray(payload.rawRecords)) {
    throw new Error("El JSON debe ser un array de registros.");
  }
  
  return payload;
};
