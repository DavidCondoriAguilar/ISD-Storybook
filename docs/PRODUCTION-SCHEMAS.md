# ISD - Sistema de Producción Multi-Módulo

## Resumen

Sistema de gestión de producción para fábrica de colchones ISD.
Soporta múltiples módulos de producción con auto-detección.

---

## Módulos Disponibles

| Módulo | Productos | Descripción |
|--------|-----------|-------------|
| **TELAS** | 13+ tipos | Bandas, Pestañas, PillowQ, Memoris, Riveteado, Protectores, Almohadas, Cunas, Corte, Tela Box, Colchonetas, Cabeceras |
| **PANELES** | 6 tipos | Panel Visco, Espuma, Latex, Gel, Memory Foam |
| **RESORTES** | 6 tipos | Bonnell, Continuous, Pocket, Mirror, Lastex |

---

## JSON Schema

### Estructura General

```json
{
  "version": "1.0.0",
  "module": "telas|paneles|resortes",
  "description": "Descripción del módulo",
  "allowedProductTypes": [...],
  "validation": { ... },
  "fieldMappings": { ... },
  "kotlinModel": { ... }
}
```

### Campos Comunes

| Campo | Aliases | Descripción |
|-------|--------|-------------|
| trabajador | worker, nombre, name, empleado | Nombre del trabajador |
| dni | cedula, ci, id | Documento de identidad |
| turno | shift, jornada | Turno de trabajo |
| fecha | date, dia | Fecha de producción |
| producto | tipo, name, articulo | Producto fabricar |
| cantidad | qty, units, cant, piezas | Cantidad-produced |
| maquina | machine, equipo | ID de máquina |

---

## Auto-Detección

El sistema detecta automáticamente el tipo de producción:

1. **Por nombre de archivo**: `tela_enero.json` → TELAS
2. **Por productos**: "Riveteado" → TELAS
3. **Por estructura**: `outputMaquina` + `calidad` → RESORTES

---

## Ejemplos de JSON

### TELAS

```json
[
  {
    "trabajador": "María García",
    "dni": "12345678",
    "turno": "Mañana",
    "fecha": "2025-01-15",
    "producto": "Banda Splendido Topacio BB",
    "cantidad": 50,
    "maquina": "TEL-01"
  }
]
```

### PANELES

```json
[
  {
    "trabajador": "Carlos López",
    "dni": "87654321",
    "turno": "Tarde",
    "fecha": "2025-01-15",
    "producto": "Panel Visco 5cm",
    "cantidad": 45,
    "maquina": "PAN-01",
    "outputMaquina": 180,
    "eficiencia": 92
  }
]
```

### RESORTES

```json
[
  {
    "trabajador": "Juan Pérez",
    "dni": "11223344",
    "turno": "Noche",
    "fecha": "2025-01-15",
    "producto": "Resorte Bonnell 2.2",
    "cantidad": 120,
    "maquina": "BOB-01",
    "outputMaquina": 450,
    "calidad": "A"
  }
]
```

---

## API Reference

### schemaRegistry.js

```javascript
import { getSchema, detectAndGetSchema, getAvailableModules } from './schemaRegistry'

// Obtener schema específico
const schema = getSchema('telas')

// Auto-detectar y obtener schema
const { module, schema } = detectAndGetSchema('archivo.json', records)

// Módulos disponibles
const modules = getAvailableModules() // ['telas', 'paneles', 'resortes']
```

---

## Modelos Kotlin

### ProduccionTela

```kotlin
data class ProduccionTela(
    val id: Long = 0,
    val trabajadorId: String,
    val trabajadorNombre: String,
    val turno: String,
    val fecha: Long,
    val productoTipo: String,
    val productoNombre: String,
    val cantidad: Int,
    val maquinaId: String,
    val createdAt: Long = System.currentTimeMillis()
)
```

### ProduccionPanel

```kotlin
data class ProduccionPanel(
    val id: Long = 0,
    val trabajadorId: String,
    val trabajadorNombre: String,
    val turno: String,
    val fecha: Long,
    val productoNombre: String,
    val cantidad: Int,
    val maquinaId: String,
    val outputMaquina: Int,
    val eficiencia: Double,
    val createdAt: Long = System.currentTimeMillis()
)
```

### ProduccionResorte

```kotlin
data class ProduccionResorte(
    val id: Long = 0,
    val trabajadorId: String,
    val trabajadorNombre: String,
    val turno: String,
    val fecha: Long,
    val productoNombre: String,
    val cantidad: Int,
    val maquinaId: String,
    val outputMaquina: Int,
    val calidad: String,
    val createdAt: Long = System.currentTimeMillis()
)
```

---

## Sincronización Offline

La app mobile debe soportar:

- **Queue local**: hasta 1000 registros pendientes
- **Conflict resolution**:LastWriteWins
- **Sync method**: cola de sincronización cuando hay conexión

---

## Última Actualización

Enero 2025 - v1.0.0