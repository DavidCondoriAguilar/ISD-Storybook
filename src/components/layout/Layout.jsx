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
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'
import { ImportProduction } from '../../features/import'
import { Dashboard } from '../../features/dashboard'
import { storageService } from '../../services/storageService'
import { useNotification } from '../../context/NotificationContext'
import { Notification } from '../ui/Notification/Notification'
import './Layout.css'

export function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { notify } = useNotification()

  useEffect(() => {
    const handleStorageChange = () => {
      notify('Nueva importación detectada ✨', 'info')
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [notify])

  const handleImportComplete = (summary) => {
    if (summary.isSkipped) {
      notify(`Omitidos ${summary.duplicatesDetected} registros duplicados 🛡️`, 'warning')
    } else {
      notify(`Importación completada (+${summary.success} registros) 🚀`, 'success')
      setActiveTab('dashboard')
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'import', label: 'Importar', icon: FileUp },
    { id: 'history', label: 'Historial', icon: History, disabled: true },
    { id: 'settings', label: 'Configuración', icon: Settings, disabled: true }
  ]

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? '80px' : 'var(--sidebar-w)',
          transition: { type: 'spring', stiffness: 300, damping: 30 }
        }}
        className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
      >
        <div className="sidebar-header">
          <motion.div 
            className="brand-icon-wrapper"
            whileHover={{ scale: 1.05, rotate: 5 }}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ cursor: 'pointer' }}
          >
            <Package size={24} />
          </motion.div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="brand-text"
              >
                ProductionHub
              </motion.span>
            )}
          </AnimatePresence>
          
          <button 
            className="toggle-sidebar-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="nav-label"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
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
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="user-info"
              >
                <span className="user-name">Administrador</span>
                <span className="user-role">Super Admin</span>
              </motion.div>
            )}
            <button className="btn-logout" style={{ marginLeft: isSidebarCollapsed ? '0' : 'auto', background: 'transparent', color: 'var(--text-muted)' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        <div className="main-content">
          <header className="top-bar">
            <div className="breadcrumb">
              {isSidebarCollapsed && (
                <button 
                  onClick={() => setIsSidebarCollapsed(false)}
                  style={{ marginRight: '16px', color: 'var(--primary)', background: 'transparent' }}
                >
                  <Menu size={20} />
                </button>
              )}
              <span className="breadcrumb-main">{activeTab === 'dashboard' ? 'Planta Central' : 'Sincronización'}</span>
              <span className="breadcrumb-divider">/</span>
              <span className="breadcrumb-current">{activeTab === 'dashboard' ? 'Dashboard' : 'Carga de Datos'}</span>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <motion.button 
                whileHover={{ color: 'var(--primary)', scale: 1.1 }}
                style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex' }}
              >
                <Bell size={20} />
              </motion.button>
              <div className="header-divider" style={{ width: '1px', height: '20px', background: 'var(--border-strong)' }} />
              <div className="date-pill">
                <span className="date-display">
                  {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'import' ? (
              <motion.div
                key="import"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <ImportProduction 
                  onImportComplete={handleImportComplete} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Notification />
    </div>
  )
}

