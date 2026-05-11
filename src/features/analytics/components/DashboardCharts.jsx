import { memo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Layers, Activity, Cpu, Zap, Settings, Award } from 'lucide-react';
import { ChartCard } from '../components/ChartCard';
import { formatMetric } from '../../../utils/formatters';
import '../styles/DashboardCharts.css';

/**
 * Tooltip Personalizado de Alta Visibilidad
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="tooltip-row">
            <div className="tooltip-dot" style={{ background: p.color, color: p.color }} />
            <span className="tooltip-value">
              {p.value.toLocaleString()} 
              <span className="tooltip-unit">{p.name}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


export const DashboardCharts = memo(({ trendData, topPaneleros, topResorteros, machineStatsMP, machineStatsMR }) => (
  <div className="charts-main-grid">
    <ChartCard title="Dinámica de Planta (MP vs MR)" icon={<Layers size={20} />} span={2}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="colorPaneles" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorResortes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" stroke="var(--text-dim)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--primary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}u`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--success)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => formatMetric(val)} />
          <Tooltip content={<CustomTooltip />} />
          <Area yAxisId="left" type="monotone" dataKey="paneles" name="u." stroke="var(--primary)" fill="url(#colorPaneles)" strokeWidth={2} isAnimationActive={false} />
          <Area yAxisId="right" type="monotone" dataKey="resortes" name="mil." stroke="var(--success)" fill="url(#colorResortes)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Top MP - Unidades" icon={<Award size={18} color="var(--primary)" />}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={topPaneleros} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" stroke="var(--text-dim)" fontSize={10} width={90} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="paneles" name="u." fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Top MR - Millares" icon={<Award size={18} color="var(--success)" />}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={topResorteros} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" stroke="var(--text-dim)" fontSize={10} width={90} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="total" name="mil." fill="var(--success)" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Performance MP" icon={<Zap size={18} color="var(--primary)" />}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={machineStatsMP}>
          <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={9} axisLine={false} tickLine={false} />
          <YAxis stroke="var(--primary)" fontSize={9} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="total" name="u." fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Performance MR" icon={<Settings size={18} color="var(--success)" />}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={machineStatsMR}>
          <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={9} axisLine={false} tickLine={false} />
          <YAxis stroke="var(--success)" fontSize={9} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="total" name="mil." fill="var(--success)" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>
));
