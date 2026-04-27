# 🗄️ Arquitectura de Datos: Dexie.js (IndexedDB)

Este documento explica el flujo de persistencia de la aplicación **Industrial ISD**, comparándolo con el ecosistema de Android (Room) para una comprensión rápida.

---

## 🏗️ Analogía Técnica: Android vs Web

| Concepto | Android (Kotlin) | Web (React) |
| :--- | :--- | :--- |
| **Motor de Base de Datos** | SQLite | IndexedDB |
| **Capa de Abstracción** | **Room** | **Dexie.js** |
| **Reactividad** | LiveData / Flow | useLiveQuery |
| **Almacenamiento** | Almacenamiento Interno | Browser Storage (GBs) |

---

## 🔄 Flujo de Datos (Data Pipeline)

Aquí se muestra cómo viaja la información desde el archivo hasta el Dashboard:

```ascii
1. ENTRADA          2. PROCESO (Service)     3. PERSISTENCIA (Dexie)   4. REACTIVIDAD (UI)
+--------------+    +-------------------+    +-------------------+    +-------------------+
| Archivo JSON | -> | Normalización y   | -> | Transacción       | -> | Hook:             |
| (Exportado   |    | Limpieza de Datos |    | (Seguridad Total) |    | useLiveQuery()    |
| de Android)  |    +-------------------+    +---------+---------+    +---------+---------+
+--------------+                                       |                        |
                                                       v                        |
                                             +-------------------+              |
                                             |   IndexedDB       |              |
                                             | (Disco Local)     | <------------+
                                             | [Tabla Records]   |    (Auto-Update)
                                             +-------------------+
```

---

## 🛠️ Cómo funciona la implementación actual

### 1. El Esquema (Schema)
Ubicado en `src/data/db.js`. Define los índices para que las búsquedas sean instantáneas.
```javascript
db.version(1).stores({
  records: '++id, fechaTimestamp, trabajadorNombre, productoNombre, maquinaId'
});
```

### 2. La Transacción
Cuando subes un archivo, el sistema garantiza la integridad:
```ascii
[ INICIO TRANSACCIÓN ]
   |
   |--> Guardar Resumen de Importación
   |--> Guardar 1000+ Registros en masa (bulkAdd)
   |
[ FIN TRANSACCIÓN: ÉXITO ] -> Si algo falla, se borra todo automáticamente.
```

### 3. Sincronización Automática
No necesitas refrescar la pantalla. El flujo es:
1. **Dexie** detecta un cambio en la tabla `records`.
2. **useLiveQuery** recibe la notificación.
3. **React** re-renderiza los gráficos con la nueva data.

---

## 📈 Impacto en el Negocio

1. **Escalabilidad**: Soporta años de historial sin degradar la velocidad.
2. **Privacidad**: La data nunca sale de la computadora del gerente (no viaja a la nube).
3. **Robustez**: Al usar transacciones, es casi imposible que la base de datos se corrompa.

---
> **Nota:** Esta arquitectura ha sido diseñada siguiendo los estándares de **Software Senior**, priorizando la velocidad de respuesta y la integridad de la información industrial.
