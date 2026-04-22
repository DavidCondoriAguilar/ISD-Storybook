import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Save, Edit3, Package, Layers, Trash2 } from 'lucide-react'
import { db } from '../../../../services/db'
import { storageService } from '../../../../services/storageService'
import { useNotification } from '../../../../context/NotificationContext'

export function SettingsModal({ isOpen, onClose, onRefresh }) {
  const { notify } = useNotification()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadMappings()
    }
  }, [isOpen])

  const loadMappings = async () => {
    setLoading(true)
    const data = await db.metadata.toArray()
    setItems(data.filter(i => i.id.startsWith('module_') || i.id.startsWith('product_')))
    setLoading(false)
  }

  const handleUpdateName = async (id, newValue) => {
    await db.metadata.put({ id, value: newValue })
    setItems(prev => prev.map(item => item.id === id ? { ...item, value: newValue } : item))
  }

  const handleSave = () => {
    onRefresh()
    notify('Diccionario de nombres actualizado 📈', 'success')
    onClose()
  }

  const handleClearData = async () => {
    const confirm = window.confirm('⚠ ATENCIÓN: Se eliminarán TODOS los registros de producción y el historial de importaciones. Los nombres personalizados del diccionario se mantendrán. ¿Continuar?')
    if (confirm) {
      await storageService.clear()
      onRefresh()
      notify('Base de datos limpiada correctamente. 🧹', 'info')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        className="settings-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        onClick={onClose}
      >
        <motion.div 
          className="settings-modal"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}
        >
          <div style={{ padding: '24px 32px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Diccionario de Planta</h2>
            </div>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
          </div>

          <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 600 }}>
              Asigna nombres reales a los IDs detectados por el sistema para que el gerente los entienda fácilmente.
            </p>

            {loading ? <div style={{ textAlign: 'center' }}>Cargando IDs...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {items.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-app)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                    Sube un archivo primero para detectar módulos y productos.
                  </div>
                )}
                
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {item.id.startsWith('module_') ? <Layers size={12} /> : <Package size={12} />}
                      {item.id.replace('module_', 'Módulo ').replace('product_', 'Producto ')}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        value={item.value} 
                        onChange={(e) => handleUpdateName(item.id, e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', paddingRight: '40px', borderRadius: '12px', border: '2.5px solid var(--border)', fontWeight: 800, fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                      />
                      <Edit3 size={16} style={{ position: 'absolute', right: '16px', top: '14px', opacity: 0.3 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
             <button 
                onClick={handleClearData} 
                title="Limpiar registros (Mantiene nombres)"
                style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', border: '1.5px solid rgba(239, 68, 68, 0.2)', borderRadius: '14px', cursor: 'pointer' }}
             >
                <Trash2 size={18} />
             </button>
             <button onClick={handleSave} style={{ flex: 1, padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save size={18} /> Aplicar Cambios Realizados
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
