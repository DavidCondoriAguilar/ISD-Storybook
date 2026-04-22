import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Package, Layers, Edit3, ShieldCheck } from 'lucide-react'
import { db } from '../../../../data/db'
import { useNotification } from '../../../../context/NotificationContext'

export function DashboardSettingsView() {
  const { notify } = useNotification()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMappings()
  }, [])

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
    window.dispatchEvent(new Event('refresh_production_data'))
    notify('Diccionario de planta actualizado correctamente ✅', 'success')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em' }}>Configuración de Diccionario</h2>
        <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Personaliza los nombres que el gerente verá en los reportes finales.</p>
      </div>

      <div style={{ display: 'grid', gap: '20px', background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Cargando datos maestros...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-app)', borderRadius: '20px' }}>
             <p style={{ fontWeight: 800 }}>No hay datos para configurar todavía.</p>
             <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sincroniza un archivo JSON primero para descubrir módulos y productos.</span>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '16px', borderRadius: '16px', border: '1px solid transparent', transition: 'all 0.2s' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--bg-app)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                   {item.id.startsWith('module_') ? <Layers size={18} /> : <Package size={18} />}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    ID: {item.id.split('_')[1]}
                  </span>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <input 
                       type="text" 
                       value={item.value} 
                       onChange={(e) => handleUpdateName(item.id, e.target.value)}
                       style={{ width: '100%', padding: '10px 0', border: 'none', borderBottom: '2px solid var(--border)', fontSize: '1rem', fontWeight: 800, outline: 'none', background: 'transparent' }}
                    />
                    <Edit3 size={14} style={{ position: 'absolute', right: 0, top: '12px', opacity: 0.3 }} />
                  </div>
                </div>
            </div>
          ))
        )}

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
           <button 
             onClick={handleSave} 
             style={{ padding: '16px 32px', background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
           >
             <Save size={18} /> Guardar Todos los Cambios
           </button>
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
         <ShieldCheck size={20} color="var(--success)" />
         <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Estos nombres se guardan localmente y persistirán tras cerrar la aplicación.</span>
      </div>
    </motion.div>
  )
}
