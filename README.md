# ISD Industrial Dashboard 2026

Panel de control de alta precisión para auditoría de producción industrial.

## 🛠 Stack Tecnológico
- **Core:** React 19 + Vite 8
- **Estado:** Zustand + Dexie (IndexedDB)
- **Estilos:** Vanilla CSS (Modern Design System)
- **Testing:** Vitest

## 🧠 Lógica de Negocio (Predicados de Auditoría)
El sistema aplica reglas estrictas para evitar la inflación de datos y asegurar la precisión en los KPIs de gerencia.

| Categoría | Identificador | Unidad | Definición de Negocio |
| :--- | :--- | :--- | :--- |
| **Paneles (MP)** | `MP1`, `MP2`, `MP3`, `MP4` | Unidades (u.) | Producto terminado listo para stock. |
| **Resortes (MR)** | `MR1`, `MR2` | Millares (mil.) | Producción volumétrica de resortes. |
| **Procesos** | `N/A`, `Otros` | Unidades (u.) | Tareas de soporte (Embarillado, Doblado, Cortado). |

> [!IMPORTANT]
> **Regla de Oro:** Solo los registros de máquinas MP se suman al total de producción. Las tareas de procesos se contabilizan por separado para no "ensuciar" el stock real.

## 📊 Estructura de Datos (JSON)
Para una importación exitosa, el archivo JSON debe seguir este esquema:

```json
{
  "trabajador": { "nombre": "Angelo" },
  "ubicacion": { "modulo": "Paneles", "maquina": "MP3" },
  "producto": { "nombre": "2 plz pegado" },
  "produccion": { "cantidad": 60, "unidad": "unidades" },
  "fechaLegible": "2026-03-31",
  "outputMaquina": 2626
}
```

## 🧪 Guía de Testing
La integridad de los datos es crítica. Contamos con un **Test de Regresión** que valida que los procesos intermedios no se mezclen con las unidades terminadas.

### Comandos de Ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar entorno de desarrollo
npm run dev

# 3. Correr Auditoría de Pruebas (Vital antes de cada deploy)
npm test src/tests/domain/production.test.js
```

---
*Desarrollado con arquitectura modular y separación estricta de responsabilidades.*
