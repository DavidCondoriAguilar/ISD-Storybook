import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, ArrowUpRight } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const MachineDistribution = ({ data }) => {
  // Find max units to scale bars relatively
  const maxUnits = Math.max(...data.map(d => d.units), 1);

  return (
    <motion.div className="clean-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card-header">
        <div className="icon-box warning">
          <HardDrive size={20} />
        </div>
        <div>
          <h3>Carga de Maquinaria</h3>
          <p>Distribución de volumen por equipo</p>
        </div>
      </div>
      <div className="machine-intensity-list" style={{ marginTop: '24px' }}>
        {data.map((item, idx) => (
          <motion.div 
            key={idx} 
            className="intensity-item"
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="intensity-label">
              <span className="name">
                {item.name}
                {idx === 0 && <ArrowUpRight size={12} style={{ marginLeft: 8, color: 'var(--success)' }} />}
              </span>
              <span className="value">{item.units.toLocaleString()} u.</span>
            </div>
            <div className="intensity-bar-bg">
              <motion.div 
                className="intensity-bar"
                initial={{ width: 0 }}
                animate={{ width: `${(item.units / maxUnits) * 100}%` }}
                style={{ background: COLORS[idx % COLORS.length] }}
                transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
