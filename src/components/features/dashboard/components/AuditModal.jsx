import { motion, AnimatePresence } from 'framer-motion'
import { Target, AlertCircle, User, X, Box } from 'lucide-react'

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
        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
      >
        <motion.div 
          className="detail-modal"
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{ background: 'white', width: '100%', maxWidth: '960px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}
        >
          <div className="modal-header" style={{ padding: '40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, var(--bg-app), white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)' }}>
                 <Target size={28} color="white" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                   Auditoría de Planta
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 950, margin: '4px 0', letterSpacing: '-0.02em' }}>{selectedRecord.fileName}</h2>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Operario: {selectedRecord.worker}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Box size={14} /> Lote: {selectedRecord.shift}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', width: '48px', height: '48px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body" style={{ padding: '0', maxHeight: '55vh', overflowY: 'auto' }}>
            <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ORDEN</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>PRODUCTO</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>MÓDULO / MÁQUINA</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>RESPONSABLE</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>VOLUMEN</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {selectedRecord.rawRecords?.map((rec, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--bg-app)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '24px', fontWeight: 900, fontSize: '0.85rem' }}>{rec.orderNumber}</td>
                    <td style={{ padding: '24px', fontWeight: 700, opacity: 0.8, fontSize: '0.85rem' }}>{rec.productName}</td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.9rem' }}>{rec.stageName}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>{rec.machineName}</div>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        <div style={{ width: '24px', height: '24px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={12} /></div>
                        {rec.workerName || selectedRecord.worker}
                      </div>
                    </td>
                    <td style={{ padding: '24px', fontWeight: 950, fontSize: '1.2rem', textAlign: 'right' }}>
                       {rec.quantity.toLocaleString()} <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>unid.</span>
                    </td>
                    <td style={{ padding: '24px' }}>
                      {rec.quantityRejected > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900, width: 'fit-content', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            {rec.quantityRejected} RECHAZOS
                          </span>
                          {rec.notes && <span style={{ fontSize: '0.65rem', fontWeight: 600, fontStyle: 'italic', opacity: 0.6, maxWidth: '180px' }}>"{rec.notes}"</span>}
                        </div>
                      ) : (
                         <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900, width: 'fit-content', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                            ÓPTIMO
                         </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer" style={{ padding: '32px 40px', background: 'var(--bg-app)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', gap: '48px' }}>
                   <div><div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>PRODUCIDO</div><div style={{ fontSize: '1.5rem', fontWeight: 950 }}>{selectedRecord.units.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>u.</span></div></div>
                   <div><div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>FALLIDOS</div><div style={{ fontSize: '1.5rem', fontWeight: 950, color: selectedRecord.failed > 0 ? 'var(--danger)' : 'var(--success)' }}>{selectedRecord.failed || 0}</div></div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={onClose} 
               style={{ padding: '16px 32px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)' }}
             >
               Finalizar Auditoría
             </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
