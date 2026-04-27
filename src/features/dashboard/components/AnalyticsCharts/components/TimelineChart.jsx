import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const TimelineChart = ({ data, machines, variants }) => {
  return (
    <div className="clean-card large-span">
      <div className="card-header">
        <div className="icon-box primary">
          <Calendar size={20} />
        </div>
        <div>
          <h3>Línea Temporal de Producción</h3>
          <p>Evolución diaria segmentada por centro de operación</p>
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%" minHeight={350}>
          <AreaChart data={data}>
            <defs>
              {machines.map((m, i) => (
                <linearGradient key={m} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} 
            />
            <Tooltip 
              contentStyle={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
              itemStyle={{ fontWeight: 800 }}
            />
            <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800 }} />
            {machines.map((machine, i) => (
              <Area 
                key={machine}
                type="monotone"
                dataKey={machine}
                stackId="1"
                stroke={COLORS[i % COLORS.length]}
                fill={`url(#grad-${i})`}
                strokeWidth={3}
                connectNulls={true}
                animationDuration={1500}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
