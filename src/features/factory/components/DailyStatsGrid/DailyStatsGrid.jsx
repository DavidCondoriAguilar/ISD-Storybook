import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DailyStatsGrid.css';

const DailyStatCard = ({ day }) => (
  <div className="stat-card-premium">
    <div className="card-top">
      <span className="card-date">{day.date}</span>
      <div className="ops-badge">
        <span className="count">{day.workers}</span>
        <span className="label">ops.</span>
      </div>
    </div>
    
    <div className="card-body">
      <div className="metric-row">
        <div className="metric-info">
          <span className="dot panel"></span>
          <span className="label">PANELES</span>
        </div>
        <div className="metric-value">
          <span className="num">{(day.mp?.total ?? 0).toLocaleString()}</span>
          <span className="unit">u.</span>
        </div>
      </div>
      
      <div className="metric-row">
        <div className="metric-info">
          <span className="dot resorte"></span>
          <span className="label">RESORTES</span>
        </div>
        <div className="metric-value">
          <span className="num">{(day.mr?.total ?? 0).toFixed(1)}</span>
          <span className="unit">mil.</span>
        </div>
      </div>
    </div>
  </div>
);

const DailyStatsGrid = ({ stats }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 999999, behavior: 'auto' });
    }
  }, [stats]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: dir === 'right' ? 999999 : 0, behavior: 'smooth' });
    }
  };

  if (!stats || stats.length === 0) {
    return (
      <section className="stats-section-carousel">
        <div className="section-header-carousel">
          <div className="skeleton" style={{ width: '120px', height: '14px' }}></div>
        </div>
        <div className="stats-scroll-container">
          <div className="daily-grid-flex">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="stat-card-premium skeleton" style={{ height: '100px' }}></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="stats-section-carousel">
      <div className="section-header-carousel">
        <h2 className="section-label">Resumen de Historial</h2>
        <div className="carousel-controls">
          <button 
            className="carousel-btn" 
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={14} />
          </button>
          <button 
            className="carousel-btn" 
            onClick={() => scroll('right')}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="stats-scroll-container" ref={scrollRef}>
        <motion.div 
          className="daily-grid-flex"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {stats.map(day => (
            <DailyStatCard key={day.date} day={day} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DailyStatsGrid;
