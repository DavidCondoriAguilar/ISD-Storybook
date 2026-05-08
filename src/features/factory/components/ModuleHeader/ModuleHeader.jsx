import React from 'react';
import { Link } from 'react-router-dom';
import './ModuleHeader.css';

const ModuleHeader = ({ moduleName }) => {
  return (
    <header className="module-header-modern">
      <div className="header-nav">
        <Link to="/factory" className="back-link-glass">
          <span className="icon">←</span>
          <span>Panel General</span>
        </Link>
      </div>
      
      <div className="header-content">
        <div className="title-group">
          <h1 className="exec-title">Área: {moduleName}</h1>
          <p className="header-subtitle">
            Análisis de Producción en Tiempo Real • {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          EN VIVO
        </div>
      </div>
    </header>
  );
};

export default ModuleHeader;
