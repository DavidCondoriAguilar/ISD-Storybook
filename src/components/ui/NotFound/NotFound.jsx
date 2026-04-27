import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Construction } from 'lucide-react'
import './NotFound.css'

export const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="not-found-container">
      <motion.div 
        className="not-found-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="not-found-icon-group">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Construction size={64} className="icon-main" />
          </motion.div>
          <div className="icon-badge">
             <AlertCircle size={20} />
          </div>
        </div>

        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Módulo No Localizado</h2>
        <p className="not-found-text">
          La ruta que intentas auditar no existe en el sistema de control ISD. 
          Es posible que el enlace esté roto o el módulo haya sido reubicado.
        </p>

        <motion.button
          className="btn-back-home"
          onClick={() => navigate('/dashboard')}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} /> Volver al Centro de Control
        </motion.button>
      </motion.div>

      <div className="not-found-background-deco">
        <span>ISD</span>
        <span>ERROR</span>
        <span>404</span>
      </div>
    </div>
  )
}
