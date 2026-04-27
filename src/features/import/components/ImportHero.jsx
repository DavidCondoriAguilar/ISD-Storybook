import { motion as m } from 'framer-motion'
import { Upload } from 'lucide-react'

export const ImportHero = () => (
  <div className="import-hero">
    <m.div 
      className="hero-icon-bg"
      whileHover={{ rotate: [0, -10, 10, 0] }}
    >
      <Upload size={36} />
    </m.div>
    <h2 className="hero-title">Portal de Carga</h2>
    <p className="hero-subtitle">
      Sincroniza tus registros de producción con el historial ejecutivo de la planta.
    </p>
  </div>
)
