
import React from 'react';
import * as dateFns from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartBox, formatMachineUnit } from './SharedComponents';

export const ProductionHeatmap = ({ dailyStats, machines }) => {
  const days = Object.keys(dailyStats).sort();
  
  // Senior Logic: Dynamic Normalization per Machine Type
  const typeMax = {
    paneles: 0,
    resortes: 0
  };

  machines.forEach(m => {
    const isResorte = m.toLowerCase().includes('resorte');
    days.forEach(d => {
      const val = dailyStats[d][m] || 0;
      if (isResorte) typeMax.resortes = Math.max(typeMax.resortes, val);
      else typeMax.paneles = Math.max(typeMax.paneles, val);
    });
  });

  return (
    <ChartBox title="Mapa de Calor: Intensidad de Producción" subtitle="Días vs Máquinas (Normalizado por Capacidad)">
      <div style={{ overflowX: 'auto', padding: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${days.length}, 1fr)`, gap: '6px', minWidth: '850px' }}>
          <div />
          {days.map(d => (
            <div key={d} style={{ fontSize: '9px', fontWeight: 900, textAlign: 'center', color: 'var(--text-muted)', textTransform: 'capitalize', paddingBottom: '8px' }}>
              {dateFns.format(dateFns.parse(d, 'yyyy-MM-dd', new Date()), 'dd MMM', { locale: es })}
            </div>
          ))}
          
          {machines.map(m => {
            const isResorte = m.toLowerCase().includes('resorte');
            const max = isResorte ? typeMax.resortes : typeMax.paneles;

            return (
              <React.Fragment key={m}>
                <div style={{ fontSize: '11px', fontWeight: 850, color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>{m}</div>
                {days.map(d => {
                  const val = dailyStats[d][m] || 0;
                  // Intensity 0 to 1 based on the maximum of its category
                  const intensity = max > 0 ? (val / max) : 0; 
                  
                  return (
                    <div 
                      key={`${m}-${d}`} 
                      title={`${m} | ${d}: ${formatMachineUnit(val, m)}`}
                      className="heatmap-cell"
                      style={{ 
                        height: '32px', 
                        borderRadius: '6px', 
                        background: val > 0 ? `rgba(99, 102, 241, ${0.1 + (intensity * 0.9)})` : 'rgba(255,255,255,0.03)',
                        boxShadow: intensity > 0.8 ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none',
                        border: intensity > 0.9 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                        cursor: 'help',
                        transition: 'all 0.2s ease'
                      }} 
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </ChartBox>
  );
};
