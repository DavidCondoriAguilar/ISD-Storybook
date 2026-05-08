import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileDown, Loader2 } from 'lucide-react'
import { reportService } from '../services/reportService'

/**
 * ExecutiveHeader - Versión Ultra-Limpia.
 * Sin búsqueda y con alineación horizontal de filtros.
 */
export const ExecutiveHeader = ({
  children,
  analyticsData,
  dateRange
}) => {
  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!analyticsData) return;
    setExporting(true);
    try {
      await reportService.generateExecutiveReport(analyticsData, dateRange);
    } catch (error) {
      console.error('Error exportando PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="exec-header-v2">
      <div className="header-left-v2">
        <div className="badges-row">
          <span className="badge-primary">Planta Central</span>
          <span className="badge-outline">Centro de Control</span>
        </div>
        <h1 className="title-v2">Dashboard <span className="blue-text">Estratégico ISD</span></h1>
        <p className="subtitle-v2">Inteligencia Operativa • {currentMonth}</p>
      </div>

      <div className="header-right-v2">
        <div className="filters-group-v2">
          {children}
        </div>

        <button
          className="btn-export-pdf"
          onClick={handleExportPDF}
          disabled={exporting || !analyticsData}
          title="Exportar reporte PDF"
        >
          {exporting ? (
            <>
              <Loader2 size={16} className="spin" />
              Generando...
            </>
          ) : (
            <>
              <FileDown size={16} />
              Exportar PDF
            </>
          )}
        </button>

        <div className="status-badge-v2">
          <motion.span 
            className="dot-v2"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          EN VIVO
        </div>
      </div>
    </header>
  )
}
