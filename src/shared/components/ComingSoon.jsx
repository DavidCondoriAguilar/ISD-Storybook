import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export const ComingSoon = ({ moduleName }) => {
  return (
    <div className="coming-soon-container glass" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '60vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Construction size={64} color="var(--warning)" />
      </motion.div>
      <h1 style={{ marginTop: '1.5rem', fontFamily: 'var(--font-outfit)' }}>
        Módulo de {moduleName}
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
        Estamos sincronizando los motores de datos para el área de {moduleName}. 
        Próximamente disponible para auditoría estratégica.
      </p>
      <div className="badge-incoming" style={{ 
        marginTop: '2rem', 
        padding: '0.5rem 1rem', 
        background: 'var(--primary-light)', 
        color: 'var(--primary)',
        borderRadius: 'var(--radius-full)',
        fontWeight: 'bold',
        fontSize: '0.8rem'
      }}>
        IN COMING
      </div>
    </div>
  );
};
