import React from 'react';
import { getTopPaneleros } from '../modules/paneles';
import { getTelasStats } from '../modules/telas';

/**
 * Ejemplo de cómo la capa de 'pages' une múltiples módulos.
 */
const ProductionDashboard = ({ records }) => {
  const topPaneleros = getTopPaneleros(records);
  const telasStats = getTelasStats(records);

  return (
    <div className="production-dashboard">
      <h1>Panel de Producción Integral</h1>
      
      <section>
        <h2>Área de Paneles</h2>
        <ul>
          {topPaneleros.map(w => (
            <li key={w.name}>{w.name}: {w.total} unidades</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Área de Telas</h2>
        <p>Total producidos: {telasStats.totalQuantity}</p>
      </section>
    </div>
  );
};

export default ProductionDashboard;
