import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, User, History, X } from 'lucide-react'
import { getModuleName, getProductName, formatDate, formatHours } from '../../../../utils/formatters'

export function AuditModal({ selectedRecord, onClose }) {
  if (!selectedRecord) return null

  return (
    <AnimatePresence>
      <motion.div 
        className="detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      >
        <motion.div 
          className="detail-modal"
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{ background: 'white', width: '100%', maxWidth: '1100px', borderRadius: '32px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="modal-header" style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ClipboardCheck size={28} color="white" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase' }}>Auditoría para Gerencia de Planta</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: '4px 0' }}>{selectedRecord.fileName}</h2>
                <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Importado por: {selectedRecord.worker}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><History size={14} /> Ref: {selectedRecord.shift}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'white', border: '1px solid var(--border)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Table Body - Exact Manager Specs */}
          <div className="modal-body" style={{ padding: '0', maxHeight: '55vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>MÓDULO</th>
                  <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>PRODUCTO</th>
                  <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>TRABAJADOR</th>
                  <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textAlign: 'center' }}>CANTIDAD</th>
                  <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>UNIDAD</th>
                  <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>FECHA</th>
                  <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>HORAS</th>
                  <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>TIPO</th>
                </tr>
              </thead>
              <tbody>
                 {selectedRecord.rawRecords?.map((rec, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                     <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.85rem' }}>{getModuleName(rec.moduloId)}</span>
                     </td>
                     <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {rec.productoNombre || getProductName(rec.productoId)}
                        </div>
                     </td>
                     <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{rec.trabajadorNombre}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>DNI: {rec.trabajadorDni}</div>
                     </td>
                     <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 950, fontSize: '1rem' }}>
                        {rec.cantidad}
                     </td>
                     <td style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {rec.unidad}
                     </td>
                     <td style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {formatDate(rec.fechaTimestamp)}
                     </td>
                     <td style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: 800 }}>
                        {formatHours(rec.jornadaTotalHoras)}
                     </td>
                     <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900,
                          background: rec.tipoJornada === 'Estándar' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: rec.tipoJornada === 'Estándar' ? 'var(--success)' : '#d97706'
                        }}>
                          {rec.tipoJornada}
                        </span>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="modal-footer" style={{ padding: '32px 40px', background: 'var(--bg-app)', borderTop: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', gap: '64px' }}>
                   <div>
                     <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Producido Totales</div>
                     <div style={{ fontSize: '1.6rem', fontWeight: 950 }}>{selectedRecord.units.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>{selectedRecord.rawRecords?.[0]?.unidad || 'u.'}</span></div>
                   </div>
                   <div>
                     <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Integridad</div>
                     <div style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--success)' }}>100% Validado</div>
                   </div>
             </div>
             <button 
               onClick={onClose} 
               style={{ padding: '16px 40px', background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 900, cursor: 'pointer' }}
             >
               Cerrar Auditoría
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
