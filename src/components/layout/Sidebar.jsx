import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import './Sidebar.css'

export const Sidebar = ({ navItems, theme, onToggleTheme }) => {
  const [activeTooltip, setActiveTooltip] = useState(null)
  const location = useLocation()

  return (
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
          onClick={onToggleTheme}
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
  )
}
