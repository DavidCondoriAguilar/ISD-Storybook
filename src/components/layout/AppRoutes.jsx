import { Routes, Route, Navigate } from 'react-router-dom'
import { ImportProduction } from '../../features/import'
import { Dashboard } from '../../features/dashboard'
import ExecutiveDashboard from '../../features/analytics/pages/ExecutiveDashboard'
import { ComingSoon } from '../../shared'
import ModuleView from '../../pages/ModuleView'
import { NotFound } from '../ui/NotFound/NotFound'

export const AppRoutes = ({ onImportComplete }) => (
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
)
