/**
 * Contenedor Gráfico Industrial
 */
export const ChartBox = ({ title, subtitle, children }) => (
  <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)' }}>{title}</h3>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

/**
 * Tarjeta de Indicador (KPI)
 */
export const StatCard = ({ title, value, color, info }) => (
  <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', borderLeft: `6px solid ${color}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      <h2 style={{ margin: '4px 0 0', fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{value}</h2>
    </div>
    {info && <p style={{ margin: '12px 0 0', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, opacity: 0.8 }}>{info}</p>}
  </div>
);

/**
 * Formateador Numérico (Uso General)
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; // M de Millones
  if (num >= 1000) return (num / 1000).toFixed(1) + ' mil';
  return num.toLocaleString();
};

/**
 * Formateador Específico por Regla de Negocio (Sincronizado con Backend)
 * @param {number} value - Cantidad neta (cantidad)
 * @param {string} unit - Unidad del registro ('millar' | 'unidades')
 */
export const formatMachineUnit = (value, unit = 'unidades') => {
  if (value === undefined || value === null) return '0';

  const unitType = String(unit).toLowerCase();

  // Business Rule: Millares de Resortes se visualizan divididos por 1000 para legibilidad ejecutiva
  if (unitType === 'millar') {
    return `${(value / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} Millares`;
  }

  // Para Paneles y otros procesos manuales
  return `${value.toLocaleString('es-PE')} Unidades`;
};


