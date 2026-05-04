import { useCallback, memo, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { LayoutDashboard, FileUp, Presentation, Factory } from 'lucide-react'

import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { AppRoutes } from './AppRoutes'
import { SettingsModal } from '../../features/dashboard/components/SettingsModal/SettingsModal'
import { Notification } from '../ui/Notification/Notification'
import { useNotification } from '../../context/NotificationContext'
import { useAppStore } from '../../store/useAppStore'

import './Layout.css'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Centro de Control', icon: LayoutDashboard, path: '/dashboard' },
  { 
    id: 'factory', 
    label: 'Módulos Fábrica', 
    icon: Factory, 
    subItems: [
      { id: 'paneles', label: 'Paneles', path: '/factory/paneles' },
      { id: 'telas', label: 'Telas', path: '/factory/telas' },
      { id: 'pegado', label: 'Pegado', path: '/factory/pegado' },
      { id: 'sellado', label: 'Sellado', path: '/factory/sellado' },
      { id: 'quimicos', label: 'Químicos', path: '/factory/quimicos' },
    ]
  },
  { id: 'import', label: 'Importar', icon: FileUp, path: '/import' }
]

export const Layout = memo(() => {
  const location = useLocation()
  const { notify } = useNotification()
  
  // Zustand Global State
  const { 
    theme,
    isSettingsOpen, 
    setSettingsOpen 
  } = useAppStore()

  // Sincronización inicial del tema con el DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleImportComplete = useCallback((summary) => {
    notify(`Importación completada (+${summary.success} registros) 🚀`, 'success')
  }, [notify])

  const pageTitle = useMemo(() => {
    const activeItem = NAV_ITEMS.find(item => location.pathname === item.path)
    return activeItem?.label || 'Auditoría ISD'
  }, [location.pathname])

  return (
    <div className="layout">
      <Sidebar navItems={NAV_ITEMS} />

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
        onClose={() => setSettingsOpen(false)}
        onRefresh={() => window.dispatchEvent(new Event('refresh_production_data'))}
      />
    </div>
  )
})

export default Layout