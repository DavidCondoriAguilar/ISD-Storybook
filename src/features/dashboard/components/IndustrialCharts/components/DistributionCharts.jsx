import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid
} from 'recharts';
import { ChartBox, formatNumber, formatMachineUnit } from './SharedComponents';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

const CustomAccTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: 'none', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', color: 'white' }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>{label}</p>
        {payload.map((entry, index) => {
          const isResorte = entry.dataKey === 'accResortes';
          const name = isResorte ? 'Resortes' : entry.dataKey === 'accPaneles' ? 'Paneles' : 'Procesos';
          const formattedVal = isResorte 
            ? `${(entry.value / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} Millares` 
            : `${entry.value.toLocaleString('es-PE')} Unidades`;
            
          return (
            <p key={index} style={{ margin: '4px 0', color: entry.color, fontWeight: 700, fontSize: '0.85rem' }}>
              {name}: {formattedVal}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export const AccumulatedEvolution = ({ data }) => (
  <ChartBox title="Crecimiento de Lote por Tipo" subtitle="Acumulación progresiva del lote de producción actual">
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPaneles" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorResortes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorProcesos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip content={<CustomAccTooltip />} />
        <Area type="monotone" dataKey="accResortes" stroke="#8b5cf6" fill="url(#colorResortes)" strokeWidth={2} />
        <Area type="monotone" dataKey="accPaneles" stroke="#6366f1" fill="url(#colorPaneles)" strokeWidth={2} />
        <Area type="monotone" dataKey="accProcesos" stroke="#10b981" fill="url(#colorProcesos)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </ChartBox>
);

const CustomMachineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { units, unitType, name } = payload[0].payload;
    return (
      <div style={{ background: '#1e293b', border: 'none', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', color: 'white' }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>{name}</p>
        <p style={{ margin: '4px 0 0', color: '#6366f1', fontWeight: 900 }}>
          {formatMachineUnit(units, unitType)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomWorkerTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#1e293b', border: 'none', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', color: 'white', minWidth: '180px' }}>
        <p style={{ margin: 0, fontWeight: 950, fontSize: '1rem', color: '#6366f1', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>{label}</p>
        
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Rendimiento</p>
          <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, color: '#10b981' }}>{data.efficiency.toFixed(1)} <span style={{ fontSize: '0.7rem' }}>u/h</span></p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.paneles > 0 && (
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#6366f1' }}>
              Paneles: <span style={{ color: 'white' }}>{data.paneles.toLocaleString()} u.</span>
            </p>
          )}
          {data.resortes > 0 && (
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>
              Resortes: <span style={{ color: 'white' }}>{data.resortes.toLocaleString('es-PE', { maximumFractionDigits: 1 })} k.</span>
            </p>
          )}
          {data.procesos > 0 && (
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
              Procesos: <span style={{ color: 'white' }}>{data.procesos.toLocaleString()} u.</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const MachineVolume = ({ dataPaneles, dataResortes }) => (
  <ChartBox title="Volumen por Máquina" subtitle="Paneles (Unidades) vs Resortes (Millares)">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div>
        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', marginBottom: '10px' }}>Línea Paneleras (MP)</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dataPaneles}>
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis tickFormatter={formatNumber} hide />
            <Tooltip content={<CustomMachineTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="units" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '10px' }}>Línea Resorteras (MR)</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dataResortes}>
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis tickFormatter={(v) => formatNumber(v / 1000)} hide />
            <Tooltip content={<CustomMachineTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="units" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </ChartBox>
);

export const WorkerRanking = ({ data }) => (
  <ChartBox title="Ranking de Eficiencia" subtitle="Rendimiento promedio en Unidades/Hora (Normalizado)">
    <ResponsiveContainer width="100%" height={450}>
      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 60 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          type="number" 
          domain={[0, 100]}
          hide 
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          tick={{ fontSize: 11, fontWeight: 800, fill: '#f8fafc' }} 
          width={110} 
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomWorkerTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        
        <Bar 
          dataKey="visualScore" 
          name="Eficiencia" 
          fill="#6366f1" 
          radius={[0, 4, 4, 0]} 
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartBox>
);

export const ProductMix = ({ dataPaneles, dataResortes }) => (
  <ChartBox title="Distribución de Productos" subtitle="Variedad de SKUs por línea de producción">
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Paneles Section */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '15px', textAlign: 'left', fontWeight: 800 }}>Mix Paneles (u.)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={dataPaneles}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              cx="40%"
            >
              {dataPaneles.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v.toLocaleString('es-PE')} Unidades`} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ fontSize: '10px', paddingLeft: '10px', lineHeight: '18px', width: '45%' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Resortes Section */}
      <div>
        <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '15px', textAlign: 'left', fontWeight: 800 }}>Mix Resortes (k.)</h4>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={dataResortes}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              cx="40%"
            >
              {dataResortes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${(v / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} Millares`} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ fontSize: '10px', paddingLeft: '10px', lineHeight: '18px', width: '45%' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  </ChartBox>
);
