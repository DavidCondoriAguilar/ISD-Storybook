import { useState, useEffect, useRef } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, ChevronRight, Factory } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import './Sidebar.css'

export const Sidebar = ({ navItems }) => {
  const location = useLocation()
  const { theme, toggleTheme, activeTooltip, setActiveTooltip } = useAppStore()
  const [openDropdown, setOpenDropdown] = useState(null)
  const sidebarRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id)
  }

  // Función para determinar el color del icono
  const getIconColor = (item, isActive) => {
    if (isActive) return 'var(--primary)';
    if (item.id === 'factory') return '#2dd4bf'; // Cyan vibrante para Fábrica
    return 'var(--text-muted)';
  };

  return (
    <aside className="sidebar" ref={sidebarRef}>
      <div className="sidebar-brand">
        <div className="brand-icon" role="img" aria-label="ISD Logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.subItems?.some(s => location.pathname === s.path))
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isDropdownOpen = openDropdown === item.id
          const iconColor = getIconColor(item, isActive)

          return (
            <div key={item.id} className="nav-item-wrapper">
              {hasSubItems ? (
                <button
                  className={`nav-item ${isActive ? 'active' : ''} ${isDropdownOpen ? 'dropdown-active' : ''}`}
                  onClick={() => toggleDropdown(item.id)}
                  onMouseEnter={() => setActiveTooltip(item.label)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="nav-icon-wrapper">
                    <item.icon size={20} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <ChevronRight size={12} className={`dropdown-chevron ${isDropdownOpen ? 'open' : ''}`} />
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => setActiveTooltip(item.label)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="nav-icon-wrapper">
                    <item.icon size={20} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                </NavLink>
              )}

              <AnimatePresence>
                {hasSubItems && isDropdownOpen && (
                  <motion.div 
                    className="sidebar-submenu glass"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="submenu-header">{item.label}</div>
                    {item.subItems.map(sub => (
                      <NavLink 
                        key={sub.id} 
                        to={sub.path} 
                        className={({isActive}) => `submenu-item ${isActive ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {isActive && !isDropdownOpen && (
                <motion.div className="active-indicator" layoutId="navIndicator" />
              )}
              
              {activeTooltip === item.label && !isDropdownOpen && (
                <div className="nav-tooltip">{item.label}</div>
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
        >
          <div className="nav-icon-wrapper">
            {theme === 'light' ? 
              <Moon size={20} color="var(--primary)" /> : 
              <Sun size={20} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.4))' }} />
            }
          </div>
        </button>
      </div>
    </aside>
  )
}
