/**
 * EXACT TypeScript Interface for Android ISD App Export (v1.0.0)
 */
export interface ProduccionRecord {
  // Technical IDs
  id: number;
  moduloId: number;
  maquinaId: number;
  productoId: number | null;
  
  // Worker Info
  trabajadorDni: string;
  trabajadorNombre: string;
  
  // Production Data
  cantidad: number;
  unidad: string;
  
  // Time Metadata
  tiempoMinutos: number;
  fechaTimestamp: number;
  esHoraExtra: boolean;
  horasExtraCantidad: number;
  
  // Sync Metadata
  exportado: boolean;
  syncId: string | null;
  updatedAt: number;
  
  // Calculated Fields (READ-ONLY)
  jornadaTotalHoras: string;
  tipoJornada: string;
}

export interface ImportSummary {
  id?: string;
  timestamp: string;
  fileName: string;
  worker: string;
  shift: string;
  success: number;
  failed: number; // Will be 0 if not present in Kotlin spec
  total: number;
  units: number;
  duplicatesDetected: number;
  isSkipped?: boolean;
  rawRecords?: ProduccionRecord[];
}
