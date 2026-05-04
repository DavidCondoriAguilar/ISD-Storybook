import React from 'react';
import { motion } from 'framer-motion';

/**
 * EmployeeMatrix - Visualización detallada del rendimiento por operario.
 * Optimizada para legibilidad extrema y separación de datos.
 */
export const EmployeeMatrix = ({ workers }) => {
  if (!workers || workers.length === 0) return null;

  return (
    <section className="employee-matrix">
      <div className="matrix-header">
        <h3>Matriz de Producción por Operario</h3>
        <p>Desglose exacto de unidades y millares por talento humano</p>
      </div>
      <div className="matrix-grid">
        {workers.map((w, i) => (
          <motion.div 
            key={w.name} 
            className="worker-profile-card glass"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <div className="worker-avatar">
              {w.name.charAt(0).toUpperCase()}
            </div>
            <div className="worker-details">
              <div className="worker-name">{w.name}</div>
              <div className="worker-stats-row">
                {w.resortes > 0 && (
                  <div className="stat-pill resortes">
                    <span className="label">Resortes</span>
                    <span className="value">{(w.resortes / 1000).toLocaleString('es-ES')} mil.</span>
                  </div>
                )}
                {w.paneles > 0 && (
                  <div className="stat-pill paneles">
                    <span className="label">Paneles</span>
                    <span className="value">{w.paneles.toLocaleString('es-ES')} u.</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
