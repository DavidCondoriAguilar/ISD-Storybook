import { motion } from 'framer-motion'
import { History, User, Search, FileCheck2, AlertCircle, FileJson } from 'lucide-react'

export function SyncHistoryLog({ records, filter, setFilter, onSelectRecord, variants }) {
  return (
    <motion.div variants={variants} className="history-container" style={{ background: 'white', borderRadius: '32px', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
      <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-app)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={24} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0 }}>Bitácora de Sincronización</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Historial de Ingesta Corporativa ERP</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-app)', padding: '4px', borderRadius: '16px', display: 'flex', gap: '4px' }}>
          {['all', 'success', 'partial'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 20px', borderRadius: '12px', border: 'none', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s',
                background: filter === f ? 'white' : 'transparent',
                color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: filter === f ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {f === 'all' ? 'Ver Todo' : f === 'success' ? 'Exitosos' : 'Errores'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CRONOLOGÍA</th>
              <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>RESPONSABLE</th>
              <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ORIGEN</th>
              <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROCESADOS</th>
              <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PRODUCCIÓN</th>
              <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ESTADO</th>
              <th style={{ padding: '20px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <motion.tr
                key={r.id || i}
                whileHover={{ background: 'var(--bg-app)' }}
                onClick={() => onSelectRecord(r)}
                style={{ cursor: 'pointer', borderBottom: '1px solid var(--bg-app)', transition: 'background 0.2s' }}
              >
                <td style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 850, fontSize: '0.9rem' }}>{new Date(r.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{new Date(r.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: '0.75rem' }}>
                      {r.worker?.charAt(0) || 'U'}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.worker}</span>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    <FileJson size={14} /> {r.fileName}
                  </div>
                </td>
                <td style={{ padding: '20px', fontWeight: 700, fontSize: '0.85rem' }}>{r.total} módulos</td>
                <td style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 950, fontSize: '1.1rem', color: 'var(--primary)' }}>{r.units?.toLocaleString()} <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>unid.</span></div>
                </td>
                <td style={{ padding: '20px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900,
                    background: r.failed === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: r.failed === 0 ? 'var(--success)' : 'var(--danger)',
                    border: '1px solid transparent'
                  }}>
                    {r.failed === 0 ? <FileCheck2 size={12} /> : <AlertCircle size={12} />}
                    {r.failed === 0 ? 'SINCRO OK' : 'REVISIÓN'}
                  </span>
                </td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Search size={14} /> Analítica
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
