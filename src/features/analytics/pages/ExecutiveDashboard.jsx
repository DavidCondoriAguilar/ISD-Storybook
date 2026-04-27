import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, Sector
} from 'recharts'
import { 
  TrendingUp, Users, Cpu, Activity, 
  Award, Layers, PieChart as PieIcon, Settings,
  Filter, Calendar, ChevronDown, Zap, Clock, Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { db } from '../../../data/db'
import { analyticsService } from '../services/analyticsService'
import { formatMetric } from '../../../utils/formatters'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#f1f5f9" style={{ fontSize: '16px', fontWeight: 'bold' }}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#94a3b8" style={{ fontSize: '11px' }}>{`${value.toLocaleString()} u.`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={16} textAnchor={textAnchor} fill="#64748b" style={{ fontSize: '10px' }}>
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const ExecutiveDashboard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeRange, setTimeRange] = useState(7); // Default 7 days
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const rawRecords = useLiveQuery(() => db.records.toArray()) || [];

  // Filter logic
  const filteredRecords = useMemo(() => {
    if (timeRange === 'all') return rawRecords;
    const cutoff = subDays(new Date(), timeRange);
    return rawRecords.filter(r => r.fechaTimestamp >= cutoff.getTime());
  }, [rawRecords, timeRange]);

  const stats = useMemo(() => analyticsService.getExecutiveKPIs(filteredRecords), [filteredRecords]);
  const advStats = useMemo(() => analyticsService.getAdvancedMetrics(filteredRecords), [filteredRecords]);
  const trendData = useMemo(() => analyticsService.getProductionTrend(filteredRecords), [filteredRecords]);
  const { topPaneleros, topResorteros } = useMemo(() => analyticsService.getWorkerRankings(filteredRecords), [filteredRecords]);
  const productMix = useMemo(() => analyticsService.getProductMix(filteredRecords), [filteredRecords]);
  const machineStats = useMemo(() => analyticsService.getMachineStats(filteredRecords), [filteredRecords]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
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
        <div className="header-left">
          <h1 className="exec-title">Dashboard <span className="highlight">Estratégico ISD</span></h1>
          <p className="exec-subtitle">Inteligencia Industrial v2.0 • Planta San Juan</p>
        </div>
        
        <div className="header-actions">
          <div className="filter-dropdown">
            <button className="filter-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Calendar size={18} />
              <span>{timeRange === 'all' ? 'Historial Completo' : `Últimos ${timeRange} días`}</span>
              <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  className="filter-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button onClick={() => { setTimeRange(1); setIsFilterOpen(false); }}>Hoy</button>
                  <button onClick={() => { setTimeRange(7); setIsFilterOpen(false); }}>Últimos 7 días</button>
                  <button onClick={() => { setTimeRange(30); setIsFilterOpen(false); }}>Últimos 30 días</button>
                  <button onClick={() => { setTimeRange('all'); setIsFilterOpen(false); }}>Todo el tiempo</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="live-indicator">
            <span className="dot"></span> LIVE
          </div>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <div className="stats-grid">
        <KPICard title="Producción Total" value={formatMetric(stats.totalUnits)} icon={<Activity />} color="blue" trend="+12.5%" />
        <KPICard title="Operarios Activos" value={stats.uniqueWorkers} icon={<Users />} color="green" />
        <KPICard title="Utilización Máq." value={stats.activeMachines} icon={<Cpu />} color="orange" />
        <KPICard title="Audit Log" value={stats.totalRecords} icon={<TrendingUp />} color="purple" />
      </div>

      {/* Advanced Senior Metrics Row */}
      <div className="advanced-stats-row">
        <AdvMetricCard 
          label="Cierre Hoy (Día)" 
          value={formatMetric(advStats.todayTotal)} 
          icon={<Zap size={18} />} 
          sub={
            <span className={advStats.variationVsYesterday >= 0 ? 'up' : 'down'}>
              {advStats.variationVsYesterday >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(advStats.variationVsYesterday)}% vs ayer
            </span>
          }
        />
        <AdvMetricCard 
          label="Promedio U/H" 
          value={`${advStats.avgUnitsPerHour} u.`} 
          icon={<Clock size={18} />} 
          sub="Eficiencia Plant-Wide"
        />
        <AdvMetricCard 
          label="MVP Operario" 
          value={advStats.topWorkerName} 
          icon={<Star size={18} />} 
          sub="Líder de Producción"
          isHighlight
        />
      </div>

      <div className="charts-main-grid">
        {/* Trend Analysis */}
        <motion.div className="chart-container glass" variants={itemVariants} style={{ gridColumn: 'span 2' }}>
          <div className="chart-header">
            <Layers size={20} />
            <h3>Dinámica de Planta (MP vs MR)</h3>
          </div>
          <div className="chart-content" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPaneles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResortes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => formatMetric(val)} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="paneles" name="Paneles (u.)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPaneles)" strokeWidth={2} />
                <Area type="monotone" dataKey="resortes" name="Resortes (mil.)" stroke="#10b981" fillOpacity={1} fill="url(#colorResortes)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Performers (Panels) */}
        <motion.div className="chart-container glass" variants={itemVariants}>
          <div className="chart-header">
            <Award size={18} style={{ color: '#3b82f6' }} />
            <h3>Top MP - Paneleras (u.)</h3>
          </div>
          <div className="chart-content" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPaneleros} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '11px' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Performers (Springs) */}
        <motion.div className="chart-container glass" variants={itemVariants}>
          <div className="chart-header">
            <Award size={18} style={{ color: '#10b981' }} />
            <h3>Top MR - Resorteras (mil.)</h3>
          </div>
          <div className="chart-content" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topResorteros} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '11px' }} />
                <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Product Mix */}
        <motion.div className="chart-container glass" variants={itemVariants}>
          <div className="chart-header">
            <PieIcon size={18} />
            <h3>Mix de Productos</h3>
          </div>
          <div className="chart-content" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={productMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {productMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Machine Performance */}
        <motion.div className="chart-container glass" variants={itemVariants}>
          <div className="chart-header">
            <Settings size={18} />
            <h3>Rendimiento de Máquinas</h3>
          </div>
          <div className="chart-content" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => formatMetric(val)} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }} />
                <Bar dataKey="total" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <style>{`
        .exec-dashboard { padding: 24px; color: #f8fafc; }
        
        .exec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .exec-title { font-size: 1.8rem; font-weight: 800; margin: 0; }
        .exec-title .highlight { color: #3b82f6; }
        .exec-subtitle { color: #64748b; font-size: 0.85rem; margin: 2px 0 0; }

        .header-actions { display: flex; align-items: center; gap: 16px; }
        
        .filter-dropdown { position: relative; }
        .filter-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f1f5f9;
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .filter-btn:hover { background: rgba(255,255,255,0.1); }
        
        .filter-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 8px;
          width: 180px;
          z-index: 100;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
        }
        .filter-menu button {
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: #94a3b8;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .filter-menu button:hover { background: rgba(255,255,255,0.05); color: #f1f5f9; }

        .live-indicator {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .live-indicator .dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; }
        
        .advanced-stats-row { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 20px; 
          margin-bottom: 32px; 
        }

        .adv-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .adv-card.highlight {
          background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%);
          border-color: rgba(59,130,246,0.3);
        }
        .adv-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }
        .adv-card.highlight .adv-icon-box { color: #3b82f6; background: rgba(59,130,246,0.1); }
        
        .adv-content .label { display: block; font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
        .adv-content .value { display: block; font-size: 1.3rem; font-weight: 800; color: #f1f5f9; }
        .adv-content .sub { font-size: 0.75rem; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
        .adv-content .sub .up { color: #10b981; display: flex; align-items: center; }
        .adv-content .sub .down { color: #ef4444; display: flex; align-items: center; }

        .charts-main-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .chart-container {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 24px;
          backdrop-filter: blur(10px);
          min-height: 320px;
          display: flex;
          flex-direction: column;
        }
        .chart-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .chart-header h3 { font-size: 0.95rem; font-weight: 700; color: #f1f5f9; margin: 0; }
        .chart-content { flex: 1; width: 100%; min-height: 200px; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        @media (max-width: 1024px) {
          .charts-main-grid { grid-template-columns: 1fr; }
          .advanced-stats-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </motion.div>
  );
};

const KPICard = ({ title, value, icon, color }) => (
  <motion.div className="kpi-card-exec" whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)' }}>
    <div className={`kpi-icon ${color}`}>{icon}</div>
    <div className="kpi-info">
      <span className="label">{title}</span>
      <span className="value">{value}</span>
    </div>
  </motion.div>
);

const AdvMetricCard = ({ label, value, icon, sub, isHighlight }) => (
  <motion.div className={`adv-card ${isHighlight ? 'highlight' : ''}`} whileHover={{ scale: 1.02 }}>
    <div className="adv-icon-box">{icon}</div>
    <div className="adv-content">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      <div className="sub">{sub}</div>
    </div>
  </motion.div>
);

export default ExecutiveDashboard;
