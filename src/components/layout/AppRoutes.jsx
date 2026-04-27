import { Routes, Route, Navigate } from 'react-router-dom'
import { ImportProduction } from '../../features/import'
import { Dashboard } from '../../features/dashboard'
import ExecutiveDashboard from '../../features/analytics/pages/ExecutiveDashboard'
import { NotFound } from '../ui/NotFound/NotFound'

export const AppRoutes = ({ onImportComplete }) => (
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/analytics" element={<ExecutiveDashboard />} />
    <Route path="/import" element={<ImportProduction onImportComplete={onImportComplete} />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)
