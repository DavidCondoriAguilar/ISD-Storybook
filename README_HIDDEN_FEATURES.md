# 🚀 Funciones Ocultas (Temporalmente)

Este documento detalla las funciones que han sido comentadas/escondidas por petición del usuario para simplificar la interfaz actual. Sigue estas instrucciones para restaurarlas fácilmente.

---

## 1. Buscador Principal (Monitor de Planta)
Permite filtrar la tabla de auditoría por operario, producto o máquina.

*   **Ubicación:** `src/features/dashboard/components/DashboardHeader.jsx`
*   **Cómo restaurar:** Busca el bloque `{/* Main Search hidden for now ... */}` al inicio del archivo y descomenta el `div` con la clase `search-container-premium`.

---

## 2. Botón de Exportar PDF
Permite generar reportes profesionales en formato PDF con el resumen de la auditoría.

*   **Ubicación:** `src/features/dashboard/components/DashboardHeader.jsx`
*   **Cómo restaurar:** Busca el bloque `{/* Export button hidden for now ... */}` y descomenta el bloque del botón `<button className="btn-elite secondary" ...>`.

---

## 3. Paginación de Tabla
Permite navegar entre grandes volúmenes de datos (25 por página).

*   **Ubicación:** `src/features/dashboard/Dashboard.jsx`
*   **Cómo restaurar:** Ve al final del archivo y busca el bloque `{/* Pagination hidden for now ... */}`. Elimina los comentarios de JS para que el componente `<Pagination />` vuelva a aparecer.

---

## 4. Buscador Global en Analytics
Permite filtrar todos los gráficos del dashboard ejecutivo por operario o producto.

*   **Ubicación:** `src/features/analytics/pages/ExecutiveDashboard.jsx`
*   **Cómo restaurar:** Busca el bloque `{/* Global Search hidden for now ... */}` en la cabecera y descomenta el `div` con la clase `exec-search`.

---

## 5. Métricas Senior (Dashboard Ejecutivo)
Cálculos avanzados de U/H, Variación vs Ayer y MVP.

*   **Ubicación:** `src/features/analytics/pages/ExecutiveDashboard.jsx`
*   **Cómo restaurar:** Busca el bloque `{/* Advanced Senior Metrics Row - Commented out ... */}` y descomenta el `div` con la clase `advanced-stats-row`.

---

> **Nota para el desarrollador:** Toda la lógica de negocio (servicios y hooks) sigue intacta y funcionando. Solo se ha escondido la capa visual (UI).
