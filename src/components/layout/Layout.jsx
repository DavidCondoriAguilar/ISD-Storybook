import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileUp,
  Package,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu
} from 'lucide-react'
import { ImportProduction } from '../../features/import'
import { Dashboard } from '../../features/dashboard'
import { SettingsModal } from '../../features/dashboard/components/SettingsModal/SettingsModal'
import { useNotification } from '../../context/NotificationContext'
import { Notification } from '../ui/Notification/Notification'
import './Layout.css'

export function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('app-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  const { notify } = useNotification()

  const handleImportComplete = (summary) => {
    notify(`Importación completada (+${summary.success} registros) 🚀`, 'success')
    setActiveTab('dashboard')
  }

  const navItems = [
    { id: 'dashboard', label: 'Monitor Planta', icon: LayoutDashboard },
    { id: 'import', label: 'Importar', icon: FileUp }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'import':
        return <ImportProduction onImportComplete={handleImportComplete} />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation (Elite Lux-Tech) */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? '80px' : 'var(--sidebar-w)' }}
        className="sidebar"
      >
        <div className="sidebar-header">
          <div className="brand-icon">
            <Package size={22} />
          </div>
          {!isSidebarCollapsed && (
            <span className="brand-text">ISD</span>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
              {activeTab === item.id && !isSidebarCollapsed && (
                <motion.div layoutId="indicator" style={{ marginLeft: 'auto', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} />
              )}
            </button>
          ))}
        </nav>
      </motion.aside>

      <main className="main-wrapper">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="breadcrumb-label">Planta Central</span>
            <ChevronRight size={14} color="var(--text-dim)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)' }}>
              {activeTab === 'dashboard' ? 'Monitor de Auditoría' : 'Sincronización ERP'}
            </span>
          </div>

          <div className="top-bar-right">
            <button
              className="icon-btn-ghost"
              onClick={toggleTheme}
              title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              className="icon-btn-ghost"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </header>

        <div style={{ padding: '24px 32px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Notification />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefresh={() => window.dispatchEvent(new Event('refresh_production_data'))}
      />
    </div>
  )
}
