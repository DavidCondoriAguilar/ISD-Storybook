import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartBox, formatNumber, formatMachineUnit } from './SharedComponents';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

export const ProductionTimeline = ({ data, machines }) => {
  // Senior Logic: Segregate machines by scale for Dual Axis visualization
  const unitMachines = machines.filter(m => !m.toLowerCase().includes('resortes'));
  const millarMachines = machines.filter(m => m.toLowerCase().includes('resortes'));

  return (
    <ChartBox title="Línea Temporal por Máquina" subtitle="Escala Dual: Unidades (Eje Izq.) | Millares (Eje Der.)">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} />
          
          {/* Left Axis: Units (Paneles/Others) */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            tickFormatter={formatNumber} 
            axisLine={false} 
            label={{ value: 'Unidades', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
          />
          
          {/* Right Axis: Millares (Resortes) */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={(v) => formatNumber(v / 1000)} 
            axisLine={false} 
            label={{ value: 'Millares', angle: 90, position: 'insideRight', fill: 'var(--primary)', fontSize: 10, fontWeight: 700 }}
          />

          <Tooltip 
            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} 
            formatter={(v, name) => [formatMachineUnit(v, name), name]}
          />
          <Legend iconType="circle" />

          {/* Unit Lines (Left Axis) */}
          {unitMachines.map((m, i) => (
            <Line 
              key={m} 
              yAxisId="left"
              type="monotone" 
              dataKey={m} 
              stroke={COLORS[i % COLORS.length]} 
              strokeWidth={3} 
              dot={false} 
              connectNulls 
            />
          ))}

          {/* Millar Lines (Right Axis) */}
          {millarMachines.map((m, i) => (
            <Line 
              key={m} 
              yAxisId="right"
              type="monotone" 
              dataKey={m} 
              stroke={COLORS[(i + unitMachines.length) % COLORS.length]} 
              strokeWidth={3} 
              strokeDasharray="5 5" // Distinction for millares
              dot={false} 
              connectNulls 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartBox>
  );
};

