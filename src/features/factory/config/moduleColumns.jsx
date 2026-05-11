import React from 'react';

/**
 * Configuración de columnas para la DataTable de Auditoría Industrial.
 * Extraído para mejorar la mantenibilidad y permitir pruebas unitarias.
 */
export const getProductionColumns = () => [
  { 
    key: 'fechaLegible',    
    label: 'FECHA',      
    width: '65px',
    render: (v) => <span className="date-cell">{v?.split('-').slice(1).reverse().join('/')}</span> 
  },
  { 
    key: 'productoNombre',  
    label: 'PRODUCTO',   
    width: '210px',
    render: (v) => <div className="product-name" title={v}>{v}</div> 
  },
  { 
    key: 'area',            
    label: 'ÁREA',       
    width: '90px',
    render: (v) => <span className="area-badge">{v?.toUpperCase()}</span> 
  },
  { 
    key: 'trabajadorNombre',
    label: 'TRABAJADOR', 
    width: '105px',
    render: (v) => <span className="operator-name">{v}</span> 
  },
  { 
    key: 'outputMaquina',   
    label: 'OUTPUT',     
    width: '95px', 
    align: 'right',
    render: (v) => <div className="output-cell mono-data">{v?.toLocaleString() || '0'}</div> 
  },
  { 
    key: 'cantidad',        
    label: 'TOTAL',      
    width: '95px', 
    align: 'right',
    render: (v, r) => (
      <div className="production-cell">
        <span className={`production-value ${r.moduloId?.toLowerCase() === 'resortes' ? 'resorte' : 'panel'}`}>
          {r.moduloId?.toLowerCase() === 'resortes' ? (v / 1000).toFixed(3) : v}
        </span>
        <span className="unit-label">{r.moduloId?.toLowerCase() === 'resortes' ? 'mil.' : 'u.'}</span>
      </div>
    )
  },
  { 
    key: 'maquinaId', 
    label: 'MÁQUINA', 
    width: '80px', 
    align: 'center',
    render: (v) => <div className="machine-chip">{v || 'N/A'}</div> 
  },
];
