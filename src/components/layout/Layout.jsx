import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { LayoutDashboard, FileUp, Presentation } from 'lucide-react'

import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { AppRoutes } from './AppRoutes'
import { SettingsModal } from '../../features/dashboard/components/SettingsModal/SettingsModal'
import { Notification } from '../ui/Notification/Notification'
import { useNotification } from '../../context/NotificationContext'

import './Layout.css'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Monitor Planta', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'analytics', label: 'Dashboard Senior', icon: Presentation, path: '/analytics' },
  { id: 'import', label: 'Importar', icon: FileUp, path: '/import' }
]

export const Layout = memo(() => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light')
  const location = useLocation()
  const { notify } = useNotification()

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('app-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const handleImportComplete = useCallback((summary) => {
    notify(`Importación completada (+${summary.success} registros) 🚀`, 'success')
  }, [notify])

  const pageTitle = useMemo(() => {
    const activeItem = NAV_ITEMS.find(item => location.pathname === item.path)
    return activeItem?.label || 'Auditoría ISD'
  }, [location.pathname])

  return (
    <div className="layout">
      <Sidebar 
        navItems={NAV_ITEMS} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
      />

      <main className="main-wrapper">
        <TopBar title={pageTitle} />

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AppRoutes onImportComplete={handleImportComplete} />
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
})

export default Layout