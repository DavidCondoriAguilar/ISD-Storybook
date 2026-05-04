# Arquitectura Modular (Domain-Driven)

Esta carpeta contiene los dominios de negocio de la fábrica de colchones. Cada módulo es independiente y sigue una estructura interna estándar.

## Estructura de un Módulo
- `components/`: Componentes UI específicos de este dominio.
- `services/`: Lógica de negocio y llamadas a la API.
- `hooks/`: Hooks de React específicos del dominio.
- `store/`: Estado global (Zustand/Redux) del módulo.
- `types/`: Definiciones de tipos y modelos de datos.
- `index.js`: Archivo barril que exporta únicamente lo necesario al exterior.

## Reglas de Oro
1. **Bajo Acoplamiento:** Un módulo no debe depender de otro módulo. Si necesitan compartir lógica, esta debe moverse a `src/shared`.
2. **Encapsulamiento:** Las páginas y otros módulos solo deben importar desde el `index.js` del módulo.
3. **Responsabilidad Única:** Cada módulo se encarga exclusivamente de su área de la fábrica.
