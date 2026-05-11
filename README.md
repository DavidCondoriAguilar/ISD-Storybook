# ISD Industrial Dashboard 2026

Panel de control de alta precisión para auditoría de producción industrial.

## 🏛️ Arquitectura Senior (Desacoplamiento Estricto)

La aplicación sigue principios de **Clean Architecture** para garantizar escalabilidad y cero errores de auditoría:

-   **📁 Domain Layer (`src/domain`):** El "cerebro". Contiene lógica pura y predicados de negocio independientes de la UI.
-   **📁 Repository Layer (`src/data/repositories`):** Capa de abstracción de datos. La UI no sabe que existe IndexedDB; solo pide datos al Repository.
-   **📁 Config-Driven UI (`src/features/.../config`):** El formato de tablas y dashboards se define en archivos de configuración, no en los componentes.
-   **📁 Hooks Orchestration (`src/features/.../hooks`):** Manejan el estado y coordinan el flujo entre Repository y Vista.

## 🛠 Stack Tecnológico
-   **Core:** React 19 + Vite 8
-   **Persistencia:** Dexie (IndexedDB) para manejo de GBs de datos offline.
-   **Logic:** Custom Hooks + Repository Pattern.
-   **Styles:** Vanilla CSS con Design System basado en Variables.

## 🧠 Reglas de Auditoría (Predicados)
El sistema aplica filtros estrictos para evitar la inflación de datos:
-   **Stock Real:** Solo se suman productos terminados (`isPanel`, `isResorte`).
-   **Procesos:** Las tareas de soporte se trackean pero no afectan el inventario final.

## 🚀 Ejecución
```bash
npm install
npm run dev
npm test      # Vital para validar integridad de datos
```

---
*Arquitectura modular diseñada para auditoría industrial de alto rendimiento.*
