import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Lazy loading de páginas para optimización de bundle (Lighthouse Performance)
const ExecutiveDashboard = lazy(() => import('../../features/analytics/pages/ExecutiveDashboard'))
const ImportProduction = lazy(() => import('../../features/import').then(m => ({ default: m.ImportProduction })))
const ModuleView = lazy(() => import('../../pages/ModuleView'))
const ComingSoon = lazy(() => import('../../shared').then(m => ({ default: m.ComingSoon })))
const NotFound = lazy(() => import('../ui/NotFound/NotFound').then(m => ({ default: m.NotFound })))

const PageSkeleton = () => (
  <div className="module-page-layout">
    <div className="page-content-restrictor skeleton-pulse-container" style={{ gap: '2.5rem' }}>
      {/* Header Skeleton: 140px */}
      <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }}></div>
      
      {/* Stats Skeleton: 200px */}
      <div className="skeleton" style={{ height: '200px', borderRadius: '16px' }}></div>
      
      {/* Audit Section Skeleton: 600px */}
      <div className="skeleton" style={{ height: '600px', borderRadius: '24px' }}></div>
    </div>
  </div>
);

export const AppRoutes = ({ onImportComplete }) => (
  <Suspense fallback={<PageSkeleton />}>
    <Routes>
      {/* Centro de Control Único (Fusión Senior) */}
      <Route path="/dashboard" element={<ExecutiveDashboard />} />
      <Route path="/import" element={<ImportProduction onImportComplete={onImportComplete} />} />
      
      {/* Auditoría Detallada de Módulos */}
      <Route path="/factory/:moduleId" element={<ModuleView />} />
      
      {/* Fallbacks */}
      <Route path="/telas" element={<ComingSoon moduleName="Telas" />} />
      <Route path="/pegado" element={<ComingSoon moduleName="Pegado" />} />
      <Route path="/sellado" element={<ComingSoon moduleName="Sellado" />} />
      <Route path="/quimicos" element={<ComingSoon moduleName="Químicos" />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
)
