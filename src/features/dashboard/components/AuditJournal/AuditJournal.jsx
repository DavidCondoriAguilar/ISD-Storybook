import React, { memo } from 'react';
import { ClipboardList, Search, History, ChevronRight, TrendingUp } from 'lucide-react';
import { getModuleName, getProductName, formatDate, formatHours } from '../../../../utils/formatters';
import { Pagination } from '../common/Pagination/Pagination';
import './AuditJournal.css';

export const AuditJournal = memo(({ 
  records, 
  filteredRecords,
  displayedRecords,
  showHistory, 
  onToggleHistory,
  filterText,
  onFilterTextChange,
  filterModule,
  onFilterModuleChange,
  areaBreakdown,
  lastImportFileName,
  paginationProps
}) => {
  return (
    <div className="master-table-pane">
      <div className="table-header-custom">
        <div className="header-top-row">
          <div className="header-title-group">
            <div className="title-icon-wrapper">
              <ClipboardList size={28} color="white" />
            </div>
            <div>
              <h2 className="header-title">Diario de Auditoría Maestro</h2>
              <p className="header-subtitle">
                {showHistory 
                  ? `Consolidado Global: ${filteredRecords.length} registros en historial` 
                  : `Lote en Línea: ${lastImportFileName || 'Sincronizado'}`}
              </p>
            </div>
          </div>

          <div className="header-actions">
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input glass"
                placeholder="Filtrar operador..."
                value={filterText}
                onChange={(e) => onFilterTextChange(e.target.value)}
              />
            </div>

            <select
              value={filterModule}
              className="module-select glass"
              onChange={(e) => onFilterModuleChange(e.target.value)}
            >
              <option value="all">Filtro Planta: Todo</option>
              {areaBreakdown?.map(area => (
                <option key={area.name} value={area.name}>{area.name}</option>
              ))}
            </select>

            <button
              onClick={onToggleHistory}
              className="toggle-history-btn glass"
            >
              {showHistory ? <ChevronRight size={18} /> : <History size={18} />}
              <span>{showHistory ? 'Lote Actual' : 'Histórico'}</span>
            </button>
          </div>
        </div>

        {/* Executive Health Pulse Bar */}
        <div className="executive-health-bar">
           <div className="health-stat">
              <div className="pulse-indicator success"></div>
              <span className="stat-label">DISPONIBILIDAD:</span>
              <span className="stat-value">98.2%</span>
           </div>
           <div className="health-stat">
              <div className="pulse-indicator warning"></div>
              <span className="stat-label">OEE PROMEDIO:</span>
              <span className="stat-value">{paginationProps.totalRecords > 0 ? "84.5%" : "0%"}</span>
           </div>
           <div className="health-stat">
              <div className="pulse-indicator info"></div>
              <span className="stat-label">SINCRONIZACIÓN:</span>
              <span className="stat-value">ACTIVA</span>
           </div>
        </div>
      </div>

      {/* <Pagination {...paginationProps} /> */}

      <div className="table-scrollable glass">
        <table className="history-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Centro de Operación</th>
              <th>Producto & SKU</th>
              <th>Operador Especialista</th>
              <th className="text-center">Producción Bruta</th>
              <th className="text-center">Eficiencia</th>
              <th>Registro Cronológico</th>
              <th className="text-right">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {displayedRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state-cell">
                  Sincronización pendiente: Esperando datos del sistema central.
                </td>
              </tr>
            ) : displayedRecords.map((r, i) => {
              const hours = parseFloat(r.jornadaTotalHoras) || 8;
              const uphValue = r.cantidad / hours;
              const uphFormatted = r.unidadOriginal === 'millar' 
                ? `${(r.cantidadOriginal / hours).toFixed(2)} k/h`
                : `${uphValue.toFixed(1)} u/h`;
              return (
                <tr key={r.idLocal || i}>
                  <td className="row-num-cell" style={{ fontSize: '10px', opacity: 0.5, fontWeight: 'bold' }}>
                    {(paginationProps?.currentPage - 1) * paginationProps?.itemsPerPage + i + 1}
                  </td>
                  <td style={{ width: '18%' }}>
                    <div className="cell-column">
                      <span className="module-name">{getModuleName(r.moduloId)}</span>
                      <span className="machine-id">{r.maquinaId || 'Proceso Manual'}</span>
                    </div>
                  </td>
                  <td style={{ width: '22%' }}>
                    <div className="cell-column">
                      <span className="product-name">{r.productoNombre || getProductName(r.productoId)}</span>
                      <span className="sku-id">{r.productoId}</span>
                    </div>
                  </td>
                  <td style={{ width: '18%' }}>
                    <div className="worker-cell">
                      <div className="worker-avatar">
                        {(r.trabajadorNombre || 'S').charAt(0)}
                      </div>
                      <div className="cell-column">
                        <span className="worker-name">{r.trabajadorNombre}</span>
                        <span className="worker-metric">{uphFormatted}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: '12%', textAlign: 'center' }}>
                    <div className="production-cell">
                      <span className="production-qty">
                        {r.unidadOriginal === 'millar' ? r.cantidadOriginal.toLocaleString() : r.cantidad.toLocaleString()}
                      </span>
                      <span className="production-unit">{r.unidadOriginal || 'unidades'}</span>
                      {r.unidadOriginal === 'millar' && (
                        <span className="net-units">({r.cantidad.toLocaleString()} u. netas)</span>
                      )}
                    </div>
                  </td>
                  <td style={{ width: '10%', textAlign: 'center' }}>
                    <div className={`efficiency-badge ${r.eficiencia >= 80 ? 'high' : r.eficiencia >= 50 ? 'med' : 'low'}`}>
                      <span className="eff-value">{r.eficiencia || 0}%</span>
                      {r.eficiencia > 90 && <TrendingUp size={12} />}
                    </div>
                  </td>
                  <td style={{ width: '10%' }}>
                    <div className="cell-column">
                      <span className="hours-total">{formatHours(r.jornadaTotalHoras)}</span>
                      <span className="record-date">{formatDate(r.fechaTimestamp)}</span>
                      {r.fileName && <div className="source-tag">src: {r.fileName}</div>}
                    </div>
                  </td>
                  <td style={{ width: '10%', textAlign: 'right' }}>
                    <span className={`badge ${r.tipoJornada === 'Estándar' ? 'badge-success' : 'badge-danger'}`}>
                      {r.tipoJornada}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* <Pagination {...paginationProps} /> */}
    </div>
  );
});
