import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts'
import { 
  TrendingUp, Users, Cpu, Activity, 
  Award, Layers, PieChart as PieIcon 
} from 'lucide-react'
import { db } from '../../../data/db'
import { analyticsService } from '../services/analyticsService'
import { formatMetric } from '../../../utils/formatters'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ExecutiveDashboard = () => {
  const records = useLiveQuery(() => db.records.toArray()) || [];

  const stats = useMemo(() => analyticsService.getExecutiveKPIs(records), [records]);
  const trendData = useMemo(() => analyticsService.getProductionTrend(records), [records]);
  const { topPaneleros, topResorteros } = useMemo(() => analyticsService.getWorkerRankings(records), [records]);
  const productMix = useMemo(() => analyticsService.getProductMix(records), [records]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="exec-dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="exec-header">
        <div>
          <h1 className="exec-title">Dashboard de <span className="highlight">Gerencia Industrial</span></h1>
          <p className="exec-subtitle">Análisis avanzado de rendimiento y flujo de producción.</p>
        </div>
        <div className="live-indicator">
          <span className="dot"></span> LIVE DATA
        </div>
      </header>

      {/* KPI Cards Row */}
      <div className="stats-grid">
        <KPICard title="Producción Total" value={formatMetric(stats.totalUnits)} icon={<Activity />} color="blue" />
        <KPICard title="Fuerza Laboral" value={stats.uniqueWorkers} icon={<Users />} color="green" />
        <KPICard title="Carga Máquinas" value={stats.activeMachines} icon={<Cpu />} color="orange" />
        <KPICard title="Total Registros" value={stats.totalRecords} icon={<TrendingUp />} color="purple" />
      </div>

      <div className="charts-main-grid">
        {/* Trend Analysis */}
        <motion.div className="chart-container glass" variants={itemVariants} style={{ gridColumn: 'span 2' }}>
          <div className="chart-header">
            <Layers size={20} />
            <h3>Tendencia de Producción (Mix de Planta)</h3>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPaneles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResortes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => formatMetric(val)} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="paneles" name="Paneles (u.)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPaneles)" strokeWidth={3} />
                <Area type="monotone" dataKey="resortes" name="Resortes (mil.)" stroke="#10b981" fillOpacity={1} fill="url(#colorResortes)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Performers (Panels) */}
        <motion.div className="chart-container glass" variants={itemVariants}>
          <div className="chart-header">
            <Award size={20} style={{ color: '#3b82f6' }} />
            <h3>Top 5 Operarios: Paneles (u.)</h3>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPaneleros} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val) => [`${val.toLocaleString()} u.`, 'Producción']}
                />
                <Bar dataKey="total" name="Unidades" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Performers (Springs) */}
        <motion.div className="chart-container glass" variants={itemVariants}>
          <div className="chart-header">
            <Award size={20} style={{ color: '#10b981' }} />
            <h3>Top 5 Operarios: Resortes (mil.)</h3>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topResorteros} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val) => [`${val.toLocaleString()} mil.`, 'Volumen']}
                />
                <Bar dataKey="total" name="Millares" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Product Mix */}
        <motion.div className="chart-container glass" variants={itemVariants} style={{ gridColumn: 'span 2' }}>
          <div className="chart-header">
            <PieIcon size={20} />
            <h3>Distribución por Tipo de Colchón</h3>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <style>{`
        .exec-dashboard {
          padding: 24px;
          --accent: #3b82f6;
          --bg-card: rgba(255, 255, 255, 0.03);
          --border: rgba(255, 255, 255, 0.08);
        }

        .exec-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .exec-title { font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; margin: 0; }
        .exec-title .highlight { color: var(--accent); }
        .exec-subtitle { color: #64748b; font-size: 0.9rem; margin-top: 4px; }

        .live-indicator {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .live-indicator .dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .kpi-card-exec {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 20px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          backdrop-filter: blur(10px);
        }

        .kpi-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .kpi-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .kpi-icon.orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .kpi-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

        .kpi-info .label { display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .kpi-info .value { display: block; font-size: 1.5rem; font-weight: 900; }

        .charts-main-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .chart-container {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 24px;
          backdrop-filter: blur(10px);
          min-width: 0;
          overflow: hidden;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          color: #94a3b8;
        }
        .chart-header h3 { font-size: 1rem; font-weight: 800; margin: 0; color: #f1f5f9; }

        @media (max-width: 1024px) {
          .charts-main-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </motion.div>
  );
};

const KPICard = ({ title, value, icon, color }) => (
  <motion.div 
    className="kpi-card-exec"
    whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
  >
    <div className={`kpi-icon ${color}`}>{icon}</div>
    <div className="kpi-info">
      <span className="label">{title}</span>
      <span className="value">{value}</span>
    </div>
  </motion.div>
);

export default ExecutiveDashboard;
