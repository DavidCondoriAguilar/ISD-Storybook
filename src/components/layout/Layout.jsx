import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileUp,
  Sun,
  Moon,
  Presentation
} from 'lucide-react'
import { ImportProduction } from '../../features/import'
import { Dashboard } from '../../features/dashboard'
import ExecutiveDashboard from '../../features/analytics/pages/ExecutiveDashboard'
import { SettingsModal } from '../../features/dashboard/components/SettingsModal/SettingsModal'
import { useNotification } from '../../context/NotificationContext'
import { Notification } from '../ui/Notification/Notification'
import './Layout.css'

const navItems = [
  { id: 'dashboard', label: 'Monitor Planta', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'analytics', label: 'Dashboard Senior', icon: Presentation, path: '/analytics' },
  { id: 'import', label: 'Importar', icon: FileUp, path: '/import' }
]

export function Layout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light')
  const [activeTooltip, setActiveTooltip] = useState(null)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('app-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  const { notify } = useNotification()

  const handleImportComplete = useCallback((summary) => {
    notify(`Importación completada (+${summary.success} registros) 🚀`, 'success')
  }, [notify])

  const pageTitle = useMemo(() => {
    const activeItem = navItems.find(item => location.pathname === item.path)
    return activeItem?.label || 'Auditoría ISD'
  }, [location.pathname])

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon" role="img" aria-label="ISD Logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Navegación principal">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <div key={item.id} className="nav-item-wrapper">
                <NavLink
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => setActiveTooltip(item.label)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="nav-icon-wrapper">
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  </div>
                  {isActive && (
                    <motion.div 
                      className="active-indicator"
                      layoutId="navIndicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </NavLink>
                {activeTooltip === item.label && (
                  <div className="nav-tooltip" role="tooltip">
                    {item.label}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={toggleTheme}
            onMouseEnter={() => setActiveTooltip(theme === 'light' ? 'Modo oscuro' : 'Modo claro')}
            onMouseLeave={() => setActiveTooltip(null)}
            aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          >
            <div className="nav-icon-wrapper">
              {theme === 'light' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
            </div>
          </button>
          {activeTooltip === (theme === 'light' ? 'Modo oscuro' : 'Modo claro') && (
            <div className="nav-tooltip" role="tooltip" style={{ bottom: '50px', top: 'auto', transform: 'none' }}>
              {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            </div>
          )}
        </div>
      </aside>

      <main className="main-wrapper">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="breadcrumb-label">Planta Central</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span className="breadcrumb-current">{pageTitle}</span>
          </div>
        </header>

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<ExecutiveDashboard />} />
                <Route path="/import" element={<ImportProduction onImportComplete={handleImportComplete} />} />
                <Route path="/" element={<Dashboard />} />
              </Routes>
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