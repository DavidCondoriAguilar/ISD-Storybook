import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  FileUp, 
  Bell, 
  Settings, 
  LogOut, 
  Package, 
  History,
  Info
} from 'lucide-react'
import { ImportProduction } from '../../features/import'
import { Dashboard } from '../../features/dashboard'
import { storageService } from '../../services/storageService'
import { useNotification } from '../../context/NotificationContext'
import { Notification } from '../ui/Notification/Notification'
import './Layout.css'

export function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { notify } = useNotification()

  useEffect(() => {
    const handleStorageChange = () => {
      notify('Nueva importación detectada ✨', 'info')
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [notify])

  const handleImportComplete = (summary, meta) => {
    storageService.save({
      fileName: meta?.fileName || 'production_import.json',
      worker: meta?.worker || 'Usuario',
      success: summary.success,
      total: summary.total,
      units: summary.units,
      failed: summary.failed || 0, // We use FAILED units for the "Failure" metric in history
      errors: summary.errors,
      rawRecords: summary.rawRecords
    })
    
    notify('¡Importación completada con éxito! 🚀', 'success')
    setActiveTab('dashboard')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'import', label: 'Importar', icon: FileUp },
    { id: 'history', label: 'Historial', icon: History, disabled: true },
    { id: 'settings', label: 'Configuración', icon: Settings, disabled: true }
  ]

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="sidebar"
      >
        <div className="sidebar-header">
          <motion.div 
            className="brand-icon-wrapper"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Package size={24} />
          </motion.div>
          <span className="brand-text">ProductionHub</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="nav-label">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="indicator"
                  className="nav-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <span className="user-name">Administrador</span>
              <span className="user-role">Super Admin</span>
            </div>
            <button className="btn-logout" style={{ marginLeft: 'auto', background: 'transparent', color: 'var(--text-muted)' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        <header className="top-bar">
          <h1 className="page-title">
            {activeTab === 'dashboard' ? 'Resumen General' : 'Carga de Datos'}
          </h1>
          <div className="header-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <motion.button 
              whileHover={{ color: 'var(--primary)' }}
              style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex' }}
            >
              <Bell size={22} />
            </motion.button>
            <div className="header-divider" style={{ width: '1px', height: '24px', background: 'var(--border-strong)' }} />
            <span className="date-display" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'import' ? (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ImportProduction 
                onImportComplete={handleImportComplete} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Notification />
    </div>
  )
}
