# ISD Industrial Dashboard 2026

Panel de control de alta precisión para auditoría de producción industrial.  
Sistema desplegado en GitHub Pages: **https://davidcondoriaguilar.github.io/ISD-Storybook**

---

## Funcionalidades

- **Dashboard Ejecutivo** — KPIs en tiempo real: producción Paneles (MP) y Resortes (MR), fuerza laboral, registros auditados, tendencias diarias.
- **Módulo por Área** — Vista detallada por módulo (Paneles, Resortes) con tabla de auditoría cruzada, filtros por operario y producto.
- **Importación de Excel** — Parseo inteligente de columnas variables, detección automática de área por máquina (MP/MR) y normalización de unidades (millares vs unidades).
- **Reporte PDF** — Exportación de reporte ejecutivo con KPIs, top operarios y desempeño por máquina.
- **Filtro Global por Fecha** — Selector de fecha unificado con presets (Hoy, 7 días, 30 días, Todo) y fecha específica.

## Correcciones Recientes (v12.7)

| Bug | Síntoma | Solución |
|---|---|---|
| Registros MR no aparecían en Paneles | Luis Polo (Millares de Resortes) invisible en módulo Paneles | Normalizer respeta área del Excel; usa máquina solo como fallback |
| Doble división en millares | Resortes mostraba 0.0 mil. en historial | Eliminado `/1000` redundante en DailyStatsGrid |
| Unidad incorrecta en tabla | MR mostraba `u.` en vez de `mil.` | Columnas usan `maquinaId.includes('MR')` en vez de `moduloId` |
| `setGlobalDateFilter` undefined | Crash al aplicar filtro de fecha en Dashboard | Variable faltante en destructuring de `useExecutiveData` |
| Scroll no llegaba al final | Última tarjeta del historial no visible | `scrollTo(999999)` + auto-scroll al montar |
| Trend chart clasificación errónea | Resortes contados como Paneles en gráfico | `trendEngine` usa predicados (`isResorte`) en vez de `moduloId` string |
| Normalización duplicada | `esMillar` y `unidad` calculados en dos pipelines | Consolidado: solo `normalizers/index.js` decide clasificación |

## Stack Tecnológico

- **Core:** React 19 + Vite 8
- **Persistencia:** Dexie (IndexedDB) — datos offline sin servidor
- **UI:** Framer Motion (animaciones), Lucide (iconos), jsPDF (reportes)
- **Estilos:** CSS Variables con tema claro/oscuro
- **Arquitectura:** Domain predicates → Repository → Services → Hooks → Components

## Ejecución Local

```bash
npm install
npm run dev      # Servidor de desarrollo (localhost:5173)
```

## Para tu Presentación con el Gerente

Puntos clave que demostrar:

1. **Dashboard Ejecutivo** — Muestra la vista general con KPIs de Paneles y Resortes. Usa el filtro de fecha (esquina superior) para cambiar entre días.
2. **Módulo Paneles** — Navega a `/factory/paneles`. La tabla de auditoría muestra TODOS los registros, incluyendo los MR (Resortes) que están físicamente en el área Paneles.
3. **Ordenación** — Haz clic en cualquier cabecera de columna (FECHA, PRODUCTO, TRABAJADOR, TOTAL, etc.) para ordenar ascendente/descendente. El ícono y hover lo indican.
4. **Historial** — El carrusel de cards muestra el resumen diario. Las flechas llevan al inicio o al final del histórico.
5. **Exportar PDF** — Botón en el Dashboard que genera un reporte profesional con KPIs, top operarios y máquinas.
6. **Importar Excel** — Sube un archivo Excel con formato variable; el sistema detecta columnas y normaliza automáticamente.

---
*Arquitectura modular diseñada para auditoría industrial de alto rendimiento.*
