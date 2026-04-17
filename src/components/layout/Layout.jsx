import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileUp,
  Settings,
  Package,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell
} from 'lucide-react'
import { ImportProduction } from '../../features/import'
import { Dashboard } from '../../features/dashboard'
import { DashboardSettingsView } from '../../features/dashboard/components/SettingsModal/DashboardSettingsView'
import { useNotification } from '../../context/NotificationContext'
import { Notification } from '../ui/Notification/Notification'
import './Layout.css'

export function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
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
      {/* Sidebar Navigation (Lux-Tech) */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? '80px' : 'var(--sidebar-w)' }}
        className="sidebar"
      >
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '30px 24px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Package size={22} />
          </div>
          {!isSidebarCollapsed && (
            <span style={{ fontSize: '1.2rem', fontWeight: 950, letterSpacing: '-0.04em' }}>ProductionHub</span>
          )}
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 12px' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: 'none', background: activeTab === item.id ? 'var(--primary-light)' : 'transparent', color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', marginBottom: '4px', fontWeight: 800, transition: 'all 0.2s' }}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
              {activeTab === item.id && !isSidebarCollapsed && (
                <motion.div layoutId="indicator" style={{ marginLeft: 'auto', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '24px', opacity: 0.3 }}>
          {/* Profile removed as per request */}
        </div>
      </motion.aside>

      <main className="main-wrapper" style={{ flex: 1, background: 'var(--bg-app)', minHeight: '100vh', overflowY: 'auto' }}>
        <header className="top-bar" style={{ padding: '20px 40px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>Planta Central</span>
            <ChevronRight size={14} color="var(--border-strong)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--text-main)' }}>{activeTab === 'dashboard' ? 'Monitor' : 'Sincronización'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </header>

        <div style={{ padding: '40px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Notification />
    </div>
  )
}
