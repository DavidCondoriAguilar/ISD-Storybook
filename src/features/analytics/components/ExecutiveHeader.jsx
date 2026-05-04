import { motion } from 'framer-motion'

/**
 * ExecutiveHeader - Versión Ultra-Limpia.
 * Sin búsqueda y con alineación horizontal de filtros.
 */
export const ExecutiveHeader = ({
  children
}) => {
  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <header className="exec-header-v2">
      <div className="header-left-v2">
        <div className="badges-row">
          <span className="badge-primary">Planta Central</span>
          <span className="badge-outline">Centro de Control</span>
        </div>
        <h1 className="title-v2">Dashboard <span className="blue-text">Estratégico ISD</span></h1>
        <p className="subtitle-v2">Inteligencia Operativa • {currentMonth}</p>
      </div>

      <div className="header-right-v2">
        {/* Aquí se inyectan los selectores (Áreas y Calendario) */}
        <div className="filters-group-v2">
          {children}
        </div>

        <div className="status-badge-v2">
          <motion.span 
            className="dot-v2"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          EN VIVO
        </div>
      </div>
    </header>
  )
}
