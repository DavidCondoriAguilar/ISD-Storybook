# 🏭 ISD Industrial Dashboard | Executive Control Center

![Status](https://img.shields.io/badge/Status-Executive--Grade-6366f1)
![Version](https://img.shields.io/badge/Version-2.0--Clean--Architecture-10b981)
![Storage](https://img.shields.io/badge/Storage-IndexedDB--Offline-f59e0b)

## 🎯 Visión General
**ISD Dashboard** es una plataforma de analítica avanzada diseñada para la toma de decisiones estratégicas en entornos de manufactura industrial. Transforma logs brutos de producción en una narrativa de datos coherente, permitiendo auditorías cruzadas entre reportes de operarios y contadores de maquinaria en tiempo real.

> **Propósito:** Eliminar la brecha de información entre la planta y la gerencia mediante visualizaciones de alta precisión y un motor de auditoría dual.

---

## 🛠️ Pilares Tecnológicos (Stack Senior)
Hemos construido esta solución priorizando el rendimiento, la seguridad de datos local y una experiencia de usuario (UX) de grado ejecutivo:

- **Core:** React 18+ con Arquitectura Modular.
- **Data Engine:** `Dexie.js` (IndexedDB) para persistencia local de alto volumen (Soporta miles de registros sin latencia).
- **Executive UI:** Sistema de diseño personalizado basado en **CSS Variables**, garantizando consistencia total en Light/Dark mode.
- **Analytics:** `Recharts` para visualización de tendencias y `Framer Motion` para transiciones fluidas de grado premium.
- **Audit Tooling:** Motor de normalización inteligente que detecta discrepancias entre **Unidades (MP)** y **Millares (MR)**.

---

## ✨ Funcionalidades Core (Executive Features)

### 📊 1. Centro de Control Ejecutivo (Dashboard)
Visión 360° de la planta. Gráficas de rendimiento comparativo, líderes de producción y KPIs estratégicos filtrables por área y tiempo.

### 🕵️ 2. Motor de Auditoría Cruzada (Module View)
Vista detallada por módulo (Paneles, Telas, etc.) que permite comparar el reporte del trabajador vs el contador de la máquina.
- **Alertas de Discrepancia:** Detección automática de errores de conteo > 10%.
- **Análisis Dual:** Segmentación clara entre producción de Unidades y Millares.

### 📅 3. Cronología de Producción
Resumen diario con métricas de eficiencia, conteo de operadores activos y estado de maquinaria por jornada.

### 📥 4. Sistema de Ingesta Inteligente
Importación de JSON con validación de esquema, detección de duplicados y normalización de campos ISD (Imperial Standard Data).

---

## 🏗️ Arquitectura de Código (Clean Code)
El proyecto sigue principios de **Clean Architecture** para facilitar su escalabilidad:
- **`shared/`**: Componentes atómicos y hooks transversales (DataTable, DateRangePicker).
- **`features/`**: Módulos de negocio independientes (Analytics, Import, Factory).
- **`data/`**: Capa de persistencia y normalización de datos.
- **`hooks/`**: Lógica de negocio desacoplada de la interfaz (useModuleLogic, useExecutiveData).

---

## 🚀 Instalación y Despliegue

```bash
# Instalar dependencias
npm install

# Iniciar entorno de desarrollo
npm run dev

# Construir para producción
npm run build
```

---

## 🛡️ Seguridad y Privacidad
Este dashboard opera bajo el principio de **"Local-First"**. Ningún dato de producción sale del navegador del usuario. Toda la analítica y el procesamiento se realizan localmente, garantizando privacidad total y operatividad sin conexión a internet.

---

## 👨‍💻 Engineering Team
Desarrollado con estándares de **Senior Software Engineering** y **Expert UI/UX Design**.
