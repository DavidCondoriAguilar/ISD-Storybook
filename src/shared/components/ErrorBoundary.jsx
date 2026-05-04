import React from 'react';

/**
 * ErrorBoundary Genérico para robustez ejecutiva.
 * Evita que un error en un módulo tumbe toda la aplicación.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado por Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback glass">
          <div className="error-icon">⚠️</div>
          <h3>Algo salió mal en este módulo</h3>
          <p>La sección "{this.props.name || 'Componente'}" no pudo cargar correctamente.</p>
          <button 
            className="retry-btn"
            onClick={() => this.setState({ hasError: false })}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
