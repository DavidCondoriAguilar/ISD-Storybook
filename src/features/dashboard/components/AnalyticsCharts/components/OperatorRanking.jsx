import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Users } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <span className="tooltip-name">{payload[0].payload.name}</span>
        <span className="tooltip-value">{payload[0].value.toLocaleString()} <small>unidades</small></span>
      </div>
    );
  }
  return null;
};

export const OperatorRanking = ({ data }) => {
  return (
    <motion.div className="clean-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card-header">
        <div className="icon-box info">
          <Users size={20} />
        </div>
        <div>
          <h3>Ranking por Operador</h3>
          <p>Consistencia y volumen por especialista</p>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 800, fill: 'var(--text-main)' }} 
              width={80} 
            />
            {/* Customizing tooltip and cursor to avoid 'weird' behavior */}
            <Tooltip 
               content={<CustomTooltip />}
               cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
            />
            <Bar 
              dataKey="units" 
              radius={[0, 10, 10, 0]} 
              barSize={20}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
