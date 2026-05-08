# Recomendaciones de Rendimiento - react-best-practices

## Estado actual del proyecto
- Bundle: 1.3MB (grande, mayor parte por recharts + framer-motion)
- Build: ✅ Funciona correctamente
- Algunos componentes ya usan `memo`: Layout, DashboardCharts, ImportProduction, AuditJournal

## Optimizaciones aplicadas
⚠️ Los cambios con memo/useMemo en StatCards.jsx rompieron el build - revertidos.

## Optimizaciones recomendadas (aplicar manualmente)

### 1. Bundle Size (CRÍTICO - 200-800ms cold start)

**Problema:** Imports de librerías completo en lugar de solo lo necesario.

```jsx
// ❌ INCORRECTO - importa miles de módulos
import { Check, X, Menu, User, Settings, ... } from 'lucide-react'

// ✅ CORRECTO - importa solo lo usado
import Check from 'lucide-react/dist/esm/icons/check'
import Menu from 'lucide-react/dist/esm/icons/menu'
```

**Archivos a optimizar:**
- Sidebar.jsx
- StatCards.jsx
- DashboardHeader.jsx
- Y 35+ archivos más

### 2. Re-renders (MEDIUM)

**Problema:** Componentes que re-renderizan sin necesidad.

```jsx
// ❌ INCORRECTO
function StatCard({ value, label }) {
  return <div>{value}</div>
}

// ✅ CORRECTO - memoizar componentes estables
import { memo } from 'react'

const StatCard = memo(function StatCard({ value, label }) {
  return <div>{value}</div>
})
```

**Archivos a memoizar:**
- src/features/analytics/components/StatCards.jsx
- src/shared/components/MetricCard.jsx
- src/shared/components/DataTable.jsx

### 3. useMemo para cálculos costosos

```jsx
// ❌ INCORRECTO - recalcula en cada render
const expensiveValue = heavyCalculation(data)

// ✅ CORRECTO - solo recalcula cuando cambia data
const expensiveValue = useMemo(() => heavyCalculation(data), [data])
```

### 4. Lazy loading para componentes pesados

```jsx
// ❌ INCORRECTO - bundled con todo
import { HeavyChart } from './components/HeavyChart'

// ✅ CORRECTO - carga bajo demanda
import { lazy, Suspense } from 'react'
const HeavyChart = lazy(() => import('./components/HeavyChart'))

function Page() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  )
}
```

## Prioridades sugeridas

| Prioridad | Optimización | Impacto |
|----------|--------------|--------|
| 1 | Imports directos de lucide-react | CRÍTICO |
| 2 | memo en StatCards, MetricCard | MEDIUM |
| 3 | lazy load de recharts gráficos | MEDIUM |
| 4 | useMemo cálculos costosos | LOW-MEDIUM |

## Notas
- Los iconos de lucide-react son los que más aportan al bundle
- Cada import directo ahorra ~200-800ms en cold start
- Verificar que Vite tree-shaking funciona con los imports directos

## Fecha: Mayo 2026